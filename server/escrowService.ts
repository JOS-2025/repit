import { storage } from './storage';

/**
 * Escrow Service for handling secure payment transactions
 * Manages the flow of funds from customer to farmer with delivery confirmation
 */
export class EscrowService {
  
  /**
   * Initiate an escrow transaction for an order
   */
  async initiateEscrowTransaction(orderData: {
    orderId: string;
    customerId: string;
    farmerId: string;
    amount: number;
    provider: string;
    customerPhoneNumber: string;
    farmerPhoneNumber?: string;
  }) {
    try {
      // Create escrow transaction record
      const escrowTransaction = await storage.createEscrowTransaction({
        orderId: orderData.orderId,
        customerId: orderData.customerId,
        farmerId: orderData.farmerId,
        amount: orderData.amount.toString(),
        provider: orderData.provider,
        customerPhoneNumber: orderData.customerPhoneNumber,
        farmerPhoneNumber: orderData.farmerPhoneNumber,
        status: 'pending',
        releaseCondition: 'delivery_confirmed',
      });

      // Initiate mobile money payment based on provider
      const paymentResponse = await this.initiateMobileMoneyPayment({
        provider: orderData.provider,
        phoneNumber: orderData.customerPhoneNumber,
        amount: orderData.amount,
        reference: escrowTransaction.id,
        description: `Payment for Order ${orderData.orderId}`,
      });

      // Update transaction with payment provider reference
      if (paymentResponse.success && 'transactionRef' in paymentResponse) {
        await storage.updateEscrowStatus(
          escrowTransaction.id,
          'pending',
          { transactionRef: paymentResponse.transactionRef }
        );
      }

      return {
        success: true,
        escrowTransactionId: escrowTransaction.id,
        paymentReference: 'transactionRef' in paymentResponse ? paymentResponse.transactionRef : null,
        message: 'Escrow transaction initiated successfully',
      };

    } catch (error) {
      console.error('Error initiating escrow transaction:', error);
      return {
        success: false,
        message: 'Failed to initiate escrow transaction',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Confirm payment and hold funds in escrow
   */
  async confirmPaymentAndHoldFunds(transactionId: string, paymentProof?: string) {
    try {
      const transaction = await storage.getEscrowTransaction(transactionId);
      
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      if (transaction.status !== 'pending') {
        throw new Error('Transaction is not in pending status');
      }

      // Verify payment with mobile money provider
      const paymentVerified = await this.verifyMobileMoneyPayment(
        transaction.provider,
        transaction.transactionRef
      );

      if (paymentVerified.success) {
        // Hold funds in escrow
        await storage.updateEscrowStatus(transactionId, 'held', {
          paymentProof: paymentProof || paymentVerified.proof,
          holdReason: 'Payment confirmed, awaiting delivery',
        });

        // Update order status to confirmed
        await storage.updateOrderStatus(transaction.orderId, 'confirmed');

        return {
          success: true,
          message: 'Payment confirmed and funds held in escrow',
        };
      } else {
        return {
          success: false,
          message: 'Payment verification failed',
        };
      }

    } catch (error) {
      console.error('Error confirming payment:', error);
      return {
        success: false,
        message: 'Failed to confirm payment',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Release funds to farmer after delivery confirmation
   */
  async releaseFundsToFarmer(transactionId: string, confirmationData: {
    deliveryConfirmed: boolean;
    confirmationMethod: string;
    confirmationProof?: string;
  }) {
    try {
      const transaction = await storage.getEscrowTransaction(transactionId);
      
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      if (transaction.status !== 'held') {
        throw new Error('Funds are not currently held in escrow');
      }

      if (!confirmationData.deliveryConfirmed) {
        throw new Error('Delivery must be confirmed before releasing funds');
      }

      // Release funds to farmer's mobile money account
      const releaseResponse = await this.releaseFundsToMobileMoney({
        provider: transaction.provider,
        phoneNumber: transaction.farmerPhoneNumber,
        amount: parseFloat(transaction.amount),
        reference: `Release-${transaction.id}`,
        description: `Payment release for Order ${transaction.orderId}`,
      });

      if (releaseResponse.success) {
        // Update escrow status to released
        await storage.updateEscrowStatus(transactionId, 'released', {
          releaseCondition: confirmationData.confirmationMethod,
          paymentProof: confirmationData.confirmationProof,
        });

        // Update order status to delivered
        await storage.updateOrderStatus(transaction.orderId, 'delivered');

        return {
          success: true,
          message: 'Funds successfully released to farmer',
          releaseReference: releaseResponse.transactionRef,
        };
      } else {
        return {
          success: false,
          message: 'Failed to release funds',
          error: 'error' in releaseResponse ? releaseResponse.error : 'Unknown error',
        };
      }

    } catch (error) {
      console.error('Error releasing funds:', error);
      return {
        success: false,
        message: 'Failed to release funds',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Refund customer if delivery fails or order is cancelled
   */
  async refundCustomer(transactionId: string, refundReason: string) {
    try {
      const transaction = await storage.getEscrowTransaction(transactionId);
      
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      if (transaction.status !== 'held') {
        throw new Error('Funds are not currently held in escrow');
      }

      // Process refund to customer's mobile money account
      const refundResponse = await this.processRefundToMobileMoney({
        provider: transaction.provider,
        phoneNumber: transaction.customerPhoneNumber,
        amount: parseFloat(transaction.amount),
        reference: `Refund-${transaction.id}`,
        description: `Refund for Order ${transaction.orderId}`,
      });

      if (refundResponse.success) {
        // Update escrow status to refunded
        await storage.updateEscrowStatus(transactionId, 'refunded', {
          refundReason: refundReason,
        });

        // Update order status to cancelled
        await storage.updateOrderStatus(transaction.orderId, 'cancelled');

        return {
          success: true,
          message: 'Refund processed successfully',
          refundReference: refundResponse.transactionRef,
        };
      } else {
        return {
          success: false,
          message: 'Failed to process refund',
          error: 'error' in refundResponse ? refundResponse.error : 'Unknown error',
        };
      }

    } catch (error) {
      console.error('Error processing refund:', error);
      return {
        success: false,
        message: 'Failed to process refund',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Handle disputes and escalations
   */
  async raiseDispute(transactionId: string, disputeReason: string, evidence?: string[]) {
    try {
      const transaction = await storage.getEscrowTransaction(transactionId);
      
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Update transaction status to disputed
      await storage.updateEscrowStatus(transactionId, 'disputed', {
        disputeReason: disputeReason,
        paymentProof: evidence ? evidence.join(',') : null,
      });

      // Log dispute for admin review
      // TODO: Implement admin notification system

      return {
        success: true,
        message: 'Dispute raised successfully. Admin will review within 24 hours.',
      };

    } catch (error) {
      console.error('Error raising dispute:', error);
      return {
        success: false,
        message: 'Failed to raise dispute',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ============= MOBILE MONEY INTEGRATION =============

  /**
   * Initiate mobile money payment (M-Pesa, Airtel Money, etc.)
   */
  private async initiateMobileMoneyPayment(paymentData: {
    provider: string;
    phoneNumber: string;
    amount: number;
    reference: string;
    description: string;
  }) {
    try {
      switch (paymentData.provider) {
        case 'mpesa':
          return await this.initiateMPesaPayment(paymentData);
        case 'airtel_money':
          return await this.initiateAirtelMoneyPayment(paymentData);
        case 'tigopesa':
          return await this.initiateTigoPesaPayment(paymentData);
        default:
          throw new Error(`Unsupported payment provider: ${paymentData.provider}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * M-Pesa STK Push implementation
   */
  private async initiateMPesaPayment(paymentData: any) {
    // Mock implementation - replace with actual M-Pesa API integration
    console.log('Initiating M-Pesa payment:', paymentData);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      transactionRef: `MPESA${Date.now()}`,
      message: 'M-Pesa STK push sent to customer phone',
    };
  }

  /**
   * Airtel Money payment implementation
   */
  private async initiateAirtelMoneyPayment(paymentData: any) {
    // Mock implementation - replace with actual Airtel Money API integration
    console.log('Initiating Airtel Money payment:', paymentData);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      transactionRef: `AIRTEL${Date.now()}`,
      message: 'Airtel Money payment request sent',
    };
  }

  /**
   * Tigo Pesa payment implementation
   */
  private async initiateTigoPesaPayment(paymentData: any) {
    // Mock implementation - replace with actual Tigo Pesa API integration
    console.log('Initiating Tigo Pesa payment:', paymentData);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      transactionRef: `TIGO${Date.now()}`,
      message: 'Tigo Pesa payment request sent',
    };
  }

  /**
   * Verify mobile money payment
   */
  private async verifyMobileMoneyPayment(provider: string, transactionRef: string) {
    // Mock implementation - replace with actual verification APIs
    console.log(`Verifying ${provider} payment:`, transactionRef);
    
    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      verified: true,
      proof: `Verified-${transactionRef}`,
    };
  }

  /**
   * Release funds to farmer's mobile money account
   */
  private async releaseFundsToMobileMoney(releaseData: any) {
    // Mock implementation - replace with actual release APIs
    console.log('Releasing funds to farmer:', releaseData);
    
    // Simulate release
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      transactionRef: `RELEASE${Date.now()}`,
      message: 'Funds released to farmer successfully',
    };
  }

  /**
   * Process refund to customer's mobile money account
   */
  private async processRefundToMobileMoney(refundData: any) {
    // Mock implementation - replace with actual refund APIs
    console.log('Processing refund to customer:', refundData);
    
    // Simulate refund
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      transactionRef: `REFUND${Date.now()}`,
      message: 'Refund processed to customer successfully',
    };
  }

  /**
   * Get escrow transaction status and history
   */
  async getTransactionStatus(transactionId: string) {
    try {
      const transaction = await storage.getEscrowTransaction(transactionId);
      
      if (!transaction) {
        return {
          success: false,
          message: 'Transaction not found',
        };
      }

      return {
        success: true,
        transaction: {
          id: transaction.id,
          orderId: transaction.orderId,
          amount: transaction.amount,
          status: transaction.status,
          provider: transaction.provider,
          createdAt: transaction.createdAt,
          heldAt: transaction.heldAt,
          releasedAt: transaction.releasedAt,
          refundedAt: transaction.refundedAt,
          releaseCondition: transaction.releaseCondition,
          holdReason: transaction.holdReason,
          disputeReason: transaction.disputeReason,
        },
      };

    } catch (error) {
      return {
        success: false,
        message: 'Failed to get transaction status',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const escrowService = new EscrowService();
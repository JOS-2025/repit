import React from 'react';
import BulkOrderForm from '../components/BulkOrderForm';
import InvoiceGenerator from '../components/InvoiceGenerator';

const B2BDashboard = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#16a34a' }}>B2B Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div style={{ border: '1px solid #ccc', padding: '2rem', borderRadius: '8px' }}>
          <h2 style={{ marginBottom: '1rem' }}>Place Bulk Order</h2>
          <BulkOrderForm />
        </div>
        
        <div style={{ border: '1px solid #ccc', padding: '2rem', borderRadius: '8px' }}>
          <h2 style={{ marginBottom: '1rem' }}>View Invoices</h2>
          <InvoiceGenerator />
        </div>
      </div>
    </div>
  );
};

export default B2BDashboard;
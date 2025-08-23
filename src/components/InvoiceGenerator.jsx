import React from 'react';

const InvoiceGenerator = () => {
  return (
    <div style={{ border: '1px solid #ccc', padding: '2rem', margin: '1rem', backgroundColor: 'white' }}>
      <h2>Invoice #INV-001</h2>
      <div style={{ marginBottom: '1rem' }}>
        <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
        <p><strong>Business:</strong> Sample Business</p>
        <p><strong>Product:</strong> Organic Tomatoes</p>
        <p><strong>Quantity:</strong> 100 lbs</p>
        <p><strong>Unit Price:</strong> $2.50/lb</p>
        <p><strong>Total:</strong> $250.00</p>
      </div>
      <button 
        style={{ 
          backgroundColor: '#16a34a', 
          color: 'white', 
          border: 'none', 
          padding: '0.5rem 1rem', 
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Download PDF
      </button>
    </div>
  );
};

export default InvoiceGenerator;
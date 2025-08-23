import React from 'react';

const BulkOrderForm = () => {
  return (
    <form style={{ maxWidth: '400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label>Business Name:</label>
        <input type="text" style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
      </div>
      <div>
        <label>Product:</label>
        <input type="text" style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
      </div>
      <div>
        <label>Quantity:</label>
        <input type="number" style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
      </div>
      <div>
        <label>Delivery Date:</label>
        <input type="date" style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
      </div>
      <button 
        type="submit" 
        style={{ 
          backgroundColor: '#16a34a', 
          color: 'white', 
          border: 'none', 
          padding: '0.75rem', 
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Submit
      </button>
    </form>
  );
};

export default BulkOrderForm;
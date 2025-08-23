import React from 'react';

const ProductCard = ({ product = { name: 'Sample Product', price: '$5.99' } }) => {
  return (
    <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
      <h3>{product.name}</h3>
      <p style={{ color: '#16a34a', fontWeight: 'bold' }}>{product.price}</p>
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
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;
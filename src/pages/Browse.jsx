import React from 'react';
import ProductCard from '../components/ProductCard';

const Browse = () => {
  const sampleProducts = [
    { name: 'Organic Tomatoes', price: '$3.99/lb' },
    { name: 'Fresh Lettuce', price: '$2.49/head' },
    { name: 'Sweet Corn', price: '$1.99/ear' },
    { name: 'Organic Carrots', price: '$2.99/lb' },
    { name: 'Bell Peppers', price: '$4.99/lb' },
    { name: 'Fresh Spinach', price: '$3.49/bunch' }
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#16a34a' }}>Browse Products</h1>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1rem' 
      }}>
        {sampleProducts.map((product, index) => (
          <ProductCard key={index} product={product} />
        ))}
      </div>
    </div>
  );
};

export default Browse;
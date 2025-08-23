import React from 'react';

const Home = () => {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#16a34a' }}>Welcome to FramCart</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#666' }}>
        Fresh produce directly from farm to your table
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button style={{ 
          backgroundColor: '#16a34a', 
          color: 'white', 
          border: 'none', 
          padding: '1rem 2rem', 
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '1rem'
        }}>
          Browse Products
        </button>
        <button style={{ 
          backgroundColor: '#16a34a', 
          color: 'white', 
          border: 'none', 
          padding: '1rem 2rem', 
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '1rem'
        }}>
          Become a Farmer
        </button>
        <button style={{ 
          backgroundColor: '#16a34a', 
          color: 'white', 
          border: 'none', 
          padding: '1rem 2rem', 
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '1rem'
        }}>
          About
        </button>
      </div>
    </div>
  );
};

export default Home;
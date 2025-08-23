import React from 'react';

const Navbar = () => {
  return (
    <nav style={{ backgroundColor: '#16a34a', padding: '1rem', color: 'white' }}>
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <h1>FramCart</h1>
        <a href="/" style={{ color: 'white', textDecoration: 'none' }}>Home</a>
        <a href="/browse" style={{ color: 'white', textDecoration: 'none' }}>Browse Products</a>
        <a href="/become-farmer" style={{ color: 'white', textDecoration: 'none' }}>Become a Farmer</a>
        <a href="/about" style={{ color: 'white', textDecoration: 'none' }}>About</a>
        <a href="/b2b-dashboard" style={{ color: 'white', textDecoration: 'none' }}>B2B Dashboard</a>
      </div>
    </nav>
  );
};

export default Navbar;
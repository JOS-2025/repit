import React from 'react';

const About = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#16a34a' }}>About FramCart</h1>
      <div style={{ lineHeight: '1.6', fontSize: '1.1rem' }}>
        <p style={{ marginBottom: '1rem' }}>
          FramCart is a revolutionary farm-to-table marketplace that connects local farmers 
          directly with consumers and businesses, eliminating intermediaries and ensuring 
          fresh, quality produce reaches your table.
        </p>
        <p style={{ marginBottom: '1rem' }}>
          Our mission is to support local agriculture while providing customers with 
          the freshest, most nutritious produce available. We believe in sustainable 
          farming practices and fair compensation for our farming partners.
        </p>
        <p style={{ marginBottom: '1rem' }}>
          Whether you're a family looking for fresh vegetables or a business needing 
          bulk orders, FramCart provides a seamless platform to meet your needs while 
          supporting local farmers in your community.
        </p>
      </div>
    </div>
  );
};

export default About;
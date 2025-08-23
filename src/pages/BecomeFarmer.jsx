import React from 'react';
import FarmerForm from '../components/FarmerForm';

const BecomeFarmer = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1rem', color: '#16a34a' }}>Become a Farmer</h1>
      <p style={{ textAlign: 'center', marginBottom: '2rem', color: '#666' }}>
        Join our community of local farmers and start selling your fresh produce directly to customers.
      </p>
      <FarmerForm />
    </div>
  );
};

export default BecomeFarmer;
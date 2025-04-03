import React from 'react';
import './DashboardLayout.css';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const DashboardLayout = ({ children, navigate }) => {
  return (
    <div className="container">
      <Sidebar navigate={navigate} />

      <div className="mainContainer">
        <Header />
        <div className="content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;

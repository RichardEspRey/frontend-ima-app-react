import './DashboardLayout.css';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Outlet } from 'react-router-dom';

const DashboardLayout = () => {
  return (
    <div className="container">
      <Sidebar/>
      <div className="mainContainer">
        <Header />
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;

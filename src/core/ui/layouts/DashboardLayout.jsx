import './DashboardLayout.css';
import Sidebar from '../Sidebar';
import Header from '../Header';
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

import React, { useContext } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthContext } from '../auth/AuthContext';
import { Provider } from 'react-redux';
import store from '../redux/store';

import LoginScreen from '../screens/Login/Login.jsx';
import DashboardLayout from '../layouts/DashboardLayout';
import HomeScreen from '../screens/HomeScreen.jsx';
import DriverAdmin from '../screens/DriverAdmin.jsx';
import DriverEditor from '../screens/DriverEditor.jsx';
import TripAdmin from '../screens/TripAdmin.jsx';
import TripScreen from '../screens/TripsScreen.jsx';
import DriverScreen from '../screens/DriverScreen.jsx';
import TruckAdmin from '../screens/TruckAdmin.jsx';
import TruckScreen from '../screens/TruckScreen.jsx';
import TrailerScreen from '../screens/TrailerScreen.jsx';
import TrailerAdmin from '../screens/TrailerAdmin.jsx';
import EditTripForm from '../screens/EditTripForm.jsx';

const AppRouter = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;

  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {!user ? (
            <>
              <Route path="*" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<LoginScreen />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route
                path="/home"
                element={
                  <DashboardLayout>
                    <HomeScreen />
                    {/* <TripAdmin/> */}
                  </DashboardLayout>
                }
              />
              <Route
                path="/drivers"
                element={
                  <DashboardLayout>
                    <DriverScreen />
                  </DashboardLayout>
                }
              />

              <Route
                path="/admin-drivers"
                element={
                  <DashboardLayout>
                    <DriverAdmin />
                  </DashboardLayout>
                }
              />

              <Route
                path="/editor-drivers/:id"
                element={
                  <DashboardLayout>
                    <DriverEditor />
                  </DashboardLayout>
                }
              />

              <Route
                path="/trucks"
                element={
                  <DashboardLayout>
                    <TruckScreen />
                  </DashboardLayout>
                }
              />


              <Route
                path="/admin-trucks"
                element={
                  <DashboardLayout>
                    <TruckAdmin />
                  </DashboardLayout>
                }
              />

              <Route
                path="/trailers"
                element={
                  <DashboardLayout>
                    <TrailerScreen />
                  </DashboardLayout>
                }
              />


              <Route
                path="/admin-trailers"
                element={
                  <DashboardLayout>
                    <TrailerAdmin />
                  </DashboardLayout>
                }
              />

              <Route
                path="/trips"
                element={
                  <DashboardLayout>
                    <TripScreen />
                  </DashboardLayout>
                }
              />

              <Route
                path="/admin-trips"
                element={
                  <DashboardLayout>
                    <TripAdmin />
                  </DashboardLayout>
                }
              />

              <Route
                path="/edit-trip/:tripId"
                element={
                  <DashboardLayout> 
                    <EditTripForm /> 
                  </DashboardLayout>
                }
              />



            </>
          )}
        </Routes>
      </Router>
    </Provider>
  );
};

export default AppRouter;

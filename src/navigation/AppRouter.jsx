import React, { useContext } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import { AuthContext } from '../auth/AuthContext';
import { Provider } from 'react-redux';
import store from '../redux/store';

// ✅ Estos ya existen
import LoginScreen from '../screens/Login/Login.jsx';
import DashboardLayout from '../layouts/DashboardLayout';
import HomeScreen from '../screens/HomeScreen.jsx';
import AdminConductores from '../screens/DriverAdmin.jsx';

// ❌ Aún no creados, por eso los comentamos
// import ConductoresScreen from '../screens/ConductoresScreen';
// import CamionesScreen from '../screens/CamionesScreen';
// import CajasScreen from '../screens/CajasScreen';

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
                  </DashboardLayout>
                }
              />
              {/* <Route
                path="/conductores"
                element={
                  <DashboardLayout>
                    <ConductoresScreen />
                  </DashboardLayout>
                }
              /> */}

              <Route
                path="/admin-conductores"
                element={
                  <DashboardLayout>
                    <AdminConductores />
                  </DashboardLayout>
                }
              />

              {/* <Route
                path="/camiones"
                element={
                  <DashboardLayout>
                    <CamionesScreen />
                  </DashboardLayout>
                }
              />
              <Route
                path="/cajas"
                element={
                  <DashboardLayout>
                    <CajasScreen />
                  </DashboardLayout>
                }
              /> */}
            </>
          )}
        </Routes>
      </Router>
    </Provider>
  );
};

export default AppRouter;

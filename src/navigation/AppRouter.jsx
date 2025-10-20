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
import TrucksEditor from '../screens/TrucksEditor.jsx';
import TrailerScreen from '../screens/TrailerScreen.jsx';
import TrailerAdmin from '../screens/TrailerAdmin.jsx';
import TrailerEdit from '../screens/TrailerEdit.jsx';
import EditTripForm from '../screens/EditTripForm.jsx';
import ImaScreen from '../screens/ImaScreen.jsx';
import ImaAdmin from '../screens/ImaAdmin.jsx';
import DieselAdmin from '../screens/Trips/DieselAdmin.jsx';
import DieselDetalle from '../screens/Trips/DieselDetalle.jsx';
import DieselEditor from '../screens/Trips/DieselEditor.jsx';
import GastosAdmin from '../screens/Trips/GastosAdmin.jsx';
import GastosDetalle from '../screens/Trips/GastosDetalle.jsx';
import GastosEditor from '../screens/Trips/GastosEditor.jsx';
import AdminGastosGeneral from '../screens/AdminGastos.jsx';
import Inspeccion_final from '../screens/Mantenimientos/Inspeccion_final.jsx';
import ExpenseScreen from '../screens/ExpenseScreen.jsx';
import StockAdmin  from '../screens/StockAdmin.jsx';
import ServiceOrderScreen from '../screens/ServiceOrderScreen.jsx';
import ServiceOrderScreenEdit from '../screens/ServiceOrderScreenEdit.jsx';
import ServiceOrderAdmin from '../screens/ServiceOrderAdmin.jsx';
import Finanzas from '../screens/Finanzas.jsx';
import ResumenTrip from '../screens/ResumenTrip.jsx';


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
                path="/editor-trucks/:id"
                element={
                  <DashboardLayout>
                    <TrucksEditor />
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
                path="/editor-trailers/:id"
                element={
                  <DashboardLayout>
                    <TrailerEdit />
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
                path="/admin-diesel"
                element={
                  <DashboardLayout>
                    <DieselAdmin />
                  </DashboardLayout>
                }
              />

              <Route
                path="/detalle-diesel/:tripId"
                element={
                  <DashboardLayout>
                    <DieselDetalle />
                  </DashboardLayout>
                }
              />

              <Route
                path="/editor-diesel/:id/:trip_id"
                element={
                  <DashboardLayout>
                    <DieselEditor />
                  </DashboardLayout>
                }
              />

               <Route
                path="/admin-gastos"
                element={
                  <DashboardLayout>
                    <GastosAdmin />
                  </DashboardLayout>
                }
              />

               <Route
                path="/detalle-gastos/:tripId"
                element={
                  <DashboardLayout>
                    <GastosDetalle />
                  </DashboardLayout>
                }
              />

              <Route
                path="/editor-gastos/:id/:trip_id"
                element={
                  <DashboardLayout>
                    <GastosEditor />
                  </DashboardLayout>
                }
              />

              <Route
                path="/admin-gastos-generales"
                element={
                  <DashboardLayout>
                    <AdminGastosGeneral />
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

              <Route
                path="/edit-trailer/:trailerId"
                element={
                  <DashboardLayout> 
                    <TrailerEdit /> 
                  </DashboardLayout>
                }
              />

              <Route
                path="/ImaAdmin"
                element={
                  <DashboardLayout> 
                    <ImaAdmin /> 
                  </DashboardLayout>
                }
              />

              <Route
                path="/ImaScreen"
                element={
                  <DashboardLayout> 
                    <ImaScreen/> 
                  </DashboardLayout>
                }
              />

               <Route
                path="/Inspeccion-final"
                element={
                  <DashboardLayout> 
                    <Inspeccion_final /> 
                  </DashboardLayout>
                }
              />

              <Route
              path="/new-expense"
              element = {
                <DashboardLayout>
                  <ExpenseScreen/>
                </DashboardLayout>
              }
              />

              <Route
              path="/view-inventory"
              element = {
                <DashboardLayout>
                  <StockAdmin/>
                </DashboardLayout>
              }
              />

              <Route
              path="/new-service-order"
              element = {
                <DashboardLayout>
                  <ServiceOrderScreen/>
                </DashboardLayout>
              }
              />

              <Route
              path="/admin-service-order"
              element = {
                <DashboardLayout>
                  <ServiceOrderAdmin/>
                </DashboardLayout>
              }
              />

              <Route
                path="/editar-orden/:orderId"
                element={
                  <DashboardLayout> 
                    <ServiceOrderScreenEdit /> 
                  </DashboardLayout>
                }
              />

               <Route
                path="/finanzas"
                element={
                  <DashboardLayout> 
                    <Finanzas /> 
                  </DashboardLayout>
                }
              />

              <Route
                path="/ResumenTrip/:tripId"
                element={
                  <DashboardLayout> 
                    <ResumenTrip /> 
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

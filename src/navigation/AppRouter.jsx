import React, { useContext } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthContext } from '../auth/AuthContext';
import { Provider } from 'react-redux';
import store from '../redux/store';

import LoginScreen from '../screens/Login/Login.jsx';
import DashboardLayout from '../layouts/DashboardLayout';
import HomeScreen from '../screens/Reports.jsx';
import DriverAdmin from '../screens/DriverAdmin.jsx';
import DriverEditor from '../screens/DriverEditor.jsx';
import TripAdmin from '../screens/TripAdmin.jsx';
import TripScreen from '../screens/TripsScreen.jsx';
import TripScreenNew from '../screens/TripsScreenNew.jsx';
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
import ExpenseEdit from '../screens/ExpenseEdit.jsx';
import StockAdmin  from '../screens/StockAdmin.jsx';
import ServiceOrderScreen from '../screens/ServiceOrderScreen.jsx';
import ServiceOrderScreenEdit from '../screens/ServiceOrderScreenEdit.jsx';
import ServiceOrderAdmin from '../screens/ServiceOrderAdmin.jsx';
import Finanzas from '../screens/Finanzas.jsx';
import ResumenTrip from '../screens/ResumenTrip.jsx';
import ResiduoTrip from '../screens/Finanzas/ResiduosTrips.jsx';
import ProfileAccessManager from '../screens/ProfileAccessManager.jsx';
import Reports from '../screens/Reports.jsx';
import Tracking from '../screens/Mapas/Tracking.jsx';
import { Welcome } from '../screens/Welcome.jsx';
import MargenScreen from '../screens/MargenScreen.jsx';
import PaymentDrivers from '../screens/Finanzas/PaymentDrivers.jsx';
import MillasDriversTable from '../screens/Finanzas/MillasDriversTable.jsx';
import TicketPayment from '../screens/Finanzas/TicketPayment.jsx';

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
            <Route path="/" element={<DashboardLayout />}> 
              <Route index element={<Navigate to="/home" replace />} /> 
              <Route path="/home" element={<Welcome/>} />
              <Route path="/drivers" element={<DriverScreen />} />
              <Route path="/admin-drivers" element={<DriverAdmin />} />
              <Route path="/editor-drivers/:id" element={<DriverEditor />} />
              <Route path="/trucks" element={<TruckScreen />} />
              <Route path="/admin-trucks" element={<TruckAdmin />} />
              <Route path="/editor-trucks/:id" element={<TrucksEditor />} /> 
              <Route path="/trailers" element={<TrailerScreen />} />
              <Route path="/admin-trailers" element={<TrailerAdmin />} />
              <Route path="/editor-trailers/:id" element={<TrailerEdit />} /> 
              <Route path="/trips" element={<TripScreen />} />
              <Route path="/trips-new" element={<TripScreenNew />} />
              <Route path="/admin-trips" element={<TripAdmin />} />
              <Route path="/admin-diesel" element={<DieselAdmin />} />
              <Route path="/detalle-diesel/:tripId" element={<DieselDetalle />} />
              <Route path="/editor-diesel/:id/:trip_id" element={<DieselEditor />} />
              <Route path="/admin-gastos" element={<GastosAdmin />} />
              <Route path="/detalle-gastos/:tripId" element={<GastosDetalle />} />
              <Route path="/editor-gastos/:id/:trip_id" element={<GastosEditor />} />
              <Route path="/admin-gastos-generales" element={<AdminGastosGeneral />} />
              <Route path="/edit-trip/:tripId" element={<EditTripForm />} />
              <Route path="/edit-trailer/:trailerId" element={<TrailerEdit />} />
              <Route path="/ImaAdmin" element={<ImaAdmin />} />
              <Route path="/ImaScreen" element={<ImaScreen />} />
              <Route path="/Inspeccion-final" element={<Inspeccion_final />} />
              <Route path="/new-expense" element={<ExpenseScreen />} />
              <Route path="/edit-expense/:id_gasto" element={<ExpenseEdit />} />
              <Route path="/view-inventory" element={<StockAdmin />} />
              <Route path="/new-service-order" element={<ServiceOrderScreen />} />
              <Route path="/admin-service-order" element={<ServiceOrderAdmin />} />
              <Route path="/editar-orden/:orderId" element={<ServiceOrderScreenEdit />} />
              <Route path="/finanzas" element={<Finanzas />} />
              <Route path="/ResumenTrip/:tripId" element={<ResumenTrip />} />
              <Route path="/access-manager" element={<ProfileAccessManager />} />
              <Route path="/ResiduoTrip" element={<ResiduoTrip />} />  
              <Route path="/reports" element={<Reports />} />  
              <Route path="/tracking" element={<Tracking />} />  
              <Route path="/margen" element={<MargenScreen />} />  
              <Route path="/paymentDrivers" element ={<PaymentDrivers />} />
              <Route path='/millasDriversTable' element ={<MillasDriversTable/>} />
              <Route path='/ticketPayment/:trip_id' element ={<TicketPayment/>} />
              <Route path="*" element={<Navigate to="/home" replace />} /> 

            </Route>
          )}
        </Routes>
      </Router>
    </Provider>
  );
};

export default AppRouter;

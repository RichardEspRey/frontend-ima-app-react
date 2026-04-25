import React, { useContext } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthContext } from '../auth/AuthContext';
import { Provider } from 'react-redux';
import store from './store';

import LoginScreen from '../pages/Login/Login.jsx';
import DashboardLayout from '../layouts/DashboardLayout';
import HomeScreen from '../pages/Reports.jsx';
import DriverAdmin from '../pages/DriverAdmin.jsx';
import DriverEditor from '../pages/DriverEditor.jsx';
import TripAdmin from '../pages/TripAdmin.jsx';
import TripScreen from '../pages/TripsScreen.jsx';
import TripScreenNew from '../pages/TripsScreenNew.jsx';
import DriverScreen from '../pages/DriverScreen.jsx';
import TruckAdmin from '../pages/TruckAdmin.jsx';
import TruckScreen from '../pages/TruckScreen.jsx';
import TrucksEditor from '../pages/TrucksEditor.jsx';
import TrailerScreen from '../pages/TrailerScreen.jsx';
import TrailerAdmin from '../pages/TrailerAdmin.jsx';
import TrailerEdit from '../pages/TrailerEdit.jsx';
import EditTripForm from '../pages/EditTripForm.jsx';
import EditTripUpcoming from '../pages//Dispatch/EditUpcoming.jsx';
import ImaScreen from '../pages/ImaScreen.jsx';
import ImaAdmin from '../pages/ImaAdmin.jsx';
import DieselAdmin from '../pages/Trips/DieselAdmin.jsx';
import DieselDetalle from '../pages/Trips/DieselDetalle.jsx';
import DieselEditor from '../pages/Trips/DieselEditor.jsx';
import GastosAdmin from '../pages/Trips/GastosAdmin.jsx';
import GastosDetalle from '../pages/Trips/GastosDetalle.jsx';
import GastosEditor from '../pages/Trips/GastosEditor.jsx';
import AdminGastosGeneral from '../pages/AdminGastos.jsx';
import Inspeccion_final from '../pages/Mantenimientos/Inspeccion_final.jsx';
import ExpenseScreen from '../pages/ExpenseScreen.jsx';
import ExpenseEdit from '../pages/ExpenseEdit.jsx';
import StockAdmin from '../pages/StockAdmin.jsx';
import ServiceOrderScreen from '../pages/ServiceOrderScreen.jsx';
import ServiceOrderScreenEdit from '../pages/ServiceOrderScreenEdit.jsx';
import ServiceOrderAdmin from '../pages/ServiceOrderAdmin.jsx';
import Finanzas from '../pages/Finanzas.jsx';
import ResumenTrip from '../pages/ResumenTrip.jsx';
import ResiduoTrip from '../pages/Finanzas/ResiduosTrips.jsx';
import ProfileAccessManager from '../pages/ProfileAccessManager.jsx';
import Reports from '../pages/Reports.jsx';
import Tracking from '../pages/Mapas/Tracking.jsx';
import { Welcome } from '../pages/Welcome.jsx';
import MargenScreen from '../pages/MargenScreen.jsx';
import PaymentDrivers from '../pages/Finanzas/PaymentDrivers.jsx';
import MillasDriversTable from '../pages/Finanzas/MillasDriversTable.jsx';
import TicketPayment from '../pages/Finanzas/TicketPayment.jsx';
import Autonomia from '../pages/Autonomia.jsx';
import EstatusUnidades from '../pages/EstatusUnidades.jsx';
import Afinaciones from '../pages/Afinaciones.jsx';
import AfinacionesHistory from '../pages/AfinacionesHistory.jsx';
import CrearViaje from '../pages/Dispatch/CrearViaje.jsx';
import Safety from '../pages/Safety/Safety.jsx';
import Ifta from '../pages/Safety/IFTA.jsx';
import Nomina from '../pages/Nomina/Nomina.jsx';
import PersonalAdmin from '../pages/Nomina/PersonalAdmin.jsx';
import DetallePago from '../pages/Nomina/DetallePago.jsx';
import RoadRepairsAdmin from '../pages/RoadRepairsAdmin.jsx';

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
              <Route path="/home" element={<Welcome />} />
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
              <Route path="/edit-trip-upcoming/:tripId" element={<EditTripUpcoming />} />
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
              <Route path="/safety" element={<Safety />} />
              <Route path="/Ifta" element={<Ifta />} />
              <Route path="/tracking" element={<Tracking />} />
              <Route path="/margen" element={<MargenScreen />} />
              <Route path="/paymentDrivers" element={<PaymentDrivers />} />
              <Route path="/millasDriversTable" element={<MillasDriversTable />} />
              <Route path="/ticketPayment/:trip_id" element={<TicketPayment />} />
              <Route path="/autonomia" element={<Autonomia />} />
              <Route path="/afinaciones" element={<Afinaciones />} />
              <Route path="/registros-afinaciones" element={<AfinacionesHistory />} />
              <Route path="/estatus-unidades" element={<EstatusUnidades />} />
              <Route path="/CrearViaje" element={<CrearViaje />} />
              <Route path="/nomina" element={<Nomina />} />
              <Route path="/personal" element={<PersonalAdmin />} />
              <Route path="/detalle-pago/:period_id" element={<DetallePago />} />
              <Route path="/road-repairs" element={<RoadRepairsAdmin />} />
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Route>
          )}
        </Routes>
      </Router>
    </Provider>
  );
};

export default AppRouter;

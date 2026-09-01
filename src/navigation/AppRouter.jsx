import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { useAuthStore } from '../store/useAuthStore'; 


import LoginScreen from '../screens/Login/Login.jsx';
import DashboardLayout from '../layouts/DashboardLayout';
import ConductoresPage from '../pages/unidades/ConductoresPage.jsx';
import DriverEditor from '../screens/DriverEditor.jsx';
import TripAdmin from '../screens/Viajes/TripAdmin.jsx';
import TripScreen from '../screens/Viajes/TripsScreen.jsx';
import TripScreenNew from '../screens/Viajes/TripsScreenNew.jsx';
import DriverScreen from '../screens/DriverScreen.jsx';
import CamionesPage from '../pages/unidades/CamionesPage.jsx';
import TruckScreen from '../screens/TruckScreen.jsx';
import TrucksEditor from '../screens/TrucksEditor.jsx';
import TrailerScreen from '../screens/TrailerScreen.jsx';
import CajasPage from '../pages/unidades/CajasPage.jsx';
import TrailerEdit from '../screens/TrailerEdit.jsx';
import EditTripForm from '../screens/EditTripForm.jsx';
import EditTripComplete from '../screens/EditTripComplete.jsx';
import EditarViajeProximoPage from '../pages/dispatch/EditarViajeProximoPage.jsx';
import DieselAdmin from '../screens/Gastos/DieselAdmin.jsx';
import DieselDetalle from '../screens/Gastos/DieselDetalle.jsx';
import DieselEditor from '../screens/Gastos/DieselEditor.jsx';
import GastosAdmin from '../screens/Gastos/GastosAdmin.jsx';
import GastosDetalle from '../screens/Gastos/GastosDetalle.jsx';
import GastosEditor from '../screens/Gastos/GastosEditor.jsx';
import AdminGastosGeneral from '../screens/Gastos/AdminGastos.jsx';
import InspeccionFinalPage from '../pages/mantenimientos/InspeccionFinalPage.jsx';
import ExpenseEdit from '../screens/Gastos/ExpenseEdit.jsx';
import NuevaOrdenPage from '../pages/mantenimientos/NuevaOrdenPage.jsx';
import EditarOrdenPage from '../pages/mantenimientos/EditarOrdenPage.jsx';
import OrdenesServicioPage from '../pages/mantenimientos/OrdenesServicioPage.jsx';
import FinanzasPage from '../pages/finanzas/FinanzasPage.jsx';
import ResumenTrip from '../screens/ResumenTrip.jsx';
import ResiduosPage from '../pages/finanzas/ResiduosPage.jsx';
import AccesosPage from '../pages/accesos/AccesosPage.jsx';
import ReportsPage from '../pages/reports/ReportsPage.jsx';
import TrackingPage from '../pages/tracking/TrackingPage.jsx';
import { InicioPage } from '../pages/inicio/InicioPage.jsx';
import MargenPage from '../pages/finanzas/MargenPage.jsx';
import PagosConductoresPage from '../pages/finanzas/PagosConductoresPage.jsx';
import TarifasConductorPage from '../pages/finanzas/TarifasConductorPage.jsx';
import TicketPagoPage from '../pages/finanzas/TicketPagoPage.jsx';
import AutonomiaPage from '../pages/mantenimientos/AutonomiaPage.jsx';
import TableroCombustiblePage from '../pages/unidades/TableroCombustiblePage.jsx';
import AfinacionesPage from '../pages/mantenimientos/AfinacionesPage.jsx';
import AfinacionesHistorialPage from '../pages/mantenimientos/AfinacionesHistorialPage.jsx';
import CrearViajePage from '../pages/dispatch/CrearViajePage.jsx';
import SafetyPage from '../pages/safety/SafetyPage.jsx';
import IftaPage from '../pages/safety/IftaPage.jsx';
import NominaPage from '../pages/nomina/NominaPage.jsx';
import PersonalPage from '../pages/nomina/PersonalPage.jsx';
import DetallePagoPage from '../pages/nomina/DetallePagoPage.jsx';
import ReparacionesRutaPage from '../pages/mantenimientos/ReparacionesRutaPage.jsx';
import Cotizador from '../screens/Viajes/Cotizacion.jsx';
import DocumentosPage from '../pages/documentos/DocumentosPage.jsx';
import InspeccionesPage from '../pages/mantenimientos/InspeccionesPage.jsx';

const AppRouter = () => {
  const { user, loading } = useAuthStore();

  if (loading) return null;

  return (
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
            <Route path="/home" element={<InicioPage />} />
            <Route path="/drivers" element={<DriverScreen />} />
            <Route path="/admin-drivers" element={<ConductoresPage />} />
            <Route path="/editor-drivers/:id" element={<DriverEditor />} />
            <Route path="/trucks" element={<TruckScreen />} />
            <Route path="/admin-trucks" element={<CamionesPage />} />
            <Route path="/editor-trucks/:id" element={<TrucksEditor />} /> 
            <Route path="/trailers" element={<TrailerScreen />} />
            <Route path="/admin-trailers" element={<CajasPage />} />
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
            <Route path="/edit-trip-complete/:tripId" element={<EditTripComplete />} />
            <Route path="/edit-trip-upcoming/:tripId" element={<EditarViajeProximoPage />} />
            <Route path="/edit-trailer/:trailerId" element={<TrailerEdit />} />
            <Route path="/Inspeccion-final" element={<InspeccionFinalPage />} />
            <Route path="/edit-expense/:id_gasto" element={<ExpenseEdit />} />
            <Route path="/view-inventory" element={<OrdenesServicioPage />} />
            <Route path="/new-service-order" element={<NuevaOrdenPage />} />
            <Route path="/admin-service-order" element={<OrdenesServicioPage />} />
            <Route path="/editar-orden/:orderId" element={<EditarOrdenPage />} />
            <Route path="/finanzas" element={<FinanzasPage />} />
            <Route path="/ResumenTrip/:tripId" element={<ResumenTrip />} />
            <Route path="/access-manager" element={<AccesosPage />} />
            <Route path="/ResiduoTrip" element={<ResiduosPage />} />  
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/safety" element={<SafetyPage />} />  
            <Route path="/Ifta" element={<IftaPage />} />  
            <Route path="/tracking" element={<TrackingPage />} />  
            <Route path="/margen" element={<MargenPage />} />  
            <Route path="/paymentDrivers" element ={<PagosConductoresPage />} />
            <Route path='/millasDriversTable' element ={<TarifasConductorPage/>} />
            <Route path='/ticketPayment/:trip_id' element ={<TicketPagoPage/>} />
            <Route path="/autonomia" element={<AutonomiaPage />} />
            <Route path="/afinaciones" element={<AfinacionesPage />} />
            <Route path="/registros-afinaciones" element={<AfinacionesHistorialPage />} />
            <Route path="/estatus-unidades" element={<TableroCombustiblePage />} />
            <Route path="/CrearViaje" element={<CrearViajePage />} />
            <Route path="/nomina" element={<NominaPage />} />
            <Route path="/personal" element={<PersonalPage />} />
            <Route path="/detalle-pago/:period_id" element={<DetallePagoPage />} />
            <Route path="/road-repairs" element={<ReparacionesRutaPage />} />
             <Route path="/cotizador" element={<Cotizador />} />
            <Route path="*" element={<Navigate to="/home" replace />} /> 
            <Route path="/ima-manager" element={<DocumentosPage />} />
            <Route path="/inspecciones" element={<InspeccionesPage />} />
          </Route>
        )}
      </Routes>
    </Router>
  );
};

export default AppRouter;
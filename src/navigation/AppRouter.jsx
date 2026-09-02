import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { useAuthStore } from '../store/useAuthStore'; 

import LoginScreen from '../screens/Login/Login.jsx';
import DashboardLayout from '../layouts/DashboardLayout';
import ConductoresPage from '../pages/unidades/ConductoresPage.jsx';
import AdminViajesPage from '../pages/viajes/AdminViajesPage.jsx';
import CamionesPage from '../pages/unidades/CamionesPage.jsx';
import CajasPage from '../pages/unidades/CajasPage.jsx';
import EditarViajePage from '../pages/viajes/EditarViajePage.jsx';
import EditarViajeCompletoPage from '../pages/viajes/EditarViajeCompletoPage.jsx';
import EditarViajeProximoPage from '../pages/dispatch/EditarViajeProximoPage.jsx';
import DieselPage from '../pages/gastos/DieselPage.jsx';
import DieselDeViajePage from '../pages/gastos/DieselDeViajePage.jsx';
import EditarDieselPage from '../pages/gastos/EditarDieselPage.jsx';
import GastosViajePage from '../pages/gastos/GastosViajePage.jsx';
import GastosDeViajePage from '../pages/gastos/GastosDeViajePage.jsx';
import EditarGastoPage from '../pages/gastos/EditarGastoPage.jsx';
import ExpenseManagerPage from '../pages/gastos/ExpenseManagerPage.jsx';
import InspeccionFinalPage from '../pages/mantenimientos/InspeccionFinalPage.jsx';
import EditarGastoGeneralPage from '../pages/gastos/EditarGastoGeneralPage.jsx';
import NuevaOrdenPage from '../pages/mantenimientos/NuevaOrdenPage.jsx';
import EditarOrdenPage from '../pages/mantenimientos/EditarOrdenPage.jsx';
import OrdenesServicioPage from '../pages/mantenimientos/OrdenesServicioPage.jsx';
import FinanzasPage from '../pages/finanzas/FinanzasPage.jsx';
import ResumenViajePage from '../pages/viajes/ResumenViajePage.jsx';
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
import CotizadorPage from '../pages/viajes/CotizadorPage.jsx';
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
            <Route path="/admin-drivers" element={<ConductoresPage />} />
            <Route path="/admin-trucks" element={<CamionesPage />} />
            <Route path="/admin-trailers" element={<CajasPage />} />
            <Route path="/admin-trips" element={<AdminViajesPage />} />
            <Route path="/admin-diesel" element={<DieselPage />} />
            <Route path="/detalle-diesel/:tripId" element={<DieselDeViajePage />} />
            <Route path="/editor-diesel/:id/:trip_id" element={<EditarDieselPage />} />
            <Route path="/admin-gastos" element={<GastosViajePage />} />
            <Route path="/detalle-gastos/:tripId" element={<GastosDeViajePage />} />
            <Route path="/editor-gastos/:id/:trip_id" element={<EditarGastoPage />} />
            <Route path="/admin-gastos-generales" element={<ExpenseManagerPage />} />
            <Route path="/edit-trip/:tripId" element={<EditarViajePage />} />
            <Route path="/edit-trip-complete/:tripId" element={<EditarViajeCompletoPage />} />
            <Route path="/edit-trip-upcoming/:tripId" element={<EditarViajeProximoPage />} />
            <Route path="/Inspeccion-final" element={<InspeccionFinalPage />} />
            <Route path="/edit-expense/:id_gasto" element={<EditarGastoGeneralPage />} />
            <Route path="/view-inventory" element={<OrdenesServicioPage />} />
            <Route path="/new-service-order" element={<NuevaOrdenPage />} />
            <Route path="/admin-service-order" element={<OrdenesServicioPage />} />
            <Route path="/editar-orden/:orderId" element={<EditarOrdenPage />} />
            <Route path="/finanzas" element={<FinanzasPage />} />
            <Route path="/ResumenTrip/:tripId" element={<ResumenViajePage />} />
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
             <Route path="/cotizador" element={<CotizadorPage />} />

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
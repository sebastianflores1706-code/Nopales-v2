import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import EspaciosLista from "./pages/espacios/EspaciosLista.tsx";
import EspacioDetalle from "./pages/espacios/EspacioDetalle.tsx";
import EspacioForm from "./pages/espacios/EspacioForm.tsx";
import ReservacionesLista from "./pages/reservaciones/ReservacionesLista.tsx";
import ReservacionDetalle from "./pages/reservaciones/ReservacionDetalle.tsx";
import ReservacionForm from "./pages/reservaciones/ReservacionForm.tsx";
import CalendarioView from "./pages/calendario/CalendarioView.tsx";
import PagosLista from "./pages/pagos/PagosLista.tsx";
import PagoDetalle from "./pages/pagos/PagoDetalle.tsx";
import PagoForm from "./pages/pagos/PagoForm.tsx";
import ContratosLista from "./pages/contratos/ContratosLista.tsx";
import Login from "./pages/auth/Login.tsx";
import UserDashboard from "./pages/user/UserDashboard.tsx";
import UserEspacios from "./pages/user/UserEspacios.tsx";
import UserEspacioDetalle from "./pages/user/UserEspacioDetalle.tsx";
import UserReservaciones from "./pages/user/UserReservaciones.tsx";
import UserReservacionDetalle from "./pages/user/UserReservacionDetalle.tsx";
import UserNuevaReservacion from "./pages/user/UserNuevaReservacion.tsx";
import UserPagos from "./pages/user/UserPagos.tsx";
import UserContratos from "./pages/user/UserContratos.tsx";
import UsuariosLista from "./pages/usuarios/UsuariosLista.tsx";
import MantenimientosLista from "./pages/mantenimientos/MantenimientosLista.tsx";

const App = () => (
  <ThemeProvider>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Pública */}
            <Route path="/login" element={<Login />} />

            {/* Panel admin (protegido por rol admin) */}
            <Route path="/" element={<ProtectedRoute requiredRol="admin"><Index /></ProtectedRoute>} />
            <Route path="/espacios" element={<ProtectedRoute requiredRol="admin"><EspaciosLista /></ProtectedRoute>} />
            <Route path="/espacios/nuevo" element={<ProtectedRoute requiredRol="admin"><EspacioForm /></ProtectedRoute>} />
            <Route path="/espacios/:id" element={<ProtectedRoute requiredRol="admin"><EspacioDetalle /></ProtectedRoute>} />
            <Route path="/espacios/:id/editar" element={<ProtectedRoute requiredRol="admin"><EspacioForm /></ProtectedRoute>} />
            <Route path="/reservaciones" element={<ProtectedRoute requiredRol="admin"><ReservacionesLista /></ProtectedRoute>} />
            <Route path="/reservaciones/nueva" element={<ProtectedRoute requiredRol="admin"><ReservacionForm /></ProtectedRoute>} />
            <Route path="/reservaciones/:id" element={<ProtectedRoute requiredRol="admin"><ReservacionDetalle /></ProtectedRoute>} />
            <Route path="/calendario" element={<ProtectedRoute requiredRol="admin"><CalendarioView /></ProtectedRoute>} />
            <Route path="/pagos" element={<ProtectedRoute requiredRol="admin"><PagosLista /></ProtectedRoute>} />
            <Route path="/pagos/nuevo" element={<ProtectedRoute requiredRol="admin"><PagoForm /></ProtectedRoute>} />
            <Route path="/pagos/:id" element={<ProtectedRoute requiredRol="admin"><PagoDetalle /></ProtectedRoute>} />
            <Route path="/contratos" element={<ProtectedRoute requiredRol="admin"><ContratosLista /></ProtectedRoute>} />
            <Route path="/usuarios" element={<ProtectedRoute requiredRol="admin"><UsuariosLista /></ProtectedRoute>} />
            <Route path="/mantenimiento" element={<ProtectedRoute requiredRol="admin"><MantenimientosLista /></ProtectedRoute>} />

            {/* Portal ciudadano (protegido, requiere rol ciudadano) */}
            <Route
              path="/portal"
              element={
                <ProtectedRoute requiredRol="ciudadano">
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/espacios"
              element={
                <ProtectedRoute requiredRol="ciudadano">
                  <UserEspacios />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/espacios/:id"
              element={
                <ProtectedRoute requiredRol="ciudadano">
                  <UserEspacioDetalle />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/reservaciones"
              element={
                <ProtectedRoute requiredRol="ciudadano">
                  <UserReservaciones />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/reservaciones/nueva"
              element={
                <ProtectedRoute requiredRol="ciudadano">
                  <UserNuevaReservacion />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/reservaciones/:id"
              element={
                <ProtectedRoute requiredRol="ciudadano">
                  <UserReservacionDetalle />
                </ProtectedRoute>
              }
            />

            <Route
              path="/portal/pagos"
              element={
                <ProtectedRoute requiredRol="ciudadano">
                  <UserPagos />
                </ProtectedRoute>
              }
            />

            <Route
              path="/portal/contratos"
              element={
                <ProtectedRoute requiredRol="ciudadano">
                  <UserContratos />
                </ProtectedRoute>
              }
            />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </ThemeProvider>
);

export default App;

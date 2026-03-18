import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/espacios" element={<EspaciosLista />} />
          <Route path="/espacios/nuevo" element={<EspacioForm />} />
          <Route path="/espacios/:id" element={<EspacioDetalle />} />
          <Route path="/espacios/:id/editar" element={<EspacioForm />} />
          <Route path="/reservaciones" element={<ReservacionesLista />} />
          <Route path="/reservaciones/nueva" element={<ReservacionForm />} />
          <Route path="/reservaciones/:id" element={<ReservacionDetalle />} />
          <Route path="/calendario" element={<CalendarioView />} />
          <Route path="/pagos" element={<PagosLista />} />
          <Route path="/pagos/nuevo" element={<PagoForm />} />
          <Route path="/pagos/:id" element={<PagoDetalle />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

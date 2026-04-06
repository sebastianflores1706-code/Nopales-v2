import { QueryClient } from "@tanstack/react-query";

// Instancia única compartida entre App.tsx y AuthContext.tsx
// Esto permite llamar queryClient.clear() en AuthContext sin depender
// del hook useQueryClient(), que puede fallar si el contexto no está disponible.
export const queryClient = new QueryClient();

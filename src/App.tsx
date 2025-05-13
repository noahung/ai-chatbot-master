import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ChatbotProvider } from "@/context/ChatbotContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import TrainingData from "./pages/TrainingData";
import ChatbotSettings from "./pages/ChatbotSettings";
import Integration from "./pages/Integration";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/layout/DashboardLayout";
import ChatbotPreview from "./components/ChatbotPreview";
import Auth from "./pages/Auth";
import RequireAuth from "./components/auth/RequireAuth";
import ChatbotWidget from "./pages/ChatbotWidget";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename="/ai-chatbot-master">
        <AuthProvider>
          <ChatbotProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={
                <RequireAuth>
                  <DashboardLayout />
                </RequireAuth>
              }>
                <Route index element={<Dashboard />} />
                <Route path="clients" element={<Clients />} />
                <Route path="clients/:id" element={<ClientDetail />} />
                <Route path="clients/:id/training" element={<TrainingData />} />
                <Route path="clients/:id/settings" element={<ChatbotSettings />} />
                <Route path="clients/:id/integration" element={<Integration />} />
              </Route>
              <Route path="/preview/:id" element={<ChatbotPreview />} />
              <Route path="/chatbot" element={<ChatbotWidget />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ChatbotProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

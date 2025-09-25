import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LastUsed from "./pages/recent/LastUsed";
import FormalWear from "./pages/category/FormalWear";
import Accessories from "./pages/category/Accessories";
import Favorites from "./pages/personal/Favorites";
import AIRecommendations from "./pages/ai/Recommendations";
import Settings from "./pages/Settings";
import CategoryLanding from "./pages/CategoryLanding";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CategoryLanding />} />
          <Route path="/ai-recommendations" element={<Index />} />
          <Route path="/recent/last-used" element={<LastUsed />} />
          <Route path="/recent/last-month" element={<LastUsed />} />
          <Route path="/recent/last-purchased" element={<LastUsed />} />
          <Route path="/seasonal/spring-2024" element={<CategoryLanding />} />
          <Route path="/seasonal/winter-2024" element={<CategoryLanding />} />
          <Route path="/category/formal" element={<FormalWear />} />
          <Route path="/category/accessories" element={<Accessories />} />
          <Route path="/personal/favorites" element={<Favorites />} />
          <Route path="/personal/archived" element={<Favorites />} />
          <Route path="/ai/recommendations" element={<AIRecommendations />} />
          <Route path="/ai/trends" element={<AIRecommendations />} />
          <Route path="/settings" element={<Settings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

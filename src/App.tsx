import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import IndexBackup from "./pages/Index.backup";
import NotFound from "./pages/NotFound";
import MealDetail from "./pages/MealDetail";
import ProductDetail from "./pages/ProductDetail";
import RecipeDetail from "./pages/RecipeDetail";
import MyPantry from "./pages/MyPantry";
import GenerateMealPlan from "./pages/GenerateMealPlan";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import Register from "./pages/Register";
import AuthGuard from "./components/AuthGuard";
import { PantryProvider } from "./contexts/PantryContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <PantryProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthGuard><Index /></AuthGuard>} />
          <Route path="/meal/:mealId" element={<MealDetail />} />
          <Route path="/product/:productId" element={<AuthGuard><ProductDetail /></AuthGuard>} />
          <Route path="/recipe/:recipeId" element={<AuthGuard><RecipeDetail /></AuthGuard>} />
          <Route path="/pantry" element={<AuthGuard><MyPantry /></AuthGuard>} />
          <Route path="/plan" element={<AuthGuard><GenerateMealPlan /></AuthGuard>} />
          <Route path="/profile" element={<AuthGuard><Profile /></AuthGuard>} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/register" element={<Register />} />
          <Route path="/index2" element={<AuthGuard><IndexBackup /></AuthGuard>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </PantryProvider>
  </QueryClientProvider>
);

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PassengerDashboard from "./pages/PassengerDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import DriverOnboarding from "./pages/DriverOnboarding";
import About from "./pages/About";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import RideSearchResults from "./pages/RideSearchResults";
import BookingConfirmation from "./pages/BookingConfirmation";
import BestOffers from "./pages/BestOffers";
import BookingForm from "./components/booking/BookingForm";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path="/" element={<Index />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/passenger/dashboard" element={<PassengerDashboard />} />
            <Route path="/driver/dashboard" element={<DriverDashboard />} />
            <Route path="/driver" element={<DriverOnboarding />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
          <Route path="/about" element={<About />} />
          <Route path="/auth/signup" element={<SignUp />} />
          <Route path="/auth/signin" element={<SignIn />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/ride-search" element={<RideSearchResults />} />
          <Route path="/best-offers" element={<BestOffers />} />
          <Route path="/booking-confirmation" element={<BookingConfirmation />} />
          <Route path="/booking-form" element={<BookingForm />} />
          <Route path="/contact" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

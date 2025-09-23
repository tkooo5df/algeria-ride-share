import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DriverOnboarding from "./pages/DriverOnboarding";
import DriverOnboardingTest from "./components/DriverOnboardingTest";
import DriverOnboardingTestPage from "./components/DriverOnboardingTestPage";
import DriverInfoVerification from "./components/DriverInfoVerification";
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
import AdminRoute from "./components/AdminRoute";
import UserDashboard from "./pages/UserDashboard";
import BookingSuccess from "./pages/BookingSuccess";
import DatabaseSettings from "./pages/DatabaseSettings";
import DataManagement from "./pages/DataManagement";

const queryClient = new QueryClient();

function App() {
  return (
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
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/user-dashboard" element={<UserDashboard />} />
              <Route path="/driver" element={<DriverOnboarding />} />
              <Route path="/driver-test" element={<DriverOnboardingTest />} />
              <Route path="/driver-test-page" element={<DriverOnboardingTestPage />} />
              <Route path="/driver-verify" element={<DriverInfoVerification />} />
            </Route>
            <Route element={<ProtectedRoute requireRole="admin" />}>
              <Route path="/admin/users" element={<Navigate to="/dashboard" replace />} />
              <Route path="/admin/settings" element={<Navigate to="/dashboard" replace />} />
            </Route>
            <Route path="/about" element={<About />} />
            <Route path="/auth/signup" element={<SignUp />} />
            <Route path="/auth/signin" element={<SignIn />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/ride-search" element={<RideSearchResults />} />
            <Route path="/best-offers" element={<BestOffers />} />
            <Route path="/booking-confirmation" element={<BookingConfirmation />} />
            <Route path="/booking-success" element={<BookingSuccess />} />
            <Route path="/booking-form" element={<BookingForm />} />
            <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
            <Route path="/contact" element={<Index />} />
            <Route path="/data-management" element={<DataManagement />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            {/* Add Database Settings route */}
            <Route path="/database-settings" element={<DatabaseSettings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
import { Routes, Route } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import CheckAuth from "./components/common/check-auth";
import { checkAuth } from "./store/auth-slice";

import AuthLayout from "./components/auth/layout";
import AuthLogin from "./pages/auth/login";
import AuthRegister from "./pages/auth/register";

/*patient page */
import PatientLayout from "./components/patient-view/layout";

import { Skeleton } from "../src/components/ui/skeleton";
import PatientHome from "./components/patient-view/home";

/*pharmacist page */
import PharmacistLayout from "./components/pharmacist-view/layout";
import PharmacistDashboard from "./pages/pharmacist-view/dashboard";
import Pharmacy from "./pages/pharmacist-view/pharmacy";
import PharmacistMedicines from "./pages/pharmacist-view/medicines";
import PharmacistOrders from "./pages/pharmacist-view/orders";

function App() {
  const { user, isAuthenticated, isLoading } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);
  if (isLoading)
    return <Skeleton className="w-[800] bg-black h-[600px] w-[600px]" />;

  return (
    <div className="flex flex-col overflow-hidden bg-white">
      <Routes>
        <Route
          path="/auth"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <AuthLayout />
            </CheckAuth>
          }
        >
          <Route path="login" element={<AuthLogin />} />
          <Route path="register" element={<AuthRegister />} />
        </Route>

        {/* patient related routes */}
        <Route
          path="/patient"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <PatientLayout />
            </CheckAuth>
          }
        >
          <Route path="home" element={<PatientHome />} />
        </Route>

        {/* pharamcist related routes */}
        <Route
          path="/pharmacist"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <PharmacistLayout />
            </CheckAuth>
          }
        >
          <Route path="dashboard" element={<PharmacistDashboard />} />
          <Route path="pharmacy" element={<Pharmacy />} />
          <Route path="medicines" element={<PharmacistMedicines />} />
          <Route path="orders" element={<PharmacistOrders />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;

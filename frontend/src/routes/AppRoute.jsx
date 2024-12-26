import { BrowserRouter, Route, Routes } from "react-router-dom";
import global from "../config/config.js";
import { AuthProvider } from "../context/auth.jsx";
import { LoginPage } from "../pages/Auth/index.js";
import RegisterPage from "../pages/Auth/RegisterPage.jsx";
import { HomePage } from "../pages/home/index.js";

const AppRoute = () => {
  console.log(global);
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <AuthProvider>
              <LoginPage />
            </AuthProvider>
          }
        />
        <Route
          path="/register"
          element={
            <AuthProvider>
              <RegisterPage />
            </AuthProvider>
          }
        />
        <Route path="/" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
};
export default AppRoute;

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import global from "../config/config.js";
import { AuthProvider } from "../context/auth.jsx";
import { MainLayout } from "../layout/Main.jsx";
import { LoginPage } from "../pages/auth/index.js";
import RegisterPage from "../pages/auth/RegisterPage.jsx";
import { HomePage } from "../pages/home/index.js";

const AppRoute = () => {
  console.log(global);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />}></Route>
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
        <Route
          path="/home"
          element={
            <MainLayout>
              <HomePage />
            </MainLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};
export default AppRoute;

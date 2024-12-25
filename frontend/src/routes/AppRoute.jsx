import { BrowserRouter, Route, Routes } from "react-router-dom";
import global from "../config/config.js";
import { HomePage } from "../pages/home/index.js";
import { LoginPage } from "../pages/Login/index.js";

const AppRoute = () => {
  console.log(global);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
};
export default AppRoute;

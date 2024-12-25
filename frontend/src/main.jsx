import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import AppRoute from "./routes/AppRoute.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppRoute />
  </StrictMode>,
);

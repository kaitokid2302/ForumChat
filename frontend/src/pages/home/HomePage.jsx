import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { deleteJwt, jwtCheck } from "../../services/auth/jwt.js";

export default function HomePage() {
  const ok = jwtCheck();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ok) {
      deleteJwt();
      navigate("/login");
    }
  }, [ok, navigate]);

  return null;
}

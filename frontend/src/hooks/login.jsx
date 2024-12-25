import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api/interceptor.js";
import { setJwt } from "../services/auth/jwt.js";

const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/user/login", { username, password });
      const token = response.data.data;
      if (!token) {
        setError(response.data.message);
        throw new Error(response.data.message);
      }
      setJwt(token);
      navigate("/");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};

export default useLogin;

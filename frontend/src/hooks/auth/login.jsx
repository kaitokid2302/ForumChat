import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../../services/api/auth.js";
import { setAuth } from "../../services/auth/jwt.js";

const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await loginRequest({ username, password });
      const token = response.data.token;
      if (!token) {
        setError("Login failed");
        throw new Error("Login failed");
      }
      setAuth(token, response.data.userID);
      navigate("/home");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};

export default useLogin;

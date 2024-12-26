import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth.jsx";
import { registerRequest } from "../services/api/auth";

const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { setRegisterSuccess } = useContext(AuthContext);

  const register = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await registerRequest({ username, password });
      if (res.code == 400) {
        throw new Error(res.message);
      }
      setRegisterSuccess(true);
      setLoading(true);
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { register, loading, error };
};

export default useRegister;

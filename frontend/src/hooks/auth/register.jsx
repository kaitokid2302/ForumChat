import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/auth/Auth.jsx";
import { registerRequest } from "../../services/api/auth.js";

const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { setRegisterSuccess } = useContext(AuthContext);

  const register = async (username, password) => {
    setError(null);
    try {
      setLoading(true);
      const res = await registerRequest({ username, password });
      if (res.code == 400) {
        throw new Error(res.message);
      }
      setRegisterSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 1700);
    } catch (error) {
      setTimeout(() => {
        setError(error.message);
        setLoading(false);
      }, 1700);
    }
  };

  return { register, loading, error };
};

export default useRegister;

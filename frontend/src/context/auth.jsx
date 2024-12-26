import PropTypes from "prop-types";
import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [registerSuccess, setRegisterSuccess] = useState(false);
  return (
    <AuthContext.Provider value={{ registerSuccess, setRegisterSuccess }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

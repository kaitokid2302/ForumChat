import { jwtDecode } from "jwt-decode";

export const setJwt = (jwt) => {
  localStorage.setItem("token", jwt);
};

export const deleteJwt = () => {
  localStorage.removeItem("token");
};

export const futureLogout = () => {
  const token = localStorage.getItem("token");
  // settimeout to delete token
  const exp = jwtDecode(token).exp;
  const now = Date.now().valueOf() / 1000;
  if (now > exp) {
    deleteJwt();
  }
  setTimeout(deleteJwt, exp - now);
};

export const jwtCheck = () => {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const exp = jwtDecode(token).exp;
      const now = Date.now().valueOf() / 1000;
      if (now > exp) {
        deleteJwt();
        return false;
      }
      return true;
    } catch (error) {
      console.error("Invalid token specified:", error);
      deleteJwt();
      return false;
    }
  }
  return false;
};

import { jwtDecode } from "jwt-decode";

export const setAuth = (jwt, userID) => {
  localStorage.setItem("token", jwt);
  localStorage.setItem("userID", userID);
};

export const deleteJwt = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userID");
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
      let userIDlocal = localStorage.getItem("userID");
      let userIDjwt = jwtDecode(token).userID;
      if (userIDlocal !== userIDjwt) {
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

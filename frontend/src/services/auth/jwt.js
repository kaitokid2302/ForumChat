import { jwtDecode } from "jwt-decode";

export const setAuth = async (jwt, userID) => {
  try {
    await Promise.all([
      localStorage.setItem("token", jwt),
      localStorage.setItem("userID", userID),
    ]);

    // Verify storage
    const storedToken = localStorage.getItem("token");
    const storedUserID = localStorage.getItem("userID");

    if (!storedToken || !storedUserID) {
      throw new Error("Failed to store authentication data");
    }

    console.log("setAuth successful:", {
      token: storedToken,
      userID: storedUserID,
    });
  } catch (error) {
    console.error("setAuth failed:", error);
    throw error;
  }
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
      const decoded = jwtDecode(token);
      const now = Date.now().valueOf() / 1000;

      if (now > decoded.exp) {
        deleteJwt();
        return false;
      }

      const userIDlocal = localStorage.getItem("userID");
      const userIDjwt = decoded.userID;

      // Chuyển đổi sang string để so sánh
      if (userIDlocal !== String(userIDjwt)) {
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

import { notification } from "antd";
import { createContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import global from "../../config/config.js";
import { deleteJwt } from "../../services/auth/jwt.js";

export const HomeContext = createContext();

// eslint-disable-next-line react/prop-types
export const HomeProvider = ({ children }) => {
  const navigate = useNavigate();

  // Groups state
  const [groupJoined, setGroupJoined] = useState([]);
  const [groupNotJoined, setGroupNotJoined] = useState([]);
  const [loadingJoined, setLoadingJoined] = useState(false);
  const [loadingNotJoined, setLoadingNotJoined] = useState(false);

  // Messages state
  const [message, setMessage] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // WebSocket refs
  const groupSocket = useRef(null);
  const messageSocket = useRef(null);

  // Notification
  const [api, contextHolder] = notification.useNotification();
  const openNotification = (title, msg) => {
    api.open({
      message: title,
      description: msg,
      duration: 2,
    });
  };

  // Handle JWT verification fail
  const handleJWTFail = () => {
    deleteJwt();
    navigate("/login");
  };

  // Listen for localStorage changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "token" && e.oldValue !== e.newValue) {
        handleJWTFail();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [navigate]);

  // WebSocket connections
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      handleJWTFail();
      return;
    }

    // Group WebSocket
    const groupWS = new WebSocket(`${global.host}/group/ws?token=${token}`);
    groupSocket.current = groupWS;

    groupWS.onopen = () => console.log("Group WebSocket connected");

    groupWS.onerror = () => handleJWTFail();

    groupWS.onclose = () => {
      groupSocket.current?.close();
      messageSocket.current?.close();
    };

    // Message WebSocket
    const messageWS = new WebSocket(`${global.host}/message/ws?token=${token}`);
    messageSocket.current = messageWS;

    messageWS.onopen = () => console.log("Message WebSocket connected");

    messageWS.onerror = () => handleJWTFail();

    messageWS.onclose = () => {
      groupSocket.current?.close();
      messageSocket.current?.close();
    };

    return () => {
      groupWS.close();
      messageWS.close();
    };
  }, [navigate]);

  return (
    <HomeContext.Provider
      value={{
        // Groups
        groupJoined,
        setGroupJoined,
        groupNotJoined,
        setGroupNotJoined,
        loadingJoined,
        setLoadingJoined,
        loadingNotJoined,
        setLoadingNotJoined,

        // Messages
        message,
        setMessage,
        loadingMessages,
        setLoadingMessages,

        // WebSocket instances
        groupSocket: groupSocket.current,
        messageSocket: messageSocket.current,

        // Utils
        openNotification,
      }}
    >
      {contextHolder}
      {children}
    </HomeContext.Provider>
  );
};

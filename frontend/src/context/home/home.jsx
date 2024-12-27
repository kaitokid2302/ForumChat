import { notification } from "antd";
import { createContext, useState } from "react";

export const HomeContext = createContext();

// eslint-disable-next-line react/prop-types
export const HomeProvider = ({ children }) => {
  const [groupJoined, setGroupJoined] = useState([]);
  const [groupNotJoined, setGroupNotJoined] = useState([]);
  const [api, contextHolder] = notification.useNotification();
  const [message, setMessage] = useState([]);
  const openNotification = (title, msg) => {
    api.open({
      message: title,
      description: msg,
      duration: 2,
    });
  };
  return (
    <HomeContext.Provider
      value={{
        groupJoined,
        setGroupJoined,
        groupNotJoined,
        setGroupNotJoined,
        message,
        setMessage,
        openNotification,
      }}
    >
      {contextHolder}
      {children}
    </HomeContext.Provider>
  );
};

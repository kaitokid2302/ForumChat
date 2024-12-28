import { Button } from "antd";
import { useLogout } from "../hooks/layout/mainLayout.js";

// eslint-disable-next-line react/prop-types
export const MainLayout = ({ children }) => {
  const { logout } = useLogout();
  return (
    <div className={"h-screen overflow-hidden"}>
      <div className="w-full text-right">
        {/*    logoutbutton*/}
        <Button color="danger" variant="solid" className="m-2" onClick={logout}>
          Logout
        </Button>
      </div>
      {children}
    </div>
  );
};

import { Button } from "antd";
import { useLogout } from "../hooks/layout/mainLayout.js";

export const MainLayout = ({ children }) => {
  const { logout } = useLogout();
  return (
    <div className="h-screen flex flex-col">
      {/* Header với logout button */}
      <div className="shrink-0 p-2 flex justify-end border-b">
        <Button color="danger" variant="solid" onClick={logout}>
          Logout
        </Button>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
};

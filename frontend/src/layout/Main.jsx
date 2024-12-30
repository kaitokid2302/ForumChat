import {Button} from "antd";
import {useExploreGroup} from "../hooks/layout/group.explore.js";
import {useLogout} from "../hooks/layout/logout.js";

export const MainLayout = ({ children }) => {
  const { logout } = useLogout();
  const handleExploreGroup = useExploreGroup();
  return (
    <div className="h-screen flex flex-col">
      {/* Header với logout button */}
      <div className="shrink-0 p-2 flex justify-end border-b">
        <Button onClick={handleExploreGroup}>Explore group</Button>
        <Button color="danger" variant="solid" onClick={logout}>
          Logout
        </Button>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
};

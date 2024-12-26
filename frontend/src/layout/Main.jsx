import { Button } from "antd";

// eslint-disable-next-line react/prop-types
export const MainLayout = ({ children }) => {
  return (
    <div>
      <div className="w-full text-right">
        {/*    logoutbutton*/}
        <Button color="danger" variant="solid" className="m-2">
          Logout
        </Button>
      </div>
      {children}
    </div>
  );
};

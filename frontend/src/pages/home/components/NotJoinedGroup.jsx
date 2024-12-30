import { HomeContext } from "../../../context/home/Home.jsx";
import { jwtCheck } from "../../../services/auth/jwt.js";

const GroupCard = (value) => {};

export const NotJoinedGroup = () => {
  jwtCheck();
  const { joinedGroups, setJoinedGroups } = useContext(HomeContext);
};

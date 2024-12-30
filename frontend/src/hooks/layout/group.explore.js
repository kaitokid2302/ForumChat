import { useNavigate } from "react-router-dom";

export const useExploreGroup = () => {
  const navigate = useNavigate();
  return () => navigate("/explore");
};

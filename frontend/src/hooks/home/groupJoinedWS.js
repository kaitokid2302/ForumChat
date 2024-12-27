import { useContext, useEffect } from "react";
import { HomeContext } from "../../context/home/home.jsx";
import { getJoinedGroups } from "../../services/api/group.js";

export const useGroupJoinedWS = () => {
  const { groupJoined, setGroupJoined, openNotification } =
    useContext(HomeContext);

  // Fetch all joined groups at first render
  useEffect(() => {
    const fetchJoinedGroups = async () => {
      try {
        const response = await getJoinedGroups();
        setGroupJoined(response.data);
      } catch {
        openNotification("Error", "Failed to fetch joined groups");
      }
    };

    fetchJoinedGroups();
  }, []);

  return {
    groupJoined,
    setGroupJoined,
  };
};

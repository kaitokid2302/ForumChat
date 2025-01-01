// context/home/home.jsx
import { notification } from "antd";
import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import global from "../../config/config.js";
import {
  countUnreadMessage,
  getAllJoinedGroups,
  getAllUnjoinedGroups,
  getAllUsersInAGroup,
} from "../../services/api/api.js";

export const HomeContext = createContext();

// eslint-disable-next-line react/prop-types
export const HomeProvider = ({ children }) => {
  const [joinedGroups, setJoinedGroups] = useState([]); // [{id, name, ownerId, count}]
  const [unjoinedGroups, setUnjoinedGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [api, contextHolder] = notification.useNotification();
  const openNotification = (title, description) => {
    api.info({
      message: title,
      description: description,
      duration: 2,
    });
  };

  const messageWsRef = useRef(null);
  // Setup WebSockets

  const handleSelectGroup = useCallback(
    (groupId) => {
      setActiveGroupId(groupId);
      console.log("Selected group:", groupId);
    },
    [setActiveGroupId],
  );
  // Trong context/home/home.jsx - thêm handleCreate
  const handleCreate = async (groupName) => {
    if (groupWsRef.current?.readyState === WebSocket.OPEN) {
      groupWsRef.current.send(
        JSON.stringify({
          type: "create",
          name: groupName,
        }),
      );

      try {
        // Fetch cả joined và unjoined groups
        const [joinedRes, unjoinedRes] = await Promise.all([
          getAllJoinedGroups(),
          getAllUnjoinedGroups(),
        ]);
        console.log("joinedRes", joinedRes);
        console.log("unjoinedRes", unjoinedRes);

        if (!joinedRes?.data || !unjoinedRes?.data) {
          throw new Error("Invalid response format from API");
        }

        // Xử lý joined groups
        const joinedGroupsData = await Promise.all(
          joinedRes.data.map(async (group) => {
            try {
              const [unreadRes, participantsRes] = await Promise.all([
                countUnreadMessage(group.ID),
                getAllUsersInAGroup(group.ID),
              ]);
              return {
                ID: group.ID,
                name: group.name,
                ownerId: group.owner_id,
                count: unreadRes?.data || 0,
                participant_count: participantsRes.data?.length || 0,
              };
            } catch (error) {
              console.warn(`Failed to get data for group ${group.ID}:`, error);
              return {
                ID: group.ID,
                name: group.name,
                ownerId: group.owner_id,
                count: 0,
                participant_count: 0,
              };
            }
          }),
        );

        // Xử lý unjoined groups
        const unjoinedGroupsData = await Promise.all(
          unjoinedRes.data.map(async (group) => {
            try {
              const participantsRes = await getAllUsersInAGroup(group.ID);
              return {
                ID: group.ID,
                name: group.name,
                ownerId: group.owner_id,
                participant_count: participantsRes.data?.length || 0,
              };
            } catch (error) {
              console.warn(
                `Failed to get participants for group ${group.ID}:`,
                error,
              );
              return {
                ID: group.ID,
                name: group.name,
                ownerId: group.owner_id,
                participant_count: 0,
              };
            }
          }),
        );

        setJoinedGroups(joinedGroupsData);
        setUnjoinedGroups(unjoinedGroupsData);
        openNotification("Success", "Group created successfully");
      } catch (error) {
        console.error("Failed to refresh groups:", error);
        openNotification("Error", "Failed to create group");
      }
    }
  };

  const handleDelete = async (groupId) => {
    if (groupWsRef.current?.readyState === WebSocket.OPEN) {
      const numericGroupId = Number(groupId);
      const numericActiveGroupId = Number(activeGroupId);
      if (numericGroupId === numericActiveGroupId) {
        console.log(
          "Setting activeGroupId to null - current group is being deleted",
        );

        setActiveGroupId(null);
        console.log("after setActiveGroupId(null):", activeGroupId);
      }

      groupWsRef.current.send(
        JSON.stringify({
          type: "delete",
          group_id: numericGroupId,
        }),
      );

      try {
        const joinedRes = await getAllJoinedGroups();
        const joinedGroupsData = await Promise.all(
          joinedRes.data.map(async (group) => {
            try {
              const unreadRes = await countUnreadMessage(group.ID);
              return {
                ID: group.ID,
                name: group.name,
                ownerId: group.owner_id,
                count: unreadRes.data,
              };
            } catch (error) {
              return {
                ID: group.ID,
                name: group.name,
                ownerId: group.owner_id,
                count: 0,
              };
            }
          }),
        );
        setJoinedGroups(joinedGroupsData);
        openNotification("Success", "Group deleted successfully");
      } catch (error) {
        console.error("Failed to refresh groups:", error);
        openNotification("Error", "Failed to delete group");
      }
    }
  };

  const handleUpdate = async (groupId, newName) => {
    if (groupWsRef.current?.readyState === WebSocket.OPEN) {
      groupWsRef.current.send(
        JSON.stringify({
          type: "update",
          group_id: groupId,
          name: newName,
        }),
      );

      try {
        const joinedRes = await getAllJoinedGroups();
        const joinedGroupsData = await Promise.all(
          joinedRes.data.map(async (group) => {
            try {
              const unreadRes = await countUnreadMessage(group.ID);
              return {
                ID: group.ID,
                name: group.name,
                ownerId: group.owner_id,
                count: unreadRes.data,
              };
            } catch (error) {
              return {
                ID: group.ID,
                name: group.name,
                ownerId: group.owner_id,
                count: 0,
              };
            }
          }),
        );
        setJoinedGroups(joinedGroupsData);
        openNotification("Success", "Group name updated successfully");
      } catch (error) {
        console.error("Failed to refresh groups:", error);
        openNotification("Error", "Failed to update group name");
      }
    }
  };

  // Sửa lại handleLeave:
  const handleLeave = async (groupId) => {
    if (groupWsRef.current?.readyState === WebSocket.OPEN) {
      groupWsRef.current.send(
        JSON.stringify({
          type: "leave",
          group_id: groupId,
        }),
      );

      try {
        // Fetch lại cả joined và unjoined groups
        const [joinedRes, unjoinedRes] = await Promise.all([
          getAllJoinedGroups(),
          getAllUnjoinedGroups(),
        ]);

        // Xử lý joined groups
        const groupsWithCounts = await Promise.all(
          (joinedRes.data || []).map(async (group) => {
            try {
              const unreadRes = await countUnreadMessage(group.ID);
              return {
                ID: group.ID,
                name: group.name,
                ownerId: group.owner_id,
                count: unreadRes.data,
              };
            } catch (error) {
              return {
                ID: group.ID,
                name: group.name,
                ownerId: group.owner_id,
                count: 0,
              };
            }
          }),
        );

        // Xử lý unjoined groups
        const unjoinedGroupsData = await Promise.all(
          (unjoinedRes.data || []).map(async (group) => {
            try {
              const participantsRes = await getAllUsersInAGroup(group.ID);
              return {
                ID: group.ID,
                name: group.name,
                ownerId: group.owner_id,
                participant_count: participantsRes.data?.length || 0,
              };
            } catch (error) {
              return {
                ID: group.ID,
                name: group.name,
                ownerId: group.owner_id,
                participant_count: 0,
              };
            }
          }),
        );

        setJoinedGroups(groupsWithCounts);
        setUnjoinedGroups(unjoinedGroupsData);

        // Reset active group
        if (groupId === activeGroupId) {
          setActiveGroupId(null);
        }

        openNotification("Success", "Left group successfully");
      } catch (error) {
        console.error("Failed to refresh groups:", error);
        openNotification("Error", "Failed to leave group");
      }
    }
  };

  const groupWsRef = useRef(null);

  // Fetch initial data
  useEffect(() => {
    // context/home/home.jsx
    const fetchInitialData = async (retryCount = 3) => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        console.log("Token:", token);

        if (!token && retryCount > 0) {
          console.log(
            `Retrying fetchInitialData... (${retryCount} attempts left)`,
          );
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return fetchInitialData(retryCount - 1);
        }

        if (!token) {
          throw new Error("No authentication token found");
        }

        // Fetch joined groups
        const joinedRes = await getAllJoinedGroups();

        if (!joinedRes?.data) {
          throw new Error("Invalid response format from getAllJoinedGroups");
        }

        const joinedGroupsData = joinedRes.data;

        // Fetch unread counts
        const groupsWithCounts = await Promise.all(
          joinedGroupsData.map(async (group) => {
            try {
              const unreadRes = await countUnreadMessage(group.ID);
              return {
                ID: group.ID,
                name: group.name,
                ownerId: group.owner_id,
                count: unreadRes?.data || 0,
              };
            } catch (error) {
              console.warn(
                `Failed to get unread count for group ${group.ID}:`,
                error,
              );
              return {
                ID: group.ID,
                name: group.name,
                ownerId: group.owner_id,
                count: 0,
              };
            }
          }),
        );

        setJoinedGroups(groupsWithCounts);
      } catch (error) {
        console.error("Failed to fetch groups:", error);
        openNotification("Error", "Failed to load groups");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Setup WebSocket
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const groupWs = new WebSocket(`${global.host}/group/ws?token=${token}`);
    const messageWs = new WebSocket(`${global.host}/message/ws?token=${token}`);

    messageWsRef.current = messageWs;
    groupWsRef.current = groupWs;

    messageWs.onopen = () => {
      console.log("Message WebSocket connected");
    };
    messageWs.onerror = (error) => {
      console.error("Message WebSocket error:", error);
    };
    messageWs.onclose = () => {
      console.log("Message WebSocket disconnected");
    };

    groupWs.onopen = () => {
      console.log("Group WebSocket connected");
    };

    groupWs.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "create": {
            setUnjoinedGroups((prev) => [
              ...prev,
              {
                ID: data.group_id,
                name: data.name,
                ownerId: data.owner_id,
                count: 0,
              },
            ]);
            const userID = localStorage.getItem("userID");
            if (data.user_id != userID) {
              openNotification(
                "New Group",
                `Group "${data.name}" has been created`,
              );
            }
            break;
          }

          case "delete": {
            console.log("case delete");
            const numericGroupId = Number(data.group_id);
            const numericActiveGroupId = Number(activeGroupId);
            setJoinedGroups((prev) =>
              prev.filter((group) => group.ID !== data.group_id),
            );
            setUnjoinedGroups((prev) =>
              prev.filter((group) => group.ID !== data.group_id),
            );
            // Thêm dòng này để reset activeGroupId khi group bị xóa
            console.log("numericGroupId", numericGroupId);
            console.log("numericActiveGroupId", numericActiveGroupId);
            console.log("activeGroupId", activeGroupId);
            if (numericGroupId == numericActiveGroupId) {
              console.log(
                "Setting activeGroupId to null - received delete event",
              );
              const userIDstring = localStorage.getItem("userID");
              const userID = parseInt(userIDstring);
              const dataUserID = parseInt(data.user_id);

              if (dataUserID != userID) {
                console.log("web socket delete group");
                setActiveGroupId(null);
              }
            }

            const userID = localStorage.getItem("userID");
            if (data.user_id != userID) {
              openNotification(
                "Group Deleted",
                `Group "${data.name}" has been deleted`,
              );
            }
            break;
          }

          case "update": {
            setJoinedGroups((prev) =>
              prev.map((group) =>
                group.ID === data.group_id
                  ? { ...group, name: data.name }
                  : group,
              ),
            );
            setUnjoinedGroups((prev) =>
              prev.map((group) =>
                group.ID === data.group_id
                  ? { ...group, name: data.name }
                  : group,
              ),
            );
            const userID = localStorage.getItem("userID");
            if (data.user_id != userID) {
              openNotification(
                "Group Updated",
                `Group name updated to "${data.name}"`,
              );
            }
            break;
          }

          case "join":
            break;
          case "leave":
            // set active group to null if the user leaves the active group
            if (data.group_id === activeGroupId) {
              flushSync(() => {
                setActiveGroupId(null);
              });
            }
            break;

          default:
            console.warn("Unknown message type:", data.type);
        }
      } catch (error) {
        console.error("Error processing websocket message:", error);
      }
    };

    groupWs.onclose = () => {
      console.log("Group WebSocket disconnected");
    };

    groupWs.onerror = (error) => {
      console.error("Group WebSocket error:", error);
    };

    return () => {
      if (groupWsRef.current) {
        groupWsRef.current.close();
      }
    };
  }, []);

  return (
    <HomeContext.Provider
      value={{
        joinedGroups,
        setJoinedGroups,
        unjoinedGroups,
        setUnjoinedGroups,
        isLoading,
        setIsLoading,
        openNotification,
        groupWs: groupWsRef.current,
        handleLeave,
        handleDelete,
        handleUpdate,
        handleCreate,
        activeGroupId,
        handleSelectGroup,
        messageWs: messageWsRef.current,
      }}
    >
      {contextHolder}
      {children}
    </HomeContext.Provider>
  );
};

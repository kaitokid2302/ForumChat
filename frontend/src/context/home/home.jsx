// context/home/home.jsx
import { notification } from "antd";
import { createContext, useCallback, useEffect, useRef, useState } from "react";
import global from "../../config/config.js";
import {
  countUnreadMessage,
  getAllJoinedGroups,
} from "../../services/api/group.js";

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

  const handleSelectGroup = useCallback((groupId) => {
    setActiveGroupId(groupId);
  }, []);
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
        const joinedRes = await getAllJoinedGroups();
        const joinedGroupsData = await Promise.all(
          joinedRes.data.map(async (group) => {
            try {
              const unreadRes = await countUnreadMessage(group.ID);
              return {
                id: group.ID,
                name: group.name,
                ownerId: group.owner_id,
                count: unreadRes.data,
              };
            } catch (error) {
              return {
                id: group.ID,
                name: group.name,
                ownerId: group.owner_id,
                count: 0,
              };
            }
          }),
        );
        setJoinedGroups(joinedGroupsData);
        openNotification("Success", "Group created successfully");
      } catch (error) {
        console.error("Failed to refresh groups:", error);
        openNotification("Error", "Failed to create group");
      }
    }
  };

  const handleDelete = async (groupId) => {
    if (groupWsRef.current?.readyState === WebSocket.OPEN) {
      groupWsRef.current.send(
        JSON.stringify({
          type: "delete",
          group_id: groupId,
        }),
      );

      try {
        const joinedRes = await getAllJoinedGroups();
        const joinedGroupsData = await Promise.all(
          joinedRes.data.map(async (group) => {
            try {
              const unreadRes = await countUnreadMessage(group.ID);
              return {
                id: group.ID,
                name: group.name,
                ownerId: group.owner_id,
                count: unreadRes.data,
              };
            } catch (error) {
              return {
                id: group.ID,
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
                id: group.ID,
                name: group.name,
                ownerId: group.owner_id,
                count: unreadRes.data,
              };
            } catch (error) {
              return {
                id: group.ID,
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

  const handleLeave = async (groupId) => {
    if (groupWsRef.current?.readyState === WebSocket.OPEN) {
      groupWsRef.current.send(
        JSON.stringify({
          type: "leave",
          group_id: groupId,
        }),
      );

      try {
        // Fetch lại danh sách groups sau khi leave
        const joinedRes = await getAllJoinedGroups();
        const joinedGroupsData = joinedRes.data;

        const groupsWithCounts = await Promise.all(
          joinedGroupsData.map(async (group) => {
            try {
              const unreadRes = await countUnreadMessage(group.ID);
              return {
                id: group.ID,
                name: group.name,
                ownerId: group.owner_id,
                count: unreadRes.data,
              };
            } catch (error) {
              return {
                id: group.ID,
                name: group.name,
                ownerId: group.owner_id,
                count: 0,
              };
            }
          }),
        );

        setJoinedGroups(groupsWithCounts);
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
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        // Fetch joined groups
        const joinedRes = await getAllJoinedGroups();
        const joinedGroupsData = joinedRes.data;

        // Fetch unread counts for each joined group
        const groupsWithCounts = await Promise.all(
          joinedGroupsData.map(async (group) => {
            try {
              const unreadRes = await countUnreadMessage(group.ID);
              return {
                id: group.ID,
                name: group.name,
                ownerId: group.owner_id,
                count: unreadRes.data,
              };
            } catch {
              // Nếu có lỗi khi đếm tin nhắn chưa đọc, set count = 0
              return {
                id: group.ID,
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
    groupWsRef.current = groupWs;

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
                id: data.group_id,
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
            setJoinedGroups((prev) =>
              prev.filter((group) => group.id !== data.group_id),
            );
            setUnjoinedGroups((prev) =>
              prev.filter((group) => group.id !== data.group_id),
            );
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
                group.id === data.group_id
                  ? { ...group, name: data.name }
                  : group,
              ),
            );
            setUnjoinedGroups((prev) =>
              prev.map((group) =>
                group.id === data.group_id
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
          case "leave":
            // Bỏ qua xử lý join/leave
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
      }}
    >
      {contextHolder}
      {children}
    </HomeContext.Provider>
  );
};

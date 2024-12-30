import { MoreOutlined } from "@ant-design/icons";
import { Avatar, Dropdown, List, Modal, Spin } from "antd";
import { useContext, useEffect, useState } from "react";
import { HomeContext } from "../../../context/home/Home.jsx";
import {
  countUnreadMessage,
  getAllJoinedGroups,
  getAllUnjoinedGroups,
  getAllUsersInAGroup,
  getOwnerGroup,
} from "../../../services/api/api.js";
import { sendJoinMessage } from "../../../services/api/ws.js";
import { jwtCheck } from "../../../services/auth/jwt.js";

const ParticipantsModal = ({ visible, onClose, participants, loading }) => {
  return (
    <Modal
      title="Group Participants"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={400}
    >
      {loading ? (
        <div className="flex justify-center py-4">
          <Spin />
        </div>
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={participants}
          renderItem={(participant) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar>
                    {participant.username?.[0].toUpperCase() || "U"}
                  </Avatar>
                }
                title={
                  <span>
                    {participant.username}
                    <span className="ml-2 text-xs text-gray-500">
                      ({participant.is_owner ? "Owner" : "Member"})
                    </span>
                  </span>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Modal>
  );
};

const GroupCard = ({ group, handleJoin, handleParticipants }) => {
  const [isParticipantsVisible, setIsParticipantsVisible] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ownerUsername, setOwnerUsername] = useState("");

  useEffect(() => {
    const fetchOwner = async () => {
      try {
        const response = await getOwnerGroup(group.ID);
        setOwnerUsername(response.data || "Unknown");
      } catch (error) {
        console.error("Failed to fetch owner:", error);
        setOwnerUsername("Unknown");
      }
    };
    fetchOwner();
  }, [group.ID]);

  const showParticipants = async () => {
    setIsParticipantsVisible(true);
    setLoading(true);
    try {
      const result = await handleParticipants(group.ID);
      const participantsWithOwner = result.data.map((participant) => ({
        ...participant,
        is_owner: participant.username === ownerUsername,
      }));
      setParticipants(participantsWithOwner);
    } catch (error) {
      console.error("Failed to load participants:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <List.Item
        className="ml-2 hover:bg-gray-50 px-4 py-3"
        style={{ cursor: "pointer" }}
      >
        <List.Item.Meta
          avatar={
            <div className="relative">
              <Avatar size={40} style={{ backgroundColor: "#1890ff" }}>
                {group.name[0].toUpperCase()}
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {group.participant_count}
              </div>
            </div>
          }
          title={
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium">{group.name}</span>
                <span className="ml-2 text-xs text-gray-500">
                  ({group.participant_count} members)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: "join",
                        label: "Join Group",
                        onClick: () => handleJoin(group.ID),
                      },
                      {
                        key: "participants",
                        label: "View Participants",
                        onClick: showParticipants,
                      },
                    ],
                  }}
                  trigger={["click"]}
                  placement="bottomRight"
                >
                  <MoreOutlined
                    className="text-lg hover:bg-gray-200 rounded-full p-1"
                    onClick={(e) => e.stopPropagation()}
                    style={{ cursor: "pointer" }}
                  />
                </Dropdown>
              </div>
            </div>
          }
          description={
            <div className="flex items-center gap-2 text-gray-500">
              <Avatar size="small">
                {ownerUsername[0]?.toUpperCase() || "U"}
              </Avatar>
              <span className="text-sm">Owner: {ownerUsername}</span>
            </div>
          }
        />
      </List.Item>

      <ParticipantsModal
        visible={isParticipantsVisible}
        onClose={() => setIsParticipantsVisible(false)}
        participants={participants}
        loading={loading}
      />
    </>
  );
};

export const NotJoinedGroup = () => {
  jwtCheck();
  const { unjoinedGroups, setUnjoinedGroups, groupWs, openNotification } =
    useContext(HomeContext);
  const { joinedGroups, setJoinedGroups } = useContext(HomeContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGroups();
  }, []);
  const loadGroups = async (retryCount = 3) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      console.log("Token:", token);

      if (!token && retryCount > 0) {
        console.log(`Retrying loadGroups... (${retryCount} attempts left)`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return loadGroups(retryCount - 1);
      }

      if (!token) {
        throw new Error("No authentication token found");
      }

      const [joinedRes, unjoinedRes] = await Promise.all([
        getAllJoinedGroups(),
        getAllUnjoinedGroups(),
      ]);

      if (!joinedRes?.data || !unjoinedRes?.data) {
        throw new Error("Invalid response format from API");
      }

      // Xử lý joined groups
      const joinedGroupsWithData = await Promise.all(
        joinedRes.data.map(async (group) => {
          try {
            const [unreadRes, participantsRes] = await Promise.all([
              countUnreadMessage(group.ID),
              getAllUsersInAGroup(group.ID),
            ]);
            return {
              id: group.ID,
              name: group.name,
              ownerId: group.owner_id,
              count: unreadRes?.data || 0,
              participant_count: participantsRes.data?.length || 0,
            };
          } catch (error) {
            console.warn(`Failed to get data for group ${group.ID}:`, error);
            return {
              id: group.ID,
              name: group.name,
              ownerId: group.owner_id,
              count: 0,
              participant_count: 0,
            };
          }
        }),
      );

      // Xử lý unjoined groups
      const unjoinedGroupsWithData = await Promise.all(
        unjoinedRes.data.map(async (group) => {
          try {
            const participantsRes = await getAllUsersInAGroup(group.ID);
            return {
              id: group.ID,
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
              id: group.ID,
              name: group.name,
              ownerId: group.owner_id,
              participant_count: 0,
            };
          }
        }),
      );

      setJoinedGroups(joinedGroupsWithData);
      setUnjoinedGroups(unjoinedGroupsWithData);
    } catch (error) {
      console.error("Failed to fetch groups:", error);
      openNotification("Error", "Failed to load groups");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async (groupId) => {
    try {
      if (groupWs?.readyState === WebSocket.OPEN) {
        await sendJoinMessage(groupWs, groupId);
        await loadGroups();
        openNotification("Success", "Joined group successfully");
      } else {
        throw new Error("WebSocket connection not open");
      }
    } catch (error) {
      console.error("Failed to join group:", error);
      openNotification("Error", "Failed to join group");
    }
  };

  const handleParticipants = async (groupId) => {
    try {
      return await getAllUsersInAGroup(groupId);
    } catch (error) {
      console.error("Failed to get participants:", error);
      return { data: [] };
    }
  };

  return (
    <div className="w-1/4 border-l">
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium">Available Groups</h2>
      </div>
      <List
        loading={isLoading}
        dataSource={unjoinedGroups}
        renderItem={(group) => (
          <GroupCard
            group={group}
            handleJoin={handleJoin}
            handleParticipants={handleParticipants}
          />
        )}
        locale={{ emptyText: "No available groups" }}
      />
    </div>
  );
};

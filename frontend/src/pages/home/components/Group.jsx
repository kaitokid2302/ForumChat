// Group component đầy đủ
import { MoreOutlined } from "@ant-design/icons";
import { Avatar, Badge, Dropdown, Input, List, Modal } from "antd";
import { useContext, useState } from "react";
import { HomeContext } from "../../../context/home/home.jsx";

export const Group = ({ group, isActive, onClick }) => {
  const { handleLeave, handleDelete, handleUpdate } = useContext(HomeContext);
  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState(group.name);
  const currentUserId = parseInt(localStorage.getItem("userID"));

  const handleRename = () => {
    handleUpdate(group.id, newGroupName);
    setIsRenameModalVisible(false);
  };

  const items =
    currentUserId === group.ownerId
      ? [
          {
            key: "rename",
            label: "Rename Group",
            onClick: () => setIsRenameModalVisible(true),
          },
          {
            key: "delete",
            label: "Delete Group",
            danger: true,
            onClick: () => handleDelete(group.id),
          },
        ]
      : [
          {
            key: "leave",
            label: "Leave Group",
            danger: true,
            onClick: () => handleLeave(group.id),
          },
        ];

  return (
    <>
      <List.Item
        className={`ml-2 hover:bg-gray-50 px-4 py-3 ${isActive ? "bg-blue-50" : ""}`}
        onClick={() => onClick(group.id)}
        style={{ cursor: "pointer" }}
      >
        <List.Item.Meta
          avatar={<Avatar size={40}>{group.name[0].toUpperCase()}</Avatar>}
          title={
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium">{group.name}</span>
                {currentUserId === group.ownerId && (
                  <span className="ml-2 text-xs text-gray-500">(Owner)</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {group.count > 0 && (
                  <Badge
                    count={group.count}
                    style={{ backgroundColor: "#ff4d4f" }}
                  />
                )}
                <Dropdown
                  menu={{ items }}
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
        />
      </List.Item>

      <Modal
        title="Rename Group"
        open={isRenameModalVisible}
        onOk={handleRename}
        onCancel={() => setIsRenameModalVisible(false)}
      >
        <Input
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          placeholder="Enter new group name"
          onPressEnter={handleRename}
        />
      </Modal>
    </>
  );
};

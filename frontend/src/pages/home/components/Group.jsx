// Group component đầy đủ
import { MoreOutlined } from "@ant-design/icons";
import { Avatar, Badge, Dropdown, Input, List, Modal } from "antd";
import { useContext, useState } from "react";
import { HomeContext } from "../../../context/home/Home.jsx";

export const Group = ({ group, isActive, onClick }) => {
  console.log("Group component", group);
  const { handleLeave, handleDelete, handleUpdate } = useContext(HomeContext);
  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState(group.name);
  const currentUserId = parseInt(localStorage.getItem("userID"));

  const handleRename = () => {
    handleUpdate(group.ID, newGroupName);
    setIsRenameModalVisible(false);
  };

  let items = [];

  if (currentUserId === group.owner_id) {
    items = [
      {
        key: "rename",
        label: "Rename Group",
        onClick: (e) => {
          setIsRenameModalVisible(true);
          e.stopPropagation();
        },
      },
      {
        key: "delete",
        label: "Delete Group",
        danger: true,
        onClick: (e) => {
          handleDelete(group.ID);
        },
      },
    ];
  } else {
    items = [
      {
        key: "leave",
        label: "Leave Group",
        danger: true,
        onClick: (e) => {
          handleLeave(group.ID);
          e.stopPropagation();
        },
      },
    ];
  }

  return (
    <>
      <List.Item
        className={`ml-2 hover:bg-gray-50 px-4 py-3 ${isActive ? "bg-blue-50" : ""}`}
        onClick={() => {
          console.log("on click here");
          onClick(group.ID);
        }}
        style={{ cursor: "pointer" }}
      >
        <List.Item.Meta
          avatar={<Avatar size={40}>{group.name[0].toUpperCase()}</Avatar>}
          title={
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium">{group.name}</span>
                {currentUserId === group.owner_id && (
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
                  menu={{
                    items,
                    onClick: (e) => {
                      e.domEvent.stopPropagation(); // Antd Dropdown trả về domEvent
                    },
                  }}
                  trigger={["click"]}
                  placement="bottomRight"
                  destroyPopupOnHide
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

import { Avatar, Badge, List } from "antd";

export const Group = ({ group }) => {
  return (
    <List.Item className="hover:bg-gray-50 cursor-pointer px-4 py-3">
      <List.Item.Meta
        avatar={<Avatar size={40}>{group.name[0].toUpperCase()}</Avatar>}
        title={group.name}
      />
      {group.count > 0 && (
        <Badge
          count={group.count}
          style={{
            backgroundColor: "#ff4d4f",
          }}
        />
      )}
    </List.Item>
  );
};

export const Group = ({ group }) => {
  return (
    <List.Item className="hover:bg-gray-50 cursor-pointer px-4 py-3">
      <List.Item.Meta
        avatar={<Avatar size={40}>{group.name[0].toUpperCase()}</Avatar>}
        title={group.name}
      />
      {group.count > 0 && (
        <Badge
          count={group.count}
          style={{
            backgroundColor: "#ff4d4f",
          }}
        />
      )}
    </List.Item>
  );
};

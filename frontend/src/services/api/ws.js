export const sendJoinMessage = (groupWs, groupId) => {
  const userId = localStorage.getItem("userID");
  const msg = {
    type: "join",
    name: "", // Không cần thiết cho join message nhưng vẫn phải có để match struct
    group_id: groupId, // Sửa thành group_id để match với GroupID trong struct
    user_id: parseInt(userId), // Sửa thành user_id và convert sang int
  };
  console.log("Sending join message:", msg);
  groupWs.send(JSON.stringify(msg));
};

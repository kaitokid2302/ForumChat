// components/MessageCard.jsx
import { Avatar } from "antd";
import React from "react";

export const MessageCard = React.memo(({ message }) => {
  const currentUserId = parseInt(localStorage.getItem("userID"));
  const isCurrentUser = message.user_id === currentUserId;

  return (
    <div
      className={`flex items-start gap-3 p-4 ${
        isCurrentUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      <div className="flex flex-col items-center">
        <Avatar size={32}>{`user${message.user_id}`[0].toLowerCase()}</Avatar>
        <span className="text-xs text-gray-500 mt-1">
          {`user${message.user_id}`}
        </span>
      </div>

      <div
        className={`max-w-[70%] px-4 py-2 rounded-2xl ${
          isCurrentUser
            ? "bg-blue-500 text-white rounded-tr-none"
            : "bg-gray-100 text-gray-800 rounded-tl-none"
        }`}
      >
        {message.text}
      </div>
    </div>
  );
});

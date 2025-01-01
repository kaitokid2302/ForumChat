import { Avatar } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { getUserByUsername } from "../../../services/api/api.js";

export const MessageCard = React.memo(
  ({ message, latestMessageRef, unreadMessageRef, messageObserver }) => {
    const currentUserId = localStorage.getItem("userID");
    const [messageUserId, setMessageUserId] = useState(null);
    const messageRef = useRef(null);

    // Thêm useEffect để lấy userID từ API
    useEffect(() => {
      const fetchUserId = async () => {
        try {
          const response = await getUserByUsername(message.user_id);
          setMessageUserId(response.data); // Giả sử API trả về object có trường ID
          console.log(response.data, "response.data");
        } catch (error) {
          console.error("Failed to fetch user ID:", error);
        }
      };
      fetchUserId();
    }, [message.user_id]);

    // So sánh với ID từ localStorage
    const isCurrentUser =
      messageUserId && String(messageUserId) === currentUserId;

    useEffect(() => {
      const currentElement = messageRef.current;
      if (currentElement && messageObserver) {
        try {
          messageObserver.observe(currentElement);
          return () => {
            if (currentElement) {
              try {
                messageObserver.unobserve(currentElement);
              } catch (error) {
                console.warn("Failed to unobserve message:", error);
              }
            }
          };
        } catch (error) {
          console.warn("Failed to observe message:", error);
        }
      }
    }, [messageObserver]);

    if (!message) return null;

    return (
      <div
        ref={(el) => {
          messageRef.current = el;
          if (message.isLatest && latestMessageRef) {
            latestMessageRef.current = el;
          }
          if (message.isFirstUnread && unreadMessageRef) {
            unreadMessageRef.current = el;
          }
        }}
        data-message-id={message.ID}
        className={`w-full flex ${
          isCurrentUser ? "justify-end" : "justify-start"
        } ${message.isFirstUnread ? "bg-blue-50" : ""}`}
      >
        <div
          className={`flex items-start gap-2 p-2 ${
            isCurrentUser ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <div className="flex flex-col items-center w-[90px]">
            <Avatar size={32}>{`${message.user_id}`[0].toLowerCase()}</Avatar>
            <span className="text-xs text-gray-500 mt-1 w-full text-center truncate">
              {`${message.user_id}`}
            </span>
          </div>

          <div
            className={`max-w-[250px] w-fit px-4 py-2 rounded-2xl break-words ${
              isCurrentUser
                ? "bg-blue-500 text-white rounded-tr-none"
                : "bg-gray-100 text-gray-800 rounded-tl-none"
            }`}
          >
            {message.text}
          </div>
        </div>
      </div>
    );
  },
);

MessageCard.displayName = "MessageCard";

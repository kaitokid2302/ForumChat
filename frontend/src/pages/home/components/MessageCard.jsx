import { Avatar } from "antd";
import React, { useEffect, useRef } from "react";

export const MessageCard = React.memo(
  ({ message, latestMessageRef, messageObserver }) => {
    const currentUserId = parseInt(localStorage.getItem("userID"));
    const isCurrentUser = message.user_id === currentUserId;
    const messageRef = useRef(null);

    // Set up intersection observer for read tracking
    useEffect(() => {
      if (messageRef.current && messageObserver) {
        messageObserver.observe(messageRef.current);
        return () => {
          messageObserver.unobserve(messageRef.current);
        };
      }
    }, [messageObserver]);

    return (
      <div
        ref={(el) => {
          messageRef.current = el;
          if (message.isLatest) {
            latestMessageRef.current = el;
          }
        }}
        data-message-id={message.ID}
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
  },
);

MessageCard.displayName = "MessageCard";

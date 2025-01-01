import { SendOutlined } from "@ant-design/icons";
import { Button, List, Spin } from "antd";
import TextArea from "antd/es/input/TextArea.js";
import { useContext, useEffect, useRef } from "react";
import { HomeContext } from "../../../context/home/Home.jsx";
import { useMessages } from "../../../hooks/home/message.js";
import { MessageCard } from "./MessageCard";

export const Messages = () => {
  const { activeGroupId, joinedGroups } = useContext(HomeContext);
  const {
    messages,
    isInitialLoading,
    error,
    newMessage,
    setNewMessage,
    handleSendMessage,
    latestMessageRef,
    messageObserver,
  } = useMessages();

  const unreadMessageRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const activeGroup = joinedGroups.find((g) => g.id === activeGroupId);

  useEffect(() => {
    if (!isInitialLoading && messages.length > 0) {
      // Nếu có tin nhắn chưa đọc
      if (unreadMessageRef.current) {
        unreadMessageRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      // Nếu không có tin nhắn chưa đọc, scroll xuống cuối
      else if (latestMessageRef.current) {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop =
            scrollContainerRef.current.scrollHeight;
        }
      }
    }
  }, [messages, isInitialLoading]);

  // Handle no active group
  if (!activeGroupId) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Please select a group to view messages
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium">{activeGroup?.name}</h2>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto"
        id="scrollableDiv"
        ref={scrollContainerRef}
      >
        {isInitialLoading ? (
          <div className="flex items-center justify-center h-full">
            <Spin size="large" />
          </div>
        ) : (
          <List
            dataSource={messages}
            renderItem={(message) => (
              <MessageCard
                key={message.ID}
                message={message}
                latestMessageRef={latestMessageRef}
                unreadMessageRef={
                  message.isFirstUnread ? unreadMessageRef : null
                }
                messageObserver={messageObserver}
              />
            )}
          />
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2 max-w-full">
          {" "}
          {/* Thêm max-w-full */}
          <div className="flex-1 max-w-[calc(100%-50px)]">
            {" "}
            {/* Container cho input/textarea */}
            <TextArea
              size="large"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type a message..."
              autoComplete="off"
              autoSize={{ minRows: 1, maxRows: 10 }}
              className="resize-none w-full" // Thêm w-full
            />
          </div>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
          />
        </div>
      </div>
    </div>
  );
};

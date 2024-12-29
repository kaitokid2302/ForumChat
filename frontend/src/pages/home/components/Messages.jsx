import { SendOutlined } from "@ant-design/icons";
import { Button, Input, List, Spin } from "antd";
import { useContext, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { HomeContext } from "../../../context/home/home.jsx";
import { useMessages } from "../../../hooks/home/messageWS.js";
import { MessageCard } from "./MessageCard";

export const Messages = () => {
  const { activeGroupId, joinedGroups } = useContext(HomeContext);
  const {
    messages,
    hasMore,
    isLoading,
    isInitialLoading,
    error,
    handleLoadMore,
    newMessage,
    setNewMessage,
    handleSendMessage,
    latestMessageRef,
    messageObserver,
  } = useMessages();

  const activeGroup = joinedGroups.find((g) => g.id === activeGroupId);

  // Scroll to latest message when messages change
  useEffect(() => {
    if (latestMessageRef.current) {
      latestMessageRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages]);

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
      <div className="flex-1 overflow-y-auto" id="scrollableDiv">
        {isInitialLoading ? (
          <div className="flex items-center justify-center h-full">
            <Spin size="large" />
          </div>
        ) : (
          <InfiniteScroll
            dataLength={messages.length}
            next={handleLoadMore}
            hasMore={hasMore}
            loader={
              isLoading && (
                <div className="flex justify-center p-4">
                  <Spin />
                </div>
              )
            }
            inverse={true}
            scrollableTarget="scrollableDiv"
            style={{
              display: "flex",
              flexDirection: "column-reverse",
            }}
            endMessage={
              <div className="text-center text-gray-500 p-4">
                No more messages
              </div>
            }
          >
            <List
              dataSource={messages}
              renderItem={(message) => (
                <MessageCard
                  key={message.ID}
                  message={message}
                  latestMessageRef={latestMessageRef}
                  messageObserver={messageObserver}
                />
              )}
            />
          </InfiniteScroll>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
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
          />
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

// hooks/useMessages.js
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { HomeContext } from "../../context/home/home.jsx";
import {
  countUnreadMessage,
  getAllMessageUnread,
  getMessagesByGroupID,
  markRead,
} from "../../services/api/api.js";

export const useMessages = () => {
  // Context
  const { activeGroupId, messageWs, setJoinedGroups, joinedGroups } =
    useContext(HomeContext);

  // States
  const [messages, setMessages] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [messageOffset, setMessageOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [scrollToBottom, setScrollToBottom] = useState(false);

  // Refs
  const messageRefs = useRef([]);

  const handleScroll = (itemID) => {
    const itemRef = messageRefs.current[itemID];
    if (itemRef) {
      itemRef.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Constants
  const MESSAGE_SIZE = 20;

  // Load initial messages when group changes
  useEffect(() => {
    if (activeGroupId) {
      setMessages([]);
      setMessageOffset(0);
      setHasMore(true);
      setError(null);
      setIsInitialLoading(true);
      loadInitialMessages(activeGroupId);
    }
  }, [activeGroupId]);

  const loadInitialMessages = async (groupId) => {
    setIsInitialLoading(true);
    const res = await getAllMessageUnread(groupId);
    setMessages(res.data);
    setIsInitialLoading(false);
  };
  // WebSocket message handler
  useEffect(() => {
    if (!messageWs) return;

    messageWs.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      const currentUserId = parseInt(localStorage.getItem("userID"));

      const isJoinedGroup = joinedGroups.some(
        (group) => group.id === data.group_id,
      );
      if (!isJoinedGroup) return;

      if (data.group_id === activeGroupId) {
        // Chỉ thêm vào mảng list tin nhắn nếu tin nhắn đó không phải của mình
        if (data.user_id !== currentUserId) {
          setMessages((prev) => [
            ...prev,
            {
              ID: data.message_id,
              text: data.text,
              user_id: data.user_id,
              group_id: data.group_id,
              CreatedAt: new Date().toISOString(),
            },
          ]);
        }

        // tin nhắn của chính mình thì đánh dấu cả group chat đã đọc
        if (data.user_id === currentUserId) {
          try {
            await markRead(data.group_id, data.message_id);
            const unreadRes = await countUnreadMessage(data.group_id);
            setJoinedGroups((prev) =>
              prev.map((group) =>
                group.id === data.group_id
                  ? { ...group, count: unreadRes.data }
                  : group,
              ),
            );
          } catch (error) {
            console.error("Failed to mark message as read:", error);
          }
        }
      }
      // Nếu tin nhắn thuộc group khác với group đang active thì cập nhật số tin nhắn chưa đọc của group đó
      else {
        // cập nhật số tin nhắn chưa đọc của group khác với group đang active
        try {
          const unreadRes = await countUnreadMessage(data.group_id);
          setJoinedGroups((prev) =>
            prev.map((group) =>
              group.id === data.group_id
                ? { ...group, count: unreadRes.data }
                : group,
            ),
          );
        } catch (error) {
          console.error("Failed to update unread count:", error);
        }
      }
    };
  }, [messageWs, activeGroupId, joinedGroups, setJoinedGroups]);

  // tải thêm tin nhắn khi cuộn lên trên
  const loadMessages = async (groupId, offset) => {
    try {
      setIsLoading(true);
      const response = await getMessagesByGroupID(
        groupId,
        MESSAGE_SIZE,
        offset,
      );

      setMessages((prev) => [...response.data, ...prev]);

      // call getMessage by group again to test if there are more messages
      const nextResponse = await getMessagesByGroupID(
        groupId,
        1,
        offset + response.data.length,
      );
      setHasMore(nextResponse.data.length > 0);
      setMessageOffset(offset + response.data.length);
    } catch (error) {
      setError("Failed to load messages");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = useCallback(() => {
    if (!activeGroupId || !hasMore || isLoading) return;
    setIsLoading(true);
    loadMessages(activeGroupId, messageOffset);
  }, [activeGroupId, hasMore, isLoading, messageOffset]);

  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim() || !messageWs) return;

    const currentUserId = parseInt(localStorage.getItem("userID"));
    const message = {
      user_id: currentUserId,
      text: newMessage.trim(),
      group_id: activeGroupId,
    };

    // Add message to list immediately
    setMessages((prev) => [
      ...prev,
      {
        ID: Date.now(),
        text: newMessage.trim(),
        user_id: currentUserId,
        group_id: activeGroupId,
        CreatedAt: new Date().toISOString(),
      },
    ]);

    messageWs.send(JSON.stringify(message));
    setNewMessage("");

    // Scroll to bottom after sending
    setScrollToBottom(true);
  }, [newMessage, messageWs, activeGroupId]);

  return {
    messages,
    hasMore,
    isLoading,
    isInitialLoading,
    error,
    newMessage,
    setNewMessage,
    handleLoadMore,
    handleSendMessage,
    messageRefs,
    handleScroll,
    scrollToBottom,
  };
};

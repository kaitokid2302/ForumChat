// hooks/useMessages.js
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { HomeContext } from "../../context/home/home.jsx";
import {
  countUnreadMessage,
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

  // Refs
  const messagesEndRef = useRef(null);

  // Constants
  const MESSAGE_SIZE = 20;

  // Scroll function
  const scrollToBottom = () => {
    const scrollDiv = document.getElementById("scrollableDiv");
    if (scrollDiv) {
      scrollDiv.scrollTop = 0; // Scroll to top because of column-reverse
    }
  };

  // Load initial messages when group changes
  useEffect(() => {
    if (activeGroupId) {
      setMessages([]);
      setMessageOffset(0);
      setHasMore(true);
      setError(null);
      setIsInitialLoading(true);
      loadMessages(activeGroupId, 0);
    }
  }, [activeGroupId]);

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
        // Only add message if it's not from current user
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

        // If message is from current user, mark as read and update count
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
      } else {
        // Update unread count for other groups
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

  // Load messages function
  const loadMessages = async (groupId, offset) => {
    try {
      const response = await getMessagesByGroupID(
        groupId,
        MESSAGE_SIZE,
        offset,
      );

      setMessages((prev) =>
        offset === 0 ? response.data : [...response.data, ...prev],
      );

      setHasMore(response.data.length === MESSAGE_SIZE);
      setMessageOffset(offset + MESSAGE_SIZE);

      // Mark latest message as read on initial load
      if (offset === 0 && response.data.length > 0) {
        const latestMessage = response.data[response.data.length - 1];
        try {
          await markRead(groupId, latestMessage.ID);
          const unreadRes = await countUnreadMessage(groupId);
          setJoinedGroups((prev) =>
            prev.map((group) =>
              group.id === groupId
                ? { ...group, count: unreadRes.data }
                : group,
            ),
          );
        } catch (error) {
          console.error("Failed to mark message as read:", error);
        }
      }
    } catch (error) {
      setError("Failed to load messages");
      console.error(error);
    } finally {
      setIsInitialLoading(false);
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
    setTimeout(scrollToBottom, 100);
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
    messagesEndRef,
  };
};

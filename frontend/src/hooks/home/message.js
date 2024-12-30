import { debounce } from "lodash";
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
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [lastReadMessageId, setLastReadMessageId] = useState(null);

  // Refs
  const latestMessageRef = useRef(null);
  const messageObserver = useRef(null);

  // Khởi tạo IntersectionObserver để theo dõi tin nhắn đã đọc
  useEffect(() => {
    if (!activeGroupId) return;

    messageObserver.current = new IntersectionObserver(
      debounce(async (entries) => {
        let latestVisibleMessageId = null;

        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target) {
            const messageId = parseInt(entry.target.dataset.messageId);
            if (!latestVisibleMessageId || messageId > latestVisibleMessageId) {
              latestVisibleMessageId = messageId;
            }
          }
        });

        if (
          latestVisibleMessageId &&
          latestVisibleMessageId !== lastReadMessageId &&
          activeGroupId
        ) {
          try {
            await markRead(activeGroupId, latestVisibleMessageId);
            setLastReadMessageId(latestVisibleMessageId);

            const unreadRes = await countUnreadMessage(activeGroupId);
            setJoinedGroups((prev) =>
              prev.map((group) =>
                group.ID === activeGroupId
                  ? { ...group, count: unreadRes.data }
                  : group,
              ),
            );
          } catch (error) {
            console.error("Failed to mark message as read:", error);
          }
        }
      }, 200),
      { threshold: 0.5 },
    );

    return () => {
      if (messageObserver.current) {
        try {
          messageObserver.current.disconnect();
        } catch (error) {
          console.warn("Failed to disconnect observer:", error);
        }
      }
    };
  }, [activeGroupId, lastReadMessageId, setJoinedGroups]);

  // Load initial messages when group changes
  useEffect(() => {
    if (activeGroupId) {
      setMessages([]);
      setError(null);
      setIsInitialLoading(true);
      loadInitialMessages(activeGroupId);
    }
  }, [activeGroupId]);

  const loadInitialMessages = async (groupId) => {
    try {
      setIsInitialLoading(true);
      // Load tất cả tin nhắn chưa đọc trước
      const unreadRes = await getAllMessageUnread(groupId);
      const unreadMessages = unreadRes.data || [];
      unreadMessages.reverse();

      // Load tất cả tin nhắn của group
      const allMessagesRes = await getMessagesByGroupID(groupId, 1000000000, 0);
      console.log("allMessagesRes", allMessagesRes);

      if (allMessagesRes.message === "record not found") {
        setMessages([]);
        return;
      }

      // Đảo ngược mảng để hiển thị tin nhắn mới nhất ở dưới
      const allMessages = allMessagesRes.data.reverse();

      // Đánh dấu tin nhắn chưa đọc đầu tiên (nếu có) và tin nhắn mới nhất
      const firstUnreadMessage = unreadMessages[0];

      setMessages(
        allMessages.map((msg, index) => ({
          ...msg,
          isLatest: index === allMessages.length - 1,
          isFirstUnread: firstUnreadMessage && msg.ID === firstUnreadMessage.ID,
        })),
      );
    } catch (error) {
      setError("Failed to load messages");
      console.error(error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  // WebSocket message handler
  useEffect(() => {
    if (!messageWs) return;

    messageWs.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      const currentUserId = parseInt(localStorage.getItem("userID"));

      const isJoinedGroup = joinedGroups.some(
        (group) => group.ID === data.group_id,
      );
      if (!isJoinedGroup) return;

      if (data.group_id === activeGroupId) {
        if (data.user_id !== currentUserId) {
          setMessages((prev) => {
            const updatedPrev = prev.map((msg) => ({
              ...msg,
              isLatest: false,
            }));

            return [
              ...updatedPrev,
              {
                ID: data.message_id,
                text: data.text,
                user_id: data.user_id,
                group_id: data.group_id,
                CreatedAt: new Date().toISOString(),
                isLatest: true,
              },
            ];
          });
        }

        // Update unread count
        try {
          const unreadRes = await countUnreadMessage(data.group_id);
          setJoinedGroups((prev) =>
            prev.map((group) =>
              group.ID === data.group_id
                ? { ...group, count: unreadRes.data }
                : group,
            ),
          );
        } catch (error) {
          console.error("Failed to update unread count:", error);
        }

        if (data.user_id === currentUserId) {
          try {
            await markRead(data.group_id, data.message_id);
            const unreadRes = await countUnreadMessage(data.group_id);
            setJoinedGroups((prev) =>
              prev.map((group) =>
                group.ID === data.group_id
                  ? { ...group, count: unreadRes.data }
                  : group,
              ),
            );
          } catch (error) {
            console.error("Failed to mark message as read:", error);
          }
        }
      } else {
        try {
          const unreadRes = await countUnreadMessage(data.group_id);
          setJoinedGroups((prev) =>
            prev.map((group) =>
              group.ID === data.group_id
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

  const handleSendMessage = useCallback(() => {
    console.log("handleSendMessage");
    console.log("newMessage", newMessage);
    if (!newMessage.trim() || !messageWs) return;

    const currentUserId = parseInt(localStorage.getItem("userID"));
    const message = {
      user_id: currentUserId,
      text: newMessage.trim(),
      group_id: activeGroupId,
    };
    console.log("message", message);

    setMessages((prev) => {
      const updatedPrev = prev.map((msg) => ({
        ...msg,
        isLatest: false,
      }));

      return [
        ...updatedPrev,
        {
          ID: Date.now(),
          text: newMessage.trim(),
          user_id: currentUserId,
          group_id: activeGroupId,
          CreatedAt: new Date().toISOString(),
          isLatest: true,
        },
      ];
    });

    messageWs.send(JSON.stringify(message));
    setNewMessage("");
  }, [newMessage, messageWs, activeGroupId]);

  return {
    messages,
    isInitialLoading,
    error,
    newMessage,
    setNewMessage,
    handleSendMessage,
    latestMessageRef,
    messageObserver: messageObserver.current,
  };
};

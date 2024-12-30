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
    messageObserver.current = new IntersectionObserver(
      debounce(async (entries) => {
        let latestVisibleMessageId = null;

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageId = parseInt(entry.target.dataset.messageId);
            if (!latestVisibleMessageId || messageId > latestVisibleMessageId) {
              latestVisibleMessageId = messageId;
            }
          }
        });

        if (
          latestVisibleMessageId &&
          latestVisibleMessageId !== lastReadMessageId
        ) {
          await markRead(activeGroupId, latestVisibleMessageId);
          setLastReadMessageId(latestVisibleMessageId);

          countUnreadMessage(activeGroupId).then((unreadRes) => {
            setJoinedGroups((prev) =>
              prev.map((group) =>
                group.id === activeGroupId
                  ? { ...group, count: unreadRes.data }
                  : group,
              ),
            );
          });
        }
      }, 200),
    );

    return () => {
      if (messageObserver.current) {
        messageObserver.current.disconnect();
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
      // reverse
      unreadRes.data?.reverse();
      console.log("unreadRes", unreadRes);

      // Load tất cả tin nhắn của group
      const allMessagesRes = await getMessagesByGroupID(groupId, 1000000000, 0);

      if (allMessagesRes.message === "record not found") {
        setMessages([]);
        return;
      }

      // Đảo ngược mảng để hiển thị tin nhắn mới nhất ở dưới
      const allMessages = allMessagesRes.data.reverse();

      // Đánh dấu tin nhắn chưa đọc đầu tiên (nếu có) và tin nhắn mới nhất
      const firstUnreadMessage = unreadRes.data?.[0];

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
        (group) => group.id === data.group_id,
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
              group.id === data.group_id
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

  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim() || !messageWs) return;

    const currentUserId = parseInt(localStorage.getItem("userID"));
    const message = {
      user_id: currentUserId,
      text: newMessage.trim(),
      group_id: activeGroupId,
    };

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

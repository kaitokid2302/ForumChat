import { debounce } from "lodash";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { HomeContext } from "../../context/home/Home.jsx";
import {
  countUnreadMessage,
  getAllMessageUnread,
  getMessagesByGroupID,
  getUserByID,
  markRead,
} from "../../services/api/api.js";

export const useMessages = () => {
  const { activeGroupId, messageWs, setJoinedGroups, joinedGroups } =
    useContext(HomeContext);

  const [messages, setMessages] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [lastReadMessageId, setLastReadMessageId] = useState(null);

  const latestMessageRef = useRef(null);
  const messageObserver = useRef(null);

  useEffect(() => {
    if (!activeGroupId) {
      setMessages([]);
      return;
    }

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
      const unreadRes = await getAllMessageUnread(groupId);
      const unreadMessages = unreadRes.data || [];
      unreadMessages.reverse();

      const allMessagesRes = await getMessagesByGroupID(groupId, 1000000000, 0);

      if (allMessagesRes.message === "record not found") {
        setMessages([]);
        return;
      }

      const allMessages = allMessagesRes.data.reverse();
      const firstUnreadMessage = unreadMessages[0];

      const messagesWithUsername = await Promise.all(
        allMessages.map(async (msg, index) => {
          const response = await getUserByID(msg.user_id);
          return {
            ...msg,
            user_id: response.data,
            isLatest: index === allMessages.length - 1,
            isFirstUnread:
              firstUnreadMessage && msg.ID === firstUnreadMessage.ID,
          };
        }),
      );

      setMessages(messagesWithUsername);
    } catch (error) {
      setError("Failed to load messages");
      console.error(error);
    } finally {
      setIsInitialLoading(false);
    }
  };

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
          const response = await getUserByID(data.user_id);

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
                user_id: response.data,
                group_id: data.group_id,
                CreatedAt: new Date().toISOString(),
                isLatest: true,
              },
            ];
          });
        }

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
    if (!newMessage.trim() || !messageWs) return;

    const currentUserId = parseInt(localStorage.getItem("userID"));

    getUserByID(currentUserId).then((response) => {
      const message = {
        user_id: currentUserId,
        text: newMessage.trim(),
        group_id: activeGroupId,
      };

      setMessages((prev) => {
        const updatedPrev = prev.map((msg) => ({
          ...msg,
          isLatest: false,
          isFirstUnread: false, // Reset isFirstUnread cho tất cả tin nhắn cũ
        }));

        return [
          ...updatedPrev,
          {
            ID: Date.now(),
            text: newMessage.trim(),
            user_id: response.data,
            group_id: activeGroupId,
            CreatedAt: new Date().toISOString(),
            isLatest: true,
            isFirstUnread: false, // Tin nhắn mới cũng không phải là unread
          },
        ];
      });

      // Đánh dấu đã đọc tin nhắn mới nhất
      markRead(activeGroupId, Date.now()).catch((error) => {
        console.error("Failed to mark message as read:", error);
      });

      messageWs.send(JSON.stringify(message));
      setNewMessage("");
    });
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
    setMessages,
  };
};

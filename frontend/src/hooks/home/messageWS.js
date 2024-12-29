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
  const [hasMore, setHasMore] = useState(true);
  const [messageOffset, setMessageOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [lastReadMessageId, setLastReadMessageId] = useState(null);

  // Refs
  const latestMessageRef = useRef(null);
  const messageObserver = useRef(null);

  // Constants
  const MESSAGE_SIZE = 20;

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
      setMessageOffset(0);
      setHasMore(true);
      setError(null);
      setIsInitialLoading(true);
      loadInitialMessages(activeGroupId);
    }
  }, [activeGroupId]);

  const loadInitialMessages = async (groupId) => {
    try {
      setIsInitialLoading(true);
      const res = await getAllMessageUnread(groupId);
      console.log("res", res);
      // if res.message = "record not found" => res.data = []
      if (res.message == "record not found" || res.data.length == 0) {
        // group can be not having any message or read all messages
        // so we need to MESSAGE_SIZE
        const res2 = await getMessagesByGroupID(groupId, MESSAGE_SIZE, 0);
        if (res2.message == "record not found") {
          setMessages([]);
          return;
        }
        // reverse array to show latest message first
        res2.data.reverse();
        setMessages(
          res2.data.map((msg, index) => ({
            ...msg,
            isLatest: index === res2.data.length - 1,
          })),
        );
        return;
      }
      // reverse array to show latest message first
      res.data.reverse();
      setMessages(
        res.data.map((msg, index) => ({
          ...msg,
          isLatest: index === res.data.length - 1,
        })),
      );
    } catch (error) {
      setError("Failed to load initial messages");
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
        } else {
          // update count
          try {
            const unreadRes = await countUnreadMessage(data.group_id);
            console.log("unreadRes", unreadRes);
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

  // Load more messages when scrolling up
  const loadMessages = async (groupId, offset) => {
    try {
      setIsLoading(true);
      const response = await getMessagesByGroupID(
        groupId,
        MESSAGE_SIZE,
        offset,
      );

      setMessages((prev) => {
        const newMessages = response.data.map((msg) => ({
          ...msg,
          isLatest: false,
        }));
        return [...newMessages, ...prev];
      });

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
    hasMore,
    isLoading,
    isInitialLoading,
    error,
    newMessage,
    setNewMessage,
    handleLoadMore,
    handleSendMessage,
    latestMessageRef,
    messageObserver: messageObserver.current,
  };
};

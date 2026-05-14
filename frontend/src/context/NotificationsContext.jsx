import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import notificationsService from "../../services/notificationsService";

const NotificationsContext = createContext(null);
const POLL_INTERVAL_MS = 30000;

const getStoredUserId = () => {
  const raw = localStorage.getItem("user");
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw);
    const id = parsed?.id ?? parsed?.userId ?? null;
    const parsedId = typeof id === "number" ? id : parseInt(id, 10);
    return Number.isNaN(parsedId) ? null : parsedId;
  } catch {
    return null;
  }
};

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchCount = useCallback(async () => {
    try {
      const userId = getStoredUserId();
      const { data } = await notificationsService.getCount({ userId });
      setUnreadCount(Number(data?.count) || 0);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      const userId = getStoredUserId();
      const { data } = await notificationsService.getAll({ userId });
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      setNotifications([]);
    }
  }, []);

  const markRead = useCallback(async (id) => {
    await notificationsService.markRead(id);
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, is_read: true } : item)),
    );
    setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
  }, []);

  const markAllRead = useCallback(async () => {
    const userId = getStoredUserId();
    await notificationsService.markAllRead({ userId });
    setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    fetchCount();
    const intervalId = setInterval(fetchCount, POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [fetchCount]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      fetchAll,
      fetchCount,
      markRead,
      markAllRead,
    }),
    [notifications, unreadCount, fetchAll, fetchCount, markRead, markAllRead],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationsProvider");
  }
  return context;
}

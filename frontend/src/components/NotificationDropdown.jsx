import { useMemo } from "react";
import { useNotifications } from "../context/NotificationsContext";

const formatTimestamp = (value) => {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleString();
};

export default function NotificationDropdown({ onClose }) {
  const { notifications, markRead, markAllRead } = useNotifications();

  const items = useMemo(() => notifications.slice(0, 50), [notifications]);

  const handleItemClick = async (item) => {
    if (!item?.is_read) {
      await markRead(item.id);
    }
    if (onClose) {
      onClose();
    }
  };

  const handleMarkAll = async () => {
    await markAllRead();
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="notif-dropdown" role="menu">
      <div className="notif-header">
        <span className="notif-title">Notifications</span>
        <button className="notif-action" type="button" onClick={handleMarkAll}>
          Mark all read
        </button>
      </div>

      <div className="notif-list">
        {items.length === 0 ? (
          <div className="notif-empty">No notifications yet.</div>
        ) : (
          items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`notif-item ${!item.is_read ? "notif-item-unread" : ""}`}
              onClick={() => handleItemClick(item)}
            >
              <div className="notif-item-title">{item.title}</div>
              <div className="notif-message">{item.message}</div>
              <div className="notif-time">{formatTimestamp(item.created_at)}</div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

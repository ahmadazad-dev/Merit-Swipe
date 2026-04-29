import { useEffect, useRef, useState } from "react";
import { FaBell } from "react-icons/fa";
import { useNotifications } from "../context/NotificationsContext";
import NotificationDropdown from "./NotificationDropdown";

export default function NotificationBell() {
  const { unreadCount, fetchAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOpen = async () => {
    if (!open) {
      await fetchAll();
    }
    setOpen((prev) => !prev);
  };

  const badgeText = unreadCount > 99 ? "99+" : unreadCount;

  return (
    <div className="notif-menu" ref={dropdownRef}>
      <button
        className="notif-btn"
        type="button"
        onClick={toggleOpen}
        aria-label="Notifications"
      >
        <FaBell size={18} />
        {unreadCount > 0 && <span className="notif-badge">{badgeText}</span>}
      </button>

      {open && <NotificationDropdown onClose={() => setOpen(false)} />}
    </div>
  );
}

import "./notification.css";

function Notification({
  type = "success",
  title,
  message,
  createdAt,
  isRead,
  expanded,
  onClick,
}) {
  const showMessage = expanded || !onClick;
  const normalizedType = title?.toLowerCase().includes("security")
    ? "security"
    : title?.toLowerCase().includes("transaction")
      ? "transaction"
      : title?.toLowerCase().includes("bank")
        ? "bank-update"
        : type;

  return (
    <button
      className={`notification ${normalizedType} ${isRead ? "read" : "unread"} ${expanded ? "expanded" : ""}`}
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
    >
      <span className="notification-icon" aria-hidden="true">
        {normalizedType === "security" ? "!" : normalizedType === "transaction" ? "$" : "i"}
      </span>
      <span className="notification-content">
        <span className="notification-topline">
          <span className="notification-title">{title}</span>
          <time dateTime={createdAt}>
            {createdAt
              ? new Date(createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
              : "Just now"}
          </time>
        </span>
        {showMessage && <span className="notification-message">{message}</span>}
      </span>
      {!isRead && <span className="notification-unread-dot" aria-label="Unread" />}
    </button>
  );
}

export default Notification;
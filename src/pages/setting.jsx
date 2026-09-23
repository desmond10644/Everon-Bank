import { useEffect, useMemo, useState } from "react";
import Notification from "../component/notification";
import { getNotificationPreferences, getUserNotifications, markAllNotificationsRead, markNotificationRead, updateNotificationPreferences } from "../api/api";
import useAuth from "../hooks/useAuth";
import "./settings.css";

const categories = ["all", "transaction", "security", "promotional"];
const categoryLabel = { all: "All alerts", transaction: "Transactions", security: "Security", promotional: "Promotions" };

function Settings() {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [preferences, setPreferences] = useState({ email_notifications: true, sms_notifications: false });
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadNotifications = async () => {
    if (!user?.id || !token) return;
    try {
      setLoading(true);
      const [notificationResult, preferenceResult] = await Promise.all([getUserNotifications(user.id), getNotificationPreferences()]);
      setNotifications(notificationResult.data || []);
      const data = preferenceResult.data || {};
      setPreferences({ email_notifications: Boolean(data.email_notifications), sms_notifications: Boolean(data.sms_notifications) });
    } catch (err) { setError(err.message || "Unable to load notifications"); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadNotifications(); }, [token, user?.id]);

  const filteredNotifications = useMemo(() => notifications.filter((item) => filter === "all" || item.type === filter || item.title?.toLowerCase().includes(filter)), [notifications, filter]);
  const unreadCount = notifications.filter((item) => !item.is_read).length;

  const togglePreference = async (key) => {
    const next = { ...preferences, [key]: !preferences[key] };
    setPreferences(next);
    try {
      setSaving(true);
      await updateNotificationPreferences(next);
      setMessage("Notification preferences saved");
    } catch (err) { setPreferences(preferences); setError(err.message || "Unable to save preferences"); }
    finally { setSaving(false); }
  };

  const readNotification = async (notification) => {
    setExpanded((current) => current === notification.id ? null : notification.id);
    if (notification.is_read) return;
    try {
      await markNotificationRead(notification.id);
      setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, is_read: 1 } : item));
    } catch (err) { setError(err.message || "Unable to update notification"); }
  };

  const readAll = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((current) => current.map((item) => ({ ...item, is_read: 1 })));
      setMessage("All notifications marked as read");
    } catch (err) { setError(err.message || "Unable to update notifications"); }
  };

  if (loading) return <div className="settings-page"><div className="settings-loading">Loading your notification centre...</div></div>;

  return <div className="settings-page"><main className="settings-content"><header className="settings-heading"><div><p className="eyebrow">Stay informed</p><h1>Notifications</h1><p>Review account activity and choose how we contact you.</p></div><span className="unread-count">{unreadCount} unread</span></header>{message && <div className="settings-message">{message}<button onClick={() => setMessage("")}>×</button></div>}{error && <div className="settings-error">{error}</div>}
    <section className="notification-layout"><div className="notification-panel"><div className="notification-panel-head"><div><h2>Your alerts</h2><p>Transaction updates, security alerts, and offers.</p></div><button onClick={readAll} disabled={!unreadCount}>Mark all read</button></div><div className="notification-filters">{categories.map((category) => <button key={category} className={filter === category ? "active" : ""} onClick={() => setFilter(category)}>{categoryLabel[category]}</button>)}</div>{filteredNotifications.length ? <div className="settings-notification-list">{filteredNotifications.map((notification) => <Notification key={notification.id} type={notification.type} title={notification.title} message={notification.message} createdAt={notification.created_at} isRead={notification.is_read} expanded={expanded === notification.id} onClick={() => readNotification(notification)} />)}</div> : <div className="notifications-empty"><span>✓</span><h3>No {filter === "all" ? "new" : categoryLabel[filter].toLowerCase()} alerts</h3><p>You're all caught up.</p></div>}</div>
      <aside className="preference-panel"><p className="eyebrow">Delivery</p><h2>Contact preferences</h2><p className="preference-intro">Choose where you receive account updates and important alerts.</p><div className="preference-row"><span className="preference-icon">@</span><span><strong>Email notifications</strong><small>Transaction receipts and account updates</small></span><button className={`preference-toggle ${preferences.email_notifications ? "on" : ""}`} onClick={() => togglePreference("email_notifications")} disabled={saving} aria-label="Toggle email notifications"><i /></button></div><div className="preference-row"><span className="preference-icon">▱</span><span><strong>SMS notifications</strong><small>Security alerts and urgent activity</small></span><button className={`preference-toggle ${preferences.sms_notifications ? "on" : ""}`} onClick={() => togglePreference("sms_notifications")} disabled={saving} aria-label="Toggle SMS notifications"><i /></button></div><div className="preference-note">Security alerts remain visible here even when delivery preferences are turned off.</div></aside></section>
  </main></div>;
}

export default Settings;

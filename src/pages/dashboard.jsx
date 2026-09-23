import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// Layout provides Navbar, Sidebar and Footer
import TransactionCard from "../component/transactioncard";
import AccountCard from "../component/accountcard";
import Modal from "../component/modal";
import Notification from "../component/notification";
import {
  createTransaction,
  getUserAccounts,
  getUserNotifications,
  getUserTransactions,
  markAllNotificationsRead,
  markNotificationRead,
} from "../api/api";
import "./dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [expandedNotification, setExpandedNotification] = useState(null);
  const [quickAction, setQuickAction] = useState(null);
  const [quickActionForm, setQuickActionForm] = useState({ amount: "", description: "" });
  const [quickActionStatus, setQuickActionStatus] = useState("");
  const [quickActionError, setQuickActionError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const savedUser = localStorage.getItem("user");

        if (!savedUser) {
          setLoading(false);
          return;
        }

        const user = JSON.parse(savedUser);

        if (!user.id) {
          setLoading(false);
          return;
        }

        const userId = user.id;

        const accountsResult = await getUserAccounts(userId);
        const transactionsResult = await getUserTransactions(userId);
        const notificationsResult = await getUserNotifications(userId);

        setAccounts(accountsResult.data || accountsResult || []);
        setTransactions(
          transactionsResult.data || transactionsResult || []
        );
        setNotifications(notificationsResult.data || []);
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const visibleNotifications = showAllNotifications
    ? notifications
    : notifications.slice(0, 3);

  const handleNotificationClick = async (notification) => {
    setExpandedNotification((current) => (
      current === notification.id ? null : notification.id
    ));

    if (!notification.is_read) {
      try {
        await markNotificationRead(notification.id);
        setNotifications((current) => current.map((item) => (
          item.id === notification.id ? { ...item, is_read: 1 } : item
        )));
      } catch (error) {
        console.error("Notification read error:", error);
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((current) => current.map((notification) => ({
        ...notification,
        is_read: 1,
      })));
    } catch (error) {
      console.error("Mark all notifications error:", error);
    }
  };

  const openQuickAction = (action) => {
    if (action === "transfer") {
      navigate("/transfer");
      return;
    }

    if (action === "statements") {
      navigate("/transactions");
      return;
    }

    setQuickAction(action);
    setQuickActionForm({ amount: "", description: "" });
    setQuickActionStatus("");
    setQuickActionError("");
  };

  const closeQuickAction = () => {
    setQuickAction(null);
    setQuickActionStatus("");
    setQuickActionError("");
  };

  const handleQuickActionSubmit = async (event) => {
    event.preventDefault();
    const savedUser = localStorage.getItem("user");
    const user = savedUser ? JSON.parse(savedUser) : null;
    const amount = Number(quickActionForm.amount);

    if (!user?.id || !amount || amount <= 0) {
      setQuickActionError("Enter a valid amount to continue.");
      return;
    }

    const actionDetails = {
      deposit: {
        type: "Deposit",
        title: "Cash deposit",
        description: quickActionForm.description || "Cash deposit",
        value: amount,
      },
      bills: {
        type: "Bill Payment",
        title: "Bill payment",
        description: quickActionForm.description || "Bill payment",
        value: -amount,
      },
      airtime: {
        type: "Airtime/Data",
        title: "Airtime and data",
        description: quickActionForm.description || "Airtime and data purchase",
        value: -amount,
      },
    }[quickAction];

    try {
      setQuickActionError("");
      await createTransaction(user.id, {
        transaction_type: actionDetails.type,
        title: actionDetails.title,
        description: actionDetails.description,
        amount: actionDetails.value,
        status: "Completed",
      });

      const [accountsResult, transactionsResult] = await Promise.all([
        getUserAccounts(user.id),
        getUserTransactions(user.id),
      ]);
      setAccounts(accountsResult.data || accountsResult || []);
      setTransactions(transactionsResult.data || transactionsResult || []);
      setQuickActionStatus("Saved to your account activity.");
      setQuickActionForm({ amount: "", description: "" });
    } catch (error) {
      setQuickActionError(error.message || "Unable to save this transaction.");
    }
  };

  const totalBalance = accounts.reduce((sum, a) => {
    const val = Number(a.balance ?? a.amount ?? a.current_balance ?? 0);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const income = transactions
    .filter((t) => Number(t.amount ?? 0) > 0)
    .reduce((sum, t) => sum + Number(t.amount ?? 0), 0);

  const spending = transactions
    .filter((t) => Number(t.amount ?? 0) < 0)
    .reduce((sum, t) => sum + Math.abs(Number(t.amount ?? 0)), 0);

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Overview</p>
          <h2>Welcome back</h2>
        </div>
        <button className="primary-action" onClick={() => openQuickAction("deposit")}>Add money</button>
      </header>

      <section className="quick-actions card">
        <div className="section-heading">
          <div>
            <h3>Quick Actions</h3>
            <p className="quick-actions-subtitle">Common banking tasks, ready when you are.</p>
          </div>
        </div>
        <div className="quick-actions-grid">
          <button type="button" className="quick-action" onClick={() => openQuickAction("transfer")}>
            <span className="quick-action-icon">↗</span>
            <span>Transfer Money</span>
          </button>
          <button type="button" className="quick-action" onClick={() => openQuickAction("deposit")}>
            <span className="quick-action-icon">＋</span>
            <span>Deposit</span>
          </button>
          <button type="button" className="quick-action" onClick={() => openQuickAction("bills")}>
            <span className="quick-action-icon">▤</span>
            <span>Pay Bills</span>
          </button>
          <button type="button" className="quick-action" onClick={() => openQuickAction("airtime")}>
            <span className="quick-action-icon">⌁</span>
            <span>Buy Airtime/Data</span>
          </button>
          <button type="button" className="quick-action" onClick={() => openQuickAction("statements")}>
            <span className="quick-action-icon">▧</span>
            <span>View Statements</span>
          </button>
        </div>
      </section>

      {!loading && (
        <section className="dashboard-notifications card">
          <div className="section-heading">
            <div>
              <h3>Notifications</h3>
              <span className="notification-count">
                {notifications.filter((notification) => !notification.is_read).length} unread
              </span>
            </div>
            <div className="notification-actions">
              <button className="notification-action" type="button" onClick={handleMarkAllRead}>
                Mark all as read
              </button>
              <button
                className="notification-action"
                type="button"
                onClick={() => setShowAllNotifications((current) => !current)}
              >
                {showAllNotifications ? "Show less" : "View all"}
              </button>
            </div>
          </div>
          {notifications.length === 0 ? (
            <p className="muted">No new notifications.</p>
          ) : (
            <div className="notification-list">
              {visibleNotifications.map((notification) => (
                <Notification
                  key={notification.id}
                  type={notification.type}
                  title={notification.title}
                  message={notification.message}
                  createdAt={notification.created_at}
                  isRead={Boolean(notification.is_read)}
                  expanded={expandedNotification === notification.id}
                  onClick={() => handleNotificationClick(notification)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {loading ? (
        <div className="dashboard-loading">Loading your financial overview...</div>
      ) : (
        <>
          <section className="quick-stats">
            <article className="stat-card accent">
              <span>Total balance</span>
              <strong>${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </article>
            <article className="stat-card">
              <span>Income</span>
              <strong>${income.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </article>
            <article className="stat-card">
              <span>Spending</span>
              <strong>${spending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </article>
            <article className="stat-card">
              <span>Savings</span>
              <strong>${(totalBalance * 0.22).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </article>
          </section>

          <section className="dashboard-top">
            <div className="balance-card card">
              <div className="balance-card-header">
                <div>
                  <p>Available cash</p>
                  <h3>${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                </div>
                <span className="chip success">+8.2%</span>
              </div>

              <div className="mini-chart" aria-hidden="true">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>

            <div className="recent-transactions card">
              <div className="section-heading">
                <h3>Recent transactions</h3>
                <button className="ghost-btn">View all</button>
              </div>

              {transactions.slice(0, 5).map((t) => (
                <TransactionCard
                  key={t.id || t.transactionId || t._id}
                  title={t.description || t.type || "Transaction"}
                  date={t.transaction_date || t.date || ""}
                  amount={t.amount ?? t.value ?? 0}
                  status={t.status || ""}
                />
              ))}
            </div>
          </section>

          <section className="accounts-list">
            <div className="section-heading">
              <h3>Your accounts</h3>
              <button className="ghost-btn">Manage</button>
            </div>

            <div className="accounts-grid">
              {accounts.map((acc) => (
                <AccountCard
                  key={acc.id || acc.accountId || acc._id}
                  accountName={acc.account_name || acc.name || `Account ${acc.id}`}
                  accountNumber={acc.account_number || acc.number || acc.account_no || "-"}
                  balance={acc.balance ?? acc.current_balance ?? acc.amount ?? 0}
                  accountType={acc.type || acc.account_type || ""}
                />
              ))}
            </div>
          </section>

        </>
      )}

      <Modal
        show={Boolean(quickAction)}
        title={quickAction === "deposit" ? "Deposit money" : quickAction === "bills" ? "Pay a bill" : "Buy airtime or data"}
        onClose={closeQuickAction}
      >
        <form className="quick-action-form" onSubmit={handleQuickActionSubmit}>
          <label htmlFor="quick-action-amount">Amount</label>
          <input
            id="quick-action-amount"
            type="number"
            min="1"
            step="0.01"
            value={quickActionForm.amount}
            onChange={(event) => setQuickActionForm((current) => ({ ...current, amount: event.target.value }))}
            placeholder="0.00"
            required
          />
          <label htmlFor="quick-action-description">Description</label>
          <input
            id="quick-action-description"
            type="text"
            value={quickActionForm.description}
            onChange={(event) => setQuickActionForm((current) => ({ ...current, description: event.target.value }))}
            placeholder={quickAction === "deposit" ? "Deposit note" : "What is this for?"}
          />
          {quickActionError && <p className="quick-action-error">{quickActionError}</p>}
          {quickActionStatus && <p className="quick-action-success">{quickActionStatus}</p>}
          <button className="primary-action" type="submit">Save transaction</button>
        </form>
      </Modal>
    </div>
  );
}

export default Dashboard;
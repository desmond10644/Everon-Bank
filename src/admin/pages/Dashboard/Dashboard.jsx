import StatCard from "../../components/StatCard/StatCard";
import Charts from "../../components/Charts/Charts";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { useAdminOverview } from "../../hooks/useAdminData";
import "./Dashboard.css";

const Dashboard = () => {
  const { data: overview, loading: overviewLoading, error: overviewError } = useAdminOverview();
  const transactions = overview?.transactions || [];
  const stats = overview?.stats || {};
  const formatCurrency = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(Number(value || 0));
  const formatDate = (value) => value ? new Date(value).toLocaleDateString() : "-";

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>
            Welcome back, Administrator. Here's your
            banking overview.
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Users"
          value={overviewLoading ? "..." : stats.totalUsers ?? 0}
          icon="👥"
        />

        <StatCard
          title="Total Accounts"
          value={overviewLoading ? "..." : stats.totalAccounts ?? 0}
          icon="🏦"
        />

        <StatCard
          title="Total Transactions"
          value={overviewLoading ? "..." : stats.totalTransactions ?? 0}
          icon="💳"
        />

        <StatCard
          title="Total Balance"
          value={overviewLoading ? "..." : formatCurrency(stats.totalBalance)}
          icon="💰"
        />
      </div>

      <div className="dashboard-grid">
        <Charts data={overview?.monthlyTransactions || []} loading={overviewLoading} />

        <div className="quick-summary">
          <h3>System Summary</h3>

          <div className="summary-row">
            <span>Pending Transfers</span>
            <strong>{stats.pendingTransfers ?? 0}</strong>
          </div>

          <div className="summary-row">
            <span>Pending Loans</span>
            <strong>{stats.pendingLoans ?? 0}</strong>
          </div>

          <div className="summary-row">
            <span>Frozen Cards</span>
            <strong>{stats.frozenCards ?? 0}</strong>
          </div>

          <div className="summary-row">
            <span>Unread Notifications</span>
            <strong>{stats.unreadNotifications ?? 0}</strong>
          </div>
        </div>
      </div>

      <div className="admin-section">
        <div className="section-heading">
          <h2>Recent Transactions</h2>
            <button type="button">View All</button>
        </div>

        <div className="recent-table">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {transactions.slice(0, 5).map((transaction) => (
                <tr key={transaction.id}>
                  <td>{transaction.user}</td>
                  <td>{transaction.transaction_type}</td>
                  <td>{formatCurrency(transaction.amount)}</td>
                  <td>
                    <StatusBadge
                      status={transaction.status}
                    />
                  </td>
                  <td>{formatDate(transaction.transaction_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {overviewLoading && <p>Loading transactions...</p>}
          {overviewError && <p>{overviewError}</p>}
          {!overviewLoading && !transactions.length && <p>No transactions found.</p>}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
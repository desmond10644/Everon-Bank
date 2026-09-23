import StatCard from "../../components/StatCard/StatCard";
import Charts from "../../components/Charts/Charts";
import { useAdminOverview } from "../../hooks/useAdminData";

const Reports = () => {
  const { data, loading, error } = useAdminOverview();
  const totals = data?.reportTotals || {};
  const formatCurrency = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value || 0));

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Reports</h1>
        <p>
          Review banking activity and financial
          performance.
        </p>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Deposits"
          value={loading ? "..." : formatCurrency(totals.deposits)}
          icon="💰"
        />

        <StatCard
          title="Total Withdrawals"
          value={loading ? "..." : formatCurrency(totals.withdrawals)}
          icon="💸"
        />

        <StatCard
          title="Total Transfers"
          value={loading ? "..." : formatCurrency(totals.transfers)}
          icon="↔️"
        />

        <StatCard
          title="Loan Portfolio"
          value={loading ? "..." : formatCurrency(totals.loanPortfolio)}
          icon="🏠"
        />
      </div>

      {error && <p>{error}</p>}
      <Charts data={data?.monthlyTransactions || []} loading={loading} />

      <div className="report-actions">
        <button className="export-btn">
          Export Transactions
        </button>

        <button className="export-btn">
          Export Users
        </button>

        <button className="export-btn">
          Export Accounts
        </button>
      </div>
    </div>
  );
};

export default Reports;
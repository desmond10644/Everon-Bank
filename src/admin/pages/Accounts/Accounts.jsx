import DataTable from "../../components/DataTable/DataTable";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import useAdminData from "../../hooks/useAdminData";

const Accounts = () => {
  const { data: accounts, loading, error } = useAdminData("accounts");
  const formatCurrency = (value, currency = "USD") => new Intl.NumberFormat("en-US", { style: "currency", currency }).format(Number(value || 0));

  const columns = [
    { key: "owner", label: "Owner" },
    { key: "account", label: "Account Type" },
    { key: "number", label: "Account Number" },
    { key: "balance", label: "Balance", render: (row) => formatCurrency(row.balance, row.currency) },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <StatusBadge status={row.status} />
      ),
    },
  ];

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Accounts</h1>
        <p>Manage customer bank accounts.</p>
      </div>

      {error && <p>{error}</p>}
      {loading && <p>Loading accounts...</p>}
      <DataTable
        columns={columns}
        data={accounts}
      />
      {!loading && !accounts.length && <p>No accounts found.</p>}
    </div>
  );
};

export default Accounts;
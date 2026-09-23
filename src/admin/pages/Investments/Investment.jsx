import DataTable from "../../components/DataTable/DataTable";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import useAdminData from "../../hooks/useAdminData";

const Investments = () => {
  const { data: investments, loading, error } = useAdminData("investments");
  const formatCurrency = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value || 0));

  const columns = [
    { key: "user", label: "User" },
    { key: "category", label: "Category" },
    { key: "invested", label: "Invested", render: (row) => formatCurrency(row.invested) },
    { key: "value", label: "Current Value", render: (row) => formatCurrency(row.value) },
    { key: "returnRate", label: "Return", render: (row) => `${Number(row.returnRate || 0).toFixed(2)}%` },
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
        <h1>Investments</h1>
        <p>Manage customer investments.</p>
      </div>

      {error && <p>{error}</p>}
      {loading && <p>Loading investments...</p>}
      <DataTable
        columns={columns}
        data={investments}
      />
      {!loading && !investments.length && <p>No investments found.</p>}
    </div>
  );
};

export default Investments;
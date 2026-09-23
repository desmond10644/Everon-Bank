import DataTable from "../../components/DataTable/DataTable";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import useAdminData from "../../hooks/useAdminData";

const Loans = () => {
  const { data: loans, loading, error } = useAdminData("loans");
  const formatCurrency = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value || 0));

  const columns = [
    { key: "user", label: "User" },
    { key: "type", label: "Loan Type" },
    { key: "amount", label: "Loan Amount", render: (row) => formatCurrency(row.amount) },
    {
      key: "outstanding",
      label: "Outstanding",
      render: (row) => formatCurrency(row.outstanding),
    },
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
        <h1>Loans</h1>
        <p>Manage customer loans.</p>
      </div>

      {error && <p>{error}</p>}
      {loading && <p>Loading loans...</p>}
      <DataTable
        columns={columns}
        data={loans}
      />
      {!loading && !loans.length && <p>No loans found.</p>}
    </div>
  );
};

export default Loans;
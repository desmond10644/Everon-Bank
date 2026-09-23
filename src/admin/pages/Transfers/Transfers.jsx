import DataTable from "../../components/DataTable/DataTable";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import useAdminData from "../../hooks/useAdminData";

const Transfers = () => {
  const { data: transfers, loading, error } = useAdminData("transfers");
  const formatCurrency = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value || 0));
  const formatDate = (value) => value ? new Date(value).toLocaleDateString() : "-";

  const columns = [
    { key: "id", label: "Transfer ID" },
    { key: "sender", label: "Sender" },
    { key: "recipient", label: "Recipient" },
    { key: "amount", label: "Amount", render: (row) => formatCurrency(row.amount) },
    { key: "type", label: "Type" },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <StatusBadge status={row.status} />
      ),
    },
    { key: "date", label: "Date", render: (row) => formatDate(row.date) },
  ];

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Transfers</h1>
        <p>Monitor customer money transfers.</p>
      </div>

      {error && <p>{error}</p>}
      {loading && <p>Loading transfers...</p>}
      <DataTable
        columns={columns}
        data={transfers}
      />
      {!loading && !transfers.length && <p>No transfers found.</p>}
    </div>
  );
};

export default Transfers;
import DataTable from "../../components/DataTable/DataTable";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import useAdminData from "../../hooks/useAdminData";

const Cards = () => {
  const { data: cards, loading, error } = useAdminData("cards");
  const formatCurrency = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value || 0));

  const columns = [
    { key: "holder", label: "Card Holder" },
    { key: "number", label: "Card Number" },
    { key: "kind", label: "Type" },
    { key: "spendingLimit", label: "Spending Limit", render: (row) => formatCurrency(row.spendingLimit) },
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
        <h1>Cards</h1>
        <p>Manage customer cards.</p>
      </div>

      {error && <p>{error}</p>}
      {loading && <p>Loading cards...</p>}
      <DataTable
        columns={columns}
        data={cards}
      />
      {!loading && !cards.length && <p>No cards found.</p>}
    </div>
  );
};

export default Cards;
import DataTable from "../../components/DataTable/DataTable";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import useAdminData from "../../hooks/useAdminData";

const Notifications = () => {
  const { data: notifications, loading, error } = useAdminData("notifications");
  const formatDate = (value) => value ? new Date(value).toLocaleDateString() : "-";

  const columns = [
    { key: "user", label: "User" },
    { key: "title", label: "Title" },
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
        <h1>Notifications</h1>
        <p>Manage customer notifications.</p>
      </div>

      <div className="admin-toolbar">
        <button className="export-btn">
          + Create Notification
        </button>
      </div>

      {error && <p>{error}</p>}
      {loading && <p>Loading notifications...</p>}
      <DataTable
        columns={columns}
        data={notifications}
      />
      {!loading && !notifications.length && <p>No notifications found.</p>}
    </div>
  );
};

export default Notifications;
import DataTable from "../../components/DataTable/DataTable";
import useAdminData from "../../hooks/useAdminData";

const AdminUsers = () => {
  const { data: admins, loading, error } = useAdminData("admins");

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
    { key: "joined", label: "Joined" },
  ];

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Admin Users</h1>
        <p>Manage administrators and permissions.</p>
      </div>

      <div className="admin-toolbar">
        <button className="export-btn">
          + Add Administrator
        </button>
      </div>

      {error && <p>{error}</p>}
      {loading && <p>Loading administrators...</p>}
      <DataTable
        columns={columns}
        data={admins}
      />
      {!loading && !admins.length && <p>No administrators found.</p>}
    </div>
  );
};

export default AdminUsers;
import { useState } from "react";
import DataTable from "../../components/DataTable/DataTable";
import AdminButton from "../../components/AdminButton/AdminButton";
import AdminModal from "../../components/AdminModal/AdminModal";
import useAdminData from "../../hooks/useAdminData";

const Users = () => {
  const [selectedUser, setSelectedUser] =
    useState(null);

  const { data: users, loading, error } = useAdminData("users");

  const columns = [
    {
      key: "name",
      label: "Name",
    },
    {
      key: "email",
      label: "Email",
    },
    {
      key: "phone",
      label: "Phone",
    },
    {
      key: "joined",
      label: "Joined",
    },
  ];

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Users</h1>
          <p>Manage all MyBank customers.</p>
        </div>

        <AdminButton>
          + Add User
        </AdminButton>
      </div>

      <div className="admin-toolbar">
        <input
          type="search"
          placeholder="Search users..."
        />

        <select>
          <option>All Status</option>
          <option>Active</option>
          <option>Suspended</option>
        </select>
      </div>

      {error && <p>{error}</p>}
      {loading && <p>Loading users...</p>}
      <DataTable
        columns={columns}
        data={users}
        actions={(row) => (
          <>
            <AdminButton
              variant="secondary"
              onClick={() => setSelectedUser(row)}
            >
              View
            </AdminButton>

            <AdminButton variant="danger">
              Suspend
            </AdminButton>
          </>
        )}
      />
      {!loading && !users.length && <p>No users found.</p>}

      <AdminModal
        open={!!selectedUser}
        title="User Details"
        onClose={() => setSelectedUser(null)}
      >
        {selectedUser && (
          <div className="user-details">
            <p>
              <strong>Name:</strong>{" "}
              {selectedUser.name}
            </p>

            <p>
              <strong>Email:</strong>{" "}
              {selectedUser.email}
            </p>

            <p>
              <strong>Phone:</strong>{" "}
              {selectedUser.phone}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {selectedUser.status}
            </p>

            <p>
              <strong>Joined:</strong>{" "}
              {selectedUser.joined}
            </p>
          </div>
        )}
      </AdminModal>
    </div>
  );
};

export default Users;
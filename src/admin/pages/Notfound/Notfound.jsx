import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="admin-not-found">
      <div>
        <h1>404</h1>

        <h2>Page Not Found</h2>

        <p>
          The admin page you are looking for does not
          exist.
        </p>

        <Link to="/admin">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
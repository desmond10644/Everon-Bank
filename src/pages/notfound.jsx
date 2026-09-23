import { Link } from "react-router-dom";
import "./notfound.css";

function NotFound() {
  return (
    <div className="notfound-page">

      <h1>404</h1>

      <h2>Page Not Found</h2>

      <p>
        Sorry, the page you are looking for doesn't exist.
      </p>

      <Link to="/" className="home-btn">
        Back to Home
      </Link>

    </div>
  );
}

export default NotFound;
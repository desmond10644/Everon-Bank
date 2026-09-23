import Sidebar from "../component/sidebar";
import Navbar from "../component/navbar";
import Footer from "../component/footer";
import "./AppLayout.css";

export default function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <header className="app-header">
        <Navbar />
      </header>

      <div className="app-body">
        <aside className="app-sidebar">
          <Sidebar />
        </aside>

        <main className="app-content">
          <div className="page card">{children}</div>
        </main>
      </div>

      <footer className="app-footer">
        <Footer />
      </footer>
    </div>
  );
}

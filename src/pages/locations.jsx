import { useMemo, useState } from "react";
import "./platform.css";

const locations = [
  { name: "Victoria Island Branch", kind: "Branch", distance: "1.8 km", hours: "Mon-Fri, 8:00 AM - 5:00 PM", services: "Cashier, advisory, account opening" },
  { name: "Marina ATM", kind: "ATM", distance: "2.4 km", hours: "Open 24 hours", services: "Cash withdrawal, deposits, balance checks" },
  { name: "Ikeja City Mall ATM", kind: "ATM", distance: "6.2 km", hours: "Open 24 hours", services: "Cash withdrawal, balance checks" },
  { name: "Lekki Branch", kind: "Branch", distance: "8.4 km", hours: "Mon-Fri, 8:00 AM - 5:00 PM", services: "Cashier, loans, investments" },
];

function Locations() {
  const [kind, setKind] = useState("All");
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => locations.filter((location) => (kind === "All" || location.kind === kind) && location.name.toLowerCase().includes(search.toLowerCase())), [kind, search]);
  return <main className="platform-page"><header className="platform-hero"><div><p className="eyebrow">Find us</p><h1>Branches & ATMs</h1><p>Find a convenient location using sample demo locations.</p></div></header><section className="platform-card location-tools"><input aria-label="Search locations" placeholder="Search by branch or area" value={search} onChange={(event) => setSearch(event.target.value)} /><div className="segmented"><button className={kind === "All" ? "active" : ""} onClick={() => setKind("All")}>All</button><button className={kind === "Branch" ? "active" : ""} onClick={() => setKind("Branch")}>Branches</button><button className={kind === "ATM" ? "active" : ""} onClick={() => setKind("ATM")}>ATMs</button></div></section><div className="platform-grid two-columns">{filtered.map((location) => <article className="platform-card location-card" key={location.name}><div className="location-title"><span className="location-icon">{location.kind === "ATM" ? "$" : "B"}</span><div><h2>{location.name}</h2><span className="pill">{location.kind}</span></div></div><p><strong>{location.distance}</strong> away</p><p className="muted">{location.hours}</p><small>Services: {location.services}</small><button className="outline-action" type="button" onClick={() => window.alert(`Demo directions to ${location.name}`)}>Get directions</button></article>)}</div>{filtered.length === 0 && <div className="empty-panel">No locations match your search.</div>}</main>;
}

export default Locations;

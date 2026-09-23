import { useEffect, useState } from "react";

import "./profile.css";

function Profile() {
  const [user, setUser] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");



  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");
        const savedUser = JSON.parse(localStorage.getItem("user") || "null");

        if (!token && savedUser) {
          setUser({
            fullName: savedUser.fullName || savedUser.full_name || "",
            email: savedUser.email || "",
            phone: savedUser.phone || "",
            address: savedUser.address || "",
          });
          setLoading(false);
          return;
        }

        const res = await fetch("http://localhost:5000/api/users/profile", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        const data = await res.json();

        if (!res.ok) {
          if (savedUser) {
            setUser({
              fullName: savedUser.fullName || savedUser.full_name || "",
              email: savedUser.email || "",
              phone: savedUser.phone || "",
              address: savedUser.address || "",
            });
            return;
          }
          throw new Error(data.message || "Failed to load profile");
        }

        const u = data.user || data.data || savedUser || {};
        setUser({
          fullName: u.full_name || u.fullName || [u.firstName, u.lastName].filter(Boolean).join(" "),
          email: u.email || "",
          phone: u.phone || "",
          address: u.address || "",
        });
      } catch (err) {
        console.error(err);
        setError(err.message || "Unable to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);



  // ==========================================
  // HANDLE INPUT
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };



  // ==========================================
  // UPDATE PROFILE
  // ==========================================

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const token = localStorage.getItem("token");

      const payload = {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        address: user.address,
      };

      const res = await fetch(`http://localhost:5000/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      setSuccess("Profile updated successfully!");
      // Update local storage user
      const saved = JSON.parse(localStorage.getItem("user") || "null");
      if (saved) {
        localStorage.setItem(
          "user",
          JSON.stringify({ ...saved, full_name: user.fullName, email: user.email, phone: user.phone, address: user.address })
        );
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to update profile");
    } finally {
      setSaving(false);
    }
  };



  // ==========================================
  // LOADING
  // ==========================================

  if (loading) return <div className="profile-loading">Loading profile...</div>;

  const initials = user.fullName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();



  return (
    <div className="profile-page">
      <header className="profile-heading">
        <div>
          <p className="eyebrow">Account</p>
          <h1>My Profile</h1>
          <p>Keep your personal details current and secure.</p>
        </div>
      </header>

      {error && <div className="profile-error">{error}</div>}
      {success && <div className="profile-success">{success}</div>}

      <div className="profile-layout">
        <main className="profile-main">
          <section className="profile-identity">
            <div className="profile-avatar">{initials || "MB"}</div>
            <div>
              <h2>{user.fullName || "MyBank customer"}</h2>
              <p>{user.email}</p>
              <span className="profile-badge">Personal account</span>
            </div>
          </section>

          <section className="information-section">
            <div className="section-title">
              <h2>Profile information</h2>
              <span>Updated details</span>
            </div>
            <div className="information-grid">
              <div><span>Full name</span><strong>{user.fullName || "Not provided"}</strong></div>
              <div><span>Email address</span><strong>{user.email || "Not provided"}</strong></div>
              <div><span>Phone number</span><strong>{user.phone || "Not provided"}</strong></div>
              <div><span>Address</span><strong>{user.address || "Not provided"}</strong></div>
            </div>
          </section>

          <form className="profile-edit-form" onSubmit={handleSave}>
            <div className="form-section-heading">
              <h2>Edit details</h2>
              <span>Changes save securely</span>
            </div>
            <div className="profile-field-grid">
              <label htmlFor="fullName">Full name<input id="fullName" name="fullName" value={user.fullName} onChange={handleChange} required /></label>
              <label htmlFor="email">Email address<input id="email" name="email" type="email" value={user.email} onChange={handleChange} required /></label>
              <label htmlFor="phone">Phone number<input id="phone" name="phone" value={user.phone} onChange={handleChange} required /></label>
              <label htmlFor="address">Address<textarea id="address" name="address" rows="3" value={user.address} onChange={handleChange} /></label>
            </div>
            <button className="primary-profile-button" type="submit" disabled={saving}>{saving ? "Saving..." : "Save changes"}</button>
          </form>
        </main>

        <aside className="profile-side">
          <section className="account-information">
            <h2>Account information</h2>
            <div className="account-detail"><span>Account type</span><strong>Personal</strong></div>
            <div className="account-detail"><span>Email status</span><strong className="verified">Verified</strong></div>
            <div className="account-detail"><span>Phone status</span><strong className="verified">Verified</strong></div>
          </section>
          <section className="security-card">
            <div className="security-icon">⌑</div>
            <h2>Keep your account safe</h2>
            <p>Use a strong password and review your details regularly to keep your banking profile protected.</p>
            <button type="button">Review security <span>→</span></button>
          </section>
        </aside>
      </div>
    </div>
  );
}


export default Profile;
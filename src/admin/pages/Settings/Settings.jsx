import { useEffect, useState } from "react";
import { getAdminSettings, updateAdminSettings } from "../../services/adminApi";

const Settings = () => {
  const [settings, setSettings] = useState({
    bankName: "",
    supportEmail: "",
    supportPhone: "",
    maintenanceMode: false,
    registrationEnabled: false,
    transfersEnabled: false,
  });

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminSettings()
      .then((data) => {
        if (data) setSettings({
          bankName: data.bankName || "",
          supportEmail: data.supportEmail || "",
          supportPhone: data.supportPhone || "",
          maintenanceMode: Boolean(data.maintenanceMode),
          registrationEnabled: Boolean(data.registrationEnabled),
          transfersEnabled: Boolean(data.transfersEnabled),
        });
      })
      .catch((loadError) => setError(loadError.response?.data?.message || loadError.message || "Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setSettings({
      ...settings,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await updateAdminSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (saveError) {
      setError(saveError.response?.data?.message || saveError.message || "Failed to save settings");
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage system and banking settings.</p>
      </div>

      {saved && (
        <div className="settings-success">
          Settings saved successfully.
        </div>
      )}
      {loading && <p>Loading settings...</p>}
      {error && <p>{error}</p>}

      <form
        className="settings-form"
        onSubmit={handleSubmit}
      >
        <div className="settings-card">
          <h2>Bank Information</h2>

          <div className="settings-grid">
            <div>
              <label>Bank Name</label>

              <input
                name="bankName"
                value={settings.bankName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Support Email</label>

              <input
                name="supportEmail"
                value={settings.supportEmail}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Support Phone</label>

              <input
                name="supportPhone"
                value={settings.supportPhone}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="settings-card">
          <h2>System Controls</h2>

          <label className="toggle-row">
            <span>Maintenance Mode</span>

            <input
              type="checkbox"
              name="maintenanceMode"
              checked={settings.maintenanceMode}
              onChange={handleChange}
            />
          </label>

          <label className="toggle-row">
            <span>Allow New Registrations</span>

            <input
              type="checkbox"
              name="registrationEnabled"
              checked={settings.registrationEnabled}
              onChange={handleChange}
            />
          </label>

          <label className="toggle-row">
            <span>Allow Transfers</span>

            <input
              type="checkbox"
              name="transfersEnabled"
              checked={settings.transfersEnabled}
              onChange={handleChange}
            />
          </label>
        </div>

        <button
          type="submit"
          className="save-settings-btn"
        >
          Save Settings
        </button>
      </form>
    </div>
  );
};

export default Settings;
import { useEffect, useState } from "react";
import { getAdminOverview } from "../services/adminApi";

export function useAdminOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getAdminOverview()
      .then((overview) => {
        if (active) setData(overview);
      })
      .catch((loadError) => {
        if (active) setError(loadError.response?.data?.message || loadError.message || "Failed to load admin data");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { data, loading, error };
}

export default function useAdminData(resource) {
  const { data: overview, loading, error } = useAdminOverview();

  return { data: overview?.[resource] || [], loading, error };
}
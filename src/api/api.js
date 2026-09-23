import { getUserTransactions as getStoredUserTransactions, addUserTransaction } from "../utils/transactionStorage";
import { getUserAccounts as getStoredUserAccounts, addUserAccount } from "../utils/accountStorage";

const API_URL = "http://localhost:5000/api";

// ==========================
// USERS
// ==========================

export const getUsers = async () => {
  const response = await fetch(`${API_URL}/users`);

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  return response.json();
};


export const getUser = async (id) => {
  const response = await fetch(`${API_URL}/users/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }

  return response.json();
};

export const getProfile = async () => {
  const authToken = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/users/profile`, { headers: authToken ? { Authorization: `Bearer ${authToken}` } : {} });
  if (!response.ok) throw new Error("Failed to fetch profile");
  return response.json();
};

export const updateProfile = async (profile) => {
  const authToken = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/users/profile`, { method: "PUT", headers: { "Content-Type": "application/json", ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) }, body: JSON.stringify(profile) });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || "Failed to update profile");
  return result;
};

export const changePassword = async (passwords) => {
  const authToken = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/users/password`, { method: "PATCH", headers: { "Content-Type": "application/json", ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) }, body: JSON.stringify(passwords) });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || "Failed to change password");
  return result;
};


// ==========================
// ACCOUNTS
// ==========================

export const getAccounts = async () => {
  const response = await fetch(`${API_URL}/accounts`);

  if (!response.ok) {
    throw new Error("Failed to fetch accounts");
  }

  return response.json();
};


export const getUserAccounts = async (userId) => {
  const id = Number(userId);

  if (!id) {
    return {
      success: true,
      data: getStoredUserAccounts(42),
    };
  }

  try {
    const authToken = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/accounts/user/${id}`, {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user accounts");
    }

    const result = await response.json();

    if (Array.isArray(result?.data) && result.data.length > 0) {
      return result;
    }

    return {
      success: true,
      data: getStoredUserAccounts(id),
    };
  } catch {
    return {
      success: true,
      data: getStoredUserAccounts(id),
    };
  }
};

export const getAccountDetails = async (accountId) => {
  const authToken = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/accounts/${accountId}`, {
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
  });
  if (!response.ok) throw new Error("Failed to fetch account details");
  return response.json();
};

export const saveUserAccount = (userId, account) => {
  const id = Number(userId);

  if (!id) {
    return null;
  }

  return addUserAccount(id, account);
};


// ==========================
// TRANSACTIONS
// ==========================

export const getTransactions = async () => {
  const response = await fetch(
    `${API_URL}/transactions`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch transactions");
  }

  return response.json();
};


export const getUserTransactions = async (userId) => {
  const id = Number(userId);

  if (!id) {
    return {
      success: true,
      data: getStoredUserTransactions(1),
    };
  }

  try {
    const response = await fetch(
      `${API_URL}/transactions/user/${id}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch user transactions");
    }

    const result = await response.json();

    if (Array.isArray(result?.data) && result.data.length > 0) {
      return result;
    }

    return {
      success: true,
      data: getStoredUserTransactions(id),
    };
  } catch {
    return {
      success: true,
      data: getStoredUserTransactions(id),
    };
  }
};

export const saveUserTransaction = (userId, transaction) => {
  const id = Number(userId);

  if (!id) {
    return null;
  }

  const result = addUserTransaction(id, transaction);

  return result;
};

export const getTransferData = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/transfers/data`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!response.ok) throw new Error("Failed to fetch transfer data");
  return response.json();
};

export const submitTransfer = async (transfer) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/transfers`, { method: "POST", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(transfer) });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || "Transfer failed");
  return result;
};

export const saveBeneficiary = async (beneficiary) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/transfers/beneficiaries`, { method: "POST", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(beneficiary) });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || "Failed to save beneficiary");
  return result;
};


// ==========================
// CARDS
// ==========================

export const getCards = async () => {
  const response = await fetch(
    `${API_URL}/cards`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch cards");
  }

  return response.json();
};


export const getUserCards = async (userId, token) => {
  const id = Number(userId ?? JSON.parse(localStorage.getItem("user") || "null")?.id ?? 1);

  const response = await fetch(
    `${API_URL}/cards/user/${id}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch user cards");
  }

  return response.json();
};


// ==========================
// LOANS
// ==========================

export const getLoans = async () => {
  const response = await fetch(
    `${API_URL}/loans`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch loans");
  }

  return response.json();
};


export const getUserLoans = async (userId) => {
  const token = localStorage.getItem("token");
  const response = await fetch(
    `${API_URL}/loans/user/${userId}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch user loans");
  }

  return response.json();
};


// ==========================
// INVESTMENTS
// ==========================

export const getInvestments = async () => {
  const response = await fetch(
    `${API_URL}/investments`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch investments");
  }

  return response.json();
};


export const getUserInvestments = async (userId) => {
  const token = localStorage.getItem("token");
  const response = await fetch(
    `${API_URL}/investments/user/${userId}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch user investments");
  }

  return response.json();
};

export const createInvestment = async (investment) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/investments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(investment),
  });

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.message || "Failed to create investment");
  }

  return response.json();
};

export const sellInvestment = async (investmentId, amount) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/investments/${investmentId}/sell`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ amount }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || "Failed to sell investment");
  return result;
};

export const getUserNotifications = async (userId) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/notifications/user/${userId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    throw new Error("Failed to fetch notifications");
  }

  return response.json();
};

export const markNotificationRead = async (notificationId) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
    method: "PATCH",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    throw new Error("Failed to mark notification as read");
  }

  return response.json();
};

export const markAllNotificationsRead = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/notifications/read-all`, {
    method: "PATCH",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    throw new Error("Failed to mark notifications as read");
  }

  return response.json();
};

export const getNotificationPreferences = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/notifications/preferences`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!response.ok) throw new Error("Failed to fetch notification preferences");
  return response.json();
};

export const updateNotificationPreferences = async (preferences) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/notifications/preferences`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(preferences),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || "Failed to save notification preferences");
  return result;
};

export const createTransaction = async (userId, transaction) => {
  const id = Number(userId);
  if (!id) return null;

  try {
    const payload = {
      user_id: id,
      account_id: transaction.account_id,
      transaction_type: transaction.transaction_type,
      title: transaction.title || transaction.description,
      description: transaction.description,
      amount: transaction.amount,
      transaction_date: transaction.transaction_date,
      status: transaction.status,
      reference: transaction.reference,
    };

    const res = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error('Failed to create transaction');

    const data = await res.json();
    return data;
  } catch {
    // Fallback to local storage
    const local = addUserTransaction(id, transaction);
    return { success: true, data: local };
  }
};

const cardRequest = async (path, options = {}) => {
  const authToken = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/cards${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(options.headers || {}),
    },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || "Card request failed");
  return result;
};

export const updateCard = (cardId, changes) => cardRequest(`/${cardId}`, { method: "PATCH", body: JSON.stringify(changes) });
export const changeCardPin = (cardId, pin) => cardRequest(`/${cardId}/pin`, { method: "PATCH", body: JSON.stringify({ pin }) });
export const requestCardReplacement = (cardId) => cardRequest(`/${cardId}/replacement`, { method: "POST" });
export const createCard = (cardKind) => cardRequest("/", { method: "POST", body: JSON.stringify({ card_kind: cardKind }) });
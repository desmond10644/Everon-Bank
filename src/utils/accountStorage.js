const STORAGE_KEY = 'bank_accounts';

const defaultAccounts = [
  {
    id: 1,
    user_id: 42,
    account_name: 'Main Checking',
    account_number: '1002345678',
    balance: 8540.42,
    account_type: 'Checking',
  },
  {
    id: 2,
    user_id: 42,
    account_name: 'Emergency Savings',
    account_number: '1002345679',
    balance: 18250.8,
    account_type: 'Savings',
  },
  {
    id: 3,
    user_id: 1,
    account_name: 'Personal Account',
    account_number: '2009876543',
    balance: 6400.5,
    account_type: 'Checking',
  },
];

function getStorage(storage = globalThis.localStorage) {
  return storage || null;
}

export function getAllAccounts(storage = getStorage()) {
  if (!storage) return [...defaultAccounts];

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      storage.setItem(STORAGE_KEY, JSON.stringify(defaultAccounts));
      return [...defaultAccounts];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : [...defaultAccounts];
  } catch {
    return [...defaultAccounts];
  }
}

export function getUserAccounts(userId, storage = getStorage()) {
  const accounts = getAllAccounts(storage);
  const targetId = Number(userId);

  return accounts.filter((account) => Number(account.user_id) === targetId);
}

export function addUserAccount(userId, account, storage = getStorage()) {
  const saved = getAllAccounts(storage);
  const entry = {
    id: Date.now(),
    user_id: Number(userId),
    account_name: account.account_name || 'New Account',
    account_number: account.account_number || '0000000000',
    balance: Number(account.balance ?? 0),
    account_type: account.account_type || 'Checking',
  };

  const next = [...saved, entry];

  if (storage) {
    storage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  return entry;
}

export default {
  getAllAccounts,
  getUserAccounts,
  addUserAccount,
};

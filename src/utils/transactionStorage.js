const STORAGE_KEY = 'bank_transactions';

const defaultTransactions = [
  {
    id: 1,
    user_id: 42,
    description: 'Salary deposit',
    amount: 3200,
    status: 'Completed',
    type: 'income',
    transaction_date: '2026-08-18T09:00:00.000Z',
  },
  {
    id: 2,
    user_id: 42,
    description: 'Groceries',
    amount: -145.75,
    status: 'Completed',
    type: 'expense',
    transaction_date: '2026-08-20T12:10:00.000Z',
  },
  {
    id: 3,
    user_id: 42,
    description: 'Netflix',
    amount: -18.99,
    status: 'Completed',
    type: 'expense',
    transaction_date: '2026-08-22T18:45:00.000Z',
  },
  {
    id: 4,
    user_id: 1,
    description: 'Freelance payout',
    amount: 1250,
    status: 'Completed',
    type: 'income',
    transaction_date: '2026-08-24T09:35:00.000Z',
  },
  {
    id: 5,
    user_id: 1,
    description: 'Rent payment',
    amount: -950,
    status: 'Completed',
    type: 'expense',
    transaction_date: '2026-08-25T14:20:00.000Z',
  },
];

function getStorage(storage = globalThis.localStorage) {
  if (!storage) return null;
  return storage;
}

export function getAllTransactions(storage = getStorage()) {
  if (!storage) return [...defaultTransactions];

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      storage.setItem(STORAGE_KEY, JSON.stringify(defaultTransactions));
      return [...defaultTransactions];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : [...defaultTransactions];
  } catch {
    return [...defaultTransactions];
  }
}

export function getUserTransactions(userId, storage = getStorage()) {
  const transactions = getAllTransactions(storage);
  const targetId = Number(userId);

  return transactions.filter((transaction) => Number(transaction.user_id) === targetId);
}

export function addUserTransaction(userId, transaction, storage = getStorage()) {
  const saved = getAllTransactions(storage);
  const entry = {
    id: Date.now(),
    user_id: Number(userId),
    description: transaction.description || 'New transaction',
    amount: Number(transaction.amount ?? 0),
    status: transaction.status || 'Completed',
    type: transaction.type || 'expense',
    transaction_date: transaction.transaction_date || new Date().toISOString(),
  };

  const next = [...saved, entry];

  if (storage) {
    storage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  return entry;
}

export default {
  getAllTransactions,
  getUserTransactions,
  addUserTransaction,
};

import test from 'node:test';
import assert from 'node:assert/strict';

import { getUserTransactions, addUserTransaction } from './transactionStorage.js';

function createMockStorage() {
  const values = new Map();

  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    },
  };
}

test('returns seeded transactions for a user when no saved data exists', () => {
  const storage = createMockStorage();

  const transactions = getUserTransactions(42, storage);

  assert.ok(Array.isArray(transactions));
  assert.ok(transactions.length > 0);
  assert.equal(transactions[0].user_id, 42);
  assert.equal(transactions[0].status, 'Completed');
});

test('adds a new transaction and keeps it in storage', () => {
  const storage = createMockStorage();

  const created = addUserTransaction(42, {
    description: 'Coffee shop',
    amount: -18.5,
    status: 'Completed',
    type: 'expense',
  }, storage);

  const transactions = getUserTransactions(42, storage);

  assert.equal(created.description, 'Coffee shop');
  assert.equal(transactions.at(-1).description, 'Coffee shop');
  assert.equal(transactions.at(-1).amount, -18.5);
});

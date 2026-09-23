import test from 'node:test';
import assert from 'node:assert/strict';

import { getUserAccounts, addUserAccount } from './accountStorage.js';

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

test('returns seeded account data for an active user', () => {
  const storage = createMockStorage();
  const accounts = getUserAccounts(42, storage);

  assert.ok(Array.isArray(accounts));
  assert.ok(accounts.length > 0);
  assert.equal(accounts[0].user_id, 42);
  assert.ok(Number(accounts[0].balance) >= 0);
});

test('adds a new account to the user account list', () => {
  const storage = createMockStorage();

  const created = addUserAccount(42, {
    account_name: 'Savings Plus',
    balance: 8200,
    account_type: 'Savings',
    account_number: '9001234567',
  }, storage);

  const accounts = getUserAccounts(42, storage);

  assert.equal(created.account_name, 'Savings Plus');
  assert.equal(accounts.at(-1).account_name, 'Savings Plus');
  assert.equal(accounts.at(-1).balance, 8200);
});

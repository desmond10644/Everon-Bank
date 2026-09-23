// account.js
import api from "./api";

export const getAccounts = async () => {
  const response = await api.get("/accounts");
  return response.data;
};

export const getAccountById = async (id) => {
  const response = await api.get(`/accounts/${id}`);
  return response.data;
};
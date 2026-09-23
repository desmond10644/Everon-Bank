// transferservice.js
import api from "./api";

export const transferMoney = async (transferData) => {
  const response = await api.post("/transfer", transferData);
  return response.data;
};

export const getTransfers = async () => {
  const response = await api.get("/transfer");
  return response.data;
};
import axios from "axios";

const BASE_URL = "http://localhost:5000/api/vnpay";

export const createVnpayPaymentUrl = async (orderCode: string, amount: number) => {
  const res = await axios.post(`${BASE_URL}/create_payment_url`, {
    orderCode,
    amount,
  });
  return res.data.paymentUrl;
};

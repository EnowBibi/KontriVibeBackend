/*-----------------------------------------------------------------------------------------------------
| @blocktype fapshiClient
| @brief    Fapshi API client wrapper for payment operations
| @param    API credentials, transaction details
| @return   Promises with transaction results
-----------------------------------------------------------------------------------------------------*/

import axios from "axios";

const baseUrl = "https://live.fapshi.com";
const headers = {
  apiuser: process.env.FAPSHI_API_USER,
  apikey: process.env.FAPSHI_API_KEY,
};

/**
 * @brief Helper function to format errors
 */
function createError(message, statusCode) {
  return { success: false, message, statusCode };
}

/**
 * @brief Initiate payment via redirect (generates payment link)
 * @param data - Payment data with amount, email, userId, redirectUrl
 * @return Promise with payment link
 */
export async function initiatePay(data) {
  return new Promise(async (resolve) => {
    try {
      if (!data?.amount) return resolve(createError("Amount required", 400));
      if (!Number.isInteger(data.amount))
        return resolve(createError("Amount must be integer", 400));
      if (data.amount < 100)
        return resolve(createError("Amount cannot be less than 100 XAF", 400));

      const config = {
        method: "post",
        url: baseUrl + "/initiate-pay",
        headers,
        data,
      };

      const response = await axios(config);
      response.data.statusCode = response.status;
      resolve(response.data);
    } catch (error) {
      resolve(createError(error.response?.data?.message || error.message, 500));
    }
  });
}

/**
 * @brief Direct payment initiation to mobile money account
 * @param data - Payment data with amount, phone, medium
 * @return Promise with transaction ID
 */
export async function directPay(data) {
  return new Promise(async (resolve) => {
    try {
      if (!data?.amount) return resolve(createError("Amount required", 400));
      if (!Number.isInteger(data.amount))
        return resolve(createError("Amount must be integer", 400));
      if (data.amount < 100)
        return resolve(createError("Amount cannot be less than 100 XAF", 400));
      if (!data?.phone)
        return resolve(createError("Phone number required", 400));
      if (typeof data.phone !== "string")
        return resolve(createError("Phone must be string", 400));
      if (!/^6[\d]{8}$/.test(data.phone))
        return resolve(createError("Invalid phone number format", 400));

      const config = {
        method: "post",
        url: baseUrl + "/direct-pay",
        headers,
        data,
      };

      const response = await axios(config);
      response.data.statusCode = response.status;
      resolve(response.data);
    } catch (error) {
      resolve(createError(error.response?.data?.message || error.message, 500));
    }
  });
}

/**
 * @brief Check payment status for a transaction
 * @param transId - Fapshi transaction ID
 * @return Promise with transaction details
 */
export async function paymentStatus(transId) {
  return new Promise(async (resolve) => {
    try {
      if (!transId || typeof transId !== "string")
        return resolve(createError("Invalid transaction ID format", 400));
      if (!/^[a-zA-Z0-9]{8,10}$/.test(transId))
        return resolve(createError("Invalid transaction ID", 400));

      const config = {
        method: "get",
        url: baseUrl + "/payment-status/" + transId,
        headers,
      };

      const response = await axios(config);
      response.data.statusCode = response.status;
      resolve(response.data);
    } catch (error) {
      resolve(createError(error.response?.data?.message || error.message, 500));
    }
  });
}

/**
 * @brief Expire a pending payment transaction
 * @param transId - Fapshi transaction ID
 * @return Promise with expiration result
 */
export async function expirePay(transId) {
  return new Promise(async (resolve) => {
    try {
      if (!transId || typeof transId !== "string")
        return resolve(createError("Invalid transaction ID format", 400));
      if (!/^[a-zA-Z0-9]{8,10}$/.test(transId))
        return resolve(createError("Invalid transaction ID", 400));

      const config = {
        method: "post",
        url: baseUrl + "/expire-pay",
        data: { transId },
        headers,
      };

      const response = await axios(config);
      response.data.statusCode = response.status;
      resolve(response.data);
    } catch (error) {
      resolve(createError(error.response?.data?.message || error.message, 500));
    }
  });
}

/**
 * @brief Get all transactions for a user
 * @param userId - Fapshi user ID
 * @return Promise with transaction array
 */
export async function getUserTransactions(userId) {
  return new Promise(async (resolve) => {
    try {
      if (!userId || typeof userId !== "string")
        return resolve(createError("Invalid user ID format", 400));

      const config = {
        method: "get",
        url: baseUrl + "/transaction/" + userId,
        headers,
      };

      const response = await axios(config);
      resolve(response.data);
    } catch (error) {
      resolve(createError(error.response?.data?.message || error.message, 500));
    }
  });
}

/**
 * @brief Get Fapshi account balance
 * @return Promise with balance details
 */
export async function getBalance() {
  return new Promise(async (resolve) => {
    try {
      const config = {
        method: "get",
        url: baseUrl + "/balance",
        headers,
      };

      const response = await axios(config);
      response.data.statusCode = response.status;
      resolve(response.data);
    } catch (error) {
      resolve(createError(error.response?.data?.message || error.message, 500));
    }
  });
}

export default {
  initiatePay,
  directPay,
  paymentStatus,
  expirePay,
  getUserTransactions,
  getBalance,
};

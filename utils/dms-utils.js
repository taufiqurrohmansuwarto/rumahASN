const axios = require("axios");
import { logger } from "./logger";

const BASE_URL = "https://api-siasn-internal.bkn.go.id/dms/api/manajemen";

// https://api-siasn-internal.bkn.go.id/dms/api/manajemen/data-profile/200201212025042004

/**
 * Create DMS fetcher instance
 * @param {string} token - Authorization token
 * @returns {Object} Axios instance configured for DMS API
 */
const createDMSFetcher = (token) => {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/**
 * Get data profile from DMS
 * @param {Object} fetcher - Axios instance
 * @param {string} nip - NIP of the employee
 * @returns {Promise<Object>} Profile data
 */
const getDataProfileDMS = async (token, nip) => {
  return new Promise(async (resolve) => {
    try {
      const fetcher = createDMSFetcher(token);
      const response = await fetcher.get(`/data-profile/${nip}`);
      resolve(response?.data);
    } catch (error) {
      const errorMsg = error?.response?.data?.message || error?.message;
      logger.error(`${nip} - ${errorMsg} DMS`);
      resolve(null);
    }
  });
};

module.exports = {
  createDMSFetcher,
  getDataProfileDMS,
};

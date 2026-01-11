// services/SiasnService.js
const utilsA = require("@/utils/siasn-utils");
const utilsB = require("@/utils/siasn-proxy.utils");
const mapping = require("@/utils/config/fetcher-mapping");

class SiasnServiceError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "SiasnServiceError";
    this.method = details.method;
    this.primaryError = details.primaryError;
    this.fallbackError = details.fallbackError;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      method: this.method,
      primary: this.primaryError?.message,
      fallback: this.fallbackError?.message,
      timestamp: this.timestamp,
    };
  }
}

class SiasnService {
  constructor(options = {}) {
    this.timeout = options.timeout || 25000;
  }

  withFetchers(fetcherA, fetcherB) {
    return {
      call: (methodName, ...args) =>
        this._call(fetcherA, fetcherB, methodName, ...args),
    };
  }

  async _call(fetcherA, fetcherB, methodName, ...args) {
    const map = mapping[methodName];

    if (!map) {
      throw new SiasnServiceError(`Method "${methodName}" tidak terdaftar`, {
        method: methodName,
      });
    }

    let primaryError = null;
    let fallbackError = null;

    // Coba A (primary)
    if (fetcherA) {
      try {
        const fnA = utilsA[map.A];

        if (typeof fnA !== "function") {
          throw new Error(`"${map.A}" tidak ada di utilsA`);
        }

        const result = await this._withTimeout(fnA(fetcherA, ...args));

        if (result === null || result === undefined) {
          throw new Error("Response A null/undefined");
        }

        return result;
      } catch (error) {
        primaryError = error;
      }
    }

    // Coba B (fallback)
    if (fetcherB) {
      try {
        const fnB = utilsB[map.B];

        if (typeof fnB !== "function") {
          throw new Error(`"${map.B}" tidak ada di utilsB`);
        }

        const result = await this._withTimeout(fnB(fetcherB, ...args));

        if (result === null || result === undefined) {
          throw new Error("Response B null/undefined");
        }

        return result;
      } catch (error) {
        fallbackError = error;
      }
    }

    throw new SiasnServiceError(`Gagal mengambil data: ${methodName}`, {
      method: methodName,
      primaryError,
      fallbackError,
    });
  }

  _withTimeout(promise) {
    let timeoutId = null;
    let settled = false;

    const cleanup = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        if (!settled) {
          settled = true;
          reject(new Error("Request timeout"));
        }
      }, this.timeout);
    });

    return Promise.race([promise, timeoutPromise])
      .then((result) => {
        settled = true;
        cleanup();
        return result;
      })
      .catch((error) => {
        settled = true;
        cleanup();
        throw error;
      });
  }
}

module.exports = new SiasnService();

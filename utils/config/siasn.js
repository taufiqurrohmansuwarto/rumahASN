// services/SiasnService.js
const utilsA = require("@/utils/siasn-utils"); // { getDataUtama, getRiwayatJabatan, ... }
const utilsB = require("@/utils/siasn-proxy.utils"); // { dataUtama, riwayatJabatan, ... }
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
    this.debug = options.debug || true; // enable debug by default
  }

  log(...args) {
    if (this.debug) {
      console.log("[SiasnService]", new Date().toISOString(), ...args);
    }
  }

  withFetchers(fetcherA, fetcherB) {
    this.log("withFetchers called");
    this.log("fetcherA exists:", !!fetcherA);
    this.log("fetcherB exists:", !!fetcherB);

    if (!fetcherA && !fetcherB) {
      this.log("WARNING: Kedua fetcher null/undefined!");
    }

    return {
      call: (methodName, ...args) =>
        this._call(fetcherA, fetcherB, methodName, ...args),
    };
  }

  async _call(fetcherA, fetcherB, methodName, ...args) {
    this.log("========== START _call ==========");
    this.log("methodName:", methodName);
    this.log("args:", JSON.stringify(args));

    // Cek mapping
    const map = mapping[methodName];
    this.log("mapping found:", !!map);

    if (!map) {
      this.log("ERROR: Method tidak ada di mapping");
      throw new SiasnServiceError(`Method "${methodName}" tidak terdaftar`, {
        method: methodName,
      });
    }

    this.log("map.A:", map.A);
    this.log("map.B:", map.B);
    this.log("utilsA[map.A] type:", typeof utilsA[map.A]);
    this.log("utilsB[map.B] type:", typeof utilsB[map.B]);

    let primaryError = null;
    let fallbackError = null;

    // ============ Coba A ============
    this.log("---------- TRY A ----------");
    if (fetcherA) {
      this.log("fetcherA ada, mencoba...");
      try {
        const fnA = utilsA[map.A];

        if (typeof fnA !== "function") {
          this.log("ERROR: fnA bukan function");
          throw new Error(`"${map.A}" tidak ada di utilsA`);
        }

        this.log("Calling fnA...");
        const resultPromise = fnA(fetcherA, ...args);
        this.log("fnA returned promise:", !!resultPromise?.then);

        const result = await this._withTimeout(resultPromise);
        this.log("A SUCCESS, result type:", typeof result);
        this.log(
          "A result preview:",
          JSON.stringify(result)?.substring(0, 200)
        );

        // Validasi result
        if (result === null || result === undefined) {
          this.log("WARNING: A returned null/undefined, treating as error");
          throw new Error("Response A null/undefined");
        }

        this.log("========== END _call (via A) ==========");
        return result;
      } catch (error) {
        this.log("A FAILED:", error.message);
        this.log("A error stack:", error.stack);
        primaryError = error;
      }
    } else {
      this.log("fetcherA null/undefined, skip");
    }

    // ============ Coba B ============
    this.log("---------- TRY B (fallback) ----------");
    if (fetcherB) {
      this.log("fetcherB ada, mencoba...");
      try {
        const fnB = utilsB[map.B];

        if (typeof fnB !== "function") {
          this.log("ERROR: fnB bukan function");
          throw new Error(`"${map.B}" tidak ada di utilsB`);
        }

        this.log("Calling fnB...");
        const resultPromise = fnB(fetcherB, ...args);
        this.log("fnB returned promise:", !!resultPromise?.then);

        const result = await this._withTimeout(resultPromise);
        this.log("B SUCCESS, result type:", typeof result);
        this.log(
          "B result preview:",
          JSON.stringify(result)?.substring(0, 200)
        );

        // Validasi result
        if (result === null || result === undefined) {
          this.log("WARNING: B returned null/undefined, treating as error");
          throw new Error("Response B null/undefined");
        }

        this.log("========== END _call (via B fallback) ==========");
        return result;
      } catch (error) {
        this.log("B FAILED:", error.message);
        this.log("B error stack:", error.stack);
        fallbackError = error;
      }
    } else {
      this.log("fetcherB null/undefined, skip");
    }

    // ============ Kedua Gagal ============
    this.log("---------- BOTH FAILED ----------");
    this.log("primaryError:", primaryError?.message);
    this.log("fallbackError:", fallbackError?.message);
    this.log("========== END _call (ERROR) ==========");

    throw new SiasnServiceError(`Gagal mengambil data: ${methodName}`, {
      method: methodName,
      primaryError,
      fallbackError,
    });
  }

  async _withTimeout(promise) {
    this.log("_withTimeout started, timeout:", this.timeout);

    return Promise.race([
      promise,
      new Promise((_, reject) => {
        setTimeout(() => {
          this.log("TIMEOUT reached!");
          reject(new Error("Request timeout"));
        }, this.timeout);
      }),
    ]);
  }
}

module.exports = new SiasnService({ debug: true });

// security-checker.js

const PII_FIELDS = [
  "nama",
  "nip",
  "nik",
  "email",
  "phone",
  "alamat",
  "tanggal_lahir",
  "tempat_lahir",
  "foto",
  "ttd",
  "nama_keluarga",
  "nik_keluarga",
];

// Pure recursive function: Find PII in object
const findPIIFields = (obj, path = "", found = []) => {
  if (!obj || typeof obj !== "object") return found;

  Object.entries(obj).forEach(([key, value]) => {
    const currentPath = path ? `${path}.${key}` : key;

    if (PII_FIELDS.includes(key.toLowerCase())) {
      found.push(currentPath);
    }

    if (typeof value === "object" && value !== null) {
      findPIIFields(value, currentPath, found);
    }
  });

  return found;
};

// Pure function: Check if data contains PII
const containsPII = (data) => {
  const piiFields = findPIIFields(data);

  return {
    hasPII: piiFields.length > 0,
    piiFields: piiFields,
  };
};

// Pure function: Validate data for AI
const validateForAI = (data) => {
  const check = containsPII(data);

  if (check.hasPII) {
    throw new Error(
      `Cannot send to AI: PII detected in fields: ${check.piiFields.join(", ")}`
    );
  }

  return true;
};

// Pure function: Check if array of data is safe
const isSafeForAI = (dataArray) => {
  if (!Array.isArray(dataArray)) {
    dataArray = [dataArray];
  }

  return dataArray.every((item) => {
    try {
      validateForAI(item);
      return true;
    } catch {
      return false;
    }
  });
};

module.exports = {
  containsPII,
  validateForAI,
  isSafeForAI,
  PII_FIELDS,
};

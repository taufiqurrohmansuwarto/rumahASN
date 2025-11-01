// masking.js

// Pure function: Mask nama
const maskName = (name) => {
  if (!name) return null;

  return name
    .split(" ")
    .map((word) => word[0] + "*".repeat(Math.max(word.length - 1, 3)))
    .join(" ");
};

// Pure function: Mask NIP
const maskNIP = (nip) => {
  if (!nip || nip.length < 10) return null;

  const visible = 4;
  const masked = "*".repeat(nip.length - visible * 2);
  return (
    nip.substring(0, visible) + masked + nip.substring(nip.length - visible)
  );
};

// Pure function: Mask NIK
const maskNIK = (nik) => {
  if (!nik || nik.length !== 16) return null;

  return nik.substring(0, 4) + "*".repeat(8) + nik.substring(12);
};

// Pure function: Mask email
const maskEmail = (email) => {
  if (!email || !email.includes("@")) return null;

  const [local, domain] = email.split("@");
  const maskedLocal = local[0] + "*".repeat(Math.max(local.length - 1, 3));
  return maskedLocal + "@" + domain;
};

// Pure function: Mask phone
const maskPhone = (phone) => {
  if (!phone || phone.length < 8) return null;

  return (
    phone.substring(0, 4) + "*".repeat(4) + phone.substring(phone.length - 4)
  );
};

// Pure function: Generalize date to year
const generalizeDate = (date) => {
  if (!date) return null;

  const d = new Date(date);
  return d.getFullYear();
};

// Pure function: Generalize age to group
const generalizeAge = (age) => {
  if (age < 25) return "20-24";
  if (age < 30) return "25-29";
  if (age < 35) return "30-34";
  if (age < 40) return "35-39";
  if (age < 45) return "40-44";
  if (age < 50) return "45-49";
  if (age < 55) return "50-54";
  return "55+";
};

module.exports = {
  maskName,
  maskNIP,
  maskNIK,
  maskEmail,
  maskPhone,
  generalizeDate,
  generalizeAge,
};

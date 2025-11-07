/**
 * Format nilai menjadi format currency Rupiah
 * @param {string|number} value - Nilai yang akan diformat
 * @returns {string} Format currency Rupiah
 */
export const formatCurrency = (value) => {
  if (!value) return "Rp 0";
  return `Rp ${parseInt(value).toLocaleString("id-ID")}`;
};

/**
 * Menghitung perubahan gaji dan menentukan warna badge
 * @param {string|number} oldGaji - Gaji lama
 * @param {string|number} newGaji - Gaji baru
 * @returns {object} Object dengan value (selisih) dan color (warna badge)
 */
export const getGajiChange = (oldGaji, newGaji) => {
  if (!oldGaji || !newGaji) return { value: 0, color: "gray" };
  const old = parseInt(oldGaji);
  const newVal = parseInt(newGaji);
  const diff = newVal - old;
  if (diff > 0) return { value: diff, color: "green" };
  if (diff < 0) return { value: Math.abs(diff), color: "red" };
  return { value: 0, color: "gray" };
};


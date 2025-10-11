/**
 * HTML Template Generator for Spesimen Tanda Tangan
 *
 * Generates HTML template that will be converted to PNG by Gotenberg
 */

const dayjs = require('dayjs');
require('dayjs/locale/id');
dayjs.locale('id');

/**
 * Format date to Indonesian format
 * @param {Date} date
 * @returns {String}
 */
const formatDate = (date) => {
  return dayjs(date).format('DD MMMM YYYY');
};

/**
 * Generate specimen HTML template (compact horizontal layout)
 * @param {Object} data - Specimen data
 * @param {String} data.name - Nama lengkap dengan gelar
 * @param {String} data.nip - NIP 18 digit
 * @param {String} data.position - Jabatan
 * @param {String} data.rank - Pangkat
 * @param {String} data.logoBase64 - Logo in base64 (optional)
 * @returns {String} - HTML string
 */
const generateSpecimenHtml = (data) => {
  const { name, nip, position, rank, logoBase64 } = data;

  // Use logo from URL or base64
  const logoSrc = logoBase64
    ? `data:image/png;base64,${logoBase64}`
    : 'https://siasn.bkd.jatimprov.go.id:9000/public/logojatim.png';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Spesimen Tanda Tangan</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      font-family: 'Arial', sans-serif;
      background-color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .container {
      width: 100%;
      height: 100%;
      background: white;
      border: 3px solid #1a1a1a;
      border-radius: 6px;
      padding: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    /* Logo */
    .logo-box {
      width: 60px;
      height: 60px;
      flex-shrink: 0;
      border: 2px solid #1a1a1a;
      border-radius: 4px;
      padding: 4px;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logo {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    /* Text Content */
    .text-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .label {
      font-size: 8px;
      color: #666;
      line-height: 1.2;
    }

    .position {
      font-size: 8px;
      color: #666;
      line-height: 1.2;
      font-weight: 500;
    }

    .info-section {
      margin-top: 6px;
    }

    .name {
      font-size: 12px;
      font-weight: bold;
      color: #1a1a1a;
      display: block;
      margin-bottom: 2px;
    }

    .rank {
      font-size: 9px;
      color: #1a1a1a;
      display: block;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Logo -->
    <div class="logo-box">
      <img src="${logoSrc}" alt="Logo" class="logo">
    </div>

    <!-- Text Content -->
    <div class="text-content">
      <div class="label">Ditandatangani secara elektronik oleh :</div>
      <div class="position">${position || 'NAMA JABATAN'}</div>

      <div class="info-section">
        <span class="name">${name || 'NAMA DAN GELAR'}</span>
        <span class="rank">${rank || 'Pangkat'}</span>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
};

/**
 * Validate specimen data
 * @param {Object} data
 * @returns {Object} - { valid: boolean, errors: array }
 */
const validateSpecimenData = (data) => {
  const errors = [];

  if (!data.name || data.name.trim() === '') {
    errors.push('Nama wajib diisi');
  }

  if (!data.nip || data.nip.trim() === '') {
    errors.push('NIP wajib diisi');
  } else if (!/^\d{18}$/.test(data.nip)) {
    errors.push('NIP harus 18 digit angka');
  }

  if (!data.position || data.position.trim() === '') {
    errors.push('Jabatan wajib diisi');
  }

  if (!data.rank || data.rank.trim() === '') {
    errors.push('Pangkat wajib diisi');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

module.exports = {
  generateSpecimenHtml,
  validateSpecimenData,
  formatDate
};

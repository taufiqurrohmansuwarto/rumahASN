import { Alert } from "antd";
import React from "react";

function AlertJabatan() {
  return (
    <Alert
      type="info"
      showIcon
      message="Perhatian"
      description="Pastikan data antara SIASN merupakan data riwayat jabatan terakhir di SIMASTER, jika tidak sesuai silahkan tambahkan"
    />
  );
}

export default AlertJabatan;

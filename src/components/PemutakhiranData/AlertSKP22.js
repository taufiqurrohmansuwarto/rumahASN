import { Alert } from "antd";
import React from "react";

function AlertSKP22() {
  return (
    <Alert
      type="info"
      showIcon
      message="Perhatian"
      description="Jika data SKP 2022 di SIASN tidak ada silahkan tambahkan dengan menggunaka data pada SIMASTER sebagai referensi"
    />
  );
}

export default AlertSKP22;

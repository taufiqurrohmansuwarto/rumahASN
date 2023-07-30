import { Alert } from "antd";
import React from "react";

function AlertAngkaKredit() {
  return (
    <Alert
      type="info"
      showIcon
      message="Perhatian"
      description="Pastikan angka kredit / PAK di SIASN sama dengan SIMASTER. Jika anda Jabatan Pelaksana tidak usah dientri!"
    />
  );
}

export default AlertAngkaKredit;

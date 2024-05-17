import React from "react";
import { Table } from "antd";

function TableUsulan({ data, isLoading }) {
  const columns = [
    { title: "Nama", dataIndex: "nama" },
    { title: "NIP", dataIndex: "nip" },
    { title: "Status Usulan", dataIndex: "status_usulan" },
    { title: "Tipe", dataIndex: "type" },
    { title: "Tanggal Usulan", dataIndex: "tanggal_usulan" },
    { title: "Jenis Layanan", dataIndex: "jenis_layanan_nama" },
    { title: "Keterangan", dataIndex: "keterangan" },
  ];

  return (
    <Table
      rowKey={(row) => row?.id}
      pagination={false}
      columns={columns}
      dataSource={data}
      loading={isLoading}
    />
  );
}

export default TableUsulan;

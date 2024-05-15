import { usulanKenaikanPangkat } from "@/services/usulan-siasn.services";
import { useQuery } from "@tanstack/react-query";
import { Table } from "antd";
import React from "react";

function RwUsulanKenaikanPangkat() {
  const { data, isLoading } = useQuery(
    ["rw-usulan-kp-personal"],
    () => usulanKenaikanPangkat(),
    {}
  );

  const columns = [
    { title: "Nama", dataIndex: "nama" },
    { title: "NIP", dataIndex: "nip" },
    { title: "Status Usulan", dataIndex: "status_usulan" },
    { title: "Tipe", dataIndex: "type" },
    { title: "Tanggal Usulan", dataIndex: "tanggal_usulan" },
    { title: "Jenis Layanan", dataIndex: "jenis_layanan_nama" },
  ];

  return (
    <div>
      <Table
        pagination={false}
        columns={columns}
        dataSource={data}
        loading={isLoading}
      />
    </div>
  );
}

export default RwUsulanKenaikanPangkat;

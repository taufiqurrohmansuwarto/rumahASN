import { cltnByNip } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { Table, Typography } from "antd";
import React from "react";

function CompareCLTNByNip({ nip }) {
  const { data, isLoading } = useQuery(["cltn", nip], () => cltnByNip(nip), {});

  const columns = [
    {
      title: "Nomer SK",
      dataIndex: "skNomor",
    },
    {
      title: "Tanggal SK",
      dataIndex: "skTanggal",
    },
    {
      title: "Tanggal Awal",
      dataIndex: "tanggalAwal",
    },
    {
      title: "Tanggal Akhir",
      dataIndex: "tanggalAkhir",
    },
    {
      title: "Tanggal Aktif",
      dataIndex: "tanggalAktif",
    },
    {
      title: "Nomer Letter BKN",
      dataIndex: "nomorLetterBkn",
    },
  ];

  return (
    <div>
      <Table
        title={() => <Typography.Title level={5}>SIASN CLTN</Typography.Title>}
        columns={columns}
        pagination={false}
        dataSource={data}
        loading={isLoading}
      />
    </div>
  );
}

export default CompareCLTNByNip;

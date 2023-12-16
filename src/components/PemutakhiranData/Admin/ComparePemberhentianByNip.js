import { dataRiwayatPemberhentian } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { Card, Table } from "antd";
import React from "react";

function ComparePemberhentianByNip({ nip }) {
  const { data, isLoading } = useQuery(
    ["rw-pemberhentian", nip],
    () => dataRiwayatPemberhentian(nip),
    {
      enabled: !!nip,
    }
  );

  const columns = [
    {
      title: "Jenis Henti",
      dataIndex: "jenisHenti",
    },
    {
      title: "Kedudukan Hukum PNS",
      dataIndex: "kedudukanHukumPns",
    },
    {
      title: "Nomor SK",
      dataIndex: "skNomor",
    },
    {
      title: "Tanggal SK",
      dataIndex: "skTanggal",
    },
    {
      title: "Asal Nama",
      dataIndex: "asalNama",
    },
  ];

  return (
    <Card title="Riwayat Pemberhentian" loading={isLoading}>
      <Table
        pagination={false}
        columns={columns}
        rowKey={(row) => row?.id}
        dataSource={data}
      />
    </Card>
  );
}

export default ComparePemberhentianByNip;

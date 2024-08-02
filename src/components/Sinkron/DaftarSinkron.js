import { refSinkronisasi } from "@/services/sync.services";
import { useQuery } from "@tanstack/react-query";
import { Table } from "antd";
import React from "react";
import dayjs from "dayjs";

function DaftarSinkron() {
  const { data, isLoading } = useQuery(
    ["daftar-sinkron"],
    () => refSinkronisasi(),
    {}
  );

  const columns = [
    {
      title: "Aplikasi",
      dataIndex: "aplikasi",
    },
    {
      title: "Layanan",
      dataIndex: "layanan",
    },
    {
      title: "Update Terakhir",
      key: "updated_at",
      render: (_, record) => {
        return dayjs(record.updated_at).format("DD-MM-YYYY HH:mm:ss");
      },
    },
  ];

  return (
    <div>
      <Table
        pagination={false}
        dataSource={data}
        loading={isLoading}
        rowKey={(row) => row?.id}
        columns={columns}
      />
    </div>
  );
}

export default DaftarSinkron;

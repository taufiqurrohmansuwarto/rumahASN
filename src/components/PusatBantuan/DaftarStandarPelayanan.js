import { getStandarLayanan } from "@/services/layanan.services";
import { useQuery } from "@tanstack/react-query";
import { Table, Space, Button, Divider } from "antd";
import React from "react";
import CreateStandarLayanan from "./CreateStandarLayanan";
import { useRouter } from "next/router";

function DaftarStandarPelayanan() {
  const router = useRouter();

  const { data, isLoading } = useQuery(
    ["standar-pelayanan"],
    () => getStandarLayanan(),
    {}
  );

  const gotoDetail = (row) => {
    router.push(`/apps-managements/standar-pelayanan/${row?.id}/detail`);
  };

  const columns = [
    {
      title: "Nama Layanan",
      dataIndex: "nama_pelayanan",
    },
    {
      title: "Status",
      dataIndex: "is_active",
      render: (row) => (row ? "Aktif" : "Tidak Aktif"),
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (row) => (
        <Space>
          <Button type="link" onClick={() => gotoDetail(row)}>
            Detail
          </Button>
          <Divider type="vertical" />
          <Button type="link">Hapus</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {JSON.stringify(data)}
      <CreateStandarLayanan />
      <Table
        columns={columns}
        dataSource={data?.data}
        loading={isLoading}
        pagination={{
          total: data?.total,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
          pageSize: data?.limit,
          current: data?.page,
        }}
      />
    </div>
  );
}

export default DaftarStandarPelayanan;

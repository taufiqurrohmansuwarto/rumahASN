import { pegawaiMaster } from "@/services/sync.services";
import { useQuery } from "@tanstack/react-query";
import { Table } from "antd";
import React, { useState } from "react";

function PegawaiMaster() {
  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["pegawai-master", query],
    queryFn: () => pegawaiMaster(query),
    enabled: !!query.page && !!query.limit,
    keepPreviousData: true,
  });

  const columns = [
    {
      title: "Nama",
      dataIndex: "nama_master",
    },
    {
      title: "Jabatan",
      dataIndex: "jabatan_asn",
    },
    {
      title: "Perangkat Daerah",
      dataIndex: "opd_master",
    },
  ];

  return (
    <div>
      <Table
        pagination={{
          onChange: (page, limit) => setQuery({ page, limit }),
          showSizeChanger: false,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
          total: data?.total,
          current: query.page,
          pageSize: query.limit,
        }}
        columns={columns}
        dataSource={data?.data}
        loading={isLoading}
      />
    </div>
  );
}

export default PegawaiMaster;

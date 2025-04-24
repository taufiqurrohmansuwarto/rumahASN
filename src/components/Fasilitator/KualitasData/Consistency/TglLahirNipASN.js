import { consistency2 } from "@/services/dimensi-consistency.services";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Table } from "antd";
import { useRouter } from "next/router";

function TglLahirNipASN() {
  const router = useRouter();

  const [query, setQuery] = useState({
    page: router?.query?.page || 1,
    limit: router?.query?.limit || 10,
  });

  const handleClick = (nip) => {
    const url = `/rekon/pegawai/${nip}/detail`;
    router.push(url);
  };

  const { data, isLoading } = useQuery(
    ["con2", query],
    () => consistency2(query),
    {
      enabled: !!query,
      keepPreviousData: true,
    }
  );

  const columns = [
    {
      title: "Nama",
      dataIndex: "nama",
    },
    {
      title: "NIP",
      dataIndex: "nip_baru",
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (_, record) => (
        <a onClick={() => handleClick(record.nip_master)}>Detail</a>
      ),
    },
  ];

  const handleChange = (page, pageSize) => {
    setQuery({ ...query, page, limit: pageSize });
    router.push({
      pathname: router.pathname,
      query: { ...query, page, limit: pageSize },
    });
  };

  return (
    <div>
      {JSON.stringify(data)}
      <Table
        rowKey={(row) => row?.id}
        pagination={{
          total: data?.total,
          pageSize: query?.limit,
          current: query?.page || 1,
          onChange: handleChange,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
        }}
        columns={columns}
        dataSource={data?.data}
        loading={isLoading}
      />
    </div>
  );
}

export default TglLahirNipASN;

import { consistency4 } from "@/services/dimensi-consistency.services";
import { useQuery } from "@tanstack/react-query";
import { Table } from "antd";
import { useRouter } from "next/router";
import { useState } from "react";

function TahunPengangkatanPPPK() {
  const router = useRouter();

  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
  });

  const handleClick = (nip) => {
    const url = `/rekon/pegawai/${nip}/detail`;
    router.push(url);
  };

  const { data, isLoading } = useQuery(
    ["tahun-pengangkatan-pppk", query],
    () => consistency4(query),
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
    <Table
      columns={columns}
      dataSource={data?.data}
      loading={isLoading}
      pagination={{
        total: data?.total,
        pageSize: query?.limit,
        current: query?.page,
        onChange: handleChange,
      }}
    />
  );
}

export default TahunPengangkatanPPPK;

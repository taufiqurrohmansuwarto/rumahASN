import { consistency3 } from "@/services/dimensi-consistency.services";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter } from "next/router";
import { Table } from "antd";

function JenisKelaminNIPASN() {
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
    ["jenis-kelamin-nip-asn", query],
    () => consistency3(query),
    {
      enabled: !!query,
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

export default JenisKelaminNIPASN;

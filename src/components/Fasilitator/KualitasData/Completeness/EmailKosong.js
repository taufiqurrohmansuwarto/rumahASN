import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { emailKosong } from "@/services/dimensi-completeness.services";
import { useState } from "react";
import { Table, Button } from "antd";

const EmailKosong = () => {
  const router = useRouter();
  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
  });

  const { data, isLoading } = useQuery(
    ["email-kosong", query],
    () => emailKosong(query),
    {
      enabled: !!query,
      keepPreviousData: true,
    }
  );

  const columns = [
    {
      title: "NIP",
      dataIndex: "nip_master",
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (_, record) => (
        <Button type="link" onClick={() => handleClick(record.nip_master)}>
          Lihat
        </Button>
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

  const handleClick = (nip) => {
    const url = `/rekon/pegawai/${nip}/detail`;
    router.push(url);
  };

  return (
    <Table
      pagination={{
        total: data?.total,
        pageSize: query?.limit,
        current: router?.query?.page || 1,
        onChange: handleChange,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} items`,
      }}
      loading={isLoading}
      columns={columns}
      dataSource={data?.data}
    />
  );
};

export default EmailKosong;

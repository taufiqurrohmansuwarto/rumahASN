import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { tmtPnsKosong } from "@/services/dimensi-completeness.services";
import { useState } from "react";
import { Table, Button } from "antd";

const TmtPnsKosong = () => {
  const router = useRouter();
  const [query, setQuery] = useState({
    page: router?.query?.page || 1,
    limit: router?.query?.limit || 10,
  });

  const { data, isLoading } = useQuery(
    ["tmt-pns-kosong", query],
    () => tmtPnsKosong(query),
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
        current: query?.page,
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

export default TmtPnsKosong;

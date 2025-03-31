import { getWebinarSeriesSigner } from "@/services/documents.services";
import { EditOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Table } from "antd";
import { useRouter } from "next/router";
import { useState } from "react";

function WebinarSigner() {
  const router = useRouter();
  const [query, setQuery] = useState({
    page: router?.query?.page || 1,
    limit: router?.query?.limit || 10,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["webinar-series-signer", query],
    queryFn: () => getWebinarSeriesSigner(query),
    keepPreviousData: true,
  });

  const columns = [
    {
      title: "Judul",
      dataIndex: "title",
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (_, row) => {
        return <Button icon={<EditOutlined />}>Tanda Tangan</Button>;
      },
    },
  ];

  const handleChangeTable = (pagination, filters, sorter, extra) => {
    setQuery({
      ...query,
      page: pagination?.current,
    });
    router.push({
      pathname: router?.pathname,
      query: {
        ...router?.query,
        page: pagination?.current,
      },
    });
  };

  return (
    <Card title="Penanda Tangan Webinar">
      <Table
        loading={isLoading}
        dataSource={data?.results}
        columns={columns}
        pagination={{
          total: data?.total,
          current: query?.page,
          pageSize: query?.limit,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
        }}
        onChange={handleChangeTable}
      />
    </Card>
  );
}

export default WebinarSigner;

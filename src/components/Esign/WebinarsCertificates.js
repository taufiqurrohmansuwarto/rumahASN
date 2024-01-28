import { getWebinars } from "@/services/esign-signer.services";
import { useQuery } from "@tanstack/react-query";
import { Table, Typography } from "antd";
import Link from "next/link";
import React, { useState } from "react";

function WebinarsCertificates() {
  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
  });

  const { data, isLoading } = useQuery(
    ["webinars-certificates", query],
    () => getWebinars(query),
    {
      keepPreviousData: true,
      enabled: !!query,
    }
  );

  const columns = [
    {
      title: "Nama Webinar",
      dataIndex: "title",
    },
    {
      title: "Status",
      dataIndex: "status",
    },
    {
      title: "Tipe TTE",
      dataIndex: "type_sign",
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (text, record) => (
        <Link href={`/tte/certificates/${text?.id}/detail`}>
          <Typography.Link>Detail</Typography.Link>
        </Link>
      ),
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        loading={isLoading}
        pagination={{
          total: data?.pagination?.total,
          showSizeChanger: false,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
          current: data?.pagination?.page,
          pageSize: data?.pagination?.limit,
          onChange: (page, limit) => {
            setQuery({
              ...query,
              page,
              limit,
            });
          },
        }}
        dataSource={data?.data}
        rowKey={(row) => row?.id}
      />
    </>
  );
}

export default WebinarsCertificates;

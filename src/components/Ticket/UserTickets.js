import { getUsersTickets } from "@/services/index";
import { useQuery } from "@tanstack/react-query";
import { Card, Table } from "antd";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.locale("id");
dayjs.extend(relativeTime);

function UserTickets() {
  const router = useRouter();

  const [query, setQuery] = useState({
    id: router?.query?.id,
    query: {
      limit: 10,
      page: 1,
    },
  });

  const { data: tickets, isLoading } = useQuery(
    ["users-tickets", query],
    () => getUsersTickets(query),
    {
      enabled: !!query,
    }
  );

  const columns = [
    {
      title: "Judul",
      key: "title",
      render: (_, record) => {
        return (
          <Link href={`/customers-tickets/${record?.id}`}>{record?.title}</Link>
        );
      },
    },
    {
      title: "Tanggal",
      key: "created_at",
      render: (_, record) => {
        return dayjs(record?.created_at).format("DD MMM YYYY HH:mm");
      },
    },
  ];

  return (
    <Card title="Daftar Pertanyaan">
      <Table
        loading={isLoading}
        pagination={{
          pageSize: query?.query?.limit,
          current: query?.query?.page,
          onChange: (page, pageSize) => {
            setQuery({
              ...query,
              query: {
                ...query?.query,
                page,
              },
            });
          },
        }}
        columns={columns}
        dataSource={tickets?.result}
        rowKey={(row) => row?.id}
      />
    </Card>
  );
}

export default UserTickets;

import { useQuery } from "@tanstack/react-query";
import { Avatar, Card, Input, Space, Table, Tag, Tooltip } from "antd";
import Link from "next/link";
import { useState } from "react";
import { getAllTickets } from "../../services/agents.services";
import { colorTag, formatDate } from "../../utils";
import PageContainer from "./PageContainer";

const AgentsTickets = ({ status = "SEMUA", title = "SEMUA" }) => {
  const columns = [
    {
      title: "Oleh",
      key: "oleh",
      render: (_, record) => (
        <Tooltip title={record?.customer?.username}>
          <Avatar src={record?.customer?.image} />
        </Tooltip>
      ),
    },
    {
      title: "Judul",
      key: "title",
      dataIndex: "title",
    },
    {
      title: "Nomer Tiket",
      key: "ticket_number",
      render: (_, row) => <Tag color="black">{row?.ticket_number}</Tag>,
    },
    {
      title: "Tgl. dibuat",
      key: "created_at",
      render: (_, record) => {
        return formatDate(record.created_at);
      },
    },
    {
      title: "Tgl. update",
      key: "updated_at",
      render: (_, record) => {
        return formatDate(record.updated_at);
      },
    },
    {
      title: "Status",
      key: "status_code",
      render: (_, record) => {
        return (
          <Tag color={colorTag(record?.status_code)}>{record?.status_code}</Tag>
        );
      },
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (_, record) => {
        return (
          <Space>
            <Link href={`/agent/tickets/${record?.id}/detail`}>
              <a>Detail</a>
            </Link>
          </Space>
        );
      },
    },
  ];
  const [query, setQuery] = useState({
    page: 1,
    limit: 50,
    status,
  });

  const { data, isLoading } = useQuery(
    ["tickets-agents", query],
    () => getAllTickets(query),
    {
      enabled: !!query,
    }
  );

  return (
    <PageContainer title="Ticket" subTitle="Agent">
      <Card title={`Daftar ${title} tiket`}>
        <Table
          title={() => {
            return (
              <Input.Search
                onChange={(e) => {
                  setQuery({
                    ...query,
                    search: e.target.value,
                  });
                }}
                style={{ width: 300 }}
                placeholder="Cari"
              />
            );
          }}
          rowKey={(row) => row?.id}
          loading={isLoading}
          dataSource={data?.data}
          columns={columns}
          pagination={{
            total: data?.total,
            current: query.page,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
            onChange: (page) => {
              // pagination
              console.log(page);
            },
          }}
        />
      </Card>
    </PageContainer>
  );
};

export default AgentsTickets;

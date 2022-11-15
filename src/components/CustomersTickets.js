import { PlusOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Input, Space, Table, Tag, Tooltip } from "antd";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { getAllTickets } from "../../services/users.services";
import { colorTag, formatDate } from "../../utils";
import PageContainer from "./PageContainer";

const CustomersTickets = ({ status = "all" }) => {
  const [query, setQuery] = useState({
    page: 1,
    limit: 50,
    status,
  });

  const router = useRouter();
  const { data, isLoading } = useQuery(
    ["user-tickets", query],
    () => getAllTickets(query),
    {
      enabled: !!query,
    }
  );

  const handleSearch = (e) => {
    setQuery({
      ...query,
      page: 1,
      search: e.target.value,
    });
  };

  const columns = [
    {
      title: "Judul",
      key: "title",
      dataIndex: "title",
    },
    {
      title: "Nomer Tiket",
      key: "ticket_number",
      render: (_, record) => <Tag color="black">{record?.ticket_number}</Tag>,
    },
    {
      title: "Tgl. dibuat",
      key: "created_at",
      render: (_, record) => {
        return formatDate(record.created_at);
      },
    },
    {
      title: "Tgl. diupdate",
      key: "created_at",
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
            <Link href={`/tickets/${record?.id}/detail`}>
              <a>Detail</a>
            </Link>
          </Space>
        );
      },
    },
  ];

  const createTicket = () => {
    router.push("/tickets/create");
  };

  return (
    <PageContainer title="Tiket" subTitle="Daftar Tiket">
      <Card title="Customer Ticket">
        <Tooltip title="Buat tiket baru">
          <Button
            icon={<PlusOutlined />}
            type="primary"
            style={{
              marginBottom: 16,
            }}
            onClick={createTicket}
          >
            Tiket
          </Button>
        </Tooltip>
        <Table
          title={() => (
            <Input.Search style={{ width: 300 }} onChange={handleSearch} />
          )}
          pagination={{
            total: data?.total,
            defaultCurrent: query?.page,
            defaultPageSize: 50,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} dari ${total} tiket`,
            onChange: (page, limit) => {
              setQuery({
                ...query,
                page,
                limit,
              });
            },
          }}
          columns={columns}
          rowKey={(row) => row?.id}
          loading={isLoading}
          dataSource={data?.results}
        />
      </Card>
    </PageContainer>
  );
};

export default CustomersTickets;

import { PlusOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import {
  Breadcrumb,
  Button,
  Card,
  Input,
  Space,
  Table,
  Tag,
  Tooltip,
} from "antd";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { getAllTickets } from "../../services/users.services";
import { colorTag, formatDate } from "../../utils";
import PageContainer from "./PageContainer";

const CustomersTickets = ({ status = "all", title = "Semua Tiket" }) => {
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
      keepPreviousData: true,
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
      title: "Judul No. Ticket",
      key: "judul_no_ticket",
      render: (record) => {
        return (
          <>
            {record?.title}
            <br />
            <Tag color="black">{record?.ticket_number}</Tag>
          </>
        );
      },
      responsive: ["xs"],
    },
    {
      title: "Judul",
      key: "title",
      dataIndex: "title",
      responsive: ["sm"],
    },
    {
      title: "Nomer Pertanyaan",
      key: "ticket_number",
      render: (_, record) => <Tag color="black">{record?.ticket_number}</Tag>,
      responsive: ["sm"],
    },
    {
      title: "Tgl. dibuat",
      key: "created_at",
      render: (_, record) => {
        return formatDate(record.created_at);
      },
      responsive: ["sm"],
    },
    {
      title: "Tgl. diupdate",
      key: "created_at",
      render: (_, record) => {
        return formatDate(record.updated_at);
      },
      responsive: ["sm"],
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
            <Link href={`/tickets/${record?.id}/detail`}>Detail</Link>
          </Space>
        );
      },
    },
  ];

  const createTicket = () => {
    router.push("/tickets/create");
  };

  return (
    <PageContainer
      title="Pertanyaan"
      subTitle={title}
      breadcrumbRender={() => (
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link href="/feeds">Beranda</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Pertanyaan</Breadcrumb.Item>
        </Breadcrumb>
      )}
    >
      <Card>
        <Tooltip title="Buat pertanyaan baru">
          <Button
            icon={<PlusOutlined />}
            type="primary"
            style={{
              marginBottom: 16,
            }}
            onClick={createTicket}
          >
            Pertanyaan
          </Button>
        </Tooltip>
        <Table
          title={() => (
            <Input.Search style={{ width: 300 }} onChange={handleSearch} />
          )}
          pagination={{
            total: data?.total,
            position: ["bottomRight", "topRight"],
            defaultCurrent: query?.page,
            defaultPageSize: 50,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} dari ${total} pertanyaan`,
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

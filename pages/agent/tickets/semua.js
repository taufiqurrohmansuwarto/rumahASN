import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Table, Card, Button, Modal, message, Space, Tag } from "antd";
import Link from "next/link";
import { useState } from "react";
import {
  getAllTickets,
  kerjakanTicket,
} from "../../../services/agents.services";
import AgentLayout from "../../../src/components/AgentLayout";
import PageContainer from "../../../src/components/PageContainer";
import { colorTag, formatDate } from "../../../utils";

const Tombol = ({ record }) => {
  const queryClient = useQueryClient();

  const { mutateAsync: kerjakan, isLoading } = useMutation(
    (id) => kerjakanTicket(id),
    {
      onSettled: () => {
        queryClient.invalidateQueries(["tickets-agents"]);
      },
      onSuccess: () => {
        message.success("Berhasil kerjakan ticket");
      },
    }
  );

  const handleKerjakan = () => {
    Modal.confirm({
      title: "Kerjakan Ticket",
      content: "Apakah anda yakin ingin mengerjakan ticket ini?",
      onOk: async () => {
        await kerjakan(record?.id);
      },
    });
  };

  if (record?.status_code === "DIAJUKAN") {
    return <Button onClick={handleKerjakan}>Kerjakan</Button>;
  }
  if (record?.status_code === "DIKERJAKAN") {
    return null;
  }
};

const Tickets = () => {
  const columns = [
    {
      title: "Judul",
      key: "title",
      dataIndex: "title",
    },
    { title: "Deskripsi", key: "content", dataIndex: "content" },
    { title: "Nomer Tiket", key: "ticket_number", dataIndex: "ticket_number" },
    {
      title: "Tanggal dibuat",
      key: "created_at",
      render: (text, record) => {
        return formatDate(record.created_at);
      },
    },
    {
      title: "Tanggal update",
      key: "updated_at",
      render: (text, record) => {
        return formatDate(record.updated_at);
      },
    },
    {
      title: "Status",
      key: "status_code",
      render: (text, record) => {
        return (
          <Tag color={colorTag(record?.status_code)}>{record?.status_code}</Tag>
        );
      },
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (text, record) => {
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
      <Card title="Daftar tiket">
        <Table
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
              setQuery((prev) => ({ ...prev, page }));
            },
          }}
        />
      </Card>
    </PageContainer>
  );
};

Tickets.getLayout = (page) => {
  return <AgentLayout>{page}</AgentLayout>;
};

Tickets.Auth = {
  action: "read",
  subject: "DashboardAgent",
};

export default Tickets;

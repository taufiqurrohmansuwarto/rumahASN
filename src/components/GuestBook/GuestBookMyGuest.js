import { getMyGuest } from "@/services/guests-books.services";
import { SyncOutlined } from "@ant-design/icons";
import { Stack, Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Flex, Space, Table, Tag, Tooltip } from "antd";
import dayjs from "dayjs";

function GuestBookMyGuest() {
  const { data, isLoading, refetch, isRefetching } = useQuery(
    ["guest-book-my-guest"],
    () => getMyGuest(),
    {}
  );

  const columns = [
    {
      title: "Nama",
      key: "name",
      render: (_, text) => {
        return <Text>{text?.guest?.name}</Text>;
      },
    },
    {
      title: "Tanggal Kunjungan",
      key: "visit_date",
      render: (_, text) => {
        return (
          <Text>{dayjs(text?.visit_date).format("DD MMM YYYY HH:mm:ss")}</Text>
        );
      },
    },
    {
      title: "Alasan Kunjungan",
      key: "reason",
      render: (_, text) => {
        return <Text>{text?.reason}</Text>;
      },
    },
    {
      title: "Status Kunjungan",
      key: "status",
      render: (_, text) => {
        return <Tag color="green">Diterima</Tag>;
      },
    },
    {
      title: "Aksi",
      key: "action",
      render: (_, text) => {
        return <a>Detail</a>;
      },
    },
  ];

  return (
    <Card title="Daftar Tamu">
      <Stack>
        <Flex align="baseline" justify="space-between">
          <Text size={16}>Tabel Tamu</Text>
          <Space>
            <Tooltip title="Segarkan">
              <Button
                type="text"
                icon={<SyncOutlined />}
                iconPosition="end"
                onClick={refetch}
                loading={isRefetching}
              />
            </Tooltip>
          </Space>
        </Flex>
        <Table
          dataSource={data?.data}
          pagination={{
            total: data?.total,
            pageSize: data?.limit,
            current: data?.page,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
          }}
          columns={columns}
          loading={isLoading || isRefetching}
          rowKey={(row) => row.id}
        />
      </Stack>
    </Card>
  );
}

export default GuestBookMyGuest;

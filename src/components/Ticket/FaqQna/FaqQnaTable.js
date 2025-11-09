import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  HistoryOutlined,
  QuestionCircleOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { Badge, Group, Stack, Text } from "@mantine/core";
import { Button, Collapse, Dropdown, Table } from "antd";
import ReactMarkdownCustom from "@/components/MarkdownEditor/ReactMarkdownCustom";

const { Panel } = Collapse;

function FaqQnaTable({
  data,
  isLoading,
  isFetching,
  page,
  limit,
  handleChangePage,
  handleOpen,
  handleDelete,
  handleViewHistory,
  handleCreateVersion,
  handleViewDetail,
  handleResync,
}) {
  const columns = [
    {
      title: "FAQ",
      key: "faq_content",
      render: (_, record) => (
        <Stack spacing={8}>
          <Collapse
            ghost
            expandIconPosition="end"
            style={{ background: "transparent" }}
          >
            <Panel
              header={
                <Text size="sm" weight={500} lineClamp={2}>
                  {record.question}
                </Text>
              }
              key="1"
            >
              <div
                style={{
                  padding: "8px 0",
                  fontSize: "13px",
                  color: "#666",
                }}
              >
                <ReactMarkdownCustom>{record.answer}</ReactMarkdownCustom>
              </div>
            </Panel>
          </Collapse>
        </Stack>
      ),
    },
    {
      title: "Info",
      key: "info",
      width: 250,
      render: (_, record) => (
        <Stack spacing={6}>
          <Group spacing={6}>
            <Badge
              size="sm"
              color={record.is_active ? "green" : "gray"}
              variant="dot"
            >
              {record.is_active ? "Aktif" : "Nonaktif"}
            </Badge>
            <Badge size="sm" color="blue" variant="light">
              v{record.version || 1}
            </Badge>
          </Group>

          {record.sub_categories && record.sub_categories.length > 0 && (
            <Group spacing={4}>
              {record.sub_categories.slice(0, 2).map((sc) => (
                <Badge
                  key={sc.id}
                  size="xs"
                  color="violet"
                  variant="outline"
                  style={{ fontSize: 10 }}
                >
                  {sc.name}
                </Badge>
              ))}
              {record.sub_categories.length > 2 && (
                <Badge size="xs" color="gray" variant="outline">
                  +{record.sub_categories.length - 2}
                </Badge>
              )}
            </Group>
          )}

          {record.tags && record.tags.length > 0 && (
            <Group spacing={4}>
              {record.tags.slice(0, 3).map((tag, idx) => (
                <Badge
                  key={idx}
                  size="xs"
                  color="gray"
                  variant="light"
                  style={{ fontSize: 9 }}
                >
                  {tag}
                </Badge>
              ))}
              {record.tags.length > 3 && (
                <Text size="xs" c="dimmed">
                  +{record.tags.length - 3}
                </Text>
              )}
            </Group>
          )}
        </Stack>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      width: 80,
      fixed: "right",
      align: "center",
      render: (_, record) => {
        const menuItems = [
          {
            key: "view",
            icon: <EyeOutlined />,
            label: "Lihat Detail",
            onClick: () => handleViewDetail(record),
          },
          {
            key: "edit",
            icon: <EditOutlined />,
            label: "Edit",
            onClick: () => handleOpen("edit", record),
          },
          {
            key: "version",
            icon: <HistoryOutlined />,
            label: "Buat Versi Baru",
            onClick: () => handleCreateVersion(record),
          },
          {
            key: "history",
            icon: <HistoryOutlined />,
            label: "Lihat History",
            onClick: () => handleViewHistory(record.id),
          },
          {
            key: "resync",
            icon: <SyncOutlined />,
            label: "Resync ke Qdrant",
            onClick: () => handleResync(record.id),
          },
          {
            type: "divider",
          },
          {
            key: "delete",
            icon: <DeleteOutlined />,
            label: "Hapus",
            danger: true,
            onClick: () => handleDelete(record.id),
          },
        ];

        return (
          <Dropdown
            menu={{ items: menuItems }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button size="small">Aksi</Button>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div style={{ marginTop: "16px" }}>
      <Table
        columns={columns}
        dataSource={data?.data || []}
        rowKey="id"
        loading={isLoading || isFetching}
        scroll={{ x: 800 }}
        size="small"
        style={{
          borderRadius: "12px",
          overflow: "hidden",
        }}
        pagination={{
          position: ["bottomRight"],
          total: data?.meta?.total || 0,
          pageSize: parseInt(limit),
          current: parseInt(page),
          showSizeChanger: false,
          onChange: handleChangePage,
          showTotal: (total, range) =>
            `${range[0].toLocaleString("id-ID")}-${range[1].toLocaleString(
              "id-ID"
            )} dari ${total.toLocaleString("id-ID")} records`,
          style: { margin: "16px 0" },
        }}
        locale={{
          emptyText: (
            <div style={{ padding: "60px", textAlign: "center" }}>
              <QuestionCircleOutlined
                style={{
                  fontSize: 64,
                  color: "#d1d5db",
                  marginBottom: 24,
                }}
              />
              <div>
                <Text size="lg" c="dimmed">
                  Tidak ada data FAQ
                </Text>
              </div>
              <div style={{ marginTop: "8px" }}>
                <Text size="sm" c="dimmed">
                  Belum ada FAQ yang ditambahkan
                </Text>
              </div>
            </div>
          ),
        }}
      />
    </div>
  );
}

export default FaqQnaTable;


import { changeStatus, refStatus } from "@/services/index";
import {
  SettingOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DatePicker,
  Form,
  Modal,
  Select,
  message,
  Button,
  Typography,
  Grid,
  Space,
  Card,
} from "antd";
import { useState, useMemo } from "react";

import dayjs from "dayjs";
import "dayjs/locale/id";
dayjs.locale("id");

const { useBreakpoint } = Grid;
const { Text } = Typography;

const StatusModal = ({ open, onCancel, data, ticketId, statusId, ticket }) => {
  const [form] = Form.useForm();
  const screens = useBreakpoint();
  const queryClient = useQueryClient();

  // Memoize responsive config
  const responsiveConfig = useMemo(() => {
    const isMobile = !screens.md;

    return {
      isMobile,
      modalWidth: isMobile ? "95%" : 700,
    };
  }, [screens.md]);

  const { mutate: updateStatus, isLoading } = useMutation(
    (data) => changeStatus(data),
    {
      onSuccess: () => {
        message.success("✅ Berhasil mengubah status tiket");
        queryClient.invalidateQueries(["publish-ticket", ticketId]);
        onCancel();
      },
      onError: () => {
        message.error("❌ Gagal mengubah status tiket");
      },
    }
  );

  const handleSubmit = async () => {
    try {
      const { status, start_work_at, completed_at } =
        await form.validateFields();
      const data = {
        id: ticketId,
        data: {
          status,
          start_work_at,
          completed_at,
        },
      };
      if (!isLoading) {
        updateStatus(data);
      }
    } catch (error) {
      console.log("Validation failed:", error);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <CheckCircleOutlined style={{ color: "#52c41a" }} />
          <span>📋 Ubah Status Tiket</span>
        </div>
      }
      destroyOnClose
      centered
      width={responsiveConfig.modalWidth}
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={isLoading}
      okText="✅ Simpan Status"
      cancelText="❌ Batal"
      okButtonProps={{
        style: {
          background: "#52c41a",
          borderColor: "#52c41a",
          fontWeight: 600,
        },
      }}
      cancelButtonProps={{
        style: {
          fontWeight: 600,
        },
      }}
    >
      <div style={{ padding: "16px 0" }}>
        <Form
          layout="vertical"
          form={form}
          initialValues={{
            status: statusId,
            created_at: dayjs(ticket?.created_at),
            start_work_at: ticket?.start_work_at
              ? dayjs(ticket?.start_work_at)
              : null,
            completed_at: ticket?.completed_at
              ? dayjs(ticket?.completed_at)
              : null,
          }}
        >
          {/* Status Section */}
          <Card size="small" style={{ marginBottom: 16 }}>
            <Space direction="vertical" size={8} style={{ width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircleOutlined style={{ color: "#52c41a" }} />
                <Text strong style={{ color: "#52c41a" }}>
                  📊 Status Tiket
                </Text>
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Pilih status yang sesuai dengan kondisi penanganan tiket saat
                ini
              </Text>
              <Form.Item
                name="status"
                rules={[
                  { required: true, message: "Status tiket wajib dipilih" },
                ]}
                style={{ marginBottom: 0 }}
              >
                <Select
                  showSearch
                  optionFilterProp="name"
                  placeholder="🔍 Pilih status tiket..."
                  size="large"
                  style={{ borderRadius: 8 }}
                  dropdownStyle={{
                    borderRadius: 8,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                >
                  {data?.map((status) => (
                    <Select.Option
                      key={status.name}
                      name={status?.name}
                      value={status.name}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <CheckCircleOutlined
                          style={{ fontSize: 14, color: "#52c41a" }}
                        />
                        <span style={{ fontWeight: 500 }}>{status.name}</span>
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Space>
          </Card>

          {/* Timeline Section */}
          <Card size="small">
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CalendarOutlined style={{ color: "#1890ff" }} />
                <Text strong style={{ color: "#1890ff" }}>
                  📅 Timeline Penanganan
                </Text>
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Kelola waktu pengajuan, mulai dikerjakan, dan penyelesaian tiket
              </Text>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: responsiveConfig.isMobile
                    ? "1fr"
                    : "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 16,
                }}
              >
                <Form.Item
                  name="created_at"
                  label={
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <CalendarOutlined
                        style={{ fontSize: 12, color: "#8c8c8c" }}
                      />
                      <span>📝 Tanggal Diajukan</span>
                    </div>
                  }
                  style={{ marginBottom: 0 }}
                >
                  <DatePicker
                    disabled
                    showTime
                    style={{ width: "100%", borderRadius: 6 }}
                    format="DD/MM/YYYY HH:mm"
                  />
                </Form.Item>

                <Form.Item
                  name="start_work_at"
                  label={
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <ClockCircleOutlined
                        style={{ fontSize: 12, color: "#fa8c16" }}
                      />
                      <span>🚀 Tanggal Dikerjakan</span>
                    </div>
                  }
                  style={{ marginBottom: 0 }}
                >
                  <DatePicker
                    showTime
                    style={{ width: "100%", borderRadius: 6 }}
                    format="DD/MM/YYYY HH:mm"
                    placeholder="Pilih waktu mulai dikerjakan"
                  />
                </Form.Item>

                <Form.Item
                  name="completed_at"
                  label={
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <CheckCircleOutlined
                        style={{ fontSize: 12, color: "#52c41a" }}
                      />
                      <span>✅ Tanggal Selesai</span>
                    </div>
                  }
                  style={{ marginBottom: 0 }}
                >
                  <DatePicker
                    showTime
                    style={{ width: "100%", borderRadius: 6 }}
                    format="DD/MM/YYYY HH:mm"
                    placeholder="Pilih waktu selesai"
                  />
                </Form.Item>
              </div>
            </Space>
          </Card>
        </Form>
      </div>
    </Modal>
  );
};

const ChangeStatus = ({ ticketId, statusId, ticket }) => {
  const screens = useBreakpoint();

  const { data, isloading } = useQuery(["ref-status"], () => refStatus(), {
    refetchOnWindowFocus: false,
  });

  const [open, setOpen] = useState(false);

  // Memoize responsive config
  const responsiveConfig = useMemo(() => {
    const isMobile = !screens.md;

    return {
      isMobile,
    };
  }, [screens.md]);

  const handleShowModal = () => {
    if (isloading) return;
    setOpen(true);
  };

  const handleCancelModal = () => setOpen(false);

  return (
    <div>
      <Button
        type="text"
        icon={<SettingOutlined />}
        onClick={handleShowModal}
        loading={isloading}
        size="small"
        style={{
          color: "#52c41a",
          border: "1px solid #d9f7be",
          background: "#f6ffed",
          borderRadius: 6,
          fontWeight: 500,
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#52c41a";
          e.currentTarget.style.color = "white";
          e.currentTarget.style.borderColor = "#52c41a";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#f6ffed";
          e.currentTarget.style.color = "#52c41a";
          e.currentTarget.style.borderColor = "#d9f7be";
        }}
      >
        {responsiveConfig.isMobile ? "" : "Ubah"}
      </Button>
      <StatusModal
        data={data}
        ticket={ticket}
        ticketId={ticketId}
        statusId={statusId}
        open={open}
        onCancel={handleCancelModal}
      />
    </div>
  );
};

export default ChangeStatus;

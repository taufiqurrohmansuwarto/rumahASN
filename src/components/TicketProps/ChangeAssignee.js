import { SettingOutlined, UserOutlined } from "@ant-design/icons";
import { useState, useMemo } from "react";
import {
  Form,
  Modal,
  Select,
  message,
  Button,
  Avatar,
  Grid,
  Typography,
} from "antd";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { refAgents, changeAssignee } from "@/services/index";

const { useBreakpoint } = Grid;
const { Text } = Typography;

const AssigneeModal = ({ open, onCancel, ticketId, agentId, agents }) => {
  const [form] = Form.useForm();
  const screens = useBreakpoint();
  const queryClient = useQueryClient();

  // Memoize responsive config
  const responsiveConfig = useMemo(() => {
    const isMobile = !screens.md;

    return {
      isMobile,
      modalWidth: isMobile ? "90%" : 480,
    };
  }, [screens.md]);

  const { mutate: updateAssignee, isLoading } = useMutation(
    (data) => changeAssignee(data),
    {
      onSuccess: () => {
        message.success("✅ Berhasil merubah penerima tugas");
        queryClient.invalidateQueries(["publish-ticket", ticketId]);
        onCancel();
      },
      onError: () => {
        message.error("❌ Gagal merubah penerima tugas");
      },
    }
  );

  const handleSubmit = async () => {
    try {
      const { assignee } = await form.validateFields();
      const data = {
        id: ticketId,
        data: {
          assignee,
        },
      };

      if (!isLoading) {
        updateAssignee(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <UserOutlined style={{ color: "#1890ff" }} />
          <span>👤 Pilih Penerima Tugas</span>
        </div>
      }
      centered
      destroyOnClose
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={isLoading}
      width={responsiveConfig.modalWidth}
      okText="✅ Simpan"
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
        <Text type="secondary" style={{ marginBottom: 12, display: "block" }}>
          Pilih agent yang akan menangani ticket ini:
        </Text>
        <Form
          form={form}
          initialValues={{
            assignee: agentId,
          }}
          layout="vertical"
        >
          <Form.Item
            name="assignee"
            rules={[
              { required: true, message: "Silakan pilih penerima tugas" },
            ]}
          >
            <Select
              showSearch
              optionFilterProp="name"
              placeholder="🔍 Cari dan pilih agent..."
              size="large"
              style={{
                borderRadius: 8,
              }}
              dropdownStyle={{
                borderRadius: 8,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
              optionRender={(option) => (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "4px 0",
                  }}
                >
                  <Avatar size={24} icon={<UserOutlined />} />
                  <span>{option.data.name}</span>
                </div>
              )}
            >
              {agents?.map((agent) => (
                <Select.Option
                  key={agent.custom_id}
                  name={agent?.username}
                  value={agent.custom_id}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Avatar size={20} icon={<UserOutlined />} />
                    {agent.username}
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

function ChangeAssignee({ ticketId, agentId }) {
  const screens = useBreakpoint();

  const { data: agents, isLoading: isLoadingAgents } = useQuery(
    ["refs-agents"],
    () => refAgents(),
    {
      refetchOnWindowFocus: false,
    }
  );

  const [open, setOpen] = useState(false);

  const handleShowModal = () => {
    if (isLoadingAgents) return;
    setOpen(true);
  };

  const handleCancelModal = () => setOpen(false);

  // Memoize responsive config
  const responsiveConfig = useMemo(() => {
    const isMobile = !screens.md;

    return {
      isMobile,
      iconSize: isMobile ? 14 : 16,
    };
  }, [screens.md]);

  return (
    <div>
      <Button
        type="text"
        icon={<SettingOutlined />}
        onClick={handleShowModal}
        loading={isLoadingAgents}
        size="small"
        style={{
          color: "#1890ff",
          border: "1px solid #d9f7be",
          background: "#f6ffed",
          borderRadius: 6,
          fontWeight: 500,
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#1890ff";
          e.currentTarget.style.color = "white";
          e.currentTarget.style.borderColor = "#1890ff";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#f6ffed";
          e.currentTarget.style.color = "#1890ff";
          e.currentTarget.style.borderColor = "#d9f7be";
        }}
      >
        {responsiveConfig.isMobile ? "" : "Ubah"}
      </Button>
      <AssigneeModal
        ticketId={ticketId}
        agentId={agentId}
        agents={agents}
        open={open}
        onCancel={handleCancelModal}
      />
    </div>
  );
}

export default ChangeAssignee;

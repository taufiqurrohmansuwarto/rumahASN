import { SettingOutlined } from "@ant-design/icons";
import { useState } from "react";
import { Form, Modal, Select } from "antd";
import { useQuery } from "@tanstack/react-query";
import { refAgents } from "@/services/index";

const AssigneeModal = ({ open, onCancel, onOk, agents }) => {
  const [form] = Form.useForm();

  return (
    <Modal
      title="Pilih Penerima Tugas"
      centered
      destroyOnClose
      open={open}
      onCancel={onCancel}
      onOk={onOk}
    >
      <Form form={form}>
        <Form.Item>
          <Select>
            {agents?.map((agent) => (
              <Select.Option key={agent.custom_id} value={agent.custom_id}>
                {agent.username}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

function ChangeAssignee({ id, userId }) {
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
  const handleOkModal = () => {};

  return (
    <div>
      <SettingOutlined
        style={{
          cursor: "pointer",
          color: "#1890ff",
        }}
        onClick={handleShowModal}
      />
      <AssigneeModal
        userId={userId}
        open={open}
        agents={agents}
        onCancel={handleCancelModal}
        onOk={handleOkModal}
      />
    </div>
  );
}

export default ChangeAssignee;

import { SettingOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { refStatus } from "@/services/index";
import { Form, Select, Modal } from "antd";

const StatusModal = ({ open, onCancel, data }) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    await form.validateFields();
  };

  return (
    <Modal
      title="Pilih Status"
      centered
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
    >
      <Form form={form}>
        <Form.Item name="status">
          <Select showSearch optionFilterProp="name">
            {data?.map((status) => {
              return (
                <Select.Option
                  key={status.name}
                  name={status?.name}
                  value={status.name}
                >
                  {status.name}
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

const ChangeStatus = ({ ticketId, statusId }) => {
  const { data, isloading } = useQuery(["ref-status"], () => refStatus(), {
    refetchOnWindowFocus: false,
  });

  const [open, setOpen] = useState(false);
  const handleShowModal = () => {
    if (isloading) return;
    setOpen(true);
  };
  const handleCancelModal = () => setOpen(false);

  return (
    <div>
      <SettingOutlined
        style={{
          cursor: "pointer",
          color: "#1890ff",
        }}
        onClick={handleShowModal}
      />
      <StatusModal
        data={data}
        ticketId={ticketId}
        statusId={statusId}
        open={open}
        onCancel={handleCancelModal}
      />
    </div>
  );
};

export default ChangeStatus;

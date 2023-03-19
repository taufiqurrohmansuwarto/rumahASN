import { SettingOutlined } from "@ant-design/icons";
import { useState } from "react";
import { Modal } from "antd";

const StatusModal = ({ open, onCancel, onOk }) => {
  return (
    <Modal
      title="Pilih Status"
      centered
      open={open}
      onCancel={onCancel}
      onOk={onOk}
    >
      <div>Status Modal</div>
    </Modal>
  );
};

function ChangeStatus({ id, userId }) {
  const [open, setOpen] = useState(false);
  const handleShowModal = () => setOpen(true);
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
      <StatusModal
        userId={userId}
        open={open}
        onCancel={handleCancelModal}
        onOk={handleOkModal}
      />
    </div>
  );
}

export default ChangeStatus;

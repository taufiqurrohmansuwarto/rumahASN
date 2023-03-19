import { SettingOutlined } from "@ant-design/icons";
import { useState } from "react";
import { Modal } from "antd";

const AssigneeModal = ({ open, onCancel, onOk }) => {
  return (
    <Modal
      title="Pilih Penerima Tugas"
      centered
      open={open}
      onCancel={onCancel}
      onOk={onOk}
    >
      <div>Assignee Modal</div>
    </Modal>
  );
};

function ChangeAssignee({ id, userId }) {
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
      <AssigneeModal
        userId={userId}
        open={open}
        onCancel={handleCancelModal}
        onOk={handleOkModal}
      />
    </div>
  );
}

export default ChangeAssignee;

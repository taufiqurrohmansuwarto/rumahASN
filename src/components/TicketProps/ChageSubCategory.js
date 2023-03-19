import { SettingOutlined } from "@ant-design/icons";
import { useState } from "react";
import { Modal } from "antd";

const SubCategoryModal = ({ open, onCancel, onOk, id }) => {
  return (
    <Modal
      title="Pilih Sub Kategori"
      centered
      open={open}
      onCancel={onCancel}
      onOk={onOk}
    >
      <div>Sub Category Modal</div>
    </Modal>
  );
};

function ChangeSubCategory({ ticketId, subCategoryId }) {
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
      <SubCategoryModal
        id={subCategoryId}
        open={open}
        onCancel={handleCancelModal}
        onOk={handleOkModal}
      />
    </div>
  );
}

export default ChangeSubCategory;

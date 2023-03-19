import { SettingOutlined } from "@ant-design/icons";
import { useState } from "react";
import { Modal } from "antd";
import { useQuery } from "@tanstack/react-query";
import { refCategories, refPriorities } from "@/services/index";

const SubCategoryModal = ({ open, onCancel, onOk, categories, priorities }) => {
  return (
    <Modal
      title="Pilih Sub Kategori"
      centered
      destroyOnClose
      open={open}
      onCancel={onCancel}
      onOk={onOk}
    >
      <div>Sub Category Modal</div>
      <div>{JSON.stringify(priorities)}</div>
      <div>{JSON.stringify(categories)}</div>
    </Modal>
  );
};

function ChangeSubCategory({ ticketId, subCategoryId }) {
  const { data, isLoading } = useQuery(
    ["ref-sub-categories"],
    () => refCategories(),
    {
      refetchOnWindowFocus: false,
    }
  );

  const { data: priorities, isLoading: isPriorityLoading } = useQuery(
    ["ref-priorities"],
    () => refPriorities(),
    {
      refetchOnWindowFocus: false,
    }
  );

  const [open, setOpen] = useState(false);

  const handleShowModal = () => {
    if (isLoading || isPriorityLoading) return;
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
      <SubCategoryModal
        categories={data}
        priorities={priorities}
        id={subCategoryId}
        open={open}
        onCancel={handleCancelModal}
        onOk={handleOkModal}
      />
    </div>
  );
}

export default ChangeSubCategory;

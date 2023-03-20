import { SettingOutlined } from "@ant-design/icons";
import { useState } from "react";
import { Modal, Form, Select, Radio } from "antd";
import { useQuery } from "@tanstack/react-query";
import { refCategories, refPriorities } from "@/services/index";

const SubCategoryModal = ({ open, onCancel, categories, priorities }) => {
  const handleSubmit = () => {};
  const [form] = Form.useForm();

  return (
    <Modal
      title="Sub Kategori dan Prioritas"
      centered
      width={800}
      destroyOnClose
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
    >
      <Form form={form}>
        <Form.Item name="sub_category_id">
          <Select showSearch optionFilterProp="name">
            {categories?.map((category) => {
              return (
                <Select.Option
                  key={category.name}
                  name={category?.name}
                  value={category.name}
                >
                  {category.name}
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>
        <Form.Item name="priority_id">
          <Radio.Group>
            {priorities?.map((priority) => {
              return (
                <Radio.Button key={priority.name} value={priority.name}>
                  {priority.name}
                </Radio.Button>
              );
            })}
          </Radio.Group>
        </Form.Item>
      </Form>
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
      />
    </div>
  );
}

export default ChangeSubCategory;

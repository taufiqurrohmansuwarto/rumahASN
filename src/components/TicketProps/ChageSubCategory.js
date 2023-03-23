import { SettingOutlined } from "@ant-design/icons";
import { useState } from "react";
import { Modal, Form, Select, Radio,message } from "antd";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { refCategories, refPriorities,changePrioritySubcategory } from "@/services/index";

const SubCategoryModal = ({ open, onCancel, categories, priorities, ticketId, priorityCode, subCategoryId }) => {
  
  const [form] = Form.useForm();

  const queryClient = useQueryClient();

  const {mutate: updateCategory, isLoading} = useMutation(data => changePrioritySubcategory(data), {
    onSuccess: () => {
      message.success('Berhasil merubah kategori dan status')
       queryClient.invalidateQueries(['publish-ticket', ticketId])
       onCancel()
    },
    onError : () => {
      message.error('Gagal')
      onCancel()
    }
  })

  const handleSubmit = async() => {
    const {sub_category_id, priority_code} = await form.validateFields();
    const data = {
      id : ticketId,
      data : {
        sub_category_id,
        priority_code
      }
    }
    if(!isLoading){
      updateCategory(data)
    }
  };

  return (
    <Modal
      title="Sub Kategori dan Prioritas"
      centered
      width={800}
      destroyOnClose
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={isLoading}
    >
      <Form form={form} initialValues={{
        sub_category_id : subCategoryId,
        priority_code: priorityCode
      }}>
        <Form.Item name="sub_category_id">
          <Select showSearch optionFilterProp="name">
            {categories?.map((category) => {
              return (
                <Select.Option
                  key={category.id}
                  name={category?.name}
                  value={category.id}
                >
                  {category.name}
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>
        <Form.Item name="priority_code">
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

function ChangeSubCategory({ ticketId, subCategoryId, priorityCode }) {
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
        subCategoryId={subCategoryId}
        priorityCode={priorityCode}
        ticketId={ticketId}
        open={open}
        onCancel={handleCancelModal}
      />
    </div>
  );
}

export default ChangeSubCategory;

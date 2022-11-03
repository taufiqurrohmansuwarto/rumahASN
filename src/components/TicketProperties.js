// ini digunakan untuk memindah prioritas dan subkategori setiap tiket oleh agent

import { Button, Form, message, Modal, Radio, Select, Skeleton } from "antd";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getPriorities, subCategories } from "../../services";
import { updatePropertyTicket } from "../../services/agents.services";

const FormProperty = ({ open, onCancel, data, priorities, subCategories }) => {
  const queryClient = useQueryClient();

  const { mutate: updateProperties, isLoading } = useMutation(
    (data) => updatePropertyTicket(data),
    {
      onSuccess: () => {
        onCancel();
        message.success("Berhasil memperbarui property tiket");
      },
    }
  );

  const handleFinish = async () => {
    const { priority_code, sub_category_id } = await form.validateFields();
    const currentData = {
      id: data?.id,
      data: {
        sub_category_id,
        priority_code,
      },
    };
    updateProperties(currentData);
  };

  const [form] = Form.useForm();

  return (
    <Modal
      onOk={handleFinish}
      open={open}
      confirmLoading={isLoading}
      onCancel={onCancel}
      title="Update Tiket Properti"
    >
      <Form name="test" initialValues={data} layout="vertical" form={form}>
        <Form.Item
          name="sub_category_id"
          label="Sub kategori"
          rules={[{ required: true, message: "Tidak boleh kosong" }]}
        >
          <Select optionFilterProp="name" showSearch>
            {subCategories?.map((item) => (
              <Select.Option key={item?.id} name={item?.name} value={item.id}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="priority_code" label="Prioritas">
          <Radio.Group>
            {priorities?.map((item) => (
              <Radio.Button
                key={item?.name}
                name={item?.name}
                value={item.name}
              >
                {item.name}
              </Radio.Button>
            ))}
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};

function TicketProperties({ data }) {
  const [open, setOpen] = useState(false);

  const { data: dataSubCategory, loading: loadingSubCategory } = useQuery(
    ["sub-categories"],
    () => subCategories()
  );

  const { data: dataPriority, loading: loadingPriority } = useQuery(
    ["priorities"],
    () => getPriorities()
  );

  const handleCancel = () => setOpen(false);
  const handleOpen = () => setOpen(true);

  return (
    <Skeleton loading={loadingPriority || loadingSubCategory}>
      <Button onClick={handleOpen}>Ubah Property Tiket</Button>
      <FormProperty
        data={data}
        open={open}
        subCategories={dataSubCategory}
        priorities={dataPriority}
        onCancel={handleCancel}
      />
    </Skeleton>
  );
}

export default TicketProperties;

// ini digunakan untuk memindah prioritas dan subkategori setiap tiket oleh agent

import { Button, Form, Modal, Skeleton } from "antd";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getPriorities, subCategories } from "../../services";
import { updatePropertyTicket } from "../../services/agents.services";

const FormProperty = ({ open, onCancel, data, ref }) => {
  const { mutate: updateProperties, isLoading } = useMutation(
    (data) => updatePropertyTicket(data),
    {}
  );

  const handleFinish = async () => {
    const values = await form.validateFields();
    console.log(values);
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
      <Form form={form} initialValues={data}>
        <Form.Item>
          <Button htmlType="submit">Submit</Button>
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
    () => getPriorities(),
    {
      refetchOnWindowFocus: false,
    }
  );

  const handleCancel = () => setOpen(false);
  const handleOpen = () => setOpen(true);

  return (
    <Skeleton loading={loadingPriority || loadingSubCategory}>
      <Button onClick={handleOpen}>Rubah status</Button>
      <FormProperty
        ref={{ subCategory: dataSubCategory, priority: dataPriority }}
        data={data}
        open={open}
        onCancel={handleCancel}
      />
    </Skeleton>
  );
}

export default TicketProperties;

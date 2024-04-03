import { submissionsSubmitter } from "@/services/submissions.services";
import { useQuery } from "@tanstack/react-query";
import { Button, Form, Modal, Select, Skeleton } from "antd";
import { useRouter } from "next/router";
import React from "react";

const ModalUsulan = ({ open, handleCancel, data }) => {
  const router = useRouter();
  const [form] = Form.useForm();

  const onFinish = async () => {
    const values = await form.validateFields();
    const { submission_id } = values;
    router.push(`/submissions/detail/${submission_id}/references`);
  };

  return (
    <Modal
      title="Daftar Usulan"
      width={800}
      open={open}
      onOk={onFinish}
      onCancel={handleCancel}
      centered
    >
      <Form form={form}>
        <Form.Item name="submission_id">
          <Select optionFilterProp="name" showSearch allowClear>
            {data?.map((item) => (
              <Select.Option name={item?.type} key={item?.id} value={item?.id}>
                {item?.type}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

function BuatUsulan() {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const { data, isLoading } = useQuery(
    ["sumbmissions-submitter"],
    () => submissionsSubmitter(),
    {}
  );

  return (
    <Skeleton loading={isLoading}>
      <Button onClick={handleOpen}>Buat Usulan</Button>
      <ModalUsulan data={data} open={open} handleCancel={handleClose} />
    </Skeleton>
  );
}

export default BuatUsulan;

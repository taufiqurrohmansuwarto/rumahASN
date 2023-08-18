import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { createThread, threads } from "@/services/discussions.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, Modal, message } from "antd";
import Head from "next/head";
import React, { useState } from "react";

const CreateDiscussions = ({ open, handleCancel }) => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  const { mutate: create, isLoading } = useMutation(
    (data) => createThread(data),
    {
      onSuccess: () => {
        message.success("Thread berhasil dibuat");
        handleCancel();
      },
      onSettled: () => {
        queryClient.invalidateQueries(["discussions-admin"]);
        form.resetFields();
      },
    }
  );

  const handleSubmit = async () => {
    const result = await form.validateFields();
    create(result);
  };

  return (
    <Modal
      title="Buat Thread untuk diskusi"
      open={open}
      onOk={handleSubmit}
      confirmLoading={isLoading}
      onCancel={handleCancel}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          rules={[
            {
              required: true,
              message: "Judul harus diisi",
            },
          ]}
          name="title"
          label="Judul"
        >
          <Input />
        </Form.Item>
        <Form.Item
          rules={[
            {
              required: true,
              message: "Sub Judul harus diisi",
            },
          ]}
          name="subtitle"
          label="Sub Judul"
        >
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};

function Discussions() {
  const [query, setQuery] = useState({
    limit: 10,
    page: 1,
  });

  const { data, isLoading } = useQuery(
    ["discussions-admin"],
    () => threads(),
    {}
  );

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Head>
        <title>Rumah ASN - Admin - Diskusi</title>
      </Head>
      <PageContainer loading={isLoading}>
        <Button onClick={handleOpen}>Buat</Button>
        <CreateDiscussions open={open} handleCancel={handleClose} />
      </PageContainer>
    </>
  );
}

Discussions.Auth = {
  action: "manage",
  subject: "Tickets",
};

Discussions.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default Discussions;

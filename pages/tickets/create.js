import { Alert, Grid, Text } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons";
import { useMutation } from "@tanstack/react-query";
import { Button, Card, Form, Input, message } from "antd";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { uploadImage } from "../../services";
import { createTickets } from "../../services/users.services";
import Layout from "../../src/components/Layout";
import PageContainer from "../../src/components/PageContainer";
import RichTextEditor from "../../src/components/RichTextEditor";

const CreateTicket = () => {
  const [form] = Form.useForm();
  const router = useRouter();

  const handleImageUpload = useCallback(
    (file) =>
      new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append("image", file);

        uploadImage(formData)
          .then((res) => resolve(res.data))
          .catch(() => reject(new Error("Upload failed")));
      }),
    []
  );

  const { mutate: create } = useMutation((data) => createTickets(data), {
    onSuccess: () => {
      message.success("Berhasil membuat tiket");
      router.push("/tickets/semua");
    },
    onError: () => {
      message.error("Gagal membuat tiket");
    },
  });

  const handleFinish = (value) => {
    const { title, content } = value;
    if (title && content) {
      const data = {
        title,
        content,
      };

      create(data);
    }
  };

  return (
    <PageContainer
      onBack={() => router.push("/tickets/semua")}
      title="Helpdesk"
      subTitle="Buat Tiket Baru"
    >
      <Grid justify="center">
        <Grid.Col span={8}>
          <Card title="Buat Ticket">
            <Alert
              icon={<IconAlertCircle />}
              color="yellow"
              title="Perhatian"
              mb={8}
            >
              <Text>
                Buatlah deskripsi dengan baik dan jelas serta gunakan tata
                bahasa yang baik, agar kami dapat membantu anda dengan cepat.
                Gunakan gambar atau link file sebagai bukti error di bagian
                deskripsi jika ada untuk mempermudah kami dalam menyelesaikan
                masalah anda. Terima Kasih.
              </Text>
            </Alert>
            <Form onFinish={handleFinish} form={form} layout="vertical">
              <Form.Item
                rules={[
                  { required: true, message: "Judul tidak boleh kosong" },
                ]}
                name="title"
                label="Judul"
              >
                <Input />
              </Form.Item>
              <Form.Item required name="content" label="Deskripsi">
                <RichTextEditor
                  onImageUpload={handleImageUpload}
                  style={{ minHeight: 300 }}
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Kirim
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Grid.Col>
      </Grid>
    </PageContainer>
  );
};

CreateTicket.getLayout = function getLayout(page) {
  return <Layout active="/tickets">{page}</Layout>;
};

CreateTicket.Auth = {
  action: "create",
  subject: "Tickets",
};

export default CreateTicket;

import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { sendPrivateMessage } from "@/services/index";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

const CreatePrivateMessage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleBack = () => router.back();
  const [form] = Form.useForm();

  const { mutate: send, isLoading } = useMutation(
    (data) => sendPrivateMessage(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["private-messages"]);
        router.push("/mails");
      },
    }
  );

  const handleFinish = async () => {
    const result = await form.validateFields();
    console.log(result);
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - Buat Pesan Pribadi</title>
      </Head>
      <PageContainer onBack={handleBack} title="Pesan Pribadi" subTitle="Buat">
        <Form form={form} onFinish={handleFinish}>
          <Form.Item name="title" label="Judul">
            <Input />
          </Form.Item>
          <Form.Item name="sender_id" label="Kepada">
            <Input />
          </Form.Item>
          <Form.Item name="message" label="Isi Pesan Pribadi">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit">Kirim</Button>
          </Form.Item>
        </Form>
      </PageContainer>
    </>
  );
};

CreatePrivateMessage.getLayout = function getLayout(page) {
  return <Layout active="/mails">{page}</Layout>;
};

CreatePrivateMessage.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default CreatePrivateMessage;

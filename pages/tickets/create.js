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
import { resizeImageTag } from "../../utils";
import { MarkdownEditor } from "@primer/react/drafts";
import { parseMarkdown, uploadFiles } from "@/services/index";

const CreateTicket = () => {
  const [form] = Form.useForm();
  const router = useRouter();


  const { mutate: create, isLoading } = useMutation(
    (data) => createTickets(data),
    {
      retry: false,
      onSuccess: () => {
        message.success("Berhasil membuat tiket");
        router.push("/tickets/semua");
      },
      onError: () => {
        message.error("Gagal membuat tiket");
      },
    }
  );


  const uploadFile = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadFiles(formData);
      return {
        url: result?.data,
        file,
      };
    } catch (error) {
      console.log(error);
    }
  };

 

  const handleFinish = (value) => {
    const { title, content } = value;
     
    if(!isLoading){
      const data = {
        title,
        content
      }
      create(data);
    }
    
  };

  const renderMarkdown = async (markdown) => {
    if(!markdown) return
    const result = await parseMarkdown(markdown);
    return result?.html;
  };


  return (
    <PageContainer
      onBack={() => router.push("/tickets/semua")}
      title="Helpdesk"
      subTitle="Buat Tiket Baru"
    >
      <Grid justify="center">
        <Grid.Col span={8}>
          <Card title="Buat Tiket">
            <Alert
              icon={<IconAlertCircle />}
              color="yellow"
              title="Perhatian"
              mb={8}
            >
              <Text>
                Jika Anda pegawai Pemerintah Provinsi Jawa Timur, gunakan akun
                SIMASTER dan PTTPK untuk mempermudah kami dalam menangani tiket
                Anda. Buatlah deskripsi dengan baik dan jelas serta gunakan tata
                bahasa yang baik, agar kami dapat membantu anda dengan cepat.
                Gunakan gambar atau link file sebagai bukti di bagian deskripsi
                jika ada. Terima Kasih.
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
              <Form.Item required name="content" label="Deskripsi" rules={[{required: true, message: "Deskripsi tidak boleh kosong"}]}>
                 <MarkdownEditor onRenderPreview={renderMarkdown}  onUploadFile={uploadFile}>
                  <MarkdownEditor.Toolbar>
                    <MarkdownEditor.DefaultToolbarButtons />
                    </MarkdownEditor.Toolbar>
                 </MarkdownEditor>
              </Form.Item>
              <Form.Item>
                <Button style={{ marginTop : 10 }} disabled={isLoading} type="primary" htmlType="submit">
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

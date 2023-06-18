import Layout from "@/components/Layout";
import { MarkdownEditor } from "@primer/react/drafts";
import PageContainer from "@/components/PageContainer";
import { createPodcast, parseMarkdown, uploadFiles } from "@/services/index";
import { useMutation } from "@tanstack/react-query";
import { Button, Card, Col, Form, Input, InputNumber, Row } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

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

const renderMarkdown = async (markdown) => {
  if (!markdown) return;
  const result = await parseMarkdown(markdown);
  return result?.html;
};

function CreatePodcast() {
  const router = useRouter();
  const { mutate: create, isLoading: isLoadingCreatePodcast } = useMutation(
    (data) => createPodcast(data),
    {
      onSuccess: () => {
        router.push("/apps-managements/podcasts");
      },
      onError: () => {
        message.error("Gagal membuat podcast,");
        form.resetFields();
      },
    }
  );

  const handleBack = () => router.back();
  const [form] = Form.useForm();

  const handleFinish = async () => {
    const result = await form.validateFields();
    create(result);
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - Buat Rekaman Podcast</title>
      </Head>
      <PageContainer
        onBack={handleBack}
        title="Buat Podcast"
        subTitle="Podcast Baru - Rumah ASN"
      >
        <Row>
          <Col md={18} xs={24}>
            <Card>
              <Form layout="vertical" onFinish={handleFinish} form={form}>
                <Form.Item
                  name="episode"
                  label="Episode"
                  rules={[
                    {
                      required: true,
                      message: "Episode harus diisi",
                    },
                  ]}
                >
                  <InputNumber />
                </Form.Item>
                <Form.Item
                  name="title"
                  label="Judul"
                  rules={[
                    {
                      required: true,
                      message: "Judul harus diisi",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item name="short_description" label="Deskripsi Pendek">
                  <Input.TextArea rows={5} />
                </Form.Item>
                <Form.Item name="description" label="Deskripsi">
                  <MarkdownEditor
                    onRenderPreview={renderMarkdown}
                    onUploadFile={uploadFile}
                  >
                    <MarkdownEditor.Toolbar>
                      <MarkdownEditor.DefaultToolbarButtons />
                    </MarkdownEditor.Toolbar>
                  </MarkdownEditor>
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    disabled={isLoadingCreatePodcast}
                    loading={isLoadingCreatePodcast}
                    htmlType="submit"
                  >
                    Submit Podcast
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </PageContainer>
    </>
  );
}

CreatePodcast.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

CreatePodcast.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default CreatePodcast;

import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { getTreeOrganization } from "@/services/index";
import { createLayanan } from "@/services/layanan-kepegawaian.services";
import { renderMarkdown, uploadFile } from "@/utils/client-utils";
import { MarkdownEditor } from "@primer/react/drafts";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Breadcrumb,
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  TreeSelect,
  message,
} from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const FormTree = () => {
  const { data: dataTree } = useQuery(["organization-tree"], () =>
    getTreeOrganization()
  );

  return (
    <>
      {dataTree && (
        <>
          <Form.Item
            label="Bidang Pengampu"
            name="bidang"
            rules={[
              {
                required: true,
                message: "Struktur Organisasi tidak boleh kosong",
              },
            ]}
          >
            <TreeSelect
              labelInValue
              treeNodeFilterProp="label"
              treeData={dataTree}
              showSearch
              placeholder="Pilih Struktur Organisasi"
              treeDefaultExpandAll
            />
          </Form.Item>
        </>
      )}
    </>
  );
};

const CreateLayananKepegawaian = () => {
  const router = useRouter();
  const [form] = Form.useForm();

  const { mutate: create, isLoading } = useMutation(
    (data) => createLayanan(data),
    {
      onSuccess: () => {
        router.push(`/apps-managements/layanan-kepegawaian`);
        message.success("Berhasil membuat layanan kepegawaian");
      },
      onError: () => {
        message.error("Gagal membuat layanan kepegawaian");
      },
    }
  );

  const handleBack = () => router.back();

  const handleFinish = async () => {
    try {
      const value = await form.validateFields();
      const bidang = JSON.stringify({
        id: value.bidang.value,
        label: value.bidang.label,
      });

      const data = {
        ...value,
        bidang,
      };

      create(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Head>
        <title>Buat Layanan Kepegawaian</title>
      </Head>
      <PageContainer
        onBack={handleBack}
        title="Layanan Kepegawaian"
        content="Form Tambah Layanan Kepegawaian"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/apps-managements/layanan-kepegawaian">
                  Layanan Kepegawaian
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Buat Layanan Kepegawaian</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <Row>
          <Col md={18} xs={24}>
            <Card>
              <Form form={form} layout="vertical">
                <Form.Item
                  name="title"
                  label="Judul"
                  rules={[
                    { required: true, message: "Judul tidak boleh kosong" },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  rules={[
                    { required: true, message: "Deskripsi Tidak boleh kosong" },
                  ]}
                  name="description"
                  label="Deskripsi"
                >
                  <MarkdownEditor
                    acceptedFileTypes={[
                      "image/*",
                      // word, excel, txt, pdf
                      ".doc",
                      ".docx",
                      ".xls",
                      ".xlsx",
                      ".txt",
                      ".pdf",
                    ]}
                    onRenderPreview={renderMarkdown}
                    onUploadFile={uploadFile}
                    mentionSuggestions={null}
                  />
                </Form.Item>
                <Form.Item name="icon_url" label="Alamat Gambar">
                  <Input />
                </Form.Item>
                <FormTree />
                <Form.Item>
                  <Button
                    onClick={handleFinish}
                    disabled={isLoading}
                    loading={isLoading}
                    htmlType="submit"
                  >
                    Submit
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </PageContainer>
    </>
  );
};

CreateLayananKepegawaian.getLayout = function (page) {
  return <Layout active="/apps-managements/layanan-kepegawaian">{page}</Layout>;
};

CreateLayananKepegawaian.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default CreateLayananKepegawaian;

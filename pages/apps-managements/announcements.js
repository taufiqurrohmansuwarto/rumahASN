import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import {
  createAnnouncements,
  getAnnouncements,
  uploadFiles,
  parseMarkdown,
  updateAnnouncements,
  removeAnnoucement,
} from "@/services/index";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, Form, Input, Button, message, Popconfirm, Row, Col } from "antd";
import Head from "next/head";
import React, { useEffect } from "react";
import { MarkdownEditor } from "@primer/react/drafts";
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

const CreateAnnounce = () => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const { mutate: create, isLoading } = useMutation(
    (data) => createAnnouncements(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["announcements"]);
        form.resetFields();
        message.success("Pengumuman berhasil dibuat");
      },
      onError: () => {
        message.error("Gagal membuat pengumuman, silahkan coba lagi nanti");
        form.resetFields();
      },
    }
  );

  const handleFinish = async () => {
    try {
      const result = await form.validateFields();
      create(result);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Row>
      <Col md={18} xs={24}>
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            name="title"
            label="Judul"
            rules={[{ required: true, message: "Judul harus diisi" }]}
          >
            <Input placeholder="Judul" />
          </Form.Item>
          <Form.Item
            required
            name="content"
            label="Isi"
            rules={[{ required: true, message: "Isi tidak boleh kosong" }]}
          >
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
              style={{ marginTop: 10 }}
              disabled={isLoading}
              type="primary"
              htmlType="submit"
            >
              Buat Pengumuman
            </Button>
          </Form.Item>
        </Form>
      </Col>
    </Row>
  );
};

const UpdateAnnouncement = ({ data }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const { mutate: edit, isLoading } = useMutation(
    (data) => updateAnnouncements(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["announcements"]);
        form.resetFields();
        message.success("Pengumuman berhasil diubah");
      },
      onError: () => {
        message.error("Gagal merubah pengumuman, silahkan coba lagi nanti");
        form.resetFields();
      },
    }
  );

  const { mutate: remove, isLoading: isLoadingRemove } = useMutation(
    (id) => removeAnnoucement(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["announcements"]);
        form.resetFields();
        message.success("Pengumuman berhasil dihapus");
      },
      onError: () => {
        message.error("Gagal menghapus pengumuman, silahkan coba lagi nanti");
        form.resetFields();
      },
    }
  );

  useEffect(() => {
    form.setFieldsValue(data);
  }, [data, form]);

  const handleFinish = async () => {
    try {
      const result = await form.validateFields();
      const kirim = {
        id: data.id,
        data: {
          title: result.title,
          content: result.content,
        },
      };
      edit(kirim);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Row>
      <Col md={18} xs={24}>
        <Form
          initialValues={{
            title: data?.title,
            content: data?.content,
          }}
          layout="vertical"
          form={form}
          onFinish={handleFinish}
        >
          <Form.Item
            name="title"
            label="Judul"
            rules={[{ required: true, message: "Judul harus diisi" }]}
          >
            <Input placeholder="Judul" />
          </Form.Item>
          <Form.Item
            required
            name="content"
            label="Isi"
            rules={[{ required: true, message: "Isi tidak boleh kosong" }]}
          >
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
              style={{ marginTop: 10 }}
              disabled={isLoading}
              type="primary"
              htmlType="submit"
            >
              Edit Pengumuman
            </Button>
          </Form.Item>
        </Form>
        <Popconfirm
          title="Apakah anda yakin ingin menghapus pengumuman ini?"
          onConfirm={() => remove(data.id)}
          okText="Ya"
          cancelText="Tidak"
        >
          <Button
            style={{ marginTop: 10 }}
            disabled={isLoadingRemove}
            type="primary"
            danger
          >
            Hapus Pengumuman
          </Button>
        </Popconfirm>
      </Col>
    </Row>
  );
};

function Announcements() {
  const { data, isLoading } = useQuery(
    ["announcements"],
    () => getAnnouncements(),
    {}
  );

  const router = useRouter();

  return (
    <>
      <Head>
        <title>Rumah ASN - Pengumuman</title>
      </Head>
      <PageContainer
        onBack={() => router.back()}
        title="Pengumuman"
        subTitle="Pengumuman Rumah ASN"
      >
        <Card loading={isLoading}>
          {!data ? <CreateAnnounce /> : <UpdateAnnouncement data={data} />}
        </Card>
      </PageContainer>
    </>
  );
}

Announcements.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

Announcements.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default Announcements;

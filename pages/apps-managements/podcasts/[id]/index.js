import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { MarkdownEditor } from "@primer/react/drafts";
import {
  getPodcastDetail,
  parseMarkdown,
  updatePodcast,
  uploadFiles,
  uploadPodcast,
} from "@/services/index";
import { EditOutlined, UploadOutlined } from "@ant-design/icons";
import { Stack } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Col,
  Row,
  Upload,
  message,
  Form,
  Input,
  Switch,
} from "antd";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

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

const UploadFileImage = ({ data, type = "image", title = "Cover" }) => {
  const [fileListImage, setFileListImage] = useState(data?.image);
  const queryClient = useQueryClient();
  const { mutate: uploadImage, isLoading: isLoadingUploadImage } = useMutation(
    (data) => uploadPodcast(data),
    {
      onSuccess: (result) => {
        queryClient.invalidateQueries(["podcasts", data?.id]);
        message.success("Gambar berhasil diunggah");
        setFileListImage(result?.data);
      },
      onError: () => {
        message.error("Gagal mengunggah Gambar, silahkan coba lagi nanti");
      },
    }
  );

  useEffect(() => {}, [data]);

  const handleBeforeUpload = (file) => {
    const isImage = file.type === "image/jpeg" || file.type === "image/png";
    if (!isImage) {
      message.error("Kamu hanya bisa mengunggah file Gambar!");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Gambar harus lebih kecil dari 2MB!");
    }
    return isImage && isLt2M;
  };

  const handleUpload = async (info) => {
    const id = data?.id;
    const formData = new FormData();
    formData.append("file", info.file?.originFileObj);
    formData.append("type", type);
    uploadImage({ id, data: formData });
  };

  return (
    <>
      <Upload
        beforeUpload={handleBeforeUpload}
        multiple={false}
        maxCount={1}
        showUploadList={{
          showRemoveIcon: false,
        }}
        accept="image/png, image/jpeg, image/jpg, image/gif, image/svg"
        onChange={handleUpload}
        fileList={fileListImage}
      >
        <Button
          icon={<UploadOutlined />}
          disabled={isLoadingUploadImage}
          loading={isLoadingUploadImage}
        >
          {title}
        </Button>
      </Upload>
    </>
  );
};

const UploadFileAudio = ({ data, type = "audio", title = "Audio" }) => {
  const [fileListAudio, setFileListAudio] = useState(data?.audio);
  const queryClient = useQueryClient();
  const { mutate: uploadAudio, isLoading: isLoadingUploadAudio } = useMutation(
    (data) => uploadPodcast(data),
    {
      onSuccess: (result) => {
        queryClient.invalidateQueries(["podcasts", data?.id]);
        message.success("Audio berhasil diunggah");
        setFileListAudio(result?.data);
      },
      onError: () => {
        message.error("Gagal mengunggah audio, silahkan coba lagi nanti");
      },
    }
  );

  useEffect(() => {}, [data]);

  const handleBeforeUpload = (file) => {
    const isAudio = file.type === "audio/mpeg";
    if (!isAudio) {
      message.error("You can only upload audio file!");
    }
    const isLt20M = file.size / 1024 / 1024 < 20;
    if (!isLt20M) {
      message.error("Audio must smaller than 20MB!");
    }
    return isAudio && isLt20M;
  };

  const handleUpload = async (info) => {
    const id = data?.id;
    const formData = new FormData();
    formData.append("file", info.file?.originFileObj);
    formData.append("type", type);
    uploadAudio({ id, data: formData });
  };

  return (
    <>
      <Upload
        beforeUpload={handleBeforeUpload}
        multiple={false}
        maxCount={1}
        showUploadList={{
          showRemoveIcon: false,
        }}
        accept="audio/*"
        onChange={handleUpload}
        fileList={fileListAudio}
      >
        <Button
          icon={<UploadOutlined />}
          disabled={isLoadingUploadAudio}
          loading={isLoadingUploadAudio}
        >
          {title}
        </Button>
      </Upload>
    </>
  );
};

const UpdateForm = ({ data }) => {
  const [form] = Form.useForm();

  const querClient = useQueryClient();

  const { mutate, isLoading } = useMutation((data) => updatePodcast(data), {
    onSuccess: () => {
      querClient.invalidateQueries(["podcasts", data?.id]);
      message.success("Podcast berhasil diperbarui");
    },
    onError: (e) => {
      console.log(e);
      message.error("Gagal memperbarui podcast, silahkan coba lagi nanti");
    },
  });

  const handleFinish = async () => {
    const result = await form.validateFields();
    const sendData = {
      id: data?.id,
      data: {
        title: result?.title,
        description: result?.description,
        is_published: result?.is_published,
      },
    };
    mutate(sendData);
  };

  return (
    <>
      <Form
        initialValues={{
          title: data?.title,
          description: data?.description,
        }}
        layout="vertical"
        onFinish={handleFinish}
        form={form}
      >
        <Form.Item name="title" label="Judul">
          <Input />
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
        <Form.Item name="is_published" label="Publikasi">
          <Switch defaultChecked={data?.is_published} />
        </Form.Item>
        <UploadFileAudio data={data} />
        <UploadFileImage data={data} />
        <Form.Item>
          <Button
            disabled={isLoading}
            loading={isLoading}
            htmlType="submit"
            style={{
              marginTop: 16,
            }}
            type="primary"
          >
            Edit
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

function DetailPodcast() {
  const router = useRouter();
  const id = router?.query?.id;
  const { data, isLoading } = useQuery(
    ["podcasts", id],
    () => getPodcastDetail(id),
    { enabled: !!id }
  );

  return (
    <>
      <Head>
        <title>Rumah ASN - {data?.title}</title>
      </Head>
      <PageContainer
        onBack={() => router.back()}
        title={`Detail Podcast`}
        subTitle={data?.title}
        loading={isLoading}
      >
        <Row>
          <Col md={18} xs={24}>
            <Card loading={isLoading}>
              <Stack>
                <UpdateForm data={data} />
                {/* <UploadFileAudio data={data} /> */}
                {/* <UploadFileImage data={data} /> */}
              </Stack>
            </Card>
          </Col>
        </Row>
      </PageContainer>
    </>
  );
}

DetailPodcast.getLayout = (page) => {
  return <Layout active={"/apps-managements/podcasts"}>{page}</Layout>;
};

DetailPodcast.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default DetailPodcast;

import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import {
  detailWebinar,
  updateWebinar,
  uploadFileWebinar,
} from "@/services/webinar.services";
import { UploadOutlined } from "@ant-design/icons";
import { Stack } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BackTop,
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  message,
} from "antd";
import moment from "moment";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const UploadFileTemplate = ({ data, type = "image", title = "test" }) => {
  const [fileListAudio, setFileListAudio] = useState(data?.template);
  const queryClient = useQueryClient();

  const { mutate: uploadAudio, isLoading: isLoadingUploadAudio } = useMutation(
    (data) => uploadFileWebinar(data),
    {
      onSuccess: (result) => {
        message.success("Berhasil mengunggah image");
        queryClient.invalidateQueries([
          "webinar-series-admin-detail",
          data?.id,
        ]);
        setFileListAudio(result);
      },
      onError: (error) => {
        console.error(error);
        message.error("Gagal mengunggah image, silahkan coba lagi nanti");
      },
    }
  );

  useEffect(() => {}, [data]);

  const handleBeforeUpload = (file) => {
    const wordFileType =
      file?.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    if (!wordFileType) {
      message.error("You can only upload image file!");
    }
    const isLt20M = file.size / 1024 / 1024 < 20;
    if (!isLt20M) {
      message.error("Image must smaller than 20MB!");
    }

    return isAudio && isLt20M;
  };

  const handleUpload = (info) => {
    const id = data?.id;
    const formData = new FormData();
    formData.append("file", info.file);
    formData.append("type", "word");
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
        // accept word only
        accept=".docx"
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

const UploadFileImage = ({ data, type = "image", title = "test" }) => {
  const [fileListAudio, setFileListAudio] = useState(data?.image);
  const queryClient = useQueryClient();

  const { mutate: uploadAudio, isLoading: isLoadingUploadAudio } = useMutation(
    (data) => uploadFileWebinar(data),
    {
      onSuccess: (result) => {
        message.success("Berhasil mengunggah image");
        queryClient.invalidateQueries([
          "webinar-series-admin-detail",
          data?.id,
        ]);
        setFileListAudio(result);
      },
      onError: (error) => {
        console.error(error);
        message.error("Gagal mengunggah image, silahkan coba lagi nanti");
      },
    }
  );

  useEffect(() => {}, [data]);

  const handleBeforeUpload = (file) => {
    const isAudio = file.type === "image/png" || file.type === "image/jpeg";
    if (!isAudio) {
      message.error("You can only upload image file!");
    }
    const isLt20M = file.size / 1024 / 1024 < 20;
    if (!isLt20M) {
      message.error("Image must smaller than 20MB!");
    }
    return isAudio && isLt20M;
  };

  const handleUpload = (info) => {
    console.log(info?.file);
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
        accept="image/*"
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

const FormEditWebinarSeries = ({ data }) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutate: create, isLoading } = useMutation(
    (data) => updateWebinar(data),
    {
      onSuccess: () => {
        router.push("/apps-managements/webinar-series");
        message.success("Berhasil mengubah webinar series");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["webinar-series-admin"]);
      },
      onError: () => {
        message.error("Gagal membuat webinar series");
      },
    }
  );
  const [form] = Form.useForm();

  const handleFinish = async (values) => {
    const { date, open_registration, close_registration, ...rest } =
      await form.validateFields();
    const [start_date, end_date] = date;

    const currentValues = {
      ...rest,
      start_date: moment(start_date).format("YYYY-MM-DD HH:mm:ss"),
      end_date: moment(end_date).format("YYYY-MM-DD HH:mm:ss"),
      open_registration: moment(open_registration).format(
        "YYYY-MM-DD HH:mm:ss"
      ),
      close_registration: moment(close_registration).format(
        "YYYY-MM-DD HH:mm:ss"
      ),
    };

    const dataSend = {
      id: data?.id,
      data: currentValues,
    };

    create(dataSend);
  };

  return (
    <>
      <BackTop />
      <Stack mb={10}>
        <UploadFileTemplate
          title="Unggah Template Sertifikat"
          type="word"
          data={data}
        />
        <UploadFileImage
          title="Unggah Poster Webinar"
          type="image"
          data={data}
        />
      </Stack>
      <Form
        initialValues={data}
        onFinish={handleFinish}
        form={form}
        layout="vertical"
      >
        <Form.Item
          rules={[
            {
              required: true,
              message: "Nomer Series harus diisi",
            },
          ]}
          required
          name="episode"
          label="Nomer Series"
        >
          <InputNumber />
        </Form.Item>
        <Form.Item
          rules={[
            {
              required: true,
              message: "Judul harus diisi",
            },
          ]}
          required
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
          required
          name="subtitle"
          label="Sub Judul"
        >
          <Input />
        </Form.Item>
        <Form.Item
          rules={[
            {
              required: true,
              message: "Deskripsi harus diisi",
            },
          ]}
          required
          name="description"
          label="Deskripsi"
        >
          <Input.TextArea />
        </Form.Item>
        <Form.Item name="hour" label="Jumlah Jam">
          <InputNumber />
        </Form.Item>
        <Form.Item
          rules={[
            {
              required: true,
              message: "Silahkan pilih jenis pengguna",
            },
          ]}
          name="type_participant"
          label="Jenis Pengguna"
        >
          <Select mode="multiple" placeholder="Pilih Jenis Pengguna">
            <Select.Option value="asn">ASN</Select.Option>
            <Select.Option value="non_asn">NON ASN</Select.Option>
            <Select.Option value="umum">Umum</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="status" label="Status">
          <Select defaultValue="draft" placeholder="Status Webinar">
            <Select.Option value="draft">Draft</Select.Option>
            <Select.Option value="published">Publish</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          required
          label="Tanggal Mulai s/d Tanggal Berakhir"
          name="date"
          rules={[
            {
              required: true,
              message: "Tanggal harus diisi",
            },
          ]}
        >
          <DatePicker.RangePicker />
        </Form.Item>
        <Form.Item
          required
          name="open_registration"
          label="Tanggal Buka Pendaftaran"
        >
          <DatePicker showTime />
        </Form.Item>
        <Form.Item
          required
          name="close_registration"
          label="Tanggal Tutup Pendaftaran"
        >
          <DatePicker showTime />
        </Form.Item>
        <Form.Item name="youtube_url" label="Link Youtube">
          <Input />
        </Form.Item>
        <Form.Item name="zoom_url" label="Link Zoom">
          <Input />
        </Form.Item>
        <Form.Item name="reference_link" label="Link Materi">
          <Input />
        </Form.Item>

        <Form.Item
          valuePropName="checked"
          name="is_allow_download_certificate"
          label="Izinkan peserta mengunduh sertifikat?"
        >
          <Checkbox>Ya</Checkbox>
        </Form.Item>

        <Form.Item
          valuePropName="checked"
          name="use_esign"
          label="Gunakan TTE untuk sertifikat?"
        >
          <Checkbox>Ya</Checkbox>
        </Form.Item>

        <Form.Item>
          <Button
            disabled={isLoading}
            loading={isLoading}
            type="primary"
            htmlType="submit"
          >
            Submit
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

const UpdateWebinarSeries = () => {
  const router = useRouter();

  const { id } = router.query;

  const { data, isLoading } = useQuery(
    ["webinar-series-admin-detail", id],
    () => detailWebinar(id),
    {}
  );

  const handleBack = () => router.back();

  return (
    <>
      <Head>
        <title>Rumah ASN - Update Webinar Series</title>
      </Head>
      <PageContainer
        onBack={handleBack}
        loading={isLoading}
        title="Rumah ASN"
        content="Webinar Series"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">
                  <a>Beranda</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/apps-managements/webinar-series">
                  <a>Webinar Series Admin</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Edit Webinar</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <Card title="Edit Webinar Series">
          <FormEditWebinarSeries
            data={{
              ...data,
              id,
              date: [moment(data?.start_date), moment(data?.end_date)],
              open_registration: moment(data?.open_registration),
              close_registration: moment(data?.close_registration),
            }}
          />
        </Card>
      </PageContainer>
    </>
  );
};

UpdateWebinarSeries.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

UpdateWebinarSeries.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default UpdateWebinarSeries;

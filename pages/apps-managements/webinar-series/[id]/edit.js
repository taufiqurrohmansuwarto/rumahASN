import Layout from "@/components/Layout";
import AdminLayoutDetailWebinar from "@/components/WebinarSeries/AdminLayoutDetailWebinar";
import {
  detailWebinar,
  updateWebinar,
  uploadFileWebinar,
} from "@/services/webinar.services";
import { UploadOutlined } from "@ant-design/icons";
import { Stack } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Space,
  BackTop,
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
  Row,
  Col,
} from "antd";
import moment from "moment";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const format = "DD-MM-YYYY";

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
    <Space>
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
          type="primary"
          icon={<UploadOutlined />}
          disabled={isLoadingUploadAudio}
          loading={isLoadingUploadAudio}
        >
          {title}
        </Button>
      </Upload>
      <Link href="google.com">
        <a>Contoh Template</a>
      </Link>
    </Space>
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
    <Space>
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
          type="primary"
          icon={<UploadOutlined />}
          disabled={isLoadingUploadAudio}
          loading={isLoadingUploadAudio}
        >
          {title}
        </Button>
      </Upload>
      <Link href="google.com">
        <a>Contoh Poster</a>
      </Link>
    </Space>
  );
};

const FormEditWebinarSeries = ({ data }) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutate: create, isLoading } = useMutation(
    (data) => updateWebinar(data),
    {
      onSuccess: () => {
        message.success("Berhasil mengubah webinar series");
      },
      onSettled: () => {
        queryClient.invalidateQueries([
          "webinar-series-admin-detail",
          router?.query?.id,
        ]);
      },
      onError: () => {
        message.error("Gagal membuat webinar series");
      },
    }
  );
  const [form] = Form.useForm();

  const handleFinish = async () => {
    const { date, open_registration, close_registration, ...rest } =
      await form.validateFields();
    const [start_date, end_date] = date;

    const currentValues = {
      ...rest,
      start_date: moment(start_date).format(format),
      end_date: moment(end_date).format(format),
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
          title="Template Sertifikat"
          type="word"
          data={data}
        />
        <UploadFileImage title="Poster" type="image" data={data} />
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
          label="Series"
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
              message: "Deskripsi harus diisi",
            },
          ]}
          required
          name="description"
          label="Deskripsi"
        >
          <Input.TextArea />
        </Form.Item>
        <Form.Item name="certificate_number" label="Nomer Sertifikat">
          <Input />
        </Form.Item>
        <Form.Item name="organizer" label="Penyelenggara">
          <Input />
        </Form.Item>
        <Form.Item name="hour" label="Jumlah Jam Pelajaran">
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
          <DatePicker.RangePicker format={format} />
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

        <Row gutter={[16, 16]}>
          <Col>
            <Form.Item
              valuePropName="checked"
              name="is_open"
              label="Buka Pendaftaran?"
            >
              <Checkbox>Ya</Checkbox>
            </Form.Item>
          </Col>
          <Col>
            <Form.Item
              valuePropName="checked"
              name="is_allow_download_certificate"
              label="Izinkan peserta mengunduh sertifikat?"
            >
              <Checkbox>Ya</Checkbox>
            </Form.Item>
          </Col>
          <Col>
            <Form.Item
              valuePropName="checked"
              name="use_esign"
              label="Gunakan TTE untuk sertifikat?"
            >
              <Checkbox>Ya</Checkbox>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Button
            disabled={isLoading}
            loading={isLoading}
            type="primary"
            htmlType="submit"
          >
            Edit
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

  return (
    <>
      <Head>
        <title>Rumah ASN - Update Webinar Series</title>
      </Head>
      <AdminLayoutDetailWebinar loading={isLoading} active="edit">
        <Card>
          <Row>
            <Col xs={24} md={18}>
              <FormEditWebinarSeries
                data={{
                  ...data,
                  id,
                  date: [moment(data?.start_date), moment(data?.end_date)],
                }}
              />
            </Col>
          </Row>
        </Card>
      </AdminLayoutDetailWebinar>
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

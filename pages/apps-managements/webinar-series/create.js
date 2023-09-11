import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { createWebinar } from "@/services/webinar.services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Breadcrumb,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  message,
} from "antd";
import moment from "moment";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const format = "DD-MM-YYYY";

const FormWebinarSeries = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutate: create, isLoading } = useMutation(
    (data) => createWebinar(data),
    {
      onSuccess: () => {
        router.push("/apps-managements/webinar-series");
        message.success("Berhasil membuat webinar series");
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

  const handleFinish = async () => {
    const { date, open_registration, close_registration, ...rest } =
      await form.validateFields();
    const [start_date, end_date] = date;

    const data = {
      ...rest,
      start_date: moment(start_date).format("YYYY-MM-DD"),
      end_date: moment(end_date).format("YYYY-MM-DD"),
    };

    create(data);
  };

  return (
    <Form onFinish={handleFinish} form={form} layout="vertical">
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
        name="organizer"
        label="Penyelenggara"
        rules={[{ required: true, message: "Penyelenggara harus diisi" }]}
      >
        <Input />
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
      <Form.Item
        label="Jumlah Jam Pelajaran (JP)"
        rules={[{ required: true, message: "JP harus diisi" }]}
        name="hour"
      >
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
          <Select.Option value="draft">DRAFT</Select.Option>
          <Select.Option value="published">PUBLISH</Select.Option>
        </Select>
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
  );
};

const CreateWebinarSeries = () => {
  const router = useRouter();

  const handleBack = () => router.back();

  return (
    <>
      <Head>
        <title>Rumah ASN - Buat Webinar Series</title>
      </Head>
      <PageContainer
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
              <Breadcrumb.Item>Buat Webinar</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        onBack={handleBack}
        title="Buat Webinar Series"
        content="Webinar Series Baru"
      >
        <Card>
          <Row>
            <Col md={16} xs={24}>
              <FormWebinarSeries />
            </Col>
          </Row>
        </Card>
      </PageContainer>
    </>
  );
};

CreateWebinarSeries.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

CreateWebinarSeries.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default CreateWebinarSeries;

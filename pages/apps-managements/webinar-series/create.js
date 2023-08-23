import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { createWebinar } from "@/services/webinar.services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, DatePicker, Form, Input, InputNumber, message } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";
import moment from "moment";

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

  const handleFinish = async (values) => {
    const { date, open_registration, close_registration, ...rest } =
      await form.validateFields();
    const [start_date, end_date] = date;

    const data = {
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
        rules={[
          {
            required: true,
            message: "Judul harus diisi",
          },
        ]}
        required
        name="name"
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
  return (
    <>
      <Head>
        <title>Rumah ASN - Buat Webinar Series</title>
      </Head>
      <PageContainer>
        <FormWebinarSeries />
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

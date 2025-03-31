import FormPersonalSign from "@/components/Esign/FormPersonalSign";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import FormJenisDiklat from "@/components/PemutakhiranData/FormJenisDiklat";
import { createWebinar } from "@/services/webinar.services";
import { renderMarkdown, uploadFile } from "@/utils/client-utils";
import { MarkdownEditor } from "@primer/react/drafts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  message,
} from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import dayjs from "dayjs";
import "dayjs/locale/id";
import FormUnorASN from "@/components/WebinarSeries/FormUnorASN";
import FormUnorPTTPK from "@/components/WebinarSeries/FormUnorPTTPK";
dayjs.locale("id");

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
    const {
      date,
      status,
      open_registration,
      type_sign,
      close_registration,
      ...rest
    } = await form.validateFields();
    const [start_date, end_date] = date;

    const data = {
      ...rest,
      type_sign: "SEAL",
      status: status || "draft",
      employee_number_signer:
        type_sign === "SEAL" ? null : rest.employee_number_signer,
      start_date: dayjs(start_date).format("YYYY-MM-DD"),
      end_date: dayjs(end_date).format("YYYY-MM-DD"),
    };

    create(data);
  };

  return (
    <Form onFinish={handleFinish} form={form} layout="vertical">
      <Form.Item
        help="Jika dipilih, maka tanda tangan akan diambil dari tanda tangan personal"
        name="use_personal_signer"
        valuePropName="checked"
      >
        <Checkbox
          onChange={(e) => {
            if (e.target.checked) {
              form.setFieldsValue({ employee_number_signer: null });
            }
          }}
        >
          Use Personal Signer
        </Checkbox>
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) =>
          prevValues.use_personal_signer !== currentValues.use_personal_signer
        }
      >
        {({ getFieldValue }) =>
          getFieldValue("use_personal_signer") ? (
            <FormPersonalSign name="employee_number_signer" />
          ) : null
        }
      </Form.Item>
      <FormJenisDiklat name="type" />
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
        label="Nama Penyelenggara"
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
      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) =>
          prevValues.type_participant !== currentValues.type_participant
        }
      >
        {({ getFieldValue }) => {
          const typeParticipant = getFieldValue("type_participant");
          return (
            <>
              {typeParticipant?.includes("asn") && (
                <FormUnorASN name="unor_asn" />
              )}
              {typeParticipant?.includes("non_asn") && (
                <FormUnorPTTPK name="unor_nonasn" />
              )}
            </>
          );
        }}
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
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/apps-managements/webinar-series">
                  Webinar Series Admin
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
        <Card title="Form Entrian Webinar Baru">
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

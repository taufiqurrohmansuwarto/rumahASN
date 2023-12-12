import PageContainer from "@/components/PageContainer";
import { createLapor } from "@/services/netralitas.services";
import { useMutation } from "@tanstack/react-query";
import {
  Breadcrumb,
  Button,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Upload,
  message,
} from "antd";
import Head from "next/head";
import Link from "next/link";
import React from "react";
import ReCAPTCHA from "react-google-recaptcha";

function Netralitas({ data }) {
  const recaptchaRef = React.useRef();

  const [form] = Form.useForm();
  const [captcha, setCaptcha] = React.useState(null);

  const { mutate, isLoading } = useMutation((values) => createLapor(values), {
    onSuccess: (data) => {
      form.resetFields();
      setCaptcha(null);
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      Modal.success({
        centered: true,
        title: "Berhasil mengirim laporan",
        content: `Terima kasih telah mengirim laporan, laporan anda akan segera kami proses. Kode Laporan Anda adalah ${data?.data?.kode_laporan}. Harap simpan kode laporan anda untuk keperluan selanjutnya.`,
      });
    },
    onError: (error) => {
      message.error("Gagal mengirim laporan");
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
    },
  });

  const handleFinish = async (values) => {
    const { bukti_dukung, ...currentData } = values;

    const files = bukti_dukung?.fileList;

    if (files?.length === 0 || captcha === null) {
      message.error("Bukti dukung tidak boleh kosong, dan captcha harus diisi");
    } else {
      const formData = new FormData();

      for (const key in currentData) {
        formData.append(key, currentData[key]);
      }

      files?.forEach((file) => {
        formData.append("files", file.originFileObj);
      });

      formData.append("captcha", captcha);

      mutate(formData);
    }
  };

  //   accept file pdf/image
  const acceptFile = ".pdf, .jpg, .jpeg, .png";

  return (
    <>
      <Head>
        <title>Rumah ASN - Laporan Netralitas ASN</title>
      </Head>
      <PageContainer
        title="Laporan Netralitas ASN"
        subTitle="Rumah ASN Lapor Netralitas"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/">
                  <a>Beranda</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/netralitas/check">
                  <a>Cek Laporan Netralitas</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Buat Laporan Netralitas</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <Form onFinish={handleFinish} form={form} layout="vertical">
          <Row gutter={[32, 32]}>
            <Col md={12} xs={24}>
              <Form.Item
                name="nama_pelapor"
                label="Nama"
                rules={[
                  {
                    required: true,
                    message: "Nama Pelapor tidak boleh kosong",
                  },
                ]}
              >
                <Input placeholder="Nama" />
              </Form.Item>
              <Form.Item
                name="pekerjaan_pelapor"
                label="Pekerjaan"
                rules={[
                  {
                    required: true,
                    message: "Pekerjaan Pelapor tidak boleh kosong",
                  },
                ]}
              >
                <Input placeholder="Pekerjaan" />
              </Form.Item>
              <Form.Item name="nip_pelapor" label="NIP">
                <Input placeholder="NIP" />
              </Form.Item>
              <Form.Item name="jabatan_instansi_pelapor" label="Instansi">
                <Input placeholder="Instansi" />
              </Form.Item>
              <Form.Item
                name="no_hp_pelapor"
                label="Nomer HP"
                rules={[
                  {
                    required: true,
                    message: "Nomer HP Pelapor tidak boleh kosong",
                  },
                  {
                    pattern: new RegExp(/^[0-9]+$/),
                    message: "Nomer HP tidak valid",
                  },
                ]}
              >
                <Input placeholder="Nomor HP" />
              </Form.Item>
              <Form.Item
                name="email_pelapor"
                label="Email"
                rules={[
                  {
                    required: true,
                    message: "Email Pelapor tidak boleh kosong",
                  },
                  {
                    type: "email",
                    message: "Email tidak valid",
                  },
                ]}
              >
                <Input placeholder="Email" />
              </Form.Item>
              <Form.Item
                name="alamat_pelapor"
                label="Alamat"
                rules={[
                  {
                    required: true,
                    message: "Alamat Pelapor tidak boleh kosong",
                  },
                ]}
              >
                <Input.TextArea placeholder="Alamat Pelapor" />
              </Form.Item>
            </Col>
            <Col md={12} xs={24}>
              <Form.Item
                label="Nama Terlapor"
                name="nama_terlapor"
                rules={[
                  {
                    required: true,
                    message: "Nama Terlapor tidak boleh kosong",
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item label="NIP Terlapor" name="nip_terlapor">
                <Input />
              </Form.Item>
              <Form.Item
                label="Jabatan/Instansi Terlapor"
                name="jabatan_instansi_terlapor"
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Laporan"
                name="laporan"
                rules={[
                  { required: true, message: "Laporan Tidak boleh kosong" },
                ]}
              >
                <Input.TextArea />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="bukti_dukung"
            label="Bukti Dukung"
            rules={[{ required: true, message: "tidak boleh kosong" }]}
          >
            <Upload
              accept={acceptFile}
              multiple
              showUploadList={{
                downloadIcon: false,
                previewIcon: false,
                removeIcon: false,
                showDownloadIcon: false,
                showPreviewIcon: false,
              }}
            >
              <Button>Upload</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <ReCAPTCHA
              ref={recaptchaRef}
              onChange={setCaptcha}
              sitekey={data.siteKey}
            />
          </Form.Item>
          <Form.Item>
            <Button
              loading={isLoading}
              disabled={isLoading}
              type="primary"
              htmlType="submit"
            >
              Submit Laporan
            </Button>
          </Form.Item>
        </Form>
      </PageContainer>
    </>
  );
}

export const getServerSideProps = async (ctx) => {
  const siteKey = process.env.RECAPTCHA_SITE_KEY;
  return {
    props: {
      data: { siteKey },
    },
  };
};

export default Netralitas;

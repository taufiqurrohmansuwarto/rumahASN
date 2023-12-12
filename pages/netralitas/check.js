import InformasiNetralitas from "@/components/LaporNetralitas/InformasiNetralitas";
import PageContainer from "@/components/PageContainer";
import { searchByKodeNetralitas } from "@/services/netralitas.services";
import { useMutation } from "@tanstack/react-query";
import { Breadcrumb, Button, Divider, Empty, Form, Input, message } from "antd";
import Link from "next/link";
import React from "react";
import ReCAPTCHA from "react-google-recaptcha";

const CheckNetralitas = ({ data }) => {
  const recaptchaRef = React.useRef();
  const [currentData, setCurrentData] = React.useState(null);

  const [form] = Form.useForm();
  const [captcha, setCaptcha] = React.useState(null);
  const { mutate, isLoading } = useMutation(
    (value) => searchByKodeNetralitas(value),
    {
      onSuccess: (data) => {
        setCurrentData(data);
      },
      onError: () => {
        message.error("Gagal mengirim laporan");
      },
      onSettled: () => {
        form.resetFields();
        setCaptcha(null);
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
      },
    }
  );

  const handleFinish = async (values) => {
    const { kode_laporan } = values;

    if (captcha === null) {
      message.error("Captcha harus diisi");
    } else {
      const payload = {
        kode: kode_laporan,
        captcha,
      };
      mutate(payload);
    }
  };

  return (
    <>
      <PageContainer
        title="Cek Laporan Netralitas"
        content="Cek laporan netralitas yang telah anda buat"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/">
                  <a>Beranda</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/netralitas">
                  <a>Buat Laporan Netralitas</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Cek Laporan Netralitas</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <Form onFinish={handleFinish} form={form} layout="vertical">
          <Form.Item
            name="kode_laporan"
            rules={[
              {
                required: true,
                message: "Kode Laporan tidak boleh kosong",
              },
            ]}
            label="Kode Laporan"
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={data?.siteKey}
              onChange={setCaptcha}
            />
          </Form.Item>
          <Form.Item>
            <Button
              loading={isLoading}
              disabled={isLoading}
              htmlType="submit"
              type="primary"
            >
              Cari Laporan
            </Button>
          </Form.Item>
        </Form>
        <Divider />
        {currentData ? (
          <>
            <InformasiNetralitas data={currentData} />
          </>
        ) : (
          <Empty />
        )}
      </PageContainer>
    </>
  );
};

export const getServerSideProps = async (ctx) => {
  const siteKey = process.env.RECAPTCHA_SITE_KEY;
  return {
    props: {
      data: { siteKey },
    },
  };
};

export default CheckNetralitas;

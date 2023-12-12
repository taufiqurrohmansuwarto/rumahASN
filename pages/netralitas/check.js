import { Button, Form, Input } from "antd";
import ReCAPTCHA from "react-google-recaptcha";
import React from "react";
import PageContainer from "@/components/PageContainer";

const CheckNetralitas = ({ data }) => {
  const recaptchaRef = React.useRef();

  const [form] = Form.useForm();
  const [captcha, setCaptcha] = React.useState(null);

  const handleFinish = async (values) => {
    const { kode_laporan } = values;

    if (captcha === null) {
      message.error("Captcha harus diisi");
    } else {
      const payload = {
        kode_laporan,
        captcha,
      };
      alert(JSON.stringify(payload));
    }
  };

  return (
    <>
      <PageContainer>
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
            <Button htmlType="submit" type="primary">
              Cari Laporan
            </Button>
          </Form.Item>
        </Form>
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

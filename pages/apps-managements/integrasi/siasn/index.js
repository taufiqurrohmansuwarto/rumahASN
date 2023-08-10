import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { Button, Card, Form, Input } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

const IntegrasiSIASN = () => {
  const router = useRouter();
  const [form] = Form.useForm();

  const handleFinish = async () => {
    const values = await form.validateFields();
    router.push(`/apps-managements/integrasi/siasn/${values.nip}`);
  };

  return (
    <>
      <Head>
        <title>Integrasi SIASN</title>
      </Head>
      <PageContainer
        title="Data Integrasi SIASN"
        subTitle="Integrasi SIASN - SIMASTER"
        onBack={() => router.back()}
      >
        <Card>
          <Form
            layout="vertical"
            form={form}
            name="form cari siasn"
            onFinish={handleFinish}
          >
            <Form.Item
              normalize={(values) => values.replace(/\s/g, "")}
              rules={[
                { min: 18, message: "NIP harus 18 karakter" },
                { required: true, message: "Harus diisi" },
              ]}
              name="nip"
              label="Nomer Induk Pegawai"
            >
              <Input />
            </Form.Item>
            <Form.Item>
              <Button htmlType="submit" type="primary">
                Cari
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </PageContainer>
    </>
  );
};

IntegrasiSIASN.getLayout = function (page) {
  return <Layout>{page}</Layout>;
};

IntegrasiSIASN.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default IntegrasiSIASN;

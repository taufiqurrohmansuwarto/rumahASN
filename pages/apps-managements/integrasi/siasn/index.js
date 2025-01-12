import EmployeesTableAdmin from "@/components/Fasilitator/EmployeesTableAdmin";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { Stack } from "@mantine/core";
import { Breadcrumb, Button, Card, Divider, Form, Grid, Input } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const IntegrasiSIASN = () => {
  const router = useRouter();
  const [form] = Form.useForm();

  const breakPoint = Grid.useBreakpoint();

  useScrollRestoration();

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
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        title="Data Integrasi SIASN"
        content="Integrasi SIASN - SIMASTER"
        onBack={() => router.back()}
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/apps-managements/logs/siasn">Log SIASN</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Integrasi SIASN</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <Stack>
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
            <Divider />
            <EmployeesTableAdmin />
          </Card>
        </Stack>
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

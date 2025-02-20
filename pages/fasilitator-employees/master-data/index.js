import EmployeesTable from "@/components/Fasilitator/EmployeesTable";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { downloadDataAnomaliFasilitator } from "@/services/anomali.services";
import {
  downloadDataIPASN,
  downloadEmployees,
} from "@/services/master.services";
import { Stack } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import {
  Breadcrumb,
  Card,
  FloatButton,
  Form,
  Grid,
  Space,
  message,
} from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const FasilitatorEmployees = () => {
  useScrollRestoration();
  const breakPoint = Grid.useBreakpoint();

  const router = useRouter();
  const [form] = Form.useForm();

  const handleFinish = async () => {
    const values = await form.validateFields();
    router.push(`/fasilitator-employees/master-data/${values.nip}`);
  };

  const { mutateAsync: download, isLoading: isLoadingDownload } = useMutation(
    (data) => downloadDataAnomaliFasilitator(data),
    {}
  );

  const { mutateAsync: downloadIPASN, isLoading: isLoadingDownloadIPASN } =
    useMutation(() => downloadDataIPASN(), {});

  const { mutateAsync: downloadPegawai, isLoading: isLoadingDownloadPegawai } =
    useMutation(() => downloadEmployees(), {});

  const handleDownloadIPASN = async () => {
    try {
      const data = await downloadIPASN();

      if (data) {
        const blob = new Blob([data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "data_ipasn.xlsx";
        link.click();

        URL.revokeObjectURL(url);
      }
    } catch (error) {
      message.error("Gagal mendownload data");
    }
  };

  const handleDownloadPegawai = async () => {
    try {
      const data = await downloadPegawai();

      if (data) {
        const blob = new Blob([data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "data_komparasi_pegawai.xlsx";
        link.click();

        URL.revokeObjectURL(url);
      }
    } catch (error) {
      message.error("Gagal mendownload data");
    }
  };

  const handleDownload = async () => {
    try {
      const data = await download();

      if (data) {
        const blob = new Blob([data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "data_anomali_fasilitator.xlsx";
        link.click();

        URL.revokeObjectURL(url);
      }

      message.success("Berhasil mendownload data");
    } catch (error) {
      message.error("Gagal mendownload data");
    }
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - Master Data - Fasilitator SIMASTER</title>
      </Head>
      <PageContainer
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">Forum Kepegawaian</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Data ASN</Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/fasilitator-employees/daftar-usulan-kenaikan-pangkat">
                  Usulan Kenaikan Pangkat
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/fasilitator-employees/daftar-usulan-pensiun">
                  Usulan Pensiun
                </Link>
              </Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        title={null}
      >
        <FloatButton.BackTop />

        <Stack>
          <Card title="Data ASN Perangkat Daerah">
            {/* <Button
          disabled={isLoadingDownload}
          loading={isLoadingDownload}
          onClick={handleDownload}
        >
          Unduh Data Anomali
        </Button> */}
            <Space>
              {/* <Button
              disabled={isLoadingDownloadIPASN}
              loading={isLoadingDownloadIPASN}
              onClick={handleDownloadIPASN}
              type="primary"
            >
              Unduh Data IPASN
            </Button>
            <Button
              disabled={isLoadingDownloadPegawai}
              loading={isLoadingDownloadPegawai}
              onClick={handleDownloadPegawai}
              type="primary"
            >
              Unduh Data Komparasi
            </Button> */}
            </Space>
            {/* <Form
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
              help="Masukkan NIP pegawai sesuai dengan perangkat daerah"
              label="Nomer Induk Pegawai"
            >
              <Input />
            </Form.Item>
            <Form.Item>
              <Button htmlType="submit" type="primary">
                Cari
              </Button>
            </Form.Item>
          </Form> */}
            <EmployeesTable />
          </Card>
        </Stack>
      </PageContainer>
    </>
  );
};

FasilitatorEmployees.Auth = {
  action: "manage",
  subject: "Feeds",
};

FasilitatorEmployees.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default FasilitatorEmployees;

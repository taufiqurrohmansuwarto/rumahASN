import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { downloadDataAnomaliFasilitator } from "@/services/anomali.services";
import { useMutation } from "@tanstack/react-query";
import { Button, message, Form, Input, Card } from "antd";
import { useRouter } from "next/router";

const FasilitatorEmployees = () => {
  const router = useRouter();
  const [form] = Form.useForm();

  const handleFinish = async () => {
    const values = await form.validateFields();
    router.push(`/fasilitator-employees/${values.nip}`);
  };

  const { mutateAsync: download, isLoading: isLoadingDownload } = useMutation(
    (data) => downloadDataAnomaliFasilitator(data),
    {}
  );

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
    <PageContainer title="Fasilitator SIMASTER" content="Integrasi SIASN">
      <Card>
        <Button
          disabled={isLoadingDownload}
          loading={isLoadingDownload}
          onClick={handleDownload}
        >
          Unduh Data Anomali
        </Button>
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
        </Form>
      </Card>
    </PageContainer>
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

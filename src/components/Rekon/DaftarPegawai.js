import { Button, Form, Input } from "antd";
import { useRouter } from "next/router";
const DaftarPegawai = () => {
  const router = useRouter();

  const handleFinish = (values) => {
    // router.push(`/rekon/pegawai/${values.nip}`);
  };

  const [form] = Form.useForm();

  return (
    <>
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
    </>
  );
};

export default DaftarPegawai;

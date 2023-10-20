import {
  dataUtamaSIASN,
  updateDataUtamaSIASN,
} from "@/services/siasn-services";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Skeleton,
  Space,
  message,
} from "antd";
import { useEffect } from "react";

const RiwayatUbahData = () => {
  const { data, isLoading } = useQuery(["data-utama-siasn"], () =>
    dataUtamaSIASN()
  );

  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { mutateAsync: update, isLoading: isLoadingUpdate } = useMutation(
    (data) => updateDataUtamaSIASN(data),
    {
      onSuccess: () => {
        message.success("Berhasil mengubah data");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["data-utama-siasn"]);
      },
    }
  );

  const handleSubmit = async () => {
    try {
      const value = await form.validateFields();

      Modal.confirm({
        title: "Apakah anda yakin?",
        content:
          "Data yang telah diubah membutuhkan waktu 2x24 jam untuk sinkronisasi data",
        centered: true,
        onOk: async () => {
          await update({
            email: value?.email,
            email_gov: value?.email_gov,
            nomor_bpjs: value?.nomor_bpjs,
            nomor_hp: value?.nomor_hp,
            nomor_telepon: value?.nomor_telepon,
            alamat: value?.alamat,
          });
        },
      });
    } catch (error) {
      message.error(
        "Gagal mengubah data! Pastikan data yang anda masukkan benar"
      );
    }
  };

  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        email: data?.email,
        email_gov: data?.emailGov,
        alamat: data?.alamat,
        nomor_bpjs: data?.bpjs,
        nomor_npwp: data?.noNpwp,
      });
    }
  }, [data, form]);

  const handleReset = () => {
    form.setFieldsValue({
      email: data?.email,
      email_gov: data?.emailGov,
      alamat: data?.alamat,
      nomor_hp: data?.noHp,
      nomor_telepon: data?.noTelp,
      nomor_bpjs: data?.bpjs,
      nomor_npwp: data?.noNpwp,
    });
  };

  return (
    <Skeleton loading={isLoading}>
      <Card>
        <Form form={form} layout="vertical">
          <Form.Item
            rules={[
              {
                type: "email",
              },
            ]}
            label="Email SIASN"
            name="email"
          >
            <Input />
          </Form.Item>
          <Form.Item
            rules={[
              {
                type: "email",
              },
            ]}
            label="Email Instansi"
            name="email_gov"
          >
            <Input />
          </Form.Item>
          {/* <Form.Item
            rules={[
              {
                pattern: new RegExp(/^((\+62)|0)[8-9][0-9]{7,11}$/),
              },
            ]}
            help="Contoh: 081234567890"
            label="No. HP"
            name="nomor_hp"
          >
            <Input />
          </Form.Item>
          <Form.Item
            rules={[
              {
                message: "A value must be entered",
                pattern: new RegExp(/^((\+62)|0)[8-9][0-9]{7,11}$/),
              },
            ]}
            help="Contoh: 081234567890"
            label="No. Telephone"
            name="nomor_telepon"
          >
            <Input />
          </Form.Item> */}
          <Form.Item label="Alamat" name="alamat">
            <Input.TextArea />
          </Form.Item>
          <Form.Item label="Nomor BPJS" name="nomor_bpjs">
            <Input />
          </Form.Item>
          <Form.Item label="Nomor NPWP" name="nomor_npwp">
            <Input />
          </Form.Item>
          <Space>
            <Button onClick={handleSubmit} type="primary">
              Submit
            </Button>
            <Button onClick={handleReset}>Reset</Button>
          </Space>
        </Form>
      </Card>
    </Skeleton>
  );
};

export default RiwayatUbahData;

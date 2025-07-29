import {
  dataUtamSIASNByNip,
  updateDataUtamaByNip,
} from "@/services/siasn-services";
import { ReloadOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, DatePicker, Flex, Form, Input, message, Select } from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useEffect } from "react";

const kelasJabatan = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
];

const CompareUbahDataByNip = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const { nip } = router?.query;

  const queryClient = useQueryClient();

  const { mutate: update, isLoading: isUpdating } = useMutation(
    (data) => updateDataUtamaByNip(data),
    {
      onSuccess: () => {
        message.success("Data berhasil diupdate");
        queryClient.invalidateQueries({ queryKey: ["data-utama-siasn", nip] });
      },
      onError: (error) => {
        message.error(error?.response?.data?.message);
      },
    }
  );

  const { data, isLoading, isFetching, refetch } = useQuery(
    ["data-utama-siasn", nip],
    () => dataUtamSIASNByNip(nip),
    {
      refetchOnWindowFocus: false,
    }
  );

  const handleUpdate = async () => {
    const value = await form.validateFields();
    const payload = {
      nip,
      data: {
        email_gov: value?.email_gov || "",
        nomor_bpjs: value?.nomor_bpjs || "",
        nomor_hp: value?.nomor_hp || "",
        nomor_telepon: value?.nomor_telepon || "",
        alamat: value?.alamat || "",
        nomor_npwp: value?.nomor_npwp || "",
        npwp_tanggal:
          value?.npwp_tanggal && dayjs(value?.npwp_tanggal).isValid()
            ? dayjs(value?.npwp_tanggal).format("DD-MM-YYYY")
            : "",
        kelas_jabatan: value?.kelas_jabatan?.toString() || "",
        tapera_nomor: value?.tapera_nomor || "",
        taspen_nomor: value?.taspen_nomor || "",
        tanggal_taspen:
          value?.tanggal_taspen && dayjs(value?.tanggal_taspen).isValid()
            ? dayjs(value?.tanggal_taspen).format("DD-MM-YYYY")
            : "",
      },
    };

    update(payload);
  };

  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        email_gov: data?.emailGov,
        alamat: data?.alamat,
        nomor_bpjs: data?.bpjs,
        nomor_npwp: data?.noNpwp,
        nomor_hp: data?.noHp,
        nomor_telepon: data?.noTelp,
        kelas_jabatan: data?.kelas_jabatan,
        tapera_nomor: data?.tapera_nomor,
        taspen_nomor: data?.taspen_nomor,
        npwp_tanggal:
          data?.tglNpwp && dayjs(data?.tglNpwp).isValid()
            ? dayjs(data?.tglNpwp)
            : null,
        taspen_nomor: data?.noTaspen,
        tanggal_taspen:
          data?.tglTaspen && dayjs(data?.tglTaspen).isValid()
            ? dayjs(data?.tglTaspen)
            : null,
      });
    }
  }, [data, form]);

  const handleRefetch = () => {
    refetch();
  };

  return (
    <>
      <Flex justify="end">
        <Button
          type="link"
          icon={<ReloadOutlined />}
          onClick={handleRefetch}
          loading={isFetching}
        >
          Refresh
        </Button>
      </Flex>
      <Form onFinish={handleUpdate} form={form} layout="vertical">
        <Form.Item label="Email" name="email_gov">
          <Input disabled />
        </Form.Item>
        <Form.Item label="Alamat" name="alamat">
          <Input.TextArea />
        </Form.Item>
        <Form.Item label="Nomor BPJS" name="nomor_bpjs">
          <Input />
        </Form.Item>
        <Form.Item label="Nomor NPWP" name="nomor_npwp">
          <Input />
        </Form.Item>
        <Form.Item label="Tanggal NPWP" name="npwp_tanggal">
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="Nomor HP" name="nomor_hp">
          <Input />
        </Form.Item>
        <Form.Item label="Nomor Telepon" name="nomor_telepon">
          <Input />
        </Form.Item>
        <Form.Item label="Nomor Tapera" name="tapera_nomor">
          <Input />
        </Form.Item>
        <Form.Item label="Nomor Taspen" name="taspen_nomor">
          <Input />
        </Form.Item>
        <Form.Item label="Kelas Jabatan" name="kelas_jabatan">
          <Select
            options={kelasJabatan.map((item) => ({
              label: `Kelas ${item}`,
              value: item,
            }))}
          />
        </Form.Item>
        <Form.Item label="Tanggal Taspen" name="tanggal_taspen">
          <DatePicker format="DD-MM-YYYY" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item>
          <Button
            loading={isUpdating}
            disabled={isUpdating}
            htmlType="submit"
            type="primary"
          >
            Submit
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default CompareUbahDataByNip;

import {
  dataUtamSIASNByNip,
  updateDataUtamaByNip,
} from "@/services/siasn-services";
import { Flex, Stack, Text } from "@mantine/core";
import {
  IconBriefcase,
  IconBuildingBank,
  IconCash,
  IconDeviceMobile,
  IconHome,
  IconMail,
  IconPhone,
  IconReceipt,
  IconRefresh,
  IconShieldCheck,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  Row,
  Select,
} from "antd";
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

  const { data, isFetching, refetch } = useQuery(
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
        tanggal_taspen:
          data?.tglTaspen && dayjs(data?.tglTaspen).isValid()
            ? dayjs(data?.tglTaspen)
            : null,
      });
    }
  }, [data, form]);

  return (
    <Stack spacing={12}>
      <Flex justify="end">
        <Button
          size="small"
          icon={<IconRefresh size={14} />}
          onClick={() => refetch()}
          loading={isFetching}
        >
          Refresh
        </Button>
      </Flex>

      <Form onFinish={handleUpdate} form={form} layout="vertical" size="small">
        {/* Kontak */}
        <Flex align="center" gap={6} mb={8}>
          <IconDeviceMobile size={14} />
          <Text size="xs" fw={600}>
            Kontak
          </Text>
        </Flex>
        <Row gutter={[12, 8]}>
          <Col span={12}>
            <Text
              size="xs"
              fw={500}
              style={{ display: "block", marginBottom: 4 }}
            >
              Email
            </Text>
            <Form.Item name="email_gov" style={{ marginBottom: 0 }}>
              <Input size="small" disabled prefix={<IconMail size={14} />} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Text
              size="xs"
              fw={500}
              style={{ display: "block", marginBottom: 4 }}
            >
              Nomor HP
            </Text>
            <Form.Item name="nomor_hp" style={{ marginBottom: 0 }}>
              <Input size="small" prefix={<IconDeviceMobile size={14} />} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Text
              size="xs"
              fw={500}
              style={{ display: "block", marginBottom: 4 }}
            >
              Nomor Telepon
            </Text>
            <Form.Item name="nomor_telepon" style={{ marginBottom: 0 }}>
              <Input size="small" prefix={<IconPhone size={14} />} />
            </Form.Item>
          </Col>
        </Row>

        <div style={{ marginTop: 8 }}>
          <Text
            size="xs"
            fw={500}
            style={{ display: "block", marginBottom: 4 }}
          >
            Alamat
          </Text>
          <Form.Item name="alamat" style={{ marginBottom: 0 }}>
            <Input.TextArea
              size="small"
              rows={2}
              placeholder="Alamat lengkap"
            />
          </Form.Item>
        </div>

        {/* NPWP & BPJS */}
        <Flex align="center" gap={6} mt={12} mb={8}>
          <IconReceipt size={14} />
          <Text size="xs" fw={600}>
            NPWP & BPJS
          </Text>
        </Flex>
        <Row gutter={[12, 8]}>
          <Col span={8}>
            <Text
              size="xs"
              fw={500}
              style={{ display: "block", marginBottom: 4 }}
            >
              Nomor NPWP
            </Text>
            <Form.Item name="nomor_npwp" style={{ marginBottom: 0 }}>
              <Input size="small" prefix={<IconReceipt size={14} />} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Text
              size="xs"
              fw={500}
              style={{ display: "block", marginBottom: 4 }}
            >
              Tanggal NPWP
            </Text>
            <Form.Item name="npwp_tanggal" style={{ marginBottom: 0 }}>
              <DatePicker
                size="small"
                format="DD-MM-YYYY"
                style={{ width: "100%" }}
                placeholder="Pilih tanggal"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Text
              size="xs"
              fw={500}
              style={{ display: "block", marginBottom: 4 }}
            >
              Nomor BPJS
            </Text>
            <Form.Item name="nomor_bpjs" style={{ marginBottom: 0 }}>
              <Input size="small" prefix={<IconShieldCheck size={14} />} />
            </Form.Item>
          </Col>
        </Row>

        {/* Tapera & Taspen */}
        <Flex align="center" gap={6} mt={12} mb={8}>
          <IconBuildingBank size={14} />
          <Text size="xs" fw={600}>
            Tapera & Taspen
          </Text>
        </Flex>
        <Row gutter={[12, 8]}>
          <Col span={8}>
            <Text
              size="xs"
              fw={500}
              style={{ display: "block", marginBottom: 4 }}
            >
              Nomor Tapera
            </Text>
            <Form.Item name="tapera_nomor" style={{ marginBottom: 0 }}>
              <Input size="small" prefix={<IconHome size={14} />} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Text
              size="xs"
              fw={500}
              style={{ display: "block", marginBottom: 4 }}
            >
              Nomor Taspen
            </Text>
            <Form.Item name="taspen_nomor" style={{ marginBottom: 0 }}>
              <Input size="small" prefix={<IconCash size={14} />} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Text
              size="xs"
              fw={500}
              style={{ display: "block", marginBottom: 4 }}
            >
              Tanggal Taspen
            </Text>
            <Form.Item name="tanggal_taspen" style={{ marginBottom: 0 }}>
              <DatePicker
                size="small"
                format="DD-MM-YYYY"
                style={{ width: "100%" }}
                placeholder="Pilih tanggal"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Jabatan */}
        <Flex align="center" gap={6} mt={12} mb={8}>
          <IconBriefcase size={14} />
          <Text size="xs" fw={600}>
            Jabatan
          </Text>
        </Flex>
        <Row gutter={[12, 8]}>
          <Col span={8}>
            <Text
              size="xs"
              fw={500}
              style={{ display: "block", marginBottom: 4 }}
            >
              Kelas Jabatan
            </Text>
            <Form.Item name="kelas_jabatan" style={{ marginBottom: 0 }}>
              <Select
                size="small"
                placeholder="Pilih kelas"
                options={kelasJabatan.map((item) => ({
                  label: `Kelas ${item}`,
                  value: item,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Flex justify="end" mt={16}>
          <Button
            loading={isUpdating}
            disabled={isUpdating}
            htmlType="submit"
            type="primary"
            size="small"
          >
            Simpan
          </Button>
        </Flex>
      </Form>
    </Stack>
  );
};

export default CompareUbahDataByNip;

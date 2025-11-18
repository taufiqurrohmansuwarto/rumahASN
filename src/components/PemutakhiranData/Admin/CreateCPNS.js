import { createCpns, dataPangkatByNip } from "@/services/siasn-services";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import UploadDokumenSIASN from "@/components/PemutakhiranData/Admin/UploadDokumenSIASN";
import {
  Button,
  Modal,
  Form,
  Input,
  message,
  DatePicker,
  Skeleton,
  Row,
  Col,
  Divider,
} from "antd";
import { Text, Badge, Stack, Group, Alert, Flex } from "@mantine/core";
import {
  IconFileDownload,
  IconBolt,
  IconCalendar,
  IconEdit,
  IconInfoCircle,
  IconFileText,
} from "@tabler/icons-react";
import React, { useState, useEffect } from "react";

const dayjs = require("dayjs");
require("dayjs/locale/id");

const format = "DD-MM-YYYY";

const dataPNS = (pangkat) =>
  pangkat?.find((d) => d?.jenis_kp_id === "12" || d?.jenis_kp_id === 12);
const dataCPNS = (pangkat) =>
  pangkat?.find((d) => d?.jenis_kp_id === "11" || d?.jenis_kp_id === 11);

const CreateModal = ({
  open,
  onCancel,
  form,
  isLoading,
  onSubmit,
  dataPangkat,
  isLoadingPangkat,
}) => {
  const gotoSKPNS = () => {
    window.open(
      `${dataPNS(dataPangkat?.pangkat_simaster)?.file_pangkat}`,
      "_blank"
    );
  };

  const gotoSKCPNS = () => {
    window.open(
      `${dataCPNS(dataPangkat?.pangkat_simaster)?.file_pangkat}`,
      "_blank"
    );
  };

  const setIsianForm = () => {
    form.setFieldsValue({
      nomor_sk_pns: dataPNS(dataPangkat?.pangkat_simaster)?.no_sk,
      tgl_sk_pns: dayjs(dataPNS(dataPangkat?.pangkat_simaster)?.tgl_sk, format),
      nomor_sk_cpns: dataCPNS(dataPangkat?.pangkat_simaster)?.no_sk,
      tgl_sk_cpns: dayjs(
        dataCPNS(dataPangkat?.pangkat_simaster)?.tgl_sk,
        format
      ),
    });
    message.success("Data berhasil diisi otomatis dari SIMASTER");
  };

  return (
    <Modal
      destroyOnClose={true}
      centered
      onOk={onSubmit}
      confirmLoading={isLoading}
      title={
        <Group gap="xs">
          <IconEdit size={16} color="#1890ff" />
          <Text fw={600} size="sm">
            Ubah Status ke PNS
          </Text>
        </Group>
      }
      open={open}
      onCancel={onCancel}
      width={700}
      okText="Simpan"
      cancelText="Batal"
    >
      <Skeleton loading={isLoadingPangkat}>
        <Stack gap="sm">
          {/* Action Buttons */}
          <Flex justify="space-between" align="center">
            <Text size="xs" fw={600}>
              Aksi Cepat
            </Text>
          </Flex>
          <Row gutter={[8, 8]}>
            <Col xs={24} sm={8}>
              <Button
                type="primary"
                icon={<IconBolt size={14} />}
                onClick={setIsianForm}
                block
                size="small"
                disabled={isLoadingPangkat}
              >
                Isi Otomatis
              </Button>
            </Col>
            <Col xs={24} sm={8}>
              <Button
                icon={<IconFileDownload size={14} />}
                onClick={gotoSKPNS}
                block
                size="small"
                disabled={!dataPNS(dataPangkat?.pangkat_simaster)?.file_pangkat}
              >
                SK PNS
              </Button>
            </Col>
            <Col xs={24} sm={8}>
              <Button
                icon={<IconFileDownload size={14} />}
                onClick={gotoSKCPNS}
                block
                size="small"
                disabled={
                  !dataCPNS(dataPangkat?.pangkat_simaster)?.file_pangkat
                }
              >
                SK CPNS
              </Button>
            </Col>
          </Row>

          {/* Referensi Info - Compact */}
          <Group gap={4} mb={8}>
            <IconInfoCircle size={12} color="#1890ff" />
            <Text size="xs" c="dimmed">
              Ref SIMASTER - PNS:{" "}
              {dataPNS(dataPangkat?.pangkat_simaster)?.no_sk || "-"} | CPNS:{" "}
              {dataCPNS(dataPangkat?.pangkat_simaster)?.no_sk || "-"}
            </Text>
          </Group>

          <Divider style={{ margin: "8px 0" }} />
        </Stack>

        {/* Form Section */}
        <Form form={form} layout="vertical" size="small">
          {/* SK PNS Section */}
          <Badge color="green" size="sm" mb={6} variant="light">
            SK PNS
          </Badge>
          <Row gutter={[12, 8]}>
            <Col xs={24} md={12}>
              <Text
                size="xs"
                fw={500}
                style={{ display: "block", marginBottom: 4 }}
              >
                Nomor SK PNS
              </Text>
              <Form.Item
                name="nomor_sk_pns"
                rules={[{ required: true, message: "Wajib diisi" }]}
                style={{ marginBottom: 0 }}
              >
                <Input
                  size="small"
                  placeholder="Nomor SK PNS"
                  prefix={<IconFileText size={14} />}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Text
                size="xs"
                fw={500}
                style={{ display: "block", marginBottom: 4 }}
              >
                Tanggal SK PNS
              </Text>
              <Form.Item
                name="tgl_sk_pns"
                rules={[{ required: true, message: "Wajib diisi" }]}
                style={{ marginBottom: 0 }}
              >
                <DatePicker
                  size="small"
                  format={format}
                  placeholder="Pilih tanggal"
                  style={{ width: "100%" }}
                  suffixIcon={<IconCalendar size={14} />}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: "12px 0" }} />

          {/* SK CPNS Section */}
          <Badge color="orange" size="sm" mb={6} variant="light">
            SK CPNS
          </Badge>
          <Row gutter={[12, 8]}>
            <Col xs={24} md={12}>
              <Text
                size="xs"
                fw={500}
                style={{ display: "block", marginBottom: 4 }}
              >
                Nomor SK CPNS
              </Text>
              <Form.Item
                name="nomor_sk_cpns"
                rules={[{ required: true, message: "Wajib diisi" }]}
                style={{ marginBottom: 0 }}
              >
                <Input
                  size="small"
                  placeholder="Nomor SK CPNS"
                  prefix={<IconFileText size={14} />}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Text
                size="xs"
                fw={500}
                style={{ display: "block", marginBottom: 4 }}
              >
                Tanggal SK CPNS
              </Text>
              <Form.Item
                name="tgl_sk_cpns"
                rules={[{ required: true, message: "Wajib diisi" }]}
                style={{ marginBottom: 0 }}
              >
                <DatePicker
                  size="small"
                  format={format}
                  placeholder="Pilih tanggal"
                  style={{ width: "100%" }}
                  suffixIcon={<IconCalendar size={14} />}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Skeleton>
    </Modal>
  );
};

function CreateCPNS({ nip, data }) {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const { data: dataPangkat, isLoading: isLoadingPangkat } = useQuery(
    ["data-riwayat-pangkat", nip],
    () => dataPangkatByNip(nip),
    {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      staleTime: 500000,
    }
  );

  const queryClient = useQueryClient();

  const handleCreate = () => {
    setOpen(true);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  useEffect(() => {
    form.setFieldsValue({
      nomor_sk_pns: data?.nomorSkPns,
      tgl_sk_pns: dayjs(data?.tglSkPns, format),
      nomor_sk_cpns: data?.nomorSkCpns,
      tgl_sk_cpns: dayjs(data?.tglSkCpns, format),
    });
  }, [data, form]);

  const { mutate, isLoading } = useMutation((data) => createCpns(data), {
    onSuccess: () => {
      message.success("Berhasil mengubah status ke PNS");
      queryClient.invalidateQueries({
        queryKey: ["data-utama-siasn"],
      });
    },
    onError: (error) => {
      message.error(error?.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["data-utama-siasn"],
      });
      setOpen(false);
    },
  });

  const handleSubmit = async () => {
    const value = await form.validateFields();
    const payload = {
      nip,
      data: {
        ...value,
        tgl_sk_pns: value?.tgl_sk_pns?.format(format),
        tgl_sk_cpns: value?.tgl_sk_cpns?.format(format),
      },
    };
    mutate(payload);
  };

  return (
    <div style={{ marginTop: 12 }}>
      <Button
        type="primary"
        onClick={handleCreate}
        icon={<IconEdit size={16} />}
      >
        Ubah ke PNS
      </Button>
      <CreateModal
        dataPangkat={dataPangkat}
        isLoadingPangkat={isLoadingPangkat}
        open={open}
        onCancel={handleCancel}
        form={form}
        isLoading={isLoading}
        onSubmit={handleSubmit}
      />
      <UploadDokumenSIASN />
    </div>
  );
}

export default CreateCPNS;

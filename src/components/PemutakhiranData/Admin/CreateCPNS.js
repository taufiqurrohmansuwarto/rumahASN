import { createCpns, dataPangkatByNip } from "@/services/siasn-services";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  Button,
  Modal,
  Form,
  Input,
  message,
  DatePicker,
  Skeleton,
  Space,
  Card,
  Divider,
  Typography,
  Row,
  Col,
  Alert,
  Flex,
} from "antd";
import React, { useState, useEffect } from "react";
import {
  FileExcelOutlined,
  FormOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";

const dayjs = require("dayjs");
require("dayjs/locale/id");

const format = "DD-MM-YYYY";
const { Title, Text } = Typography;

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
        <Flex align="center" gap={12}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FormOutlined style={{ color: "white", fontSize: "18px" }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: "#1a1a1a" }}>
              🏛️ Ubah Status ke PNS
            </Title>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              Lengkapi data SK PNS dan CPNS
            </Text>
          </div>
        </Flex>
      }
      open={open}
      onCancel={onCancel}
      width={700}
      okText="Simpan Perubahan"
      cancelText="Batal"
    >
      <Skeleton loading={isLoadingPangkat}>
        <div style={{ marginBottom: "20px" }}>
          {/* Action Buttons */}
          <Card
            style={{
              marginBottom: "20px",
              borderRadius: "12px",
              border: "1px solid #e8e8e8",
            }}
          >
            <Flex align="center" gap={12} style={{ marginBottom: "16px" }}>
              <InfoCircleOutlined
                style={{ color: "#1890ff", fontSize: "16px" }}
              />
              <Text strong style={{ color: "#1a1a1a" }}>
                📋 Aksi Cepat
              </Text>
            </Flex>

            <Row gutter={[12, 12]}>
              <Col xs={24} sm={8}>
                <Button
                  type="primary"
                  icon={<ThunderboltOutlined />}
                  onClick={setIsianForm}
                  style={{
                    width: "100%",
                    borderRadius: "8px",
                    background:
                      "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                    borderColor: "#52c41a",
                    fontWeight: 600,
                  }}
                  disabled={isLoadingPangkat}
                >
                  Isi Otomatis
                </Button>
              </Col>
              <Col xs={24} sm={8}>
                <Button
                  type="default"
                  icon={<FileExcelOutlined />}
                  onClick={gotoSKPNS}
                  style={{
                    width: "100%",
                    borderRadius: "8px",
                    borderColor: "#1890ff",
                    color: "#1890ff",
                  }}
                  disabled={
                    !dataPNS(dataPangkat?.pangkat_simaster)?.file_pangkat
                  }
                >
                  Unduh SK PNS
                </Button>
              </Col>
              <Col xs={24} sm={8}>
                <Button
                  type="default"
                  icon={<FileExcelOutlined />}
                  onClick={gotoSKCPNS}
                  style={{
                    width: "100%",
                    borderRadius: "8px",
                    borderColor: "#fa8c16",
                    color: "#fa8c16",
                  }}
                  disabled={
                    !dataCPNS(dataPangkat?.pangkat_simaster)?.file_pangkat
                  }
                >
                  Unduh SK CPNS
                </Button>
              </Col>
            </Row>
          </Card>

          {/* Information Alert */}
          <Alert
            message="Informasi Data SIMASTER"
            description={
              <div>
                <Text strong>Data PNS:</Text>{" "}
                {dataPNS(dataPangkat?.pangkat_simaster)?.no_sk ||
                  "Tidak tersedia"}
                <br />
                <Text strong>Data CPNS:</Text>{" "}
                {dataCPNS(dataPangkat?.pangkat_simaster)?.no_sk ||
                  "Tidak tersedia"}
              </div>
            }
            type="info"
            showIcon
            style={{
              marginBottom: "20px",
              borderRadius: "8px",
            }}
          />
        </div>

        {/* Form Section */}
        <Card
          style={{
            borderRadius: "12px",
            border: "1px solid #e8e8e8",
          }}
        >
          <Flex align="center" gap={12} style={{ marginBottom: "20px" }}>
            <FormOutlined style={{ color: "#1890ff", fontSize: "16px" }} />
            <Text strong style={{ color: "#1a1a1a", fontSize: "16px" }}>
              📝 Form Input Data
            </Text>
          </Flex>

          <Form form={form} layout="vertical">
            <Row gutter={[16, 0]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label={
                    <Flex align="center" gap={8}>
                      <CalendarOutlined style={{ color: "#52c41a" }} />
                      <Text strong>Nomor SK PNS</Text>
                    </Flex>
                  }
                  name="nomor_sk_pns"
                  rules={[
                    {
                      required: true,
                      message: "Nomor SK PNS wajib diisi",
                    },
                  ]}
                >
                  <Input
                    placeholder="Masukkan nomor SK PNS"
                    style={{ borderRadius: "8px" }}
                  />
                </Form.Item>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  💡 Referensi:{" "}
                  {dataPNS(dataPangkat?.pangkat_simaster)?.no_sk ||
                    "Tidak tersedia"}
                </Text>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label={
                    <Flex align="center" gap={8}>
                      <CalendarOutlined style={{ color: "#52c41a" }} />
                      <Text strong>Tanggal SK PNS</Text>
                    </Flex>
                  }
                  name="tgl_sk_pns"
                  rules={[
                    {
                      required: true,
                      message: "Tanggal SK PNS wajib diisi",
                    },
                  ]}
                >
                  <DatePicker
                    format={format}
                    placeholder="Pilih tanggal SK PNS"
                    style={{ width: "100%", borderRadius: "8px" }}
                  />
                </Form.Item>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  💡 Referensi:{" "}
                  {dataPNS(dataPangkat?.pangkat_simaster)?.tgl_sk ||
                    "Tidak tersedia"}
                </Text>
              </Col>
            </Row>

            <Divider style={{ margin: "20px 0" }} />

            <Row gutter={[16, 0]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label={
                    <Flex align="center" gap={8}>
                      <CalendarOutlined style={{ color: "#fa8c16" }} />
                      <Text strong>Nomor SK CPNS</Text>
                    </Flex>
                  }
                  name="nomor_sk_cpns"
                  rules={[
                    {
                      required: true,
                      message: "Nomor SK CPNS wajib diisi",
                    },
                  ]}
                >
                  <Input
                    placeholder="Masukkan nomor SK CPNS"
                    style={{ borderRadius: "8px" }}
                  />
                </Form.Item>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  💡 Referensi:{" "}
                  {dataCPNS(dataPangkat?.pangkat_simaster)?.no_sk ||
                    "Tidak tersedia"}
                </Text>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label={
                    <Flex align="center" gap={8}>
                      <CalendarOutlined style={{ color: "#fa8c16" }} />
                      <Text strong>Tanggal SK CPNS</Text>
                    </Flex>
                  }
                  name="tgl_sk_cpns"
                  rules={[
                    {
                      required: true,
                      message: "Tanggal SK CPNS wajib diisi",
                    },
                  ]}
                >
                  <DatePicker
                    format={format}
                    placeholder="Pilih tanggal SK CPNS"
                    style={{ width: "100%", borderRadius: "8px" }}
                  />
                </Form.Item>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  💡 Referensi:{" "}
                  {dataCPNS(dataPangkat?.pangkat_simaster)?.tgl_sk ||
                    "Tidak tersedia"}
                </Text>
              </Col>
            </Row>
          </Form>
        </Card>
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
    <div style={{ marginTop: 16 }}>
      <Button type="primary" onClick={handleCreate}>
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
    </div>
  );
}

export default CreateCPNS;

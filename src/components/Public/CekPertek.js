import { cekPertekService } from "@/services/public.services";
import ASNAIInsight from "./ASNAIInsight";
import { Stack, Text, Group } from "@mantine/core";
import {
  IconUser,
  IconHash,
  IconBriefcase,
  IconBuilding,
  IconFileText,
  IconDownload,
  IconChecklist,
} from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import {
  Button,
  Col,
  Radio,
  Form,
  Input,
  message,
  Modal,
  Row,
  Skeleton,
  Space,
  Tooltip,
  Divider,
  Tag,
  Alert,
} from "antd";
import { useSession } from "next-auth/react";
import { useState } from "react";

const ShowData = ({ data }) => {
  const handleDownload = () => {
    const base64String = `data:application/pdf;base64,${data?.file}`;
    const a = document.createElement("a");
    a.href = base64String;
    a.download = "pertek.pdf";
    a.click();
  };

  const handleDownloadSk = () => {
    const base64String = `data:application/pdf;base64,${data?.fileSk}`;
    const a = document.createElement("a");
    a.href = base64String;
    a.download = "sk.pdf";
    a.click();
  };

  return (
    <Stack gap="sm">
      {/* Data Pertek */}
      <div>
        <Text size="sm" fw={600} mb={8} c="#fa8c16">
          Status Usulan
        </Text>
        <Row gutter={[16, 0]}>
          <Col lg={12} xs={24}>
            <DetailItem icon={IconUser} label="Nama" value={data.nama} />
            <DetailItem icon={IconHash} label="NIP" value={data.nip} />
          </Col>
          <Col lg={12} xs={24}>
            <DetailItem
              icon={IconFileText}
              label="Nomor Peserta"
              value={data.no_peserta}
            />
            <DetailItem
              icon={IconBriefcase}
              label="Jenis Formasi"
              value={data.jenis_formasi_nama}
            />
          </Col>
        </Row>

        <Divider style={{ margin: "10px 0" }} />

        <DetailItem
          icon={IconChecklist}
          label="Status"
          value={
            <Tag color="orange" style={{ padding: "2px 8px", fontSize: 12 }}>
              {data.status_usulan_nama}
            </Tag>
          }
        />
        <DetailItem
          icon={IconBuilding}
          label="Unit Organisasi"
          value={data.unor_siasn || "-"}
        />

        {/* Download Buttons */}
        {(data?.file || data?.fileSk) && (
          <>
            <Divider style={{ margin: "10px 0" }} />
            <Space size="small" wrap>
              {data?.file && (
                <Button
                  type="primary"
                  icon={<IconDownload size={16} />}
                  onClick={handleDownload}
                  size="small"
                >
                  Pertek
                </Button>
              )}
              {data?.fileSk && (
                <Button
                  icon={<IconDownload size={16} />}
                  onClick={handleDownloadSk}
                  size="small"
                >
                  SK
                </Button>
              )}
            </Space>
          </>
        )}
      </div>

      {/* AI Insight - Load separately */}
      <ASNAIInsight id={data?.id} />
    </Stack>
  );
};

const DetailItem = ({ icon: Icon, label, value }) => (
  <Group gap={8} align="flex-start" mb={8} wrap="nowrap">
    {Icon && (
      <div style={{ marginTop: 2 }}>
        <Icon size={16} color="#6b7280" />
      </div>
    )}
    <div style={{ flex: 1 }}>
      <Text size="xs" c="dimmed" mb={2}>
        {label}
      </Text>
      <Text size="sm" fw={500} style={{ color: "#1f2937" }}>
        {value || "-"}
      </Text>
    </div>
  </Group>
);

const ModalCekPertek = ({ open, onCancel }) => {
  const [form] = Form.useForm();
  const [data, setData] = useState(null);
  const [useSkck, setUseSkck] = useState(false);

  const { mutate, isLoading } = useMutation({
    mutationFn: (data) => cekPertekService(data),
    onSuccess: (data) => {
      setData(data);
    },
    onMutate: () => {
      setData(null);
    },
    onError: (error) => {
      message.error(error?.response?.data?.message);
    },
  });

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload = {
      no_peserta: values?.no_peserta,
      tahun: values?.tahun,
      use_skck: useSkck,
    };

    if (useSkck) {
      payload.no_skck = values?.no_skck;
    } else {
      payload.no_ijazah = values?.no_ijazah;
      payload.tahun_lulus = values?.tahun_lulus;
    }

    mutate(payload);
  };

  const handleDocumentTypeChange = (e) => {
    setUseSkck(e.target.value);
    // Reset field yang tidak digunakan
    if (e.target.value) {
      form.setFieldValue("no_ijazah", undefined);
      form.setFieldValue("tahun_lulus", undefined);
    } else {
      form.setFieldValue("no_skck", undefined);
    }
  };

  return (
    <Modal
      centered
      title="Cek Status Usulan CASN"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={900}
      styles={{
        body: {
          maxHeight: "70vh",
          overflowY: "auto",
          overflowX: "hidden",
        },
      }}
    >
      <Alert
        message="Hanya untuk Pemerintah Provinsi Jawa Timur"
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />

      {/* Form */}
      {!data && (
        <Form form={form} layout="vertical">
                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item
                          label="Jenis Dokumen"
                          style={{ marginBottom: 16 }}
                        >
                          <Radio.Group
                            value={useSkck}
                            onChange={handleDocumentTypeChange}
                            buttonStyle="solid"
                          >
                            <Radio.Button value={false}>
                              Nomor Ijazah
                            </Radio.Button>
                            <Radio.Button value={true}>Nomor SKCK</Radio.Button>
                          </Radio.Group>
                        </Form.Item>
                      </Col>
                      <Col md={12} xs={24}>
                        <Form.Item
                          rules={[
                            {
                              required: true,
                              message: "No Peserta harus diisi",
                            },
                          ]}
                          normalize={(values) => values.replace(/\s/g, "")}
                          name="no_peserta"
                          label="No Peserta"
                          style={{ marginBottom: 16 }}
                        >
                          <Input placeholder="Masukkan nomor peserta" />
                        </Form.Item>
                      </Col>
                      {!useSkck ? (
                        <>
                          <Col md={12} xs={24}>
                            <Form.Item
                              rules={[
                                {
                                  required: true,
                                  message: "No Ijazah harus diisi",
                                },
                              ]}
                              name="no_ijazah"
                              label="No Ijazah (lihat di SSCASN)"
                            >
                              <Input placeholder="Masukkan nomor ijazah" />
                            </Form.Item>
                          </Col>
                          <Col md={12} xs={24}>
                            <Form.Item
                              rules={[
                                {
                                  required: true,
                                  message: "Tahun Lulus harus diisi",
                                },
                              ]}
                              name="tahun_lulus"
                              label="Tahun Lulus (lihat di SSCASN)"
                            >
                              <Input placeholder="Masukkan tahun lulus" />
                            </Form.Item>
                          </Col>
                        </>
                      ) : (
                        <Col md={12} xs={24}>
                          <Form.Item
                            rules={[
                              {
                                required: true,
                                message: "No SKCK harus diisi",
                              },
                            ]}
                            name="no_skck"
                            label="No SKCK (lihat di SSCASN)"
                          >
                            <Input placeholder="Masukkan nomor SKCK" />
                          </Form.Item>
                        </Col>
                      )}
                      <Col md={12} xs={24}>
                        <Form.Item
                          rules={[
                            { required: true, message: "Tahun harus diisi" },
                          ]}
                          name="tahun"
                          label="Tahun"
                          style={{ marginBottom: 16 }}
                        >
                          <Radio.Group buttonStyle="solid">
                            <Radio.Button value="2025">2025</Radio.Button>
                            <Radio.Button value="2024">2024</Radio.Button>
                            <Radio.Button value="2023">2023</Radio.Button>
                            <Radio.Button value="2022">2022</Radio.Button>
                          </Radio.Group>
                        </Form.Item>
                      </Col>
                    </Row>
          <Space>
            <Button
              loading={isLoading}
              disabled={isLoading}
              type="primary"
              htmlType="submit"
              onClick={handleSubmit}
            >
              Cek Status
            </Button>
            <Button onClick={() => form.resetFields()} disabled={isLoading}>
              Reset
            </Button>
          </Space>
        </Form>
      )}

      {/* Loading State */}
      {isLoading && !data && (
        <div style={{ padding: "20px 0" }}>
          <Skeleton active paragraph={{ rows: 3 }} />
        </div>
      )}

      {/* Result */}
      {data && (
        <>
          <ShowData data={data} />
          <Divider style={{ margin: "16px 0" }} />
          <Button
            block
            onClick={() => {
              setData(null);
              form.resetFields();
            }}
            icon={
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="1 4 1 10 7 10"></polyline>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
              </svg>
            }
          >
            Cari Pertek Lagi
          </Button>
        </>
      )}
    </Modal>
  );
};

function CekPertek() {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const pegawaiPemprov =
    session?.user?.group === "MASTER" || session?.user?.group === "PTTPK";

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {
        <Tooltip title="Masuk menggunakan akun Pegawai Pemerintah Provinsi Jawa Timur (Non ASN / ASN)">
          <Button
            disabled={!pegawaiPemprov}
            shape="round"
            type="primary"
            onClick={handleOpenModal}
          >
            Cek Status Usulan CASN
          </Button>
          <ModalCekPertek
            open={isModalOpen}
            onCancel={handleCloseModal}
            onOk={handleCloseModal}
          />
        </Tooltip>
      }
    </>
  );
}

export default CekPertek;

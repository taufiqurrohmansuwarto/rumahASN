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
  Typography,
  Flex,
  theme,
  message,
  Select,
  DatePicker,
} from "antd";
import {
  EditOutlined,
  MailOutlined,
  HomeOutlined,
  IdcardOutlined,
  InfoCircleOutlined,
  SaveOutlined,
  CalendarOutlined,
  StarOutlined,
  BankOutlined,
  FileTextOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { useEffect } from "react";
import dayjs from "dayjs";

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

const { Title, Text } = Typography;
const { useToken } = theme;

const RiwayatUbahData = () => {
  const { data, isLoading } = useQuery(["data-utama-siasn"], () =>
    dataUtamaSIASN()
  );

  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const { token } = useToken();

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
        title: "Perhatian",
        content: "Apakah anda yakin ingin mengubah data?",
        centered: true,
        onOk: async () => {
          await update({
            email_gov: value?.email_gov,
            nomor_bpjs: value?.nomor_bpjs,
            nomor_hp: value?.nomor_hp,
            nomor_telepon: value?.nomor_telepon,
            alamat: value?.alamat,
            nomor_npwp: value?.nomor_npwp,
            npwp_tanggal: dayjs(value?.npwp_tanggal).format("DD-MM-YYYY"),
            kelas_jabatan: value?.kelas_jabatan,
            tapera_nomor: value?.tapera_nomor,
            taspen_nomor: value?.taspen_nomor,
            tanggal_taspen: dayjs(value?.tanggal_taspen).format("DD-MM-YYYY"),
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

  return (
    <Skeleton loading={isLoading}>
      {data && (
        <Card
          style={{
            borderRadius: token.borderRadiusLG,
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: token.marginMD }}>
            <Flex justify="space-between" align="center">
              <div>
                <Flex align="center" gap={token.marginXS}>
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: token.borderRadiusSM,
                      backgroundColor: token.colorPrimary,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <EditOutlined
                      style={{ color: "white", fontSize: "12px" }}
                    />
                  </div>
                  <div>
                    <Title level={5} style={{ margin: 0 }}>
                      Pemutakhiran Data Kepegawaian
                    </Title>
                    <Text type="secondary">
                      Perbarui data kepegawaian Anda di SIASN
                    </Text>
                  </div>
                </Flex>
              </div>
            </Flex>
          </div>

          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Form form={form} layout="vertical">
              {/* Informasi Kontak */}
              <div
                style={{
                  marginBottom: token.marginLG,
                }}
              >
                <Title
                  level={5}
                  style={{
                    margin: `0 0 ${token.marginMD}px 0`,
                    color: token.colorTextHeading,
                    borderBottom: `2px solid ${token.colorPrimary}`,
                    paddingBottom: token.paddingXS,
                    display: "inline-block",
                  }}
                >
                  📧 Informasi Kontak
                </Title>
                <div
                  style={{
                    padding: token.paddingMD,
                    borderRadius: token.borderRadius,
                    backgroundColor: "white",
                    border: `1px solid ${token.colorBorder}`,
                  }}
                >
                  <Form.Item
                    rules={[{ type: "email" }]}
                    label={
                      <Flex align="center" gap={token.marginXS}>
                        <MailOutlined style={{ color: token.colorPrimary }} />
                        <span>Email Government</span>
                      </Flex>
                    }
                    name="email_gov"
                    help={
                      <span
                        style={{
                          fontSize: "12px",
                          color: token.colorTextSecondary,
                        }}
                      >
                        Akses melalui{" "}
                        <a
                          href="https://webmail.mail.go.id/"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          webmail.mail.go.id
                        </a>
                      </span>
                    }
                  >
                    <Input
                      disabled
                      prefix={
                        <MailOutlined
                          style={{ color: token.colorTextSecondary }}
                        />
                      }
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <Flex align="center" gap={token.marginXS}>
                        <HomeOutlined style={{ color: token.colorPrimary }} />
                        <span>Alamat Lengkap</span>
                      </Flex>
                    }
                    name="alamat"
                    help="Masukkan alamat sesuai KTP atau domisili saat ini"
                  >
                    <Input.TextArea
                      rows={3}
                      placeholder="Contoh: Jl. Sudirman No. 123, Kelurahan ABC, Kecamatan XYZ"
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <Flex align="center" gap={token.marginXS}>
                        <PhoneOutlined style={{ color: token.colorPrimary }} />
                        <span>Nomor HP</span>
                      </Flex>
                    }
                    name="nomor_hp"
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    label={
                      <Flex align="center" gap={token.marginXS}>
                        <PhoneOutlined style={{ color: token.colorPrimary }} />
                        <span>Nomor Telepon</span>
                      </Flex>
                    }
                    name="nomor_telepon"
                  >
                    <Input />
                  </Form.Item>
                </div>
              </div>

              {/* Informasi Finansial */}
              <div
                style={{
                  marginBottom: token.marginLG,
                }}
              >
                <Title
                  level={5}
                  style={{
                    margin: `0 0 ${token.marginMD}px 0`,
                    color: token.colorTextHeading,
                    borderBottom: `2px solid ${token.colorPrimary}`,
                    paddingBottom: token.paddingXS,
                    display: "inline-block",
                  }}
                >
                  💳 Informasi Finansial & Asuransi
                </Title>
                <div
                  style={{
                    padding: token.paddingMD,
                    borderRadius: token.borderRadius,
                    backgroundColor: "white",
                    border: `1px solid ${token.colorBorder}`,
                  }}
                >
                  <Form.Item
                    label={
                      <Flex align="center" gap={token.marginXS}>
                        <BankOutlined style={{ color: token.colorPrimary }} />
                        <span>Nomor BPJS Kesehatan</span>
                      </Flex>
                    }
                    name="nomor_bpjs"
                    help="13 digit nomor BPJS Kesehatan"
                  >
                    <Input
                      prefix={
                        <BankOutlined
                          style={{ color: token.colorTextSecondary }}
                        />
                      }
                      placeholder="Contoh: 0001234567890"
                      maxLength={13}
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <Flex align="center" gap={token.marginXS}>
                        <FileTextOutlined
                          style={{ color: token.colorPrimary }}
                        />
                        <span>Nomor NPWP</span>
                      </Flex>
                    }
                    name="nomor_npwp"
                    help="15 digit nomor NPWP tanpa tanda titik atau strip"
                  >
                    <Input
                      prefix={
                        <FileTextOutlined
                          style={{ color: token.colorTextSecondary }}
                        />
                      }
                      placeholder="Contoh: 123456789012345"
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <Flex align="center" gap={token.marginXS}>
                        <CalendarOutlined
                          style={{ color: token.colorPrimary }}
                        />
                        <span>Tanggal Terbit NPWP</span>
                      </Flex>
                    }
                    name="npwp_tanggal"
                  >
                    <DatePicker
                      format="DD-MM-YYYY"
                      style={{ width: "100%" }}
                      placeholder="Pilih tanggal terbit NPWP"
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <Flex align="center" gap={token.marginXS}>
                        <BankOutlined style={{ color: token.colorPrimary }} />
                        <span>Nomor Taspen</span>
                      </Flex>
                    }
                    name="taspen_nomor"
                    help="Nomor peserta Taspen (jika ada)"
                  >
                    <Input
                      prefix={
                        <BankOutlined
                          style={{ color: token.colorTextSecondary }}
                        />
                      }
                      placeholder="Masukkan nomor Taspen"
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <Flex align="center" gap={token.marginXS}>
                        <CalendarOutlined
                          style={{ color: token.colorPrimary }}
                        />
                        <span>Tanggal Mulai Taspen</span>
                      </Flex>
                    }
                    name="tanggal_taspen"
                  >
                    <DatePicker
                      format="DD-MM-YYYY"
                      style={{ width: "100%" }}
                      placeholder="Pilih tanggal mulai Taspen"
                    />
                  </Form.Item>
                </div>
              </div>

              {/* Informasi Kepegawaian */}
              <div
                style={{
                  marginBottom: token.marginLG,
                }}
              >
                <Title
                  level={5}
                  style={{
                    margin: `0 0 ${token.marginMD}px 0`,
                    color: token.colorTextHeading,
                    borderBottom: `2px solid ${token.colorPrimary}`,
                    paddingBottom: token.paddingXS,
                    display: "inline-block",
                  }}
                >
                  🏛️ Informasi Kepegawaian
                </Title>
                <div
                  style={{
                    padding: token.paddingMD,
                    borderRadius: token.borderRadius,
                    backgroundColor: "white",
                    border: `1px solid ${token.colorBorder}`,
                  }}
                >
                  <Form.Item
                    label={
                      <Flex align="center" gap={token.marginXS}>
                        <StarOutlined style={{ color: token.colorPrimary }} />
                        <span>Kelas Jabatan</span>
                      </Flex>
                    }
                    name="kelas_jabatan"
                    help="Pilih kelas jabatan sesuai SK terakhir"
                  >
                    <Select
                      placeholder="Pilih kelas jabatan"
                      options={kelasJabatan.map((item) => ({
                        label: `Kelas ${item}`,
                        value: item,
                      }))}
                    />
                  </Form.Item>
                </div>
              </div>

              <div style={{ marginTop: token.marginMD }}>
                <Button
                  onClick={handleSubmit}
                  type="primary"
                  loading={isLoadingUpdate}
                  icon={<SaveOutlined />}
                  style={{
                    borderRadius: token.borderRadius,
                  }}
                >
                  Simpan
                </Button>
              </div>
            </Form>
          </Space>
        </Card>
      )}
    </Skeleton>
  );
};

export default RiwayatUbahData;

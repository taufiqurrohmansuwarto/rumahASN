import {
  dataUtamaSIASN,
  updateDataUtamaSIASN,
} from "@/services/siasn-services";
import {
  BankOutlined,
  EditOutlined,
  FileTextOutlined,
  MailOutlined,
  PhoneOutlined,
  ReloadOutlined,
  SaveOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  DatePicker,
  Flex,
  Form,
  Input,
  message,
  Modal,
  Select,
  Skeleton,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
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

const { Title, Text } = Typography;

const LoadingSkeleton = ({ minHeight = "120px" }) => (
  <Card
    style={{
      width: "100%",
      backgroundColor: "#FFFFFF",
      border: "1px solid #EDEFF1",
      borderRadius: "4px",
      marginBottom: "8px",
    }}
    bodyStyle={{ padding: 0 }}
  >
    <Flex>
      <div
        style={{
          width: "40px",
          backgroundColor: "#F8F9FA",
          borderRight: "1px solid #EDEFF1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight,
        }}
      >
        <Skeleton.Avatar size={16} />
      </div>
      <Flex vertical style={{ flex: 1, padding: "12px" }} gap={8}>
        <Skeleton.Input style={{ width: "40%" }} active size="small" />
        <Skeleton
          paragraph={{ rows: 2, width: ["100%", "80%"] }}
          active
          title={false}
        />
      </Flex>
    </Flex>
  </Card>
);

const RiwayatUbahData = () => {
  const { data, isLoading, refetch, isFetching } = useQuery(
    ["data-utama-siasn"],
    () => dataUtamaSIASN(),
    {
      refetchOnWindowFocus: false,
    }
  );

  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { mutateAsync: update, isLoading: isLoadingUpdate } = useMutation(
    (data) => updateDataUtamaSIASN(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["data-utama-siasn"]);
        message.success("Berhasil mengubah data");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["data-utama-siasn"]);
      },
    }
  );

  const handleRefetch = () => {
    refetch();
    message.info("Memuat ulang data...");
  };

  const handleSubmit = async () => {
    try {
      const value = await form.validateFields();

      Modal.confirm({
        title: "Perhatian",
        content: "Apakah anda yakin ingin mengubah data?",
        centered: true,
        onOk: async () => {
          const payload = {
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
          };
          await update(payload);
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

  if (isLoading) {
    return (
      <div
        style={{
          backgroundColor: "#DAE0E6",
          minHeight: "100vh",
          padding: "16px",
        }}
      >
        <LoadingSkeleton minHeight="80px" />
        <LoadingSkeleton minHeight="200px" />
        <LoadingSkeleton minHeight="250px" />
        <LoadingSkeleton minHeight="100px" />
        <LoadingSkeleton minHeight="60px" />
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#DAE0E6",
        minHeight: "100vh",
        padding: "16px",
      }}
    >
      {data && (
        <>
          {/* Header */}
          <Card
            style={{
              width: "100%",
              backgroundColor: "#FFFFFF",
              border: "1px solid #EDEFF1",
              borderRadius: "4px",
              marginBottom: "8px",
            }}
            bodyStyle={{ padding: 0 }}
          >
            <Flex>
              {/* Icon Section */}
              <div
                style={{
                  width: "40px",
                  backgroundColor: "#F8F9FA",
                  borderRight: "1px solid #EDEFF1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "80px",
                }}
              >
                <EditOutlined style={{ color: "#FF4500", fontSize: "16px" }} />
              </div>

              {/* Header Content */}
              <div style={{ flex: 1, padding: "12px" }}>
                <Flex justify="space-between" align="center">
                  <div>
                    <Title level={4} style={{ margin: 0, color: "#1A1A1B" }}>
                      Pemutakhiran Data Kepegawaian
                    </Title>
                    <Text style={{ color: "#787C7E", fontSize: "14px" }}>
                      Perbarui data kepegawaian Anda di SIASN
                    </Text>
                  </div>
                  <Tooltip title="Muat ulang data">
                    <Button
                      type="text"
                      icon={<ReloadOutlined />}
                      loading={isFetching}
                      onClick={handleRefetch}
                      style={{
                        color: "#787C7E",
                        border: "1px solid #EDEFF1",
                        borderRadius: "4px",
                      }}
                    >
                      {isFetching ? "Memuat..." : "Refresh"}
                    </Button>
                  </Tooltip>
                </Flex>
              </div>
            </Flex>
          </Card>

          <Form form={form} layout="vertical">
            {/* Informasi Kontak */}
            {isFetching ? (
              <LoadingSkeleton minHeight="200px" />
            ) : (
              <Card
                style={{
                  width: "100%",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #EDEFF1",
                  borderRadius: "4px",
                  marginBottom: "8px",
                }}
                bodyStyle={{ padding: 0 }}
              >
                <Flex>
                  {/* Icon Section */}
                  <div
                    style={{
                      width: "40px",
                      backgroundColor: "#F8F9FA",
                      borderRight: "1px solid #EDEFF1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: "120px",
                    }}
                  >
                    <MailOutlined
                      style={{ color: "#FF4500", fontSize: "16px" }}
                    />
                  </div>

                  {/* Content Section */}
                  <div style={{ flex: 1, padding: "12px" }}>
                    <Title
                      level={5}
                      style={{ marginBottom: "16px", color: "#1A1A1B" }}
                    >
                      📧 Informasi Kontak
                    </Title>

                    <Form.Item
                      label={
                        <span style={{ color: "#1A1A1B", fontSize: "14px" }}>
                          Email Government
                        </span>
                      }
                      name="email_gov"
                      rules={[{ type: "email" }]}
                      help={
                        <span style={{ fontSize: "12px", color: "#787C7E" }}>
                          Akses melalui{" "}
                          <a
                            href="https://webmail.mail.go.id/"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#FF4500" }}
                          >
                            webmail.mail.go.id
                          </a>
                        </span>
                      }
                    >
                      <Input
                        disabled
                        prefix={<MailOutlined style={{ color: "#787C7E" }} />}
                        style={{ backgroundColor: "#F8F9FA" }}
                      />
                    </Form.Item>

                    <Form.Item
                      label={
                        <span style={{ color: "#1A1A1B", fontSize: "14px" }}>
                          Alamat Lengkap
                        </span>
                      }
                      name="alamat"
                      help={
                        <span style={{ fontSize: "12px", color: "#787C7E" }}>
                          Masukkan alamat sesuai KTP atau domisili saat ini
                        </span>
                      }
                    >
                      <Input.TextArea
                        rows={3}
                        placeholder="Contoh: Jl. Sudirman No. 123, Kelurahan ABC, Kecamatan XYZ"
                        style={{ borderColor: "#EDEFF1" }}
                      />
                    </Form.Item>

                    <Form.Item
                      label={
                        <span style={{ color: "#1A1A1B", fontSize: "14px" }}>
                          Nomor HP
                        </span>
                      }
                      name="nomor_hp"
                    >
                      <Input
                        prefix={<PhoneOutlined style={{ color: "#787C7E" }} />}
                        style={{ borderColor: "#EDEFF1" }}
                      />
                    </Form.Item>

                    <Form.Item
                      label={
                        <span style={{ color: "#1A1A1B", fontSize: "14px" }}>
                          Nomor Telepon
                        </span>
                      }
                      name="nomor_telepon"
                    >
                      <Input
                        prefix={<PhoneOutlined style={{ color: "#787C7E" }} />}
                        style={{ borderColor: "#EDEFF1" }}
                      />
                    </Form.Item>
                  </div>
                </Flex>
              </Card>
            )}

            {/* Informasi Finansial */}
            {isFetching ? (
              <LoadingSkeleton minHeight="250px" />
            ) : (
              <Card
                style={{
                  width: "100%",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #EDEFF1",
                  borderRadius: "4px",
                  marginBottom: "8px",
                }}
                bodyStyle={{ padding: 0 }}
              >
                <Flex>
                  {/* Icon Section */}
                  <div
                    style={{
                      width: "40px",
                      backgroundColor: "#F8F9FA",
                      borderRight: "1px solid #EDEFF1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: "120px",
                    }}
                  >
                    <BankOutlined
                      style={{ color: "#FF4500", fontSize: "16px" }}
                    />
                  </div>

                  {/* Content Section */}
                  <div style={{ flex: 1, padding: "12px" }}>
                    <Title
                      level={5}
                      style={{ marginBottom: "16px", color: "#1A1A1B" }}
                    >
                      💳 Informasi Finansial & Asuransi
                    </Title>

                    <Form.Item
                      label={
                        <span style={{ color: "#1A1A1B", fontSize: "14px" }}>
                          Nomor BPJS Kesehatan
                        </span>
                      }
                      name="nomor_bpjs"
                      help={
                        <span style={{ fontSize: "12px", color: "#787C7E" }}>
                          13 digit nomor BPJS Kesehatan
                        </span>
                      }
                    >
                      <Input
                        prefix={<BankOutlined style={{ color: "#787C7E" }} />}
                        placeholder="Contoh: 0001234567890"
                        maxLength={13}
                        style={{ borderColor: "#EDEFF1" }}
                      />
                    </Form.Item>

                    <Form.Item
                      label={
                        <span style={{ color: "#1A1A1B", fontSize: "14px" }}>
                          Nomor NPWP
                        </span>
                      }
                      name="nomor_npwp"
                      help={
                        <span style={{ fontSize: "12px", color: "#787C7E" }}>
                          15 digit nomor NPWP tanpa tanda titik atau strip
                        </span>
                      }
                    >
                      <Input
                        prefix={
                          <FileTextOutlined style={{ color: "#787C7E" }} />
                        }
                        placeholder="Contoh: 123456789012345"
                        style={{ borderColor: "#EDEFF1" }}
                      />
                    </Form.Item>

                    <Form.Item
                      label={
                        <span style={{ color: "#1A1A1B", fontSize: "14px" }}>
                          Tanggal Terbit NPWP
                        </span>
                      }
                      name="npwp_tanggal"
                    >
                      <DatePicker
                        format="DD-MM-YYYY"
                        style={{ width: "100%", borderColor: "#EDEFF1" }}
                        placeholder="Pilih tanggal terbit NPWP"
                      />
                    </Form.Item>

                    <Form.Item
                      label={
                        <span style={{ color: "#1A1A1B", fontSize: "14px" }}>
                          Nomor Taspen
                        </span>
                      }
                      name="taspen_nomor"
                      help={
                        <span style={{ fontSize: "12px", color: "#787C7E" }}>
                          Nomor peserta Taspen (jika ada)
                        </span>
                      }
                    >
                      <Input
                        prefix={<BankOutlined style={{ color: "#787C7E" }} />}
                        placeholder="Masukkan nomor Taspen"
                        style={{ borderColor: "#EDEFF1" }}
                      />
                    </Form.Item>

                    <Form.Item
                      label={
                        <span style={{ color: "#1A1A1B", fontSize: "14px" }}>
                          Tanggal Mulai Taspen
                        </span>
                      }
                      name="tanggal_taspen"
                    >
                      <DatePicker
                        format="DD-MM-YYYY"
                        style={{ width: "100%", borderColor: "#EDEFF1" }}
                        placeholder="Pilih tanggal mulai Taspen"
                      />
                    </Form.Item>
                  </div>
                </Flex>
              </Card>
            )}

            {/* Informasi Kepegawaian */}
            {isFetching ? (
              <LoadingSkeleton minHeight="100px" />
            ) : (
              <Card
                style={{
                  width: "100%",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #EDEFF1",
                  borderRadius: "4px",
                  marginBottom: "8px",
                }}
                bodyStyle={{ padding: 0 }}
              >
                <Flex>
                  {/* Icon Section */}
                  <div
                    style={{
                      width: "40px",
                      backgroundColor: "#F8F9FA",
                      borderRight: "1px solid #EDEFF1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: "80px",
                    }}
                  >
                    <StarOutlined
                      style={{ color: "#FF4500", fontSize: "16px" }}
                    />
                  </div>

                  {/* Content Section */}
                  <div style={{ flex: 1, padding: "12px" }}>
                    <Title
                      level={5}
                      style={{ marginBottom: "16px", color: "#1A1A1B" }}
                    >
                      🏛️ Informasi Kepegawaian
                    </Title>

                    <Form.Item
                      label={
                        <span style={{ color: "#1A1A1B", fontSize: "14px" }}>
                          Kelas Jabatan
                        </span>
                      }
                      name="kelas_jabatan"
                      help={
                        <span style={{ fontSize: "12px", color: "#787C7E" }}>
                          Pilih kelas jabatan sesuai SK terakhir
                        </span>
                      }
                    >
                      <Select
                        placeholder="Pilih kelas jabatan"
                        style={{ borderColor: "#EDEFF1" }}
                        options={kelasJabatan.map((item) => ({
                          label: `Kelas ${item}`,
                          value: item,
                        }))}
                      />
                    </Form.Item>
                  </div>
                </Flex>
              </Card>
            )}

            {/* Submit Button */}
            {isFetching ? (
              <LoadingSkeleton minHeight="60px" />
            ) : (
              <Card
                style={{
                  width: "100%",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #EDEFF1",
                  borderRadius: "4px",
                  marginBottom: "8px",
                }}
                bodyStyle={{ padding: 0 }}
              >
                <Flex>
                  {/* Icon Section */}
                  <div
                    style={{
                      width: "40px",
                      backgroundColor: "#F8F9FA",
                      borderRight: "1px solid #EDEFF1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: "60px",
                    }}
                  >
                    <SaveOutlined
                      style={{ color: "#FF4500", fontSize: "16px" }}
                    />
                  </div>

                  {/* Button Section */}
                  <div style={{ flex: 1, padding: "12px" }}>
                    <Button
                      onClick={handleSubmit}
                      type="primary"
                      loading={isLoadingUpdate}
                      icon={<SaveOutlined />}
                      style={{
                        backgroundColor: "#FF4500",
                        borderColor: "#FF4500",
                        borderRadius: "20px",
                        fontWeight: 600,
                        height: "36px",
                        padding: "0 24px",
                      }}
                    >
                      {isLoadingUpdate ? "Menyimpan..." : "Simpan"}
                    </Button>
                  </div>
                </Flex>
              </Card>
            )}
          </Form>
        </>
      )}
    </div>
  );
};

export default RiwayatUbahData;

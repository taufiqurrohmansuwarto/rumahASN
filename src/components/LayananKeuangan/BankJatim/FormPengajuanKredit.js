import { getUserInfo, pengajuanKredit } from "@/services/bankjatim.services";
import { getJenisKredit, getKodeKabkota } from "@/utils/client-utils";
import {
  BankOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CreditCardOutlined,
  FileTextOutlined,
  SyncOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import {
  Button,
  Card,
  Collapse,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useState } from "react";

const { Title, Text } = Typography;
const { Panel } = Collapse;

const FormPengajuanKredit = () => {
  const [form] = Form.useForm();
  const [isSynced, setIsSynced] = useState(false);
  const [activeKey, setActiveKey] = useState(["1", "2", "3"]); // Default semua terbuka

  const { mutate: userInfo, isLoading: isUserInfoLoading } = useMutation({
    mutationFn: getUserInfo,
    onSuccess: (result) => {
      form.setFieldsValue({
        ...result,
        tgl_lahir: dayjs(result.tgl_lahir),
      });
      setIsSynced(true);
      setActiveKey(["3"]);
    },
  });

  const { mutate, isLoading } = useMutation((data) => pengajuanKredit(data), {
    onSuccess: (result) => {
      if (result?.data) {
        const { no_pengajuan, kantor_cabang } = result?.data;
        Modal.success({
          title: "Pengajuan Berhasil Disubmit",
          width: 500,
          content: (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <CheckCircleOutlined
                style={{ fontSize: 48, color: "#52c41a", marginBottom: 16 }}
              />
              <Title level={4} style={{ marginBottom: 16, color: "#1f2937" }}>
                Pengajuan Kredit Berhasil Disubmit
              </Title>
              <div style={{ marginBottom: 20 }}>
                <Text
                  type="secondary"
                  style={{
                    fontSize: "14px",
                    display: "block",
                    marginBottom: 8,
                  }}
                >
                  No. Pengajuan:
                </Text>
                <Text strong style={{ fontSize: "16px", color: "#dc2626" }}>
                  {no_pengajuan}
                </Text>
              </div>
              <div style={{ marginBottom: 20 }}>
                <Text
                  type="secondary"
                  style={{
                    fontSize: "14px",
                    display: "block",
                    marginBottom: 8,
                  }}
                >
                  Kantor Cabang:
                </Text>
                <Text strong style={{ fontSize: "14px", color: "#1f2937" }}>
                  {kantor_cabang}
                </Text>
              </div>
              <Text
                type="secondary"
                style={{ fontSize: "14px", lineHeight: "1.6" }}
              >
                Pengajuan kredit Anda telah berhasil disubmit ke sistem Bank
                Jatim. Silahkan simpan nomor pengajuan untuk keperluan
                pengecekan status selanjutnya.
              </Text>
            </div>
          ),
        });
      } else {
        Modal.error({
          title: "Pengajuan Gagal",
          content: (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <CloseCircleOutlined
                style={{ fontSize: 48, color: "#ff4d4f", marginBottom: 16 }}
              />
              <Title level={4} style={{ marginBottom: 8 }}>
                Bank Jatim Error
              </Title>
              <Text type="secondary">{result?.response_description}</Text>
            </div>
          ),
        });
      }
    },
    onError: (error) => {
      Modal.error({
        title: "Pengajuan Gagal",
        content: (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <CloseCircleOutlined
              style={{ fontSize: 48, color: "#ff4d4f", marginBottom: 16 }}
            />
            <Title level={4} style={{ marginBottom: 8 }}>
              Terjadi Kesalahan
            </Title>
            <Text type="secondary">{error.response.data.message}</Text>
          </div>
        ),
      });
    },
  });

  const handleSubmit = (data) => {
    const payload = {
      ...data,
      tgl_lahir: dayjs(data.tgl_lahir).format("YYYY-MM-DD"),
    };
    mutate(payload);
  };

  const handleCollapseChange = (key) => {
    setActiveKey(key);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Card
        style={{
          flex: 1,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
        }}
        bodyStyle={{ padding: 0, height: "100%" }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
            color: "white",
            padding: "20px 24px",
            textAlign: "center",
          }}
        >
          <FileTextOutlined style={{ fontSize: 24, marginBottom: 8 }} />
          <Title level={4} style={{ color: "white", margin: "0 0 4px 0" }}>
            Pengajuan Kredit
          </Title>
          <Text style={{ color: "rgba(255, 255, 255, 0.9)" }}>
            Isi formulir pengajuan kredit dengan lengkap
          </Text>
        </div>

        {/* Form */}
        <div
          style={{
            padding: 24,
            height: "calc(100% - 100px)",
            overflowY: "auto",
          }}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Button
              onClick={() => userInfo()}
              icon={<SyncOutlined />}
              style={{
                width: "100%",
                marginBottom: 20,
                height: 40,
                borderRadius: 8,
                background: isSynced ? "#52c41a" : undefined,
                borderColor: isSynced ? "#52c41a" : undefined,
                color: isSynced ? "white" : undefined,
              }}
            >
              {isUserInfoLoading ? "Mengambil Data..." : "Ambil Data"}
            </Button>

            <Collapse
              activeKey={activeKey}
              onChange={handleCollapseChange}
              style={{ marginBottom: 20 }}
              size="small"
            >
              {/* Data Pribadi */}
              <Panel
                header={
                  <Space>
                    <UserOutlined style={{ color: "#dc2626" }} />
                    <span style={{ fontWeight: 600 }}>Data Pribadi</span>
                    {isSynced && (
                      <CheckCircleOutlined style={{ color: "#52c41a" }} />
                    )}
                  </Space>
                }
                key="1"
              >
                <Space
                  direction="vertical"
                  size="middle"
                  style={{ width: "100%" }}
                >
                  <Form.Item name="nip" label="NIP">
                    <Input readOnly disabled style={{ borderRadius: 8 }} />
                  </Form.Item>

                  <Form.Item name="no_ktp" label="No KTP">
                    <Input readOnly disabled style={{ borderRadius: 8 }} />
                  </Form.Item>

                  <Form.Item name="nama" label="Nama">
                    <Input readOnly disabled style={{ borderRadius: 8 }} />
                  </Form.Item>

                  <Form.Item name="tempat_lahir" label="Tempat Lahir">
                    <Input readOnly disabled style={{ borderRadius: 8 }} />
                  </Form.Item>

                  <Form.Item name="tgl_lahir" label="Tanggal Lahir">
                    <DatePicker
                      format="YYYY-MM-DD"
                      readOnly
                      disabled
                      style={{ width: "100%", borderRadius: 8 }}
                    />
                  </Form.Item>

                  <Form.Item name="jns_kelamin" label="Jenis Kelamin">
                    <Select
                      disabled
                      placeholder="Pilih jenis kelamin"
                      style={{ width: "100%", borderRadius: 8 }}
                      options={[
                        { value: "L", label: "Laki-laki" },
                        { value: "P", label: "Perempuan" },
                      ]}
                    />
                  </Form.Item>

                  <Form.Item name="no_hp" label="No HP">
                    <Input readOnly disabled style={{ borderRadius: 8 }} />
                  </Form.Item>
                </Space>
              </Panel>

              {/* Data Kepegawaian */}
              <Panel
                header={
                  <Space>
                    <BankOutlined style={{ color: "#dc2626" }} />
                    <span style={{ fontWeight: 600 }}>Data Kepegawaian</span>
                    {isSynced && (
                      <CheckCircleOutlined style={{ color: "#52c41a" }} />
                    )}
                  </Space>
                }
                key="2"
              >
                <Space
                  direction="vertical"
                  size="middle"
                  style={{ width: "100%" }}
                >
                  <Form.Item
                    name="tmt_pensiun"
                    label="TMT Pensiun"
                    rules={[
                      { required: true, message: "Masukkan TMT Pensiun!" },
                      {
                        validator: (_, value) => {
                          if (value > 70) {
                            return Promise.reject(
                              new Error(
                                "TMT Pensiun tidak boleh lebih dari 70 tahun!"
                              )
                            );
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <InputNumber style={{ width: "100%", borderRadius: 8 }} />
                  </Form.Item>

                  <Form.Item
                    name="norek_gaji"
                    label="No Rek Gaji"
                    rules={[
                      {
                        pattern: /^[0-9]+$/,
                        message: "No Rek Gaji hanya boleh berisi angka!",
                      },
                    ]}
                  >
                    <Input style={{ borderRadius: 8 }} />
                  </Form.Item>

                  <Form.Item name="kd_dinas" label="Kode Dinas">
                    <Input readOnly disabled style={{ borderRadius: 8 }} />
                  </Form.Item>

                  <Form.Item name="nama_dinas" label="Nama Dinas">
                    <Input readOnly disabled style={{ borderRadius: 8 }} />
                  </Form.Item>

                  <Form.Item
                    name="alamat_kantor"
                    label="Alamat Kantor"
                    rules={[
                      { required: true, message: "Masukkan Alamat Kantor!" },
                    ]}
                  >
                    <Input readOnly style={{ borderRadius: 8 }} />
                  </Form.Item>

                  <Form.Item
                    name="kode_kabkota"
                    label="Kode Kabkota"
                    rules={[{ required: true, message: "Pilih kode kabkota!" }]}
                  >
                    <Select
                      showSearch
                      optionFilterProp="label"
                      filterOption={(input, option) =>
                        option.label
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                      options={getKodeKabkota.map((item) => ({
                        label: item.label.replace("\r", ""),
                        value: item.key,
                      }))}
                      placeholder="Pilih kode kabkota"
                      style={{ borderRadius: 8 }}
                    />
                  </Form.Item>
                </Space>
              </Panel>

              {/* Data Kredit */}
              <Panel
                header={
                  <Space>
                    <CreditCardOutlined style={{ color: "#dc2626" }} />
                    <span style={{ fontWeight: 600, color: "#dc2626" }}>
                      Data Kredit (Wajib Diisi)
                    </span>
                  </Space>
                }
                key="3"
              >
                <Space
                  direction="vertical"
                  size="middle"
                  style={{ width: "100%" }}
                >
                  <Form.Item
                    name="jns_pinjaman"
                    label="Jenis Pinjaman"
                    rules={[
                      { required: true, message: "Pilih jenis pinjaman!" },
                    ]}
                  >
                    <Select
                      showSearch
                      optionFilterProp="label"
                      filterOption={(input, option) =>
                        option.label
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                      options={getJenisKredit.map((item) => ({
                        label: item,
                        value: item,
                      }))}
                      placeholder="Pilih jenis kredit"
                      style={{ borderRadius: 8 }}
                    />
                  </Form.Item>

                  <Form.Item
                    name="plafon_pengajuan"
                    label="Plafon Pengajuan"
                    rules={[
                      { required: true, message: "Masukkan plafon pengajuan!" },
                    ]}
                  >
                    <InputNumber
                      style={{ width: "100%", borderRadius: 8 }}
                      formatter={(value) =>
                        `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/Rp\s?|(,*)/g, "")}
                      placeholder="Masukkan jumlah pinjaman"
                    />
                  </Form.Item>

                  <Form.Item
                    name="jangka_waktu"
                    label="Jangka Waktu (Bulan)"
                    rules={[
                      { required: true, message: "Masukkan jangka waktu!" },
                    ]}
                  >
                    <InputNumber
                      style={{ width: "100%", borderRadius: 8 }}
                      min={1}
                      max={300}
                      placeholder="Masukkan jangka waktu dalam bulan"
                    />
                  </Form.Item>
                </Space>
              </Panel>
            </Collapse>

            <Form.Item style={{ marginTop: 24 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                disabled={!isSynced}
                style={{
                  width: "100%",
                  height: 44,
                  borderRadius: 8,
                  background: !isSynced
                    ? "#d1d5db"
                    : "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
                  border: "none",
                  fontWeight: 600,
                  color: !isSynced ? "#9ca3af" : "white",
                }}
              >
                {!isSynced
                  ? "Sinkron Data Terlebih Dahulu"
                  : isLoading
                  ? "Mengirim..."
                  : "Submit Pengajuan"}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Card>
    </div>
  );
};

export default FormPengajuanKredit;

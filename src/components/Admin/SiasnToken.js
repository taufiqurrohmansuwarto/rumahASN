import { useEffect, useState } from "react";
import {
  Button,
  Flex,
  Form,
  Input,
  Modal,
  message,
  Alert,
  Spin,
  Typography,
  Space,
  Tooltip,
  Card,
} from "antd";
import {
  KeyOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import {
  getSiasnToken,
  setSiasnToken,
  testConnectionSiasn,
} from "@/services/admin.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const { Text, Title } = Typography;

const ModalSiasnToken = ({ open, onCancel }) => {
  const [form] = Form.useForm();
  const [showToken, setShowToken] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["siasn-token"],
    queryFn: getSiasnToken,
    enabled: open,
    refetchOnWindowFocus: false,
    retry: 3,
    onError: (error) => {
      console.error("Error fetching SIASN token:", error);
      message.error("Gagal mengambil data token SIASN");
    },
  });

  const { mutate: setSiasnTokenMutation, isLoading: isLoadingSetSiasnToken } =
    useMutation({
      mutationFn: (token) => setSiasnToken(token),
      onSuccess: () => {
        message.success("Token SIASN berhasil diperbarui");
        onCancel();
        queryClient.invalidateQueries({ queryKey: ["siasn-token"] });
        form.resetFields();
        setShowToken(false);
      },
      onError: (error) => {
        console.error("Error setting SIASN token:", error);
        message.error("Gagal memperbarui token SIASN");
      },
    });

  // Validate JSON token
  const validateToken = (value) => {
    if (!value) {
      setTokenValid(false);
      return;
    }

    try {
      const parsed = JSON.parse(value);
      // Basic validation for required token fields
      if (parsed && typeof parsed === "object" && parsed.access_token) {
        setTokenValid(true);
      } else {
        setTokenValid(false);
      }
    } catch (error) {
      setTokenValid(false);
    }
  };

  useEffect(() => {
    if (data?.token) {
      const tokenString = JSON.stringify(data.token, null, 2);
      form.setFieldsValue({ token: tokenString });
      validateToken(tokenString);
    } else if (data && !data.token) {
      form.setFieldsValue({ token: "" });
      setTokenValid(false);
    }
  }, [data, form]);

  const handleSubmit = async () => {
    try {
      const payload = await form.validateFields();
      const parsedToken = JSON.parse(payload.token);
      setSiasnTokenMutation(parsedToken);
    } catch (error) {
      message.error("Format token tidak valid");
    }
  };

  const handleTokenChange = (e) => {
    const value = e.target.value;
    validateToken(value);
  };

  const { mutate: testConnection, isLoading: isLoadingTestConnection } =
    useMutation({
      mutationFn: testConnectionSiasn,
      onSuccess: () => {
        message.success("Koneksi SIASN berhasil");
      },
      onError: (error) => {
        const message = error?.message || "Gagal menguji koneksi SIASN";
        message.error(message);
      },
    });

  const handleTestConnection = () => {
    testConnection();
  };

  const handleRetry = () => {
    refetch();
  };

  const formatToken = () => {
    const currentValue = form.getFieldValue("token");
    if (currentValue) {
      try {
        const parsed = JSON.parse(currentValue);
        const formatted = JSON.stringify(parsed, null, 2);
        form.setFieldsValue({ token: formatted });
        validateToken(formatted);
      } catch (error) {
        message.error("Format JSON tidak valid");
      }
    }
  };

  const toggleTokenVisibility = () => {
    setShowToken(!showToken);
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      confirmLoading={isLoadingSetSiasnToken}
      title={
        <Space>
          <KeyOutlined />
          <Title level={4} style={{ margin: 0 }}>
            Konfigurasi Token SIASN
          </Title>
        </Space>
      }
      okText="Simpan Token"
      cancelText="Batal"
      onOk={handleSubmit}
      width={700}
      okButtonProps={{
        disabled: !tokenValid || isLoading,
        loading: isLoadingSetSiasnToken,
      }}
    >
      {error && (
        <Alert
          message="Gagal memuat data token"
          description={
            error.message || "Terjadi kesalahan saat mengambil data token"
          }
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          action={
            <Button size="small" onClick={handleRetry}>
              Coba Lagi
            </Button>
          }
        />
      )}

      {isLoading ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text>Memuat data token...</Text>
          </div>
        </div>
      ) : (
        <div>
          <Alert
            message="Informasi Token SIASN"
            description="Token ini digunakan untuk mengakses API SIASN. Pastikan token dalam format JSON yang valid dan memiliki access_token."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form form={form} layout="vertical">
            <Form.Item
              label={
                <Space>
                  <Text strong>Token SIASN</Text>
                  <Tooltip title="Token harus dalam format JSON yang valid dengan field access_token">
                    <InfoCircleOutlined />
                  </Tooltip>
                </Space>
              }
              name="token"
              rules={[
                {
                  required: true,
                  message: "Token SIASN wajib diisi",
                },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();

                    try {
                      const parsed = JSON.parse(value);
                      if (!parsed.access_token) {
                        return Promise.reject(
                          new Error("Token harus memiliki field access_token")
                        );
                      }
                      return Promise.resolve();
                    } catch (error) {
                      return Promise.reject(
                        new Error("Format JSON tidak valid")
                      );
                    }
                  },
                },
              ]}
            >
              <Input.TextArea
                rows={12}
                onChange={handleTokenChange}
                placeholder={`{
  "access_token": "your_access_token_here",
  "refresh_token": "your_refresh_token_here",
  "token_type": "Bearer",
  "expires_in": 3600
}`}
                style={{
                  fontFamily: "monospace",
                  fontSize: "12px",
                  filter: showToken ? "none" : "blur(3px)",
                }}
              />
            </Form.Item>

            <Space style={{ marginBottom: 16 }}>
              <Button
                type="default"
                icon={showToken ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                onClick={toggleTokenVisibility}
                size="small"
              >
                {showToken ? "Sembunyikan" : "Tampilkan"} Token
              </Button>
              <Button
                type="default"
                icon={<ReloadOutlined />}
                onClick={formatToken}
                size="small"
              >
                Format JSON
              </Button>
              <Button
                icon={<CheckOutlined />}
                type="default"
                size="small"
                loading={isLoadingTestConnection}
                disabled={isLoadingTestConnection}
                onClick={handleTestConnection}
              >
                Tes Koneksi
              </Button>
            </Space>

            {!tokenValid && (
              <Alert
                message="Token tidak valid"
                description="Pastikan token dalam format JSON yang benar dan memiliki field access_token"
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            {data?.token && (
              <Card size="small" style={{ backgroundColor: "#f8f9fa" }}>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  <strong>Terakhir diperbarui:</strong>{" "}
                  {data.updated_at
                    ? new Date(data.updated_at).toLocaleString("id-ID")
                    : "Tidak diketahui"}
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  <strong>Status:</strong>{" "}
                  {data.token?.access_token ? "Aktif" : "Tidak aktif"}
                </Text>
              </Card>
            )}
          </Form>
        </div>
      )}
    </Modal>
  );
};

const SiasnToken = () => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Flex justify="end" style={{ marginBottom: 16 }} gap={12}>
      <Tooltip title="Kelola token untuk integrasi dengan sistem SIASN">
        <Button
          type="primary"
          onClick={handleOpen}
          icon={<KeyOutlined />}
          style={{
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          Konfigurasi Token SIASN
        </Button>
      </Tooltip>
      <ModalSiasnToken open={open} onCancel={handleCancel} />
    </Flex>
  );
};

export default SiasnToken;

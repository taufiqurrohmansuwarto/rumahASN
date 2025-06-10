import {
  MailOutlined,
  SyncOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import {
  Form,
  Input,
  Modal,
  Skeleton,
  Tag,
  message,
  Card,
  Alert,
  Space,
  Typography,
  Flex,
  Button,
} from "antd";
import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  dataUtamaSIASN,
  updateDataUtamaSIASN,
} from "@/services/siasn-services";

const { Text } = Typography;

const GantiEmailModal = ({ open, onCancel, onOk }) => {
  const [form] = Form.useForm();

  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(
    ["data-utama-siasn"],
    () => dataUtamaSIASN(),
    {
      onSuccess: (data) => {
        if (data?.email) {
          form.setFieldsValue({
            email: data?.email,
          });
        }
      },
    }
  );

  const { mutate: update, isLoading: isUpdating } = useMutation(
    (data) => updateDataUtamaSIASN(data),
    {
      onError: (error) => {
        message.error(error?.message);
      },
      onSuccess: () => {
        message.success("Berhasil mengubah email");
        queryClient.invalidateQueries(["data-utama-siasn"]);
      },
      onSettled: () => {
        queryClient.invalidateQueries(["data-utama-siasn"]);
        onCancel();
      },
    }
  );

  const handleSubmit = async () => {
    try {
      const value = await form.validateFields();
      update({
        email: value?.email,
      });
    } catch (error) {
      message.error(error?.message);
    }
  };

  return (
    <Modal
      width={600}
      title={
        <Flex align="center" gap={8}>
          <SyncOutlined style={{ color: "#FF4500" }} />
          <span style={{ color: "#1A1A1B" }}>Ganti Email SIASN</span>
        </Flex>
      }
      open={open}
      onCancel={onCancel}
      footer={
        <Flex justify="end" gap={12} style={{ padding: "12px 0" }}>
          <Button
            onClick={onCancel}
            style={{
              height: "36px",
              borderRadius: "6px",
              borderColor: "#EDEFF1",
              color: "#787C7E",
              backgroundColor: "#FFFFFF",
              fontWeight: 500,
              minWidth: "80px",
            }}
            disabled={isUpdating}
          >
            Batal
          </Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={isUpdating}
            style={{
              height: "36px",
              borderRadius: "6px",
              backgroundColor: "#FF4500",
              borderColor: "#FF4500",
              fontWeight: 500,
              minWidth: "80px",
              boxShadow: "0 2px 4px rgba(255, 69, 0, 0.2)",
            }}
          >
            {isUpdating ? "Menyimpan..." : "Simpan"}
          </Button>
        </Flex>
      }
      styles={{
        content: {
          backgroundColor: "#DAE0E6",
          padding: "0",
        },
        header: {
          backgroundColor: "#F8F9FA",
          borderBottom: "1px solid #EDEFF1",
          margin: "0",
          padding: "16px 24px",
        },
        body: {
          padding: "20px",
        },
        footer: {
          backgroundColor: "#F8F9FA",
          borderTop: "1px solid #EDEFF1",
          padding: "12px 24px",
        },
      }}
    >
      <Card
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #EDEFF1",
          borderRadius: "4px",
          marginBottom: "16px",
        }}
      >
        <Alert
          message={
            <Space direction="vertical" size="small">
              <Text style={{ color: "#1A1A1B" }}>
                Pastikan email yang diganti adalah email aktif dan sering
                digunakan.
              </Text>
              <Text style={{ color: "#787C7E", fontSize: "12px" }}>
                Email yang diganti membutuhkan waktu 2 jam untuk sinkronisasi
                data.
              </Text>
            </Space>
          }
          type="info"
          icon={<InfoCircleOutlined style={{ color: "#FF4500" }} />}
          style={{
            backgroundColor: "#E6F7FF",
            border: "1px solid #91D5FF",
            borderRadius: "4px",
            marginBottom: "16px",
          }}
        />

        {isLoading ? (
          <Skeleton active paragraph={{ rows: 2 }} />
        ) : (
          <Form layout="vertical" form={form}>
            <Form.Item
              rules={[
                {
                  required: true,
                  message: "Email SIASN harus diisi",
                },
                {
                  type: "email",
                  message: "Email SIASN harus valid",
                },
              ]}
              label={
                <Text style={{ color: "#1A1A1B", fontWeight: 500 }}>
                  Email SIASN
                </Text>
              }
              name="email"
            >
              <Input
                autoComplete="off"
                prefix={<MailOutlined style={{ color: "#787C7E" }} />}
                style={{
                  borderColor: "#EDEFF1",
                  borderRadius: "4px",
                }}
                placeholder="Masukkan email SIASN yang baru"
              />
            </Form.Item>
          </Form>
        )}
      </Card>
    </Modal>
  );
};

function GantiEmail() {
  const [showModal, setShowModal] = useState(false);
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  return (
    <>
      <GantiEmailModal
        open={showModal}
        onCancel={handleCloseModal}
        onOk={handleCloseModal}
      />
      <Tag
        style={{ cursor: "pointer" }}
        onClick={handleShowModal}
        icon={<SyncOutlined />}
      >
        Ganti Email SIASN
      </Tag>
    </>
  );
}

export default GantiEmail;

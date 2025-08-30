import { checkGelar, getGelar, uncheckGelar } from "@/services/siasn-services";
import { InfoCircleOutlined, SettingOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Card,
  Checkbox,
  Col,
  Flex,
  message,
  Modal,
  Row,
  Skeleton,
  Space,
  Tag,
  Typography,
} from "antd";
import { useState } from "react";

const { Text, Title } = Typography;

// cast 'true' to true
const castToBoolean = (value) => (value === "true" ? true : false);

const ModalPengaturanGelar = ({ open, onCancel, onOk }) => {
  const [idGelar, setIdGelar] = useState(null);
  const { data, isLoading } = useQuery(["daftar-gelar"], () => getGelar(), {
    refetchOnWindowFocus: false,
  });

  const queryClient = useQueryClient();

  const { mutateAsync: gelarCheck, isLoading: isLoadingGelarCheck } =
    useMutation((data) => checkGelar(data), {
      onSuccess: () => {
        queryClient.invalidateQueries(["daftar-gelar"]);
        message.success("Update gelar berhasil");
      },
      onError: () => {
        message.error("Update gelar gagal");
      },
      onSettled: () => {
        setIdGelar(null);
      },
    });

  const { mutateAsync: gelarUncheck, isLoading: isLoadingGelarUncheck } =
    useMutation((data) => uncheckGelar(data), {
      onSuccess: () => {
        queryClient.invalidateQueries(["daftar-gelar"]);
        message.success("Update gelar berhasil");
      },
      onError: () => {
        message.error("Update gelar gagal");
      },
      onSettled: () => {
        setIdGelar(null);
      },
    });

  const handleCheck = async (id, event, loc) => {
    const isChecked = event.target.checked;
    setIdGelar(id);
    const payload = {
      gelarId: id,
      loc: loc,
    };
    if (isChecked) {
      await gelarCheck(payload);
    } else {
      await gelarUncheck(payload);
    }
  };

  const isUpdating = isLoadingGelarCheck || isLoadingGelarUncheck;

  return (
    <Modal
      width={600}
      title={
        <Flex align="center" gap={8}>
          <SettingOutlined style={{ color: "#FF4500" }} />
          <span style={{ color: "#1A1A1B" }}>Pengaturan Gelar</span>
        </Flex>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
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
          padding: "16px",
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
                Pilih gelar yang sesuai dengan Anda.
              </Text>
              <Text style={{ color: "#787C7E", fontSize: "12px" }}>
                Gelar anda tidak sesuai?{" "}
                <a
                  href="/helpdesk/pemutakhiran-data/pendidikan"
                  style={{ color: "#FF4500", textDecoration: "none" }}
                >
                  Cek data Pendidikan SIASN
                </a>{" "}
                atau{" "}
                <a
                  href="https://bkd.jatimprov.go.id/penyesuaiangelar"
                  target="_blank"
                  style={{ color: "#FF4500", textDecoration: "none" }}
                >
                  Lihat Panduan Pencantuman Gelar.
                </a>
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
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : (
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Space
                direction="vertical"
                size="small"
                style={{ width: "100%" }}
              >
                <Title
                  level={5}
                  style={{
                    margin: "0 0 12px 0",
                    color: "#1A1A1B",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  Gelar Depan
                </Title>
                {data?.gelar_belakang?.map((gelar) => (
                  <Card
                    key={gelar.id}
                    size="small"
                    style={{
                      backgroundColor: castToBoolean(gelar.checked)
                        ? "#F6FFED"
                        : "#FAFAFA",
                      border: `1px solid ${
                        castToBoolean(gelar.checked) ? "#B7EB8F" : "#EDEFF1"
                      }`,
                      borderRadius: "4px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    bodyStyle={{ padding: "8px 12px" }}
                  >
                    <Flex align="center" gap={8}>
                      <Checkbox
                        disabled={idGelar === gelar.id || isUpdating}
                        onChange={(checked) =>
                          handleCheck(gelar.id, checked, "D")
                        }
                        checked={castToBoolean(gelar.checked)}
                        style={{
                          color: castToBoolean(gelar.checked)
                            ? "#52C41A"
                            : "#787C7E",
                        }}
                      />
                      <Tag
                        color={
                          castToBoolean(gelar.checked) ? "success" : "default"
                        }
                        style={{
                          margin: 0,
                          borderRadius: "4px",
                          fontSize: "12px",
                        }}
                      >
                        {gelar.glr_depan}
                      </Tag>
                    </Flex>
                  </Card>
                ))}
              </Space>
            </Col>
            <Col span={12}>
              <Space
                direction="vertical"
                size="small"
                style={{ width: "100%" }}
              >
                <Title
                  level={5}
                  style={{
                    margin: "0 0 12px 0",
                    color: "#1A1A1B",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  Gelar Belakang
                </Title>
                {data?.gelar_depan?.map((gelar) => (
                  <Card
                    key={gelar.id}
                    size="small"
                    style={{
                      backgroundColor: castToBoolean(gelar.checked)
                        ? "#F6FFED"
                        : "#FAFAFA",
                      border: `1px solid ${
                        castToBoolean(gelar.checked) ? "#B7EB8F" : "#EDEFF1"
                      }`,
                      borderRadius: "4px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    bodyStyle={{ padding: "8px 12px" }}
                  >
                    <Flex align="center" gap={8}>
                      <Checkbox
                        disabled={idGelar === gelar.id || isUpdating}
                        onChange={(checked) =>
                          handleCheck(gelar.id, checked, "B")
                        }
                        checked={castToBoolean(gelar.checked)}
                        style={{
                          color: castToBoolean(gelar.checked)
                            ? "#52C41A"
                            : "#787C7E",
                        }}
                      />
                      <Tag
                        color={
                          castToBoolean(gelar.checked) ? "success" : "default"
                        }
                        style={{
                          margin: 0,
                          borderRadius: "4px",
                          fontSize: "12px",
                        }}
                      >
                        {gelar.glr_belakang}
                      </Tag>
                    </Flex>
                  </Card>
                ))}
              </Space>
            </Col>
          </Row>
        )}
      </Card>
    </Modal>
  );
};

function PengaturanGelar() {
  const [showModal, setShowModal] = useState(false);
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  return (
    <>
      <ModalPengaturanGelar
        open={showModal}
        onCancel={handleCloseModal}
        onOk={handleCloseModal}
      />
      <Tag
        style={{
          cursor: "pointer",
        }}
        onClick={handleShowModal}
        icon={<SettingOutlined />}
      >
        Pengaturan Gelar
      </Tag>
    </>
  );
}

export default PengaturanGelar;

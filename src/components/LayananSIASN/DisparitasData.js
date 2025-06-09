import {
  AlertOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  Badge,
  Button,
  Card,
  Flex,
  Modal,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { upperCase } from "lodash";
import { useRouter } from "next/router";
import { useState } from "react";

const { Text, Title } = Typography;

const totalDisparitas = (data) => {
  return data?.filter((item) => item?.result === "Salah").length;
};

const ModalDisparitasData = ({
  open,
  onCancel,
  onOk,
  loading,
  data,
  refetch,
}) => {
  const router = useRouter();

  const handleDetail = (record) => {
    if (record?.jenis === "unor") {
      router.push("/pemutakhiran-data/jabatan");
    } else if (record?.jenis === "skp") {
      router.push("/pemutakhiran-data/laporan-kinerja");
    }
  };

  const columns = [
    {
      title: "Jenis Disparitas",
      key: "jenis",
      render: (_, record) => {
        return (
          <Tag
            color="blue"
            style={{
              fontSize: "12px",
              fontWeight: 500,
              borderRadius: "4px",
            }}
          >
            {upperCase(record.jenis)}
          </Tag>
        );
      },
    },
    {
      title: "Deskripsi",
      key: "deskripsi",
      dataIndex: "deskripsi",
      render: (text) => (
        <Text style={{ color: "#1A1A1B", fontSize: "13px" }}>{text}</Text>
      ),
    },
    {
      title: "Data SIASN",
      key: "siasn",
      dataIndex: "siasn",
      render: (text) => (
        <Text style={{ color: "#1890FF", fontSize: "13px", fontWeight: 500 }}>
          {text || "-"}
        </Text>
      ),
    },
    {
      title: "Data SIMASTER",
      key: "simaster",
      dataIndex: "simaster",
      render: (text) => (
        <Text style={{ color: "#FF4500", fontSize: "13px", fontWeight: 500 }}>
          {text || "-"}
        </Text>
      ),
    },
    {
      title: "Status",
      key: "hasil",
      render: (_, record) => {
        const isCorrect = record?.result === "Benar";
        return (
          <Tag
            color={isCorrect ? "green" : "red"}
            icon={
              isCorrect ? (
                <CheckCircleOutlined />
              ) : (
                <ExclamationCircleOutlined />
              )
            }
            style={{
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: 500,
            }}
          >
            {record?.result}
          </Tag>
        );
      },
    },
  ];

  const errorData = data?.filter((item) => item?.result !== "Benar") || [];

  return (
    <Modal
      width={1200}
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      title={
        <div
          style={{
            backgroundColor: "#F8F9FA",
            margin: "-24px -24px 24px -24px",
            padding: "16px 24px",
            borderBottom: "1px solid #EDEFF1",
          }}
        >
          <Flex align="center" gap={12}>
            <div
              style={{
                width: "40px",
                height: "40px",
                backgroundColor: "#FF4500",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AlertOutlined style={{ color: "white", fontSize: "18px" }} />
            </div>
            <div>
              <Title level={4} style={{ margin: 0, color: "#1A1A1B" }}>
                📊 Disparitas Data
              </Title>
              <Text style={{ color: "#787C7E", fontSize: "14px" }}>
                Perbandingan data antara SIASN dan SIMASTER
              </Text>
            </div>
          </Flex>
        </div>
      }
      style={{
        top: 20,
      }}
    >
      <Card
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #EDEFF1",
          borderRadius: "8px",
          marginBottom: "16px",
        }}
        bodyStyle={{ padding: "16px" }}
      >
        <Flex
          justify="space-between"
          align="center"
          style={{ marginBottom: "16px" }}
        >
          <div>
            <Text
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "#1A1A1B",
                marginBottom: "4px",
                display: "block",
              }}
            >
              Ringkasan Disparitas
            </Text>
            <Text style={{ color: "#787C7E", fontSize: "14px" }}>
              {errorData.length > 0
                ? `Ditemukan ${errorData.length} data yang tidak sesuai`
                : "Semua data sudah sesuai"}
            </Text>
          </div>
          <Space>
            <Badge
              count={errorData.length}
              showZero
              style={{
                backgroundColor: errorData.length > 0 ? "#FF4500" : "#52C41A",
                fontSize: "12px",
                fontWeight: 500,
              }}
            />
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              loading={loading}
              onClick={refetch}
              style={{
                backgroundColor: "#FF4500",
                borderColor: "#FF4500",
                borderRadius: "6px",
                fontWeight: 500,
              }}
            >
              {loading ? "Memuat..." : "Refresh Data"}
            </Button>
          </Space>
        </Flex>

        {errorData.length > 0 ? (
          <Table
            size="small"
            loading={loading}
            rowKey={(row) => row?.jenis}
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} dari ${total} data`,
              style: { marginTop: "16px" },
            }}
            dataSource={errorData}
            columns={columns}
            style={{
              backgroundColor: "#FFFFFF",
            }}
            rowClassName={(record, index) =>
              index % 2 === 0 ? "" : "table-row-light"
            }
          />
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              backgroundColor: "#F6FFED",
              border: "1px solid #B7EB8F",
              borderRadius: "8px",
            }}
          >
            <CheckCircleOutlined
              style={{
                fontSize: "48px",
                color: "#52C41A",
                marginBottom: "16px",
              }}
            />
            <Title level={4} style={{ color: "#389E0D", margin: 0 }}>
              ✅ Tidak Ada Disparitas
            </Title>
            <Text style={{ color: "#52C41A", fontSize: "14px" }}>
              Semua data telah sesuai antara SIASN dan SIMASTER
            </Text>
          </div>
        )}
      </Card>

      <style jsx global>{`
        .table-row-light {
          background-color: #fafafa !important;
        }
        .ant-table-thead > tr > th {
          background-color: #f8f9fa !important;
          border-bottom: 2px solid #edeff1 !important;
          color: #1a1a1b !important;
          font-weight: 600 !important;
          font-size: 13px !important;
        }
        .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f0f0f0 !important;
          padding: 12px 16px !important;
        }
        .ant-table-tbody > tr:hover > td {
          background-color: #f8f9fa !important;
        }
      `}</style>
    </Modal>
  );
};

function DisparitasData({ data, isLoading, refetch, isFetching }) {
  const [showModal, setShowModal] = useState(false);
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const totalErrors = totalDisparitas(data);
  const hasErrors = totalErrors > 0;

  return (
    <>
      <ModalDisparitasData
        open={showModal}
        onCancel={handleCloseModal}
        onOk={handleCloseModal}
        loading={isLoading || isFetching}
        data={data}
        refetch={refetch}
      />

      {data && (
        <Tooltip
          title={
            hasErrors
              ? `${totalErrors} data tidak sesuai dengan SIASN`
              : "Semua data sudah sesuai"
          }
        >
          <Button
            type="default"
            size="small"
            onClick={handleShowModal}
            loading={isLoading || isFetching}
            style={{
              backgroundColor: hasErrors ? "#FFF2E8" : "#F6FFED",
              border: `2px solid ${hasErrors ? "#FF4500" : "#52C41A"}`,
              borderRadius: "8px",
              color: hasErrors ? "#FF4500" : "#52C41A",
              fontWeight: 600,
              fontSize: "11px",
              height: "32px",
              padding: "0 12px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              position: "relative",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow = `0 4px 12px ${
                hasErrors ? "rgba(255, 69, 0, 0.2)" : "rgba(82, 196, 26, 0.2)"
              }`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {hasErrors ? (
              <ExclamationCircleOutlined style={{ fontSize: "14px" }} />
            ) : (
              <CheckCircleOutlined style={{ fontSize: "14px" }} />
            )}
            <span>Disparitas</span>
            {totalErrors > 0 && (
              <Badge
                count={totalErrors}
                size="small"
                style={{
                  backgroundColor: "#FF4500",
                  fontSize: "10px",
                  minWidth: "18px",
                  height: "18px",
                  lineHeight: "18px",
                }}
              />
            )}
          </Button>
        </Tooltip>
      )}
    </>
  );
}

export default DisparitasData;

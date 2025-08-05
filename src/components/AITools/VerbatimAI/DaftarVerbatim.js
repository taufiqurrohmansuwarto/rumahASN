import {
  getRekamanVerbatim,
  resultVerbatim,
  splitAudioVerbatim,
  transcribeVerbatim,
  transformVerbatim,
  deleteVerbatim,
  exportVerbatim,
} from "@/services/assesor-ai.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  message,
  Modal,
  Space,
  Table,
  Typography,
  Card,
  Tag,
  Flex,
  Avatar,
  Tooltip,
  Grid,
  Progress,
} from "antd";
import {
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  PlayCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CopyOutlined,
  ThunderboltOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";
import { saveAs } from "file-saver";
import { useState } from "react";
import dayjs from "dayjs";
import ReactMarkdownCustom from "@/components/MarkdownEditor/ReactMarkdownCustom";

const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

const SplitAudioButton = ({ id }) => {
  const queryClient = useQueryClient();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const { mutateAsync: splitAudio, isLoading: isSplitting } = useMutation({
    mutationFn: splitAudioVerbatim,
    onSuccess: () => {
      message.success("Audio berhasil di split");
      queryClient.invalidateQueries({ queryKey: ["get-rekaman-verbatim"] });
    },
    onError: () => {
      message.error("Audio gagal di split");
    },
  });

  const handleSplitAudio = () => {
    Modal.confirm({
      title: "Split Audio",
      content: "Apakah anda yakin ingin memsplit audio?",
      onOk: async () => await splitAudio(id),
    });
  };

  return (
    <Tooltip title="Split Audio">
      <Button
        icon={<SettingOutlined />}
        onClick={handleSplitAudio}
        loading={isSplitting}
        size={isMobile ? "small" : "middle"}
        style={{
          borderColor: "#722ed1",
          color: "#722ed1",
        }}
      >
        {!isMobile && "Split"}
      </Button>
    </Tooltip>
  );
};

const TranscriptButton = ({ id }) => {
  const queryClient = useQueryClient();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const { mutateAsync: transcribe, isLoading: isTranscribing } = useMutation({
    mutationFn: transcribeVerbatim,
    onSuccess: () => {
      message.success("Audio berhasil di transcribe");
      queryClient.invalidateQueries({ queryKey: ["get-rekaman-verbatim"] });
    },
    onError: () => {
      message.error("Audio gagal di transcribe");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["get-rekaman-verbatim"] });
    },
  });

  const handleTranscribe = () => {
    Modal.confirm({
      title: "Transkrip",
      content: "Apakah anda yakin ingin melakukan transkrip?",
      onOk: async () => await transcribe(id),
    });
  };

  return (
    <Tooltip title="Proses Transkrip Audio">
      <Button
        type="primary"
        icon={<FileTextOutlined />}
        onClick={handleTranscribe}
        loading={isTranscribing}
        size={isMobile ? "small" : "middle"}
        style={{
          backgroundColor: "#1890ff",
          borderColor: "#1890ff",
        }}
      >
        {!isMobile && "Transkrip"}
      </Button>
    </Tooltip>
  );
};

const TransformButton = ({ id, disabled }) => {
  const queryClient = useQueryClient();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const { mutateAsync: transform, isLoading: isTransforming } = useMutation({
    mutationFn: transformVerbatim,
    onSuccess: () => {
      message.success("Transkrip berhasil di transform");
      queryClient.invalidateQueries({ queryKey: ["get-rekaman-verbatim"] });
    },
    onError: () => {
      message.error("Transkrip gagal di transform");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["get-rekaman-verbatim"] });
    },
  });

  const handleTransform = () => {
    Modal.confirm({
      title: "Transform",
      content: "Apakah anda yakin ingin melakukan transform?",
      onOk: async () => await transform(id),
    });
  };

  return (
    <Tooltip title="Transform Transkrip">
      <Button
        type="primary"
        icon={<ThunderboltOutlined />}
        onClick={handleTransform}
        loading={isTransforming}
        disabled={disabled}
        size={isMobile ? "small" : "middle"}
        style={{
          backgroundColor: "#faad14",
          borderColor: "#faad14",
        }}
      >
        {!isMobile && "Transform"}
      </Button>
    </Tooltip>
  );
};

const ResultButton = ({ id, disabled }) => {
  const queryClient = useQueryClient();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const { mutateAsync: result, isLoading: isResulting } = useMutation({
    mutationFn: resultVerbatim,
    onSuccess: () => {
      message.success("Transkrip berhasil di result");
      queryClient.invalidateQueries({ queryKey: ["get-rekaman-verbatim"] });
    },
    onError: () => {
      message.error("Transkrip gagal di result");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["get-rekaman-verbatim"] });
    },
  });

  const handleResult = () => {
    Modal.confirm({
      title: "Result",
      content: "Apakah anda yakin ingin melakukan result?",
      onOk: async () => await result(id),
    });
  };

  return (
    <Tooltip title="Generate Result Analisis">
      <Button
        type="primary"
        icon={<CheckCircleOutlined />}
        onClick={handleResult}
        loading={isResulting}
        disabled={disabled}
        size={isMobile ? "small" : "middle"}
        style={{
          backgroundColor: "#52c41a",
          borderColor: "#52c41a",
        }}
      >
        {!isMobile && "Result"}
      </Button>
    </Tooltip>
  );
};

const ViewTranscriptButton = ({ transcript, disabled }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const handleViewTranscript = async () => {
    setIsModalVisible(true);
  };

  const handleCopyTranscript = async () => {
    try {
      await navigator.clipboard.writeText(transcript || "");
      message.success("Transkrip berhasil disalin");
    } catch (error) {
      message.error("Gagal menyalin transkrip");
    }
  };

  return (
    <>
      <Tooltip title="Lihat Transkrip">
        <Button
          icon={<FileSearchOutlined />}
          onClick={handleViewTranscript}
          disabled={disabled}
          size={isMobile ? "small" : "middle"}
          style={{
            borderColor: "#13c2c2",
            color: "#13c2c2",
          }}
        >
          {!isMobile && "Lihat Transkrip"}
        </Button>
      </Tooltip>
      <Modal
        title={
          <Space>
            <FileTextOutlined />
            <Text strong>Transkrip Audio</Text>
          </Space>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button
            key="copy"
            icon={<CopyOutlined />}
            onClick={handleCopyTranscript}
            type="primary"
            style={{ marginRight: 8 }}
          >
            Salin Transkrip
          </Button>,
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Tutup
          </Button>,
        ]}
        width={isMobile ? "90vw" : 900}
      >
        <div
          style={{
            maxHeight: "60vh",
            overflow: "auto",
            padding: "16px",
            backgroundColor: "#fafafa",
            borderRadius: "8px",
            border: "1px solid #e8e8e8",
          }}
        >
          <ReactMarkdownCustom>
            {transcript || "Transkrip belum tersedia"}
          </ReactMarkdownCustom>
        </div>
      </Modal>
    </>
  );
};

const ViewResultButton = ({ result, disabled }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const handleViewResult = async () => {
    setIsModalVisible(true);
  };

  const handleCopyResult = async () => {
    try {
      await navigator.clipboard.writeText(result || "");
      message.success("Result berhasil disalin");
    } catch (error) {
      message.error("Gagal menyalin result");
    }
  };

  return (
    <>
      <Tooltip title="Lihat Result Analisis">
        <Button
          icon={<CheckCircleOutlined />}
          onClick={handleViewResult}
          disabled={disabled}
          size={isMobile ? "small" : "middle"}
          style={{
            borderColor: "#52c41a",
            color: "#52c41a",
          }}
        >
          {!isMobile && "Lihat Result"}
        </Button>
      </Tooltip>
      <Modal
        title={
          <Space>
            <CheckCircleOutlined />
            <Text strong>Result Analisis</Text>
          </Space>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button
            key="copy"
            icon={<CopyOutlined />}
            onClick={handleCopyResult}
            type="primary"
            style={{ marginRight: 8 }}
          >
            Salin Result
          </Button>,
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Tutup
          </Button>,
        ]}
        width={isMobile ? "90vw" : 900}
      >
        <div
          style={{
            maxHeight: "60vh",
            overflow: "auto",
            padding: "16px",
            backgroundColor: "#fafafa",
            borderRadius: "8px",
            border: "1px solid #e8e8e8",
          }}
        >
          <ReactMarkdownCustom>
            {result || "Result belum tersedia"}
          </ReactMarkdownCustom>
        </div>
      </Modal>
    </>
  );
};

const DeleteButton = ({ id, judul }) => {
  const queryClient = useQueryClient();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const { mutateAsync: deleteItem, isLoading: isDeleting } = useMutation({
    mutationFn: deleteVerbatim,
    onSuccess: () => {
      message.success("Data berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["get-rekaman-verbatim"] });
    },
    onError: () => {
      message.error("Data gagal dihapus");
    },
  });

  const handleDelete = () => {
    Modal.confirm({
      title: "Hapus Data",
      content: `Apakah anda yakin ingin menghapus "${judul}"?`,
      okText: "Ya, Hapus",
      cancelText: "Batal",
      okType: "danger",
      onOk: async () => await deleteItem(id),
    });
  };

  return (
    <Tooltip title="Hapus Data Session">
      <Button
        icon={<DeleteOutlined />}
        onClick={handleDelete}
        loading={isDeleting}
        danger
        size={isMobile ? "small" : "middle"}
      >
        {!isMobile && "Hapus"}
      </Button>
    </Tooltip>
  );
};

const ExportButton = ({ id, disabled, judul }) => {
  const [isExporting, setIsExporting] = useState(false);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const handleExport = async (type = "result") => {
    setIsExporting(true);
    try {
      const data = await exportVerbatim(id, type);
      console.log(data);

      // Create Word document content
      const content = `
${judul}
========================

${type === "result" ? "RESULT ANALISIS" : "TRANSKRIP"}
------------------------

${data.content || data.result || data.transcript || "Data tidak tersedia"}

------------------------
Diekspor pada: ${dayjs().format("DD-MM-YYYY HH:mm:ss")}
      `.trim();

      // Create blob and download
      const blob = new Blob([content], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      const filename = `${judul}_${type}_${dayjs().format("YYYY-MM-DD")}.docx`;
      saveAs(blob, filename);

      message.success("File berhasil diunduh");
    } catch (error) {
      message.error("Gagal mengunduh file");
    } finally {
      setIsExporting(false);
    }
  };

  if (isMobile) {
    return (
      <Tooltip title="Export Dokumen">
        <Button
          icon={<DownloadOutlined />}
          onClick={() => handleExport("result")}
          loading={isExporting}
          disabled={disabled}
          size="small"
          style={{
            borderColor: "#fa8c16",
            color: "#fa8c16",
          }}
        />
      </Tooltip>
    );
  }

  return (
    <Space size={4}>
      <Tooltip title="Export Result ke Word">
        <Button
          icon={<DownloadOutlined />}
          onClick={() => handleExport("result")}
          loading={isExporting}
          disabled={disabled}
          size="middle"
          style={{
            borderColor: "#fa8c16",
            color: "#fa8c16",
          }}
        >
          Export Result
        </Button>
      </Tooltip>
      <Tooltip title="Export Transkrip ke Word">
        <Button
          icon={<DownloadOutlined />}
          onClick={() => handleExport("transcript")}
          loading={isExporting}
          disabled={disabled}
          size="middle"
          style={{
            borderColor: "#fa8c16",
            color: "#fa8c16",
          }}
        >
          Export Transkrip
        </Button>
      </Tooltip>
    </Space>
  );
};

function AudioPlayer({ src, judul }) {
  return (
    <div style={{ width: "100%" }}>
      <Flex align="center" gap={8}>
        <PlayCircleOutlined style={{ color: "#ff4500", fontSize: "16px" }} />
        <div style={{ flex: 1 }}>
          <audio
            controls
            style={{
              width: "100%",
              height: "32px",
              outline: "none",
            }}
            preload="metadata"
          >
            <source src={src} type="audio/mpeg" />
            <source src={src} type="audio/wav" />
            <source src={src} type="audio/ogg" />
            Browser tidak mendukung audio.
          </audio>
        </div>
      </Flex>
      {judul && (
        <Text
          type="secondary"
          style={{
            fontSize: "11px",
            display: "block",
            marginTop: "4px",
            wordBreak: "break-word",
          }}
          ellipsis={{ tooltip: judul }}
        >
          {judul}
        </Text>
      )}
    </div>
  );
}

const StatusIndicator = ({ record }) => {
  const getStatus = () => {
    if (record.result) {
      return {
        color: "success",
        icon: <CheckCircleOutlined />,
        text: "Selesai",
        bgColor: "#f6ffed",
        borderColor: "#b7eb8f",
      };
    } else if (record.transform) {
      return {
        color: "processing",
        icon: <SettingOutlined spin />,
        text: "Transform",
        bgColor: "#e6f7ff",
        borderColor: "#91d5ff",
      };
    } else if (record.transcript) {
      return {
        color: "warning",
        icon: <ClockCircleOutlined />,
        text: "Transkrip",
        bgColor: "#fffbe6",
        borderColor: "#ffe58f",
      };
    } else {
      return {
        color: "default",
        icon: <ExclamationCircleOutlined />,
        text: "Pending",
        bgColor: "#fafafa",
        borderColor: "#d9d9d9",
      };
    }
  };

  const status = getStatus();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  return (
    <Tag
      color={status.color}
      icon={!isMobile ? status.icon : null}
      style={{
        borderRadius: "16px",
        padding: isMobile ? "2px 8px" : "4px 12px",
        fontSize: isMobile ? "10px" : "12px",
        fontWeight: 500,
        border: `1px solid ${status.borderColor}`,
        backgroundColor: status.bgColor,
      }}
    >
      {isMobile ? status.text.substring(0, 4) : status.text}
    </Tag>
  );
};

const DaftarVerbatim = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;

  const { data, isLoading } = useQuery({
    queryKey: ["get-rekaman-verbatim"],
    queryFn: getRekamanVerbatim,
    keepPreviousData: true,
  });

  const columns = [
    {
      title: (
        <Space>
          <FileTextOutlined />
          <Text strong>Informasi Session</Text>
        </Space>
      ),
      dataIndex: "judul",
      key: "judul",
      width: isMobile ? 200 : 320,
      render: (judul, record) => (
        <Flex vertical gap={4}>
          <Text
            style={{
              fontSize: isMobile ? "12px" : "14px",
              fontWeight: 600,
              color: "#1a1a1a",
              lineHeight: 1.3,
            }}
            ellipsis={{ tooltip: judul }}
          >
            {judul}
          </Text>
          <Flex gap={8} wrap>
            <Text
              style={{
                fontSize: isMobile ? "10px" : "11px",
                color: "#666",
              }}
            >
              <UserOutlined style={{ marginRight: 4 }} />
              Asesor: {record.nama_asesor}
            </Text>
            <Text
              style={{
                fontSize: isMobile ? "10px" : "11px",
                color: "#666",
              }}
            >
              Asesi: {record.nama_asesi}
            </Text>
          </Flex>
        </Flex>
      ),
    },
    {
      title: (
        <Space>
          <SettingOutlined />
          <Text strong>Status</Text>
        </Space>
      ),
      dataIndex: "status",
      key: "status",
      width: isMobile ? 80 : 120,
      align: "center",
      render: (text, record) => <StatusIndicator record={record} />,
    },
    {
      title: (
        <Space>
          <CalendarOutlined />
          <Text strong>Tanggal</Text>
        </Space>
      ),
      dataIndex: "tgl_wawancara",
      key: "tgl_wawancara",
      width: isMobile ? 100 : 140,
      align: "center",
      render: (text) => (
        <Flex vertical align="center" gap={2}>
          <Text
            style={{
              fontSize: isMobile ? "11px" : "12px",
              fontWeight: 600,
              color: "#1a1a1a",
            }}
          >
            {dayjs(text).format("DD MMM")}
          </Text>
          <Text
            style={{
              fontSize: isMobile ? "9px" : "10px",
              color: "#666",
            }}
          >
            {dayjs(text).format("YYYY")}
          </Text>
        </Flex>
      ),
    },
    ...(isMobile
      ? []
      : [
          {
            title: (
              <Space>
                <PlayCircleOutlined />
                <Text strong>Audio File</Text>
              </Space>
            ),
            dataIndex: "file_path",
            key: "file_path",
            width: 300,
            render: (text, record) => (
              <AudioPlayer
                src={`https://siasn.bkd.jatimprov.go.id:9000${text}`}
                judul={record.judul}
              />
            ),
          },
        ]),
    {
      title: (
        <Space>
          <SettingOutlined />
          <Text strong>Aksi</Text>
        </Space>
      ),
      dataIndex: "aksi",
      key: "aksi",
      width: isMobile ? 180 : 450,
      render: (text, record) => {
        return (
          <div>
            {isMobile && (
              <div style={{ marginBottom: "8px" }}>
                <AudioPlayer
                  src={`https://siasn.bkd.jatimprov.go.id:9000${record.file_path}`}
                  judul={record.judul}
                />
              </div>
            )}

            {/* Process Actions */}
            <div className="action-group">
              <Space
                wrap
                size={4}
                style={{ marginBottom: isMobile ? "4px" : "8px" }}
              >
                <Text
                  type="secondary"
                  style={{
                    fontSize: "10px",
                    fontWeight: 500,
                    color: "#ff4500",
                  }}
                >
                  PROSES:
                </Text>
                <TranscriptButton id={record.id} />
                <TransformButton disabled={!record.transcript} id={record.id} />
                <ResultButton disabled={!record.transform} id={record.id} />
              </Space>
            </div>

            {/* View & Export Actions */}
            <div className="action-group">
              <Space
                wrap
                size={4}
                style={{ marginBottom: isMobile ? "4px" : "8px" }}
              >
                <Text
                  type="secondary"
                  style={{
                    fontSize: "10px",
                    fontWeight: 500,
                    color: "#ff4500",
                  }}
                >
                  LIHAT:
                </Text>
                <ViewTranscriptButton
                  transcript={record.transform}
                  disabled={!record.transform}
                />
                <ViewResultButton
                  result={record.result}
                  disabled={!record.result}
                />
              </Space>
            </div>

            {/* Management Actions */}
            <div className="action-group">
              <Space wrap size={4}>
                <Text
                  type="secondary"
                  style={{
                    fontSize: "10px",
                    fontWeight: 500,
                    color: "#ff4500",
                  }}
                >
                  KELOLA:
                </Text>
                <DeleteButton id={record.id} judul={record.judul} />
              </Space>
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      {/* Header Card */}
      <Card
        style={{
          marginBottom: "16px",
          borderRadius: isMobile ? "8px" : "12px",
          border: "1px solid #e8e8e8",
        }}
      >
        <Flex align="center" justify="space-between" wrap>
          <Space>
            <Avatar
              size={isMobile ? 32 : 40}
              style={{ backgroundColor: "#ff4500" }}
              icon={<FileTextOutlined />}
            />
            <div>
              <Title
                level={isMobile ? 5 : 4}
                style={{ margin: 0, color: "#1a1a1a" }}
              >
                Daftar Session Verbatim AI
              </Title>
              <Text
                type="secondary"
                style={{ fontSize: isMobile ? "11px" : "13px" }}
              >
                Kelola dan proses rekaman wawancara assessment
              </Text>
            </div>
          </Space>
          <Tag
            color="orange"
            style={{
              borderRadius: "16px",
              padding: "4px 12px",
              fontSize: isMobile ? "10px" : "12px",
            }}
          >
            {data?.length || 0} Session
          </Tag>
        </Flex>
      </Card>

      {/* Table Card */}
      <Card
        style={{
          borderRadius: isMobile ? "8px" : "12px",
          border: "1px solid #e8e8e8",
        }}
      >
        <Table
          dataSource={data}
          columns={columns}
          loading={isLoading}
          rowKey="id"
          size={isMobile ? "small" : "middle"}
          scroll={{ x: isMobile ? 1000 : undefined }}
          pagination={false}
          rowClassName={(record, index) =>
            index % 2 === 0 ? "table-row-light" : "table-row-dark"
          }
        />
      </Card>

      <style jsx global>{`
        .ant-table-thead > tr > th {
          background: #ffffff !important;
          color: #1a1a1a !important;
          font-weight: 600 !important;
          border-bottom: 2px solid #ff4500 !important;
          padding: ${isMobile ? "12px 8px" : "16px 12px"} !important;
          font-size: ${isMobile ? "11px" : "14px"} !important;
        }

        .ant-table-thead > tr > th:first-child {
          border-top-left-radius: 8px !important;
        }

        .ant-table-thead > tr > th:last-child {
          border-top-right-radius: 8px !important;
        }

        .table-row-light {
          background-color: #ffffff !important;
        }

        .table-row-dark {
          background-color: #fafafa !important;
        }

        .ant-table-tbody > tr:hover > td {
          background-color: #fff7e6 !important;
          transition: all 0.2s ease !important;
        }

        .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f0f0f0 !important;
          padding: ${isMobile ? "8px 6px" : "12px"} !important;
          transition: all 0.2s ease !important;
        }

        .ant-table-container {
          border-radius: 8px !important;
          overflow: hidden !important;
        }

        .ant-card {
          transition: all 0.3s ease !important;
        }

        .ant-card:hover {
          border-color: #ff4500 !important;
        }

        /* Audio player custom styling */
        audio::-webkit-media-controls-panel {
          background-color: #f5f5f5;
          border-radius: 4px;
        }

        audio::-webkit-media-controls-play-button,
        audio::-webkit-media-controls-pause-button {
          background-color: #ff4500;
          border-radius: 50%;
        }

        /* Button responsive styling */
        @media (max-width: 768px) {
          .ant-btn {
            font-size: 10px !important;
            padding: 2px 6px !important;
            height: auto !important;
            min-height: 24px !important;
          }

          .ant-btn-icon-only {
            width: 24px !important;
            padding: 0 !important;
          }
        }

        /* Action button groups */
        .action-group {
          border-left: 3px solid #ff4500;
          padding-left: 8px;
          margin-bottom: 6px;
        }

        .action-group:last-child {
          margin-bottom: 0;
        }

        /* Enhanced button styling */
        .ant-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }

        .ant-btn:active {
          transform: translateY(0);
        }

        /* Modal enhancements */
        .ant-modal-header {
          border-bottom: 2px solid #ff4500;
        }

        .ant-modal-footer {
          border-top: 1px solid #e8e8e8;
          padding: 16px 24px;
        }
      `}</style>
    </div>
  );
};

export default DaftarVerbatim;

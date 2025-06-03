import React, { useState } from "react";
import {
  Form,
  Select,
  Input,
  Button,
  Card,
  Typography,
  Space,
  Empty,
  Divider,
  Timeline,
  Tag,
  Progress,
  Alert,
  Collapse,
} from "antd";
import {
  SearchOutlined,
  FileTextOutlined,
  CarOutlined,
  HomeOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  CalendarOutlined,
  DollarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { createStyles } from "antd-style";

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const tipePengajuan = [
  {
    value: "kkb",
    label: "Kredit Kendaraan Bermotor",
    icon: <CarOutlined style={{ marginRight: 8, color: "#dc2626" }} />,
  },
  {
    value: "kpr",
    label: "Kredit Pemilikan Rumah",
    icon: <HomeOutlined style={{ marginRight: 8, color: "#dc2626" }} />,
  },
  {
    value: "multiguna",
    label: "Kredit Multiguna",
    icon: <CreditCardOutlined style={{ marginRight: 8, color: "#dc2626" }} />,
  },
];

// Sample data untuk demo
const sampleStatusData = {
  kkb: {
    "KKB-2024-001": {
      status: "approved",
      nomorPengajuan: "KKB-2024-001",
      jenisKredit: "Kredit Kendaraan Bermotor",
      pemohon: "Ahmad Suryanto",
      tanggalPengajuan: "2024-01-15",
      estimasiSelesai: "2024-02-15",
      jumlahPinjaman: "Rp 150.000.000",
      progress: 100,
      timeline: [
        {
          date: "2024-01-15",
          title: "Pengajuan Diterima",
          description: "Dokumen lengkap telah diterima",
          status: "completed",
        },
        {
          date: "2024-01-18",
          title: "Verifikasi Dokumen",
          description: "Semua dokumen telah diverifikasi",
          status: "completed",
        },
        {
          date: "2024-01-22",
          title: "Survey & Penilaian",
          description: "Survey kendaraan telah selesai",
          status: "completed",
        },
        {
          date: "2024-01-25",
          title: "Analisis Kredit",
          description: "Analisis kredit telah diselesaikan",
          status: "completed",
        },
        {
          date: "2024-01-28",
          title: "Persetujuan",
          description: "Pengajuan kredit disetujui",
          status: "completed",
        },
      ],
    },
    "KKB-2024-002": {
      status: "in_review",
      nomorPengajuan: "KKB-2024-002",
      jenisKredit: "Kredit Kendaraan Bermotor",
      pemohon: "Siti Nurhaliza",
      tanggalPengajuan: "2024-01-20",
      estimasiSelesai: "2024-02-20",
      jumlahPinjaman: "Rp 80.000.000",
      progress: 60,
      timeline: [
        {
          date: "2024-01-20",
          title: "Pengajuan Diterima",
          description: "Dokumen lengkap telah diterima",
          status: "completed",
        },
        {
          date: "2024-01-23",
          title: "Verifikasi Dokumen",
          description: "Semua dokumen telah diverifikasi",
          status: "completed",
        },
        {
          date: "2024-01-26",
          title: "Survey & Penilaian",
          description: "Sedang dalam proses survey kendaraan",
          status: "current",
        },
        {
          date: "2024-01-30",
          title: "Analisis Kredit",
          description: "Menunggu hasil survey",
          status: "pending",
        },
        {
          date: "2024-02-02",
          title: "Keputusan Final",
          description: "Menunggu proses sebelumnya",
          status: "pending",
        },
      ],
    },
  },
  kpr: {
    "KPR-2024-001": {
      status: "need_documents",
      nomorPengajuan: "KPR-2024-001",
      jenisKredit: "Kredit Pemilikan Rumah",
      pemohon: "Budi Santoso",
      tanggalPengajuan: "2024-01-10",
      estimasiSelesai: "2024-03-10",
      jumlahPinjaman: "Rp 500.000.000",
      progress: 40,
      timeline: [
        {
          date: "2024-01-10",
          title: "Pengajuan Diterima",
          description: "Dokumen awal telah diterima",
          status: "completed",
        },
        {
          date: "2024-01-13",
          title: "Verifikasi Dokumen",
          description: "Memerlukan dokumen tambahan",
          status: "need_action",
        },
      ],
      documentsNeeded: [
        "Sertifikat tanah asli",
        "Slip gaji 3 bulan terakhir",
        "Rekening koran 6 bulan terakhir",
      ],
    },
  },
  multiguna: {
    "MG-2024-001": {
      status: "rejected",
      nomorPengajuan: "MG-2024-001",
      jenisKredit: "Kredit Multiguna",
      pemohon: "Dewi Lestari",
      tanggalPengajuan: "2024-01-05",
      jumlahPinjaman: "Rp 100.000.000",
      progress: 100,
      rejectionReason:
        "Tidak memenuhi syarat kredit berdasarkan analisis kemampuan bayar dan riwayat kredit.",
      timeline: [
        {
          date: "2024-01-05",
          title: "Pengajuan Diterima",
          description: "Dokumen lengkap telah diterima",
          status: "completed",
        },
        {
          date: "2024-01-08",
          title: "Verifikasi Dokumen",
          description: "Semua dokumen telah diverifikasi",
          status: "completed",
        },
        {
          date: "2024-01-12",
          title: "Analisis Kredit",
          description: "Analisis kredit telah diselesaikan",
          status: "completed",
        },
        {
          date: "2024-01-15",
          title: "Keputusan",
          description: "Pengajuan tidak dapat disetujui",
          status: "rejected",
        },
      ],
    },
  },
};

const useStyle = createStyles(({ token, css }) => ({
  container: css`
    width: 100%;
    max-height: 70vh;
    overflow-y: auto;

    /* Custom Scrollbar Styling */
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: #f8fafc;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, #dc2626, #ef4444);
      border-radius: 3px;
      transition: all 0.3s ease;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(135deg, #b91c1c, #dc2626);
      width: 8px;
    }

    /* Firefox Scrollbar */
    scrollbar-width: thin;
    scrollbar-color: #dc2626 #f8fafc;
  `,
  statusCard: css`
    border-radius: 12px;
    border: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    margin-bottom: 16px;
  `,
  headerSection: css`
    background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
    color: white;
    padding: 20px 24px 16px 24px;
    text-align: center;
    position: relative;
    border-radius: 12px 12px 0 0;
  `,
  formContainer: css`
    padding: 24px;
    background: white;
  `,
  formItemCustom: css`
    margin-bottom: 16px;
  `,
  selectCustom: css`
    .ant-select-selector {
      border-radius: 8px !important;
      border: 1px solid #e2e8f0 !important;
      height: 40px !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }

    &:hover .ant-select-selector,
    &.ant-select-focused .ant-select-selector {
      border-color: #dc2626 !important;
      box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.1) !important;
    }
  `,
  inputCustom: css`
    border-radius: 8px !important;
    border: 1px solid #e2e8f0 !important;
    height: 40px !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;

    &:hover,
    &:focus {
      border-color: #dc2626 !important;
      box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.1) !important;
    }
  `,
  submitButton: css`
    width: 100% !important;
    height: 44px !important;
    border-radius: 8px !important;
    font-weight: 600 !important;
    background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%) !important;
    border: none !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;

    &:hover {
      transform: translateY(-1px) !important;
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3) !important;
    }
  `,
  iconWrapper: css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    margin-bottom: 12px;
    font-size: 18px;
  `,
  formLabel: css`
    font-weight: 600 !important;
    font-size: 14px !important;
    color: #1f2937 !important;
  `,
  formHelpText: css`
    font-size: 12px;
    color: #6b7280;
    margin-top: 12px;
    margin-bottom: 12px;
  `,
  resultCard: css`
    border-radius: 12px;
    border: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    max-height: 50vh;
    overflow-y: auto;

    /* Custom Scrollbar Styling for Result Card */
    &::-webkit-scrollbar {
      width: 5px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 2.5px;
      margin: 8px 0;
    }

    &::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, #94a3b8, #cbd5e1);
      border-radius: 2.5px;
      transition: all 0.3s ease;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(135deg, #64748b, #94a3b8);
    }

    /* Firefox Scrollbar */
    scrollbar-width: thin;
    scrollbar-color: #94a3b8 #f1f5f9;
  `,
  statusHeader: css`
    padding: 16px 20px;
    border-bottom: 1px solid #f1f5f9;
  `,
  statusBadge: css`
    font-size: 12px;
    font-weight: 600;
    padding: 4px 12px;
    border-radius: 16px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  `,
  approvedBadge: css`
    background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
    color: white;
    border: none;
  `,
  rejectedBadge: css`
    background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
    color: white;
    border: none;
  `,
  inReviewBadge: css`
    background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
    color: white;
    border: none;
  `,
  needDocsBadge: css`
    background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
    color: white;
    border: none;
  `,
  infoGrid: css`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
    padding: 16px 20px;
  `,
  infoItem: css`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: #f8fafc;
    border-radius: 8px;
    border-left: 3px solid #dc2626;
  `,
  compactTimeline: css`
    padding: 16px 20px;
    border-top: 1px solid #f1f5f9;

    .ant-timeline {
      margin-top: 8px;
    }

    .ant-timeline-item {
      padding-bottom: 12px;
    }
  `,
  documentsNeeded: css`
    padding: 16px 20px;
    border-top: 1px solid #f1f5f9;

    .doc-item {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 0;
      font-size: 13px;
    }
  `,
  compactAlert: css`
    margin: 16px 20px;

    .ant-alert {
      padding: 8px 12px;
      border-radius: 6px;
    }
  `,
  // Styling untuk collapse panel scrollbar
  collapsePanel: css`
    .ant-collapse-content-box {
      max-height: 200px;
      overflow-y: auto;

      &::-webkit-scrollbar {
        width: 4px;
      }

      &::-webkit-scrollbar-track {
        background: #f8fafc;
        border-radius: 2px;
      }

      &::-webkit-scrollbar-thumb {
        background: #e2e8f0;
        border-radius: 2px;
        transition: all 0.3s ease;
      }

      &::-webkit-scrollbar-thumb:hover {
        background: #cbd5e1;
      }

      /* Firefox Scrollbar */
      scrollbar-width: thin;
      scrollbar-color: #e2e8f0 #f8fafc;
    }
  `,
}));

const getStatusConfig = (status) => {
  const configs = {
    approved: {
      label: "Disetujui",
      color: "success",
      icon: <CheckCircleOutlined />,
      className: "approvedBadge",
    },
    rejected: {
      label: "Ditolak",
      color: "error",
      icon: <CloseCircleOutlined />,
      className: "rejectedBadge",
    },
    in_review: {
      label: "Dalam Review",
      color: "warning",
      icon: <ClockCircleOutlined />,
      className: "inReviewBadge",
    },
    need_documents: {
      label: "Butuh Dokumen",
      color: "processing",
      icon: <ExclamationCircleOutlined />,
      className: "needDocsBadge",
    },
  };
  return configs[status] || configs.in_review;
};

const getTimelineIcon = (status) => {
  const icons = {
    completed: (
      <CheckCircleOutlined style={{ color: "#10b981", fontSize: 14 }} />
    ),
    current: <ClockCircleOutlined style={{ color: "#f59e0b", fontSize: 14 }} />,
    pending: <ClockCircleOutlined style={{ color: "#94a3b8", fontSize: 14 }} />,
    need_action: (
      <ExclamationCircleOutlined style={{ color: "#8b5cf6", fontSize: 14 }} />
    ),
    rejected: (
      <CloseCircleOutlined style={{ color: "#ef4444", fontSize: 14 }} />
    ),
  };
  return icons[status] || icons.pending;
};

const Result = ({ data }) => {
  const { styles } = useStyle();

  if (!data) {
    return (
      <Card className={styles.resultCard}>
        <Empty
          description="Masukkan nomor pengajuan untuk melihat status"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ padding: "20px 0" }}
        />
      </Card>
    );
  }

  const statusConfig = getStatusConfig(data.status);

  return (
    <Card className={styles.resultCard} bodyStyle={{ padding: 0 }}>
      {/* Status Header */}
      <div className={styles.statusHeader}>
        <Space direction="vertical" size="small" style={{ width: "100%" }}>
          <Space align="center" size="small" style={{ width: "100%" }}>
            <span
              className={`${styles.statusBadge} ${
                styles[statusConfig.className]
              }`}
            >
              {statusConfig.icon} {statusConfig.label}
            </span>
            <Progress
              percent={data.progress}
              size="small"
              strokeColor="#dc2626"
              style={{ flex: 1 }}
              showInfo={false}
            />
            <Text style={{ fontSize: 12, color: "#6b7280" }}>
              {data.progress}%
            </Text>
          </Space>
          <Title level={5} style={{ margin: "4px 0 0 0" }}>
            {data.jenisKredit}
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            #{data.nomorPengajuan}
          </Text>
        </Space>
      </div>

      {/* Info Grid */}
      <div className={styles.infoGrid}>
        <div className={styles.infoItem}>
          <UserOutlined style={{ color: "#dc2626", fontSize: 14 }} />
          <Space direction="vertical" size={0}>
            <Text style={{ fontSize: 12, fontWeight: 600 }}>Pemohon</Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {data.pemohon}
            </Text>
          </Space>
        </div>
        <div className={styles.infoItem}>
          <CalendarOutlined style={{ color: "#dc2626", fontSize: 14 }} />
          <Space direction="vertical" size={0}>
            <Text style={{ fontSize: 12, fontWeight: 600 }}>Tanggal</Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {data.tanggalPengajuan}
            </Text>
          </Space>
        </div>
        <div className={styles.infoItem}>
          <DollarOutlined style={{ color: "#dc2626", fontSize: 14 }} />
          <Space direction="vertical" size={0}>
            <Text style={{ fontSize: 12, fontWeight: 600 }}>Pinjaman</Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {data.jumlahPinjaman}
            </Text>
          </Space>
        </div>
        {data.estimasiSelesai && (
          <div className={styles.infoItem}>
            <ClockCircleOutlined style={{ color: "#dc2626", fontSize: 14 }} />
            <Space direction="vertical" size={0}>
              <Text style={{ fontSize: 12, fontWeight: 600 }}>Estimasi</Text>
              <Text type="secondary" style={{ fontSize: 11 }}>
                {data.estimasiSelesai}
              </Text>
            </Space>
          </div>
        )}
      </div>

      {/* Rejection Reason */}
      {data.status === "rejected" && data.rejectionReason && (
        <div className={styles.compactAlert}>
          <Alert
            message="Alasan Penolakan"
            description={data.rejectionReason}
            type="error"
            showIcon
            size="small"
          />
        </div>
      )}

      {/* Documents Needed */}
      {data.documentsNeeded && (
        <div className={styles.documentsNeeded}>
          <Title level={5} style={{ marginBottom: 8, fontSize: 14 }}>
            <WarningOutlined style={{ color: "#f59e0b", marginRight: 6 }} />
            Dokumen Diperlukan
          </Title>
          {data.documentsNeeded.map((doc, index) => (
            <div key={index} className="doc-item">
              <FileTextOutlined style={{ color: "#dc2626", fontSize: 12 }} />
              <Text style={{ fontSize: 12 }}>{doc}</Text>
            </div>
          ))}
        </div>
      )}

      {/* Compact Timeline */}
      <Collapse
        size="small"
        ghost
        className={styles.collapsePanel}
        style={{ margin: "0 20px 16px" }}
      >
        <Panel
          header={
            <Text strong style={{ fontSize: 13 }}>
              Timeline Pengajuan ({data.timeline.length} tahap)
            </Text>
          }
          key="timeline"
        >
          <Timeline
            size="small"
            items={data.timeline.map((item) => ({
              dot: getTimelineIcon(item.status),
              children: (
                <Space direction="vertical" size={2}>
                  <Space size="small">
                    <Text strong style={{ fontSize: 12 }}>
                      {item.title}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {item.date}
                    </Text>
                  </Space>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {item.description}
                  </Text>
                </Space>
              ),
            }))}
          />
        </Panel>
      </Collapse>
    </Card>
  );
};

function CekStatusPengajuan({ onSubmit, isLoading }) {
  const [form] = Form.useForm();
  const [resultData, setResultData] = useState(null);
  const { styles } = useStyle();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      console.log(values);

      // Simulate API call
      setTimeout(() => {
        const data =
          sampleStatusData[values.tipePengajuan]?.[values.nomorPengajuan];
        setResultData(data || null);
        onSubmit(values);
      }, 1000);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.statusCard} bodyStyle={{ padding: 0 }}>
        {/* Header Section */}
        <div className={styles.headerSection}>
          <div className={styles.iconWrapper}>
            <SearchOutlined />
          </div>
          <Title level={4} style={{ color: "white", margin: "0 0 4px 0" }}>
            Cek Status Pengajuan
          </Title>
          <Text style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: 13 }}>
            Pantau perkembangan pengajuan kredit Anda
          </Text>
        </div>

        {/* Form Section */}
        <div className={styles.formContainer}>
          <Form
            layout="vertical"
            form={form}
            onFinish={handleSubmit}
            requiredMark={false}
          >
            <Form.Item
              className={styles.formItemCustom}
              rules={[
                {
                  required: true,
                  message: "Silakan pilih tipe pengajuan",
                },
              ]}
              name="tipePengajuan"
              label={<span className={styles.formLabel}>Tipe Pengajuan</span>}
              help={
                <div className={styles.formHelpText}>
                  Pilih jenis kredit yang sudah Anda ajukan
                </div>
              }
            >
              <Select
                className={styles.selectCustom}
                placeholder="Pilih jenis pengajuan kredit"
                options={tipePengajuan}
                optionRender={(option) => (
                  <Space>
                    {option.data.icon}
                    {option.data.label}
                  </Space>
                )}
              />
            </Form.Item>

            <Form.Item
              className={styles.formItemCustom}
              rules={[
                {
                  required: true,
                  message: "Nomor pengajuan wajib diisi",
                },
              ]}
              name="nomorPengajuan"
              label={<span className={styles.formLabel}>Nomor Pengajuan</span>}
              help={
                <div className={styles.formHelpText}>
                  Contoh: KKB-2024-001, KPR-2024-001, MG-2024-001
                </div>
              }
            >
              <Input
                className={styles.inputCustom}
                placeholder="Masukkan nomor pengajuan Anda"
                prefix={<FileTextOutlined style={{ color: "#6b7280" }} />}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 20 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                className={styles.submitButton}
                icon={<SearchOutlined />}
              >
                {isLoading ? "Mencari..." : "Cek Status"}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Card>

      {resultData && <Result data={resultData} />}
    </div>
  );
}

export default CekStatusPengajuan;

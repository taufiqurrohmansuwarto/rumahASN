import React from "react";
import { Collapse, Card, Typography, Space, Tag, Grid } from "antd";
import {
  QuestionCircleOutlined,
  DollarOutlined,
  CalendarOutlined,
  FileTextOutlined,
  BankOutlined,
  SafetyOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  CreditCardOutlined,
  PercentageOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { useBreakpoint } = Grid;

const BankJatimFAQ = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const faqData = [
    {
      key: "1",
      icon: <CreditCardOutlined style={{ color: "#dc2626" }} />,
      question: "Apa saja jenis kredit yang tersedia di Bank Jatim?",
      answer: (
        <div>
          <Paragraph>
            Bank Jatim menyediakan berbagai jenis kredit untuk memenuhi
            kebutuhan finansial Anda:
          </Paragraph>
          <ul>
            <li>
              <strong>KKB (Kredit Kendaraan Bermotor)</strong> - Untuk pembelian
              kendaraan roda 2 dan roda 4
            </li>
            <li>
              <strong>KPR (Kredit Pemilikan Rumah)</strong> - Untuk pembelian
              rumah tinggal
            </li>
            <li>
              <strong>KMG (Kredit Multiguna)</strong> - Untuk berbagai kebutuhan
              konsumtif
            </li>
          </ul>
          <Tag color="blue">Semua jenis kredit tersedia khusus untuk ASN</Tag>
        </div>
      ),
    },
    {
      key: "2",
      icon: <PercentageOutlined style={{ color: "#dc2626" }} />,
      question: "Berapa suku bunga kredit di Bank Jatim?",
      answer: (
        <div>
          <Paragraph>Suku bunga kredit Bank Jatim sangat kompetitif:</Paragraph>
          <Space direction="vertical" size="small">
            <Text>
              • <strong>KKB:</strong> Mulai dari 6.5% per tahun
            </Text>
            <Text>
              • <strong>KPR:</strong> Mulai dari 7.0% per tahun
            </Text>
            <Text>
              • <strong>KMG:</strong> Mulai dari 8.0% per tahun
            </Text>
          </Space>
          <br />
          <br />
          <Tag color="green">
            Suku bunga dapat berubah sesuai kebijakan bank
          </Tag>
        </div>
      ),
    },
    {
      key: "3",
      icon: <CalendarOutlined style={{ color: "#dc2626" }} />,
      question: "Berapa lama tenor kredit yang tersedia?",
      answer: (
        <div>
          <Paragraph>
            Tenor kredit disesuaikan dengan jenis kredit dan kemampuan bayar:
          </Paragraph>
          <Space direction="vertical" size="small">
            <Text>
              • <strong>KKB:</strong> 1 - 7 tahun
            </Text>
            <Text>
              • <strong>KPR:</strong> 5 - 25 tahun
            </Text>
            <Text>
              • <strong>KMG:</strong> 1 - 5 tahun
            </Text>
          </Space>
          <br />
          <br />
          <Tag color="orange">
            Tenor maksimal disesuaikan dengan usia pensiun ASN
          </Tag>
        </div>
      ),
    },
    {
      key: "4",
      icon: <DollarOutlined style={{ color: "#dc2626" }} />,
      question: "Berapa Down Payment (DP) minimum yang diperlukan?",
      answer: (
        <div>
          <Paragraph>DP minimum bervariasi tergantung jenis kredit:</Paragraph>
          <Space direction="vertical" size="small">
            <Text>
              • <strong>KKB:</strong> Minimum 10% dari harga kendaraan
            </Text>
            <Text>
              • <strong>KPR:</strong> Minimum 10% dari harga properti
            </Text>
            <Text>
              • <strong>KMG:</strong> Tanpa DP (sesuai plafon yang disetujui)
            </Text>
          </Space>
          <br />
          <br />
          <Tag color="purple">
            DP yang lebih besar dapat mengurangi cicilan bulanan
          </Tag>
        </div>
      ),
    },
    {
      key: "5",
      icon: <FileTextOutlined style={{ color: "#dc2626" }} />,
      question: "Apa saja syarat dan dokumen yang diperlukan?",
      answer: (
        <div>
          <Paragraph>
            <strong>Syarat Umum:</strong>
          </Paragraph>
          <ul>
            <li>ASN aktif dengan masa kerja minimal 2 tahun</li>
            <li>Usia maksimal 55 tahun saat pengajuan</li>
            <li>Memiliki rekening gaji di Bank Jatim</li>
          </ul>
          <Paragraph>
            <strong>Dokumen yang diperlukan:</strong>
          </Paragraph>
          <ul>
            <li>Fotokopi KTP dan Kartu Keluarga</li>
            <li>Fotokopi SK Pengangkatan terakhir</li>
            <li>Slip gaji 3 bulan terakhir</li>
            <li>Fotokopi rekening tabungan 3 bulan terakhir</li>
            <li>Dokumen agunan (untuk KKB dan KPR)</li>
          </ul>
        </div>
      ),
    },
    {
      key: "6",
      icon: <ClockCircleOutlined style={{ color: "#dc2626" }} />,
      question: "Berapa lama proses persetujuan kredit?",
      answer: (
        <div>
          <Paragraph>
            Proses persetujuan kredit Bank Jatim relatif cepat:
          </Paragraph>
          <Space direction="vertical" size="small">
            <Text>
              • <strong>Verifikasi dokumen:</strong> 1-2 hari kerja
            </Text>
            <Text>
              • <strong>Survey lapangan:</strong> 2-3 hari kerja (jika
              diperlukan)
            </Text>
            <Text>
              • <strong>Analisa kredit:</strong> 3-5 hari kerja
            </Text>
            <Text>
              • <strong>Persetujuan:</strong> 1-2 hari kerja
            </Text>
          </Space>
          <br />
          <br />
          <Tag color="cyan">Total proses maksimal 14 hari kerja</Tag>
        </div>
      ),
    },
    {
      key: "7",
      icon: <SafetyOutlined style={{ color: "#dc2626" }} />,
      question: "Apakah kredit dilindungi asuransi?",
      answer: (
        <div>
          <Paragraph>
            Ya, semua kredit Bank Jatim dilindungi asuransi:
          </Paragraph>
          <Space direction="vertical" size="small">
            <Text>
              • <strong>Asuransi Jiwa:</strong> Melindungi dari risiko meninggal
              dunia
            </Text>
            <Text>
              • <strong>Asuransi Kebakaran:</strong> Khusus untuk KPR
            </Text>
            <Text>
              • <strong>Asuransi Kendaraan:</strong> Khusus untuk KKB (TLO/All
              Risk)
            </Text>
          </Space>
          <br />
          <br />
          <Tag color="red">
            Premi asuransi sudah termasuk dalam cicilan bulanan
          </Tag>
        </div>
      ),
    },
    {
      key: "8",
      icon: <BankOutlined style={{ color: "#dc2626" }} />,
      question: "Bisakah take over kredit dari bank lain?",
      answer: (
        <div>
          <Paragraph>
            Ya, Bank Jatim menerima take over kredit dari bank lain dengan
            syarat:
          </Paragraph>
          <ul>
            <li>Kredit existing memiliki track record yang baik</li>
            <li>Sisa tenor minimal 1 tahun</li>
            <li>Memenuhi syarat kredit Bank Jatim</li>
            <li>Agunan masih memiliki nilai yang memadai</li>
          </ul>
          <Tag color="geekblue">
            Take over dapat memberikan suku bunga yang lebih kompetitif
          </Tag>
        </div>
      ),
    },
    {
      key: "9",
      icon: <PhoneOutlined style={{ color: "#dc2626" }} />,
      question: "Bagaimana cara menghubungi customer service?",
      answer: (
        <div>
          <Paragraph>
            Anda dapat menghubungi kami melalui berbagai channel:
          </Paragraph>
          <Space direction="vertical" size="small">
            <Text>
              • <strong>Call Center:</strong> 1500-123 (24 jam)
            </Text>
            <Text>
              • <strong>WhatsApp:</strong> 0811-3456-789
            </Text>
            <Text>
              • <strong>Email:</strong> cs@bankjatim.co.id
            </Text>
            <Text>
              • <strong>Website:</strong> www.bankjatim.co.id
            </Text>
          </Space>
          <br />
          <br />
          <Tag color="magenta">Customer service siap membantu Anda 24/7</Tag>
        </div>
      ),
    },
  ];

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
            padding: isMobile ? "20px 16px" : "24px 24px",
            textAlign: "center",
          }}
        >
          <QuestionCircleOutlined style={{ fontSize: 32, marginBottom: 12 }} />
          <Title level={3} style={{ color: "white", margin: "0 0 8px 0" }}>
            Frequently Asked Questions
          </Title>
          <Text style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: 16 }}>
            Pertanyaan yang Sering Diajukan tentang Layanan Kredit Bank Jatim
          </Text>
        </div>

        {/* FAQ Content */}
        <div
          style={{
            padding: isMobile ? 16 : 24,
            height: "calc(100% - 140px)",
            overflowY: "auto",
          }}
        >
          <Collapse
            ghost
            size="large"
            expandIconPosition="end"
            style={{
              background: "transparent",
            }}
          >
            {faqData.map((faq) => (
              <Panel
                key={faq.key}
                header={
                  <Space size="middle" style={{ alignItems: "flex-start" }}>
                    <div style={{ marginTop: 2 }}>{faq.icon}</div>
                    <Text
                      style={{
                        fontSize: isMobile ? 14 : 16,
                        fontWeight: 600,
                        color: "#1f2937",
                        lineHeight: 1.5,
                      }}
                    >
                      {faq.question}
                    </Text>
                  </Space>
                }
                style={{
                  marginBottom: 8,
                  background: "#fafbfc",
                  borderRadius: 12,
                  border: "1px solid #e5e7eb",
                }}
              >
                <div
                  style={{
                    paddingLeft: isMobile ? 0 : 40,
                    color: "#4b5563",
                    lineHeight: 1.6,
                  }}
                >
                  {faq.answer}
                </div>
              </Panel>
            ))}
          </Collapse>

          {/* Contact Info */}
          <Card
            style={{
              marginTop: 24,
              borderRadius: 12,
              background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
              border: "1px solid #e2e8f0",
            }}
          >
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Title level={5} style={{ margin: 0, color: "#dc2626" }}>
                Butuh Bantuan Lebih Lanjut?
              </Title>
              <Paragraph style={{ margin: 0, color: "#4b5563" }}>
                Tim customer service kami siap membantu Anda dengan pertanyaan
                lebih spesifik mengenai layanan kredit Bank Jatim. Jangan ragu
                untuk menghubungi kami!
              </Paragraph>
              <Space wrap>
                <Tag icon={<PhoneOutlined />} color="blue">
                  Call Center: 1500-123
                </Tag>
                <Tag icon={<PhoneOutlined />} color="green">
                  WhatsApp: 0811-3456-789
                </Tag>
              </Space>
            </Space>
          </Card>
        </div>
      </Card>
    </div>
  );
};

export default BankJatimFAQ;

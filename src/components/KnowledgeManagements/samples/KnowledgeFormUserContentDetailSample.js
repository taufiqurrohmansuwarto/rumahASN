import React from "react";
import {
  Row,
  Col,
  Card,
  Tag,
  Space,
  Typography,
  Button,
  Avatar,
  Progress,
  Divider,
  List,
  Input,
  Affix,
} from "antd";
import {
  LikeOutlined,
  BookOutlined,
  ShareAltOutlined,
  ExclamationCircleOutlined,
  DownloadOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

export default function KnowledgeFormUserContentDetailSample({ children }) {
  return (
    <Space
      direction="vertical"
      size="middle"
      style={{ width: "100%", padding: 16, maxWidth: 1120, margin: "0 auto" }}
    >
      {/* Row 1: Header */}
      <Card>
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Title level={2} style={{ margin: 0 }}>
            Judul Konten / Artikel
          </Title>
          <Space wrap>
            <Tag color="blue">Kategori: Kinerja & IP ASN</Tag>
            <Tag>#skp</Tag>
            <Tag>#panduan</Tag>
            <Tag color="green">Verified BKD</Tag>
            {/* atau tampilkan Tag "Draft" / "Published" */}
          </Space>
        </Space>
      </Card>

      {/* Row 2: Meta & Author */}
      <Row gutter={[16, 16]}>
        {/* Col Kiri: Meta */}
        <Col xs={24} md={16}>
          <Card>
            <Space size="large" wrap>
              <Text>📅 Dipublikasikan: 10 Jan 2025</Text>
              <Text>🛠️ Update: 15 Jan 2025</Text>
              <Text>⏱️ Baca: ~3 menit</Text>
              <Text>👁️ 245 views</Text>
              <Text>👍 37 likes</Text>
              <Text>💬 5 komentar</Text>
            </Space>
          </Card>
        </Col>

        {/* Col Kanan: Penulis */}
        <Col xs={24} md={8}>
          <Card>
            <Space align="start">
              <Avatar size={48} />
              <Space direction="vertical" size={2}>
                <Text strong>Budi Santoso</Text>
                <Text type="secondary">Analis Kepegawaian • BKD Jatim</Text>
                <Space size="small" wrap>
                  <Tag>Level 4</Tag>
                  <Tag color="gold">Problem Solver</Tag>
                </Space>
                <Button type="link" size="small">
                  Lihat Profil
                </Button>
              </Space>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Row 3: Konten */}
      <Card>
        {/* TL;DR */}
        <Card size="small" style={{ background: "#f8fafc" }} bordered={false}>
          <Text strong>TL;DR</Text>
          <ul style={{ margin: "8px 0 0 18px" }}>
            <li>Pahami indikator & target SKP.</li>
            <li>Sinkron dengan atasan & sistem.</li>
            <li>Kumpulkan bukti pendukung sejak awal.</li>
          </ul>
        </Card>

        <Divider />

        {/* Isi Konten */}
        <Space direction="vertical" style={{ width: "100%" }}>
          <Paragraph>
            Isi konten utama (markdown/HTML) ditempatkan di sini. Sertakan
            gambar, tabel, dan contoh jika perlu.
          </Paragraph>
          <Paragraph>
            Gunakan H2/H3 agar mudah discan. Tambahkan ringkasan visual bila
            perlu.
          </Paragraph>
        </Space>

        <Divider />

        {/* Lampiran & Rujukan */}
        <Card size="small" style={{ background: "#fff7e6" }} bordered={false}>
          <Text strong>Lampiran & Rujukan</Text>
          <ul style={{ margin: "8px 0 0 18px" }}>
            <li>
              <a href="#">Template Formulir SKP (PDF)</a>
            </li>
            <li>
              <a href="#">Peraturan X Tahun 2024 (PDF)</a>
            </li>
          </ul>
        </Card>
      </Card>

      {/* Row 4: Komentar & Sidebar */}
      <Row gutter={[16, 16]}>
        {/* Kiri: Komentar */}
        <Col xs={24} md={16}>
          <Card title="Komentar">
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Input.Search placeholder="Tulis komentar…" enterButton="Kirim" />
              <List
                itemLayout="vertical"
                dataSource={[
                  {
                    author: "Siti (BKD)",
                    time: "2 hari lalu",
                    text: "Ringkas dan jelas, terima kasih!",
                  },
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Space>
                          <Text strong>{item.author}</Text>
                          <Text type="secondary">{item.time}</Text>
                        </Space>
                      }
                    />
                    <Paragraph style={{ marginTop: 4 }}>{item.text}</Paragraph>
                  </List.Item>
                )}
              />
            </Space>
          </Card>
        </Col>

        {/* Kanan: Quick Facts + Gamifikasi */}
        <Col xs={24} md={8}>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Card title="Quick Facts">
              <Space direction="vertical">
                <Text>Dasar hukum: Peraturan X/2024</Text>
                <Text>Narahubung: Bidang Kinerja</Text>
                <Text>Email: kinerja@bkd.jatim.go.id</Text>
              </Space>
            </Card>

            <Card title="Gamifikasi">
              <Space direction="vertical" style={{ width: "100%" }}>
                <Space>
                  <Text>XP kamu:</Text>
                  <Text strong>320</Text>
                  <Text>• Level</Text>
                  <Text strong>5</Text>
                </Space>
                <Progress percent={60} showInfo={false} />
                <Text>Daily Quest: Baca 1 konten (0/1)</Text>
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>

      {/* Row 5: Konten Terkait */}
      <Card title="Konten Terkait">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Card hoverable>Panduan SKP Lanjutan</Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card hoverable>Contoh Penilaian IP ASN</Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card hoverable>FAQ SKP: Pertanyaan Umum</Card>
          </Col>
        </Row>
      </Card>

      {/* Row 6: Footer Actions (Sticky) */}
      <Affix offsetBottom={12}>
        <Card
          bodyStyle={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <Space wrap>
            <Button icon={<LikeOutlined />}>Like</Button>
            <Button icon={<BookOutlined />}>Bookmark</Button>
            <Button icon={<ShareAltOutlined />}>Bagikan</Button>
            <Button icon={<ExclamationCircleOutlined />}>Laporkan</Button>
            <Button icon={<DownloadOutlined />}>Unduh PDF</Button>
          </Space>
          <Space align="center">
            <Text type="secondary">+2 XP setelah baca tuntas</Text>
            <div style={{ width: 160 }}>
              <Progress percent={40} showInfo={false} />
            </div>
          </Space>
        </Card>
      </Affix>
    </Space>
  );
}

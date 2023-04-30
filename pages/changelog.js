import { FileTextOutlined } from "@ant-design/icons";
import { Breadcrumb, Layout, Typography } from "antd";
import Link from "next/link";

const { Content, Footer } = Layout;
const { Title } = Typography;

const ChangeLog = () => {
  const changelogData = [
    {
      version: "1.0.0-rc 1",
      date: "20-04-2023",
      changes: [
        "Integrasi dengan Web BKD Provinsi Jawa Timur",
        "Penambahan daftar Web BKD khusus untuk seleksi dan detail halaman seleksi",
      ],
    },
    {
      version: "1.0.0-rc 2",
      date: "21-04-2023",
      changes: [
        "Menambahkan variabel SLA (Service Level Agreement) pada sub kategori",
        "Menambahkan pagination di kategori dan sub kategori",
      ],
    },
    {
      version: "1.0.0-rc 3",
      date: "26-04-2023",
      changes: [
        "Menambahkan kebijakan dan privasi",
        "Menambahkan fungsi analisis data di halaman admin, trend, kepuasan pelanggan, kecepatan respon, dan performa agent",
      ],
    },
    {
      version: "1.0.0-rc 4",
      date: "26-04-2023",
      changes: [
        "Ubah Posisi Grid untuk membaca lebih mudah",
        "scroll restoration",
      ],
    },
    {
      version: "1.0.0-rc 5",
      date: "26-04-2023",
      changes: ["Tambah Fitur Rekomendasi tiket di halaman detail tiket"],
    },
    {
      version: "1.0.0-rc 6",
      date: "30-04-2023",
      changes: ["Tambah fitur rekomendasi untuk faq"],
    },
  ];

  return (
    <Layout>
      <Content style={{ padding: "0 50px", marginTop: 64 }}>
        <Breadcrumb style={{ margin: "16px 0" }}>
          <Breadcrumb.Item>
            <Link href="/">
              <a>Beranda</a>
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Changelog</Breadcrumb.Item>
        </Breadcrumb>
        <div style={{ background: "#fff", padding: 24, minHeight: 380 }}>
          <Title level={2}>Changelog</Title>
          {changelogData.map((entry, index) => (
            <div key={index}>
              <Title level={3}>
                <FileTextOutlined /> {entry.version} - {entry.date}
              </Title>
              <ul>
                {entry.changes.map((change, idx) => (
                  <li key={idx}>{change}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}>
        ©2022 BKD Provinsi Jawa Timur | Rumah ASN
      </Footer>
    </Layout>
  );
};

export default ChangeLog;

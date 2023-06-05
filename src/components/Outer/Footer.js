import { Col, Row, Space, Typography, Grid } from "antd";
import React from "react";

const { useBreakpoint } = Grid;

const applications = [
  {
    name: "SIMASTER Fasilitator",
    url: "https://master.bkd.jatimprov.go.id/fasilitator",
  },
  {
    name: "SIMASTER Personal",
    url: "https://master.bkd.jatimprov.go.id",
  },
  {
    name: "PTTPK Fasilitator",
    url: "https://bkd.jatimprov.go.id/pttpk",
  },
  {
    name: "PTTPK Personal",
    url: "https://bkd.jatimprov.go.id/pttpk/personal",
  },
  {
    name: "Penilaian PTTPK",
    url: "https://siasn.bkd.jatimprov.go.id/pttpk-penilaian",
  },
];

const profil = [
  {
    name: "Profil BKD",
    url: "https://bkd.jatimprov.go.id/Profil-bkdjatim",
  },
  {
    name: "Visi Misi",
    url: "https://bkd.jatimprov.go.id/VisiMisi",
  },
  {
    name: "Struktur Organisasi",
    url: "https://bkd.jatimprov.go.id/StrukturOrganisasi",
  },
];

const bidang = [
  {
    name: "Sekretariat",
    url: "https://bkd.jatimprov.go.id/Sekretariat",
  },
  {
    name: "Pengembangan",
    url: "https://bkd.jatimprov.go.id/PengembanganASN",
  },
  {
    name: "Mutasi",
    url: "https://bkd.jatimprov.go.id/Bidangmutasi",
  },
  {
    name: "Perencanaan, Pengadaaan, Pengolahan Data dan Sistem Informasi ASN",
    url: "https://bkd.jatimprov.go.id/p3dasi",
  },
  {
    name: "Pembinaan Kesejahteraan Perlindungan Hukum",
    url: "https://bkd.jatimprov.go.id/pkph",
  },
];

const zonaIntegritas = [
  {
    name: "Whistleblowing System",
    url: "https://bkd.jatimprov.go.id/websbkdjatim",
  },
];

const styles = {
  footer: {
    backgroundColor: "#1f1f1f",
    color: "white",
    padding: 80,
  },
  textFont: {
    color: "white",
  },
  text: {
    color: "white",
    fontSize: 14,
  },
  credit: {
    backgroundColor: "#1f1f1f",
  },
};

function Footer() {
  const screens = useBreakpoint();
  return (
    <div>
      <div style={styles.footer}>
        <Row
          gutter={[16, 16]}
          style={{
            paddingLeft: screens.xs ? 0 : 300,
            paddingRight: screens.xs ? 0 : 300,
          }}
        >
          <Col md={6} xs={12}>
            <Typography.Title level={2} style={styles.textFont}>
              Aplikasi
            </Typography.Title>
            <Space direction="vertical">
              {applications.map((application) => (
                <Typography.Link key={application?.name} style={styles.text}>
                  {application.name}
                </Typography.Link>
              ))}
            </Space>
          </Col>
          <Col md={6} xs={12}>
            <Typography.Title level={2} style={styles.textFont}>
              Bidang
            </Typography.Title>
            <Space direction="vertical">
              {bidang?.map((bidang) => (
                <Typography.Link key={bidang?.name} style={styles.text}>
                  {bidang.name}
                </Typography.Link>
              ))}
            </Space>
          </Col>
          <Col md={6} xs={12}>
            <Typography.Title level={2} style={styles.textFont}>
              Zona Integritas
            </Typography.Title>
            <Space direction="vertical">
              {zonaIntegritas?.map((bidang) => (
                <Typography.Link key={bidang?.name} style={styles.text}>
                  {bidang.name}
                </Typography.Link>
              ))}
            </Space>
          </Col>
          <Col md={6} xs={12}>
            <Typography.Title level={2} style={styles.textFont}>
              Profil
            </Typography.Title>
            <Space direction="vertical">
              {profil?.map((bidang) => (
                <Typography.Link key={bidang?.name} style={styles.text}>
                  {bidang.name}
                </Typography.Link>
              ))}
            </Space>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default Footer;

import { Col, Divider, Grid, Row, Space, Typography } from "antd";

const { useBreakpoint } = Grid;

const COLOR = "#f0f0f0";

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
    backgroundColor: "#2f54eb",
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
          gutter={[32, 32]}
          style={{
            paddingLeft: screens?.xxl ? 400 : 0,
            paddingRight: screens?.xxl ? 400 : 0,
          }}
        >
          <Col xl={6} lg={6} sm={12} md={12} xs={24}>
            <Typography.Title level={2} style={styles.textFont}>
              Aplikasi
            </Typography.Title>
            <Space direction="vertical">
              {applications.map((application) => (
                <Typography key={application?.name} style={styles.text}>
                  <a
                    style={{
                      color: COLOR,
                    }}
                    href={application?.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {application.name}
                  </a>
                </Typography>
              ))}
            </Space>
          </Col>
          <Col xl={6} lg={6} sm={12} md={12} xs={24}>
            <Typography.Title level={2} style={styles.textFont}>
              Bidang
            </Typography.Title>
            <Space direction="vertical">
              {bidang?.map((bidang) => (
                <Typography key={bidang?.name} style={styles.text}>
                  <a
                    style={{
                      color: COLOR,
                    }}
                    href={bidang?.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {bidang.name}
                  </a>
                </Typography>
              ))}
            </Space>
          </Col>
          <Col lg={6} xl={6} sm={12} md={12} xs={24}>
            <Typography.Title level={2} style={styles.textFont}>
              Zona Integritas
            </Typography.Title>
            <Space direction="vertical">
              {zonaIntegritas?.map((bidang) => (
                <Typography key={bidang?.name} style={styles.text}>
                  <a
                    style={{
                      color: COLOR,
                    }}
                    href={bidang?.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {bidang.name}
                  </a>
                </Typography>
              ))}
            </Space>
          </Col>
          <Col xl={6} lg={6} sm={12} md={12} xs={24}>
            <Typography.Title level={2} style={styles.textFont}>
              Profil
            </Typography.Title>
            <Space direction="vertical">
              {profil?.map((bidang) => (
                <Typography key={bidang?.name} style={styles.text}>
                  <a
                    style={{
                      color: COLOR,
                    }}
                    href={bidang?.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {bidang.name}
                  </a>
                </Typography>
              ))}
            </Space>
          </Col>
          <Divider
            style={{
              backgroundColor: "#f0f0f0",
            }}
          />
          <Typography.Text
            style={{
              textAlign: "center",
              color: "#fafafa",
              fontSize: 14,
            }}
          >
            @2022 Desain dan Pengembangan oleh Tim IT BKD Provinsi Jawa Timur
          </Typography.Text>
        </Row>
      </div>
    </div>
  );
}

export default Footer;

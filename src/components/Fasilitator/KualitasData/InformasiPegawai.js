import { Avatar, Col, Row, Typography } from "antd";

// Komponen untuk menampilkan informasi pegawai pada tabel
const InformasiPegawai = ({ record, onClick }) => (
  <Row align="middle" gutter={16} style={{ width: "100%", padding: 8 }}>
    <Col>
      <Avatar
        src={record.foto}
        alt={record.nama_master}
        size={56}
        style={{
          backgroundColor: "#f5f5f5",
          color: "#bbb",
          fontWeight: 700,
          fontSize: 24,
          border: "2px solid #f0f0f0",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        {!record.foto && (record.nama_master?.[0] || "?")}
      </Avatar>
    </Col>
    <Col flex="auto">
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Typography.Link onClick={() => onClick(record.nip_master)}>
          {record.nama_master}
        </Typography.Link>
        <Typography.Text
          style={{ color: "#888", fontSize: 13, margin: "2px 0" }}
        >
          {record.nip_master}
        </Typography.Text>
        <Typography.Text>{record.opd_master || "-"}</Typography.Text>
      </div>
    </Col>
  </Row>
);

export default InformasiPegawai;

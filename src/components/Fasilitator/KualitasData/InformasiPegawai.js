import { Avatar, Col, Row, Typography } from "antd";

// Komponen untuk menampilkan informasi pegawai pada tabel
const InformasiPegawai = ({ record, onClick }) => (
  <Row align="middle" gutter={16} style={{ width: "100%", padding: 8 }}>
    <Col>
      <Avatar
        src={record.foto}
        alt={record.nama}
        size={56}
        style={{
          backgroundColor: "#f5f5f5",
          color: "#555",
          fontWeight: 700,
          fontSize: 24,
          border: "2px solid #f0f0f0",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        {!record.foto && (record.nama?.[0] || "?")}
      </Avatar>
    </Col>
    <Col flex="auto">
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Typography.Link
          onClick={() => onClick(record.nip)}
          style={{
            fontSize: 15,
            fontWeight: 600,
            marginBottom: 2,
          }}
        >
          {record.nama}
        </Typography.Link>
        <Typography.Text
          style={{
            color: "#555",
            fontSize: 14,
            margin: "3px 0",
            fontWeight: 500,
          }}
        >
          {record.nip}
        </Typography.Text>
        <Typography.Text
          style={{
            fontSize: 14,
            color: "#333",
            marginTop: 2,
          }}
        >
          {record.unit_organisasi || "-"}
        </Typography.Text>
        <Typography.Text
          style={{
            fontSize: 14,
            color: "#333",
            marginTop: 2,
          }}
        >
          {record.jabatan || "-"}
        </Typography.Text>
      </div>
    </Col>
  </Row>
);

export default InformasiPegawai;

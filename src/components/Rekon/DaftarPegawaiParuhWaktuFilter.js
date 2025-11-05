import { Text } from "@mantine/core";
import { Button, Col, Input, Row, TreeSelect } from "antd";

const { Search } = Input;

const DaftarPegawaiParuhWaktuFilter = ({
  nama,
  nip,
  no_peserta,
  opd_id,
  unor,
  hasFilter,
  onSearch,
  onTreeSelectChange,
  onClearFilter,
}) => {
  return (
    <div
      style={{
        padding: "20px 0 16px 0",
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      <Row gutter={[12, 12]}>
        <Col xs={24} md={5}>
          <div style={{ marginBottom: 4 }}>
            <Text fw={600} size="sm" c="dimmed">
              Nama:
            </Text>
          </div>
          <Search
            placeholder="Cari nama"
            allowClear
            defaultValue={nama}
            onSearch={(value) => onSearch("nama", value)}
            style={{ width: "100%" }}
          />
        </Col>
        <Col xs={24} md={5}>
          <div style={{ marginBottom: 4 }}>
            <Text fw={600} size="sm" c="dimmed">
              NIP:
            </Text>
          </div>
          <Search
            placeholder="Cari NIP"
            allowClear
            defaultValue={nip}
            onSearch={(value) => onSearch("nip", value)}
            style={{ width: "100%" }}
          />
        </Col>
        <Col xs={24} md={5}>
          <div style={{ marginBottom: 4 }}>
            <Text fw={600} size="sm" c="dimmed">
              No. Peserta:
            </Text>
          </div>
          <Search
            placeholder="Cari no. peserta"
            allowClear
            defaultValue={no_peserta}
            onSearch={(value) => onSearch("no_peserta", value)}
            style={{ width: "100%" }}
          />
        </Col>
        <Col xs={24} md={9}>
          <div style={{ marginBottom: 4 }}>
            <Text fw={600} size="sm" c="dimmed">
              Perangkat Daerah:
            </Text>
          </div>
          <TreeSelect
            style={{ width: "100%" }}
            treeNodeFilterProp="label"
            showSearch
            treeData={unor}
            placeholder="Pilih OPD"
            allowClear
            value={opd_id}
            onChange={onTreeSelectChange}
          />
        </Col>
      </Row>
      {hasFilter && (
        <Row style={{ marginTop: 12 }}>
          <Col>
            <Button
              type="text"
              onClick={onClearFilter}
              style={{
                color: "#FF4500",
                fontWeight: 500,
                padding: "4px 8px",
              }}
            >
              Clear Filter
            </Button>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default DaftarPegawaiParuhWaktuFilter;


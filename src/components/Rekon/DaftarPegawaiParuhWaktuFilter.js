import { Text } from "@mantine/core";
import { Button, Col, Input, Row, TreeSelect, InputNumber, Radio } from "antd";

const { Search } = Input;

const DaftarPegawaiParuhWaktuFilter = ({
  nama,
  nip,
  no_peserta,
  opd_id,
  min_gaji,
  max_gaji,
  unor_type,
  unor,
  hasFilter,
  onSearch,
  onTreeSelectChange,
  onGajiChange,
  onUnorTypeChange,
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
        <Col xs={24} md={8}>
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
        <Col xs={24} md={8}>
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
        <Col xs={24} md={8}>
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
      </Row>
      <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
        <Col xs={24}>
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
      <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
        <Col xs={24} md={8}>
          <div style={{ marginBottom: 4 }}>
            <Text fw={600} size="sm" c="dimmed">
              Gaji Min:
            </Text>
          </div>
          <InputNumber
            style={{ width: "100%" }}
            placeholder="Min: 100.000"
            min={100000}
            max={25000000}
            formatter={(value) =>
              `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
            }
            parser={(value) => value.replace(/Rp\s?|(\.*)/g, "")}
            value={min_gaji ? Number(min_gaji) : undefined}
            onChange={(value) => onGajiChange("min_gaji", value)}
          />
        </Col>
        <Col xs={24} md={8}>
          <div style={{ marginBottom: 4 }}>
            <Text fw={600} size="sm" c="dimmed">
              Gaji Max:
            </Text>
          </div>
          <InputNumber
            style={{ width: "100%" }}
            placeholder="Max: 25.000.000"
            min={100000}
            max={25000000}
            formatter={(value) =>
              `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
            }
            parser={(value) => value.replace(/Rp\s?|(\.*)/g, "")}
            value={max_gaji ? Number(max_gaji) : undefined}
            onChange={(value) => onGajiChange("max_gaji", value)}
          />
        </Col>
        <Col xs={24} md={8}>
          <div style={{ marginBottom: 4 }}>
            <Text fw={600} size="sm" c="dimmed">
              Tipe UNOR:
            </Text>
          </div>
          <Radio.Group
            value={unor_type || "simaster"}
            onChange={(e) => onUnorTypeChange(e.target.value)}
            style={{ width: "100%" }}
          >
            <Radio.Button value="simaster">SIMASTER</Radio.Button>
            <Radio.Button value="pk">PK</Radio.Button>
          </Radio.Group>
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


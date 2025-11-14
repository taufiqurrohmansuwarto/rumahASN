import { Text, Divider as MantineDivider } from "@mantine/core";
import {
  Button,
  Col,
  Input,
  Row,
  TreeSelect,
  InputNumber,
  Radio,
  Select,
} from "antd";
import {
  IconUser,
  IconId,
  IconFileText,
  IconBuilding,
  IconCash,
  IconFilter,
  IconBuildingHospital,
  IconMapPin,
  IconCircleCheck,
} from "@tabler/icons-react";

const { Search } = Input;

const DaftarPegawaiParuhWaktuFilter = ({
  nama,
  nip,
  no_peserta,
  opd_id,
  min_gaji,
  max_gaji,
  unor_type,
  is_blud,
  luar_perangkat_daerah,
  unor_match,
  unor,
  hasFilter,
  onSearch,
  onTreeSelectChange,
  onGajiChange,
  onUnorTypeChange,
  onFilterChange,
  onClearFilter,
}) => {
  return (
    <div
      style={{
        marginTop: "16px",
        padding: "16px",
        marginBottom: "16px",
        background: "#fafafa",
        border: "1px solid #e8e8e8",
        borderRadius: "8px",
      }}
    >
      {/* Header Filter */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "12px",
        }}
      >
        <IconFilter size={16} style={{ color: "#FF4500" }} />
        <Text size="sm" fw={600} c="#FF4500">
          Filter Pencarian
        </Text>
      </div>

      <MantineDivider size="xs" style={{ marginBottom: "12px" }} />

      <Row gutter={[8, 8]}>
        <Col xs={24} sm={12} md={6}>
          <Text
            size="xs"
            fw={500}
            style={{ display: "block", marginBottom: 4 }}
          >
            Nama
          </Text>
          <Search
            size="small"
            placeholder="Cari nama"
            allowClear
            defaultValue={nama}
            onSearch={(value) => onSearch("nama", value)}
            prefix={<IconUser size={14} />}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Text
            size="xs"
            fw={500}
            style={{ display: "block", marginBottom: 4 }}
          >
            NIP
          </Text>
          <Search
            size="small"
            placeholder="Cari NIP"
            allowClear
            defaultValue={nip}
            onSearch={(value) => onSearch("nip", value)}
            prefix={<IconId size={14} />}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Text
            size="xs"
            fw={500}
            style={{ display: "block", marginBottom: 4 }}
          >
            No. Peserta
          </Text>
          <Search
            size="small"
            placeholder="Cari no. peserta"
            allowClear
            defaultValue={no_peserta}
            onSearch={(value) => onSearch("no_peserta", value)}
            prefix={<IconFileText size={14} />}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Text
            size="xs"
            fw={500}
            style={{ display: "block", marginBottom: 4 }}
          >
            Tipe UNOR
          </Text>
          <Radio.Group
            size="small"
            value={unor_type || "simaster"}
            onChange={(e) => onUnorTypeChange(e.target.value)}
            style={{ width: "100%" }}
          >
            <Radio.Button value="simaster" style={{ width: "50%" }}>
              <Text size="xs" span>
                SIMASTER
              </Text>
            </Radio.Button>
            <Radio.Button value="pk" style={{ width: "50%" }}>
              <Text size="xs" span>
                PK
              </Text>
            </Radio.Button>
          </Radio.Group>
        </Col>
      </Row>
      <Row gutter={[8, 8]} style={{ marginTop: 8 }}>
        <Col xs={24} md={9}>
          <Text
            size="xs"
            fw={500}
            style={{ display: "block", marginBottom: 4 }}
          >
            Perangkat Daerah
          </Text>
          <TreeSelect
            size="small"
            style={{ width: "100%" }}
            treeNodeFilterProp="label"
            showSearch
            treeData={unor}
            placeholder="Pilih OPD"
            allowClear
            value={opd_id}
            onChange={onTreeSelectChange}
            suffixIcon={<IconBuilding size={14} />}
          />
        </Col>
        <Col xs={12} md={5}>
          <Text
            size="xs"
            fw={500}
            style={{ display: "block", marginBottom: 4 }}
          >
            Upah Min
          </Text>
          <InputNumber
            size="small"
            style={{ width: "100%" }}
            placeholder="100.000"
            min={100000}
            max={25000000}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
            }
            parser={(value) => value.replace(/\./g, "")}
            value={min_gaji ? Number(min_gaji) : undefined}
            onChange={(value) => onGajiChange("min_gaji", value)}
            prefix={<IconCash size={14} />}
          />
        </Col>
        <Col xs={12} md={5}>
          <Text
            size="xs"
            fw={500}
            style={{ display: "block", marginBottom: 4 }}
          >
            Upah Max
          </Text>
          <InputNumber
            size="small"
            style={{ width: "100%" }}
            placeholder="25.000.000"
            min={100000}
            max={25000000}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
            }
            parser={(value) => value.replace(/\./g, "")}
            value={max_gaji ? Number(max_gaji) : undefined}
            onChange={(value) => onGajiChange("max_gaji", value)}
            prefix={<IconCash size={14} />}
          />
        </Col>
        <Col xs={12} md={3}>
          <Text
            size="xs"
            fw={500}
            style={{ display: "block", marginBottom: 4 }}
          >
            BLUD
          </Text>
          <Select
            size="small"
            style={{ width: "100%" }}
            placeholder="Semua"
            allowClear
            value={is_blud}
            onChange={(value) => onFilterChange("is_blud", value)}
            suffixIcon={<IconBuildingHospital size={14} />}
            options={[
              { label: "Ya", value: "true" },
              { label: "Tidak", value: "false" },
            ]}
          />
        </Col>
        <Col xs={12} md={3}>
          <Text
            size="xs"
            fw={500}
            style={{ display: "block", marginBottom: 4 }}
          >
            Luar PD
          </Text>
          <Select
            size="small"
            style={{ width: "100%" }}
            placeholder="Semua"
            allowClear
            value={luar_perangkat_daerah}
            onChange={(value) => onFilterChange("luar_perangkat_daerah", value)}
            suffixIcon={<IconMapPin size={14} />}
            options={[
              { label: "Ya", value: "true" },
              { label: "Tidak", value: "false" },
            ]}
          />
        </Col>
      </Row>
      <Row gutter={[8, 8]} style={{ marginTop: 8 }}>
        <Col xs={24} md={6}>
          <Text
            size="xs"
            fw={500}
            style={{ display: "block", marginBottom: 4 }}
          >
            Status UNOR
          </Text>
          <Select
            size="small"
            style={{ width: "100%" }}
            placeholder="Semua"
            allowClear
            value={unor_match}
            onChange={(value) => onFilterChange("unor_match", value)}
            suffixIcon={<IconCircleCheck size={14} />}
            options={[
              { label: "UNOR PK = SIMASTER (Sama)", value: "same" },
              { label: "UNOR PK ≠ SIMASTER (Beda)", value: "different" },
            ]}
          />
        </Col>
      </Row>
      {hasFilter && (
        <>
          <MantineDivider size="xs" style={{ margin: "12px 0" }} />
          <Row>
            <Col>
              <Button
                type="link"
                size="small"
                onClick={onClearFilter}
                style={{
                  color: "#FF4500",
                  padding: 0,
                }}
              >
                <Text size="xs" fw={500}>
                  Clear Filter
                </Text>
              </Button>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default DaftarPegawaiParuhWaktuFilter;

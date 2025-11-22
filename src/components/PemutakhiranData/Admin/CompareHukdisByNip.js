import { getHukdisByNip } from "@/services/siasn-services";
import {
  dataAlasanHukumanDisiplin,
  dataHukumanDisiplin,
  ppHukumanDisiplin,
} from "@/utils/client-data";
import {
  Badge as MantineBadge,
  Stack,
  Text as MantineText,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconFileText,
  IconPlus,
  IconRefresh,
  IconSend,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Row,
  Select,
  Space,
  Table,
  Tooltip,
} from "antd";
import { useState } from "react";
import dayjs from "dayjs";
import { getRwHukdisByNip } from "@/services/master.services";

const FormModalHukdis = ({ open, onClose, create }) => {
  const [form] = Form.useForm();
  const [dataTingkatHukdis, setDataTingkatHukdis] =
    useState(dataHukumanDisiplin);

  const handleFinish = async (values) => {
    const value = await form.validateFields();
    const payload = {
      ...value,
      hukumanTanggal: dayjs(value?.hukumanTanggal).format("YYYY-MM-DD"),
      tanggalSk: dayjs(value?.tanggalSk).format("YYYY-MM-DD"),
    };
    console.log(payload);
  };

  return (
    <Modal
      width={800}
      open={open}
      onCancel={onClose}
      onOk={handleFinish}
      title={"Tambah Hukuman Disiplin"}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name={"jenisHukumanId"}
          label={"Tingkat Hukuman Disiplin"}
          required
          rules={[
            {
              required: true,
              message: "Pilih Tingkat Hukuman Disiplin",
            },
          ]}
        >
          <Radio.Group
            onChange={(e) => {
              const value = e.target.value;
              if (value === "berat") {
                const hukumanBerat = dataHukumanDisiplin.filter(
                  (hukuman) => hukuman.jenis_tingkat_hukuman_id === "B"
                );
                setDataTingkatHukdis(hukumanBerat);
              } else if (value === "sedang") {
                const hukumanSedang = dataHukumanDisiplin.filter(
                  (hukuman) => hukuman.jenis_tingkat_hukuman_id === "S"
                );
                setDataTingkatHukdis(hukumanSedang);
              } else {
                const hukumanRingan = dataHukumanDisiplin.filter(
                  (hukuman) => hukuman.jenis_tingkat_hukuman_id === "R"
                );
                setDataTingkatHukdis(hukumanRingan);
              }
            }}
          >
            <Radio.Button value="ringan">Ringan</Radio.Button>
            <Radio.Button value="sedang">Sedang</Radio.Button>
            <Radio.Button value="berat">Berat</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          name="jenisTingkatHukumanId"
          label={"Jenis Tingkat Hukuman Disiplin"}
        >
          <Select showSearch allowClear optionFilterProp="nama">
            {dataTingkatHukdis.map((tingkatHukdis) => {
              return (
                <Select.Option
                  nama={tingkatHukdis.nama}
                  key={tingkatHukdis.id}
                  value={tingkatHukdis.id}
                >
                  {tingkatHukdis.nama}
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>
        <Form.Item name="alasanHukumanDisiplinId" label={"Alasan Hukuman"}>
          <Select showSearch allowClear optionFilterProp="nama">
            {dataAlasanHukumanDisiplin.map((alasan) => {
              return (
                <Select.Option
                  nama={alasan.nama}
                  key={alasan.id}
                  value={alasan.id}
                >
                  {alasan.nama}
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>
        <Form.Item name={"nomorPp"} label={"Nomor Peraturan"}>
          <Select showSearch allowClear optionFilterProp="nama">
            {ppHukumanDisiplin.results.map((pp) => {
              return (
                <Select.Option nama={pp.nama} key={pp.id} value={pp.id}>
                  {pp.nama}
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>

        <Form.Item name={"skNomor"} label={"Nomor SK"}>
          <Input />
        </Form.Item>
        <Row>
          <Col md={6}>
            <Form.Item required name="tanggalSk" label="Tanggal SK">
              <DatePicker format={"DD-MM-YYYY"} />
            </Form.Item>
          </Col>
          <Col md={6}>
            <Form.Item
              required
              name="hukumanTanggal"
              label="TMT Hukuman Disiplin"
            >
              <DatePicker format={"DD-MM-YYYY"} />
            </Form.Item>
          </Col>
          <Col md={6}>
            <Form.Item required name="masaTahun" label="Masa Hukuman Tahun">
              <InputNumber />
            </Form.Item>
          </Col>
          <Col md={6}>
            <Form.Item required name="masaBulan" label="Masa Hukuman Bulan">
              <InputNumber />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="keterangan" label="Keterangan">
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const CompareHukdisByNip = ({ nip }) => {
  const [open, setOpen] = useState(false);

  const {
    data,
    isLoading,
    refetch: refetchSiasn,
    isFetching: isFetchingSiasn,
  } = useQuery(["hukdis", nip], () => getHukdisByNip(nip), {
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    enabled: !!nip,
  });

  const {
    data: hukdisMaster,
    isLoading: isLoadingMaster,
    refetch: refetchMaster,
    isFetching: isFetchingMaster,
  } = useQuery(["hukdis-master", nip], () => getRwHukdisByNip(nip), {
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    enabled: !!nip,
  });

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const columns = [
    {
      title: "Dok",
      key: "file",
      width: 60,
      align: "center",
      render: (_, row) => {
        return (
          <>
            {row?.path?.[882] && (
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${row?.path?.[882]?.dok_uri}`}
                target="_blank"
                rel="noreferrer"
              >
                <Button size="small" icon={<IconFileText size={14} />} />
              </a>
            )}
          </>
        );
      },
    },
    {
      title: "Nomor & Tanggal SK",
      key: "nomor_tgl_sk",
      render: (_, row) => (
        <Tooltip
          title={`Nomor: ${row?.skNomor || "-"} | Tanggal: ${row?.skTanggal || "-"}`}
        >
          <div>
            <MantineText size="sm" fw={500} lineClamp={1}>
              {row?.skNomor || "-"}
            </MantineText>
            <MantineText size="xs" c="dimmed">
              {row?.skTanggal || "-"}
            </MantineText>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Jenis & Alasan",
      key: "jenis_alasan",
      render: (_, row) => (
        <Tooltip
          title={`Jenis: ${row?.jenisHukumanNama || "-"} | Alasan: ${row?.alasanHukumanDisiplinNama || "-"}`}
        >
          <div>
            <MantineBadge
              size="xs"
              color="red"
              tt="none"
              style={{ marginBottom: 4 }}
            >
              {row?.jenisHukumanNama || "-"}
            </MantineBadge>
            <MantineText size="xs" lineClamp={2}>
              {row?.alasanHukumanDisiplinNama || "-"}
            </MantineText>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "TMT & Masa",
      key: "tmt_masa",
      render: (_, row) => (
        <Tooltip
          title={`TMT: ${row?.hukumanTanggal || "-"} | Masa: ${row?.masaTahun || 0} tahun`}
        >
          <div>
            <MantineText size="xs">
              {row?.hukumanTanggal || "-"}
            </MantineText>
            <MantineBadge size="xs" color="orange">
              {row?.masaTahun || 0} tahun
            </MantineBadge>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Keterangan",
      dataIndex: "keterangan",
      render: (ket) => (
        <MantineText size="xs" lineClamp={2}>
          {ket || "-"}
        </MantineText>
      ),
    },
  ];

  const columnsMaster = [
    {
      title: "Dok",
      key: "file",
      width: 60,
      align: "center",
      render: (_, row) => {
        return (
          <>
            {row?.file_disiplin && (
              <a href={row?.file_disiplin} target="_blank" rel="noreferrer">
                <Button size="small" icon={<IconFileText size={14} />} />
              </a>
            )}
          </>
        );
      },
    },
    {
      title: "Jenis Hukuman",
      key: "jenis",
      render: (_, row) => (
        <MantineBadge size="sm" color="red" tt="none">
          {row?.hukdis?.name || "-"}
        </MantineBadge>
      ),
    },
    {
      title: "Nomor & Tanggal SK",
      key: "nomor_tgl",
      render: (_, row) => (
        <Tooltip
          title={`Nomor: ${row?.no_sk || "-"} | Tanggal: ${row?.tgl_sk || "-"}`}
        >
          <div>
            <MantineText size="sm" fw={500} lineClamp={1}>
              {row?.no_sk || "-"}
            </MantineText>
            <MantineText size="xs" c="dimmed">
              {row?.tgl_sk || "-"}
            </MantineText>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Periode TMT",
      key: "periode",
      render: (_, row) => (
        <Tooltip
          title={`Awal: ${row?.tmt_awal || "-"} | Akhir: ${row?.tmt_akhir || "-"}`}
        >
          <div>
            <MantineText size="xs">{row?.tmt_awal || "-"}</MantineText>
            <MantineText size="xs" c="dimmed">
              s/d {row?.tmt_akhir || "-"}
            </MantineText>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Keterangan",
      dataIndex: "keterangan",
      render: (ket) => (
        <MantineText size="xs" lineClamp={2}>
          {ket || "-"}
        </MantineText>
      ),
    },
    {
      title: "Aksi",
      key: "aksi",
      width: 60,
      align: "center",
      render: (_, row) => (
        <Tooltip title="Transfer ke SIASN">
          <Button
            size="small"
            type="primary"
            icon={<IconSend size={14} />}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <Card
      title={
        <Space>
          <IconAlertTriangle size={20} />
          <span>Hukuman Disiplin</span>
          <MantineBadge size="sm" color="blue">
            SIMASTER: {hukdisMaster?.length || 0}
          </MantineBadge>
          <MantineBadge size="sm" color="green">
            SIASN: {data?.length || 0}
          </MantineBadge>
        </Space>
      }
      extra={
        <Button
          onClick={handleOpen}
          type="primary"
          icon={<IconPlus size={14} />}
          size="small"
        >
          Tambah
        </Button>
      }
      style={{ marginTop: 16 }}
    >
      <FormModalHukdis open={open} onClose={handleClose} />
      <Stack>
        <Table
          title={() => (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <MantineText fw="bold">SIMASTER</MantineText>
              <Tooltip title="Refresh data SIMASTER">
                <Button
                  size="small"
                  icon={<IconRefresh size={14} />}
                  onClick={() => refetchMaster()}
                  loading={isFetchingMaster}
                />
              </Tooltip>
            </div>
          )}
          columns={columnsMaster}
          loading={isLoadingMaster || isFetchingMaster}
          dataSource={hukdisMaster}
          rowKey={(row) => row?.disiplin_id}
          pagination={false}
          rowClassName={(_, index) =>
            index % 2 === 0 ? "table-row-light" : "table-row-dark"
          }
          size="small"
          scroll={{ x: "max-content" }}
        />
        <Table
          title={() => (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <MantineText fw="bold">SIASN</MantineText>
              <Tooltip title="Refresh data SIASN">
                <Button
                  size="small"
                  icon={<IconRefresh size={14} />}
                  onClick={() => refetchSiasn()}
                  loading={isFetchingSiasn}
                />
              </Tooltip>
            </div>
          )}
          columns={columns}
          loading={isLoading || isFetchingSiasn}
          dataSource={data}
          rowKey={(row) => row?.id}
          pagination={false}
          rowClassName={(_, index) =>
            index % 2 === 0 ? "table-row-light" : "table-row-dark"
          }
          size="small"
          scroll={{ x: "max-content" }}
        />
      </Stack>
    </Card>
  );
};

export default CompareHukdisByNip;

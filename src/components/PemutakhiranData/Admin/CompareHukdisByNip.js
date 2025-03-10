import { getHukdisByNip } from "@/services/siasn-services";
import {
  dataAlasanHukumanDisiplin,
  dataHukumanDisiplin,
  ppHukumanDisiplin,
} from "@/utils/client-data";
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
  Table,
} from "antd";
import { useState } from "react";
import dayjs from "dayjs";

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
  const { data, isLoading } = useQuery(
    ["hukdis", nip],
    () => getHukdisByNip(nip),
    {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      staleTime: 500000,
    }
  );

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const columns = [
    {
      title: "File",
      key: "file",
      render: (_, row) => {
        return (
          <>
            {row?.path?.[882] && (
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${row?.path?.[882]?.dok_uri}`}
                target="_blank"
                rel="noreferrer"
              >
                File
              </a>
            )}
          </>
        );
      },
    },
    {
      title: "Nomor SK",
      dataIndex: "skNomor",
    },
    {
      title: "Tgl. SK",
      dataIndex: "skTanggal",
    },
    {
      title: "Tgl. Hukuman",
      dataIndex: "hukumanTanggal",
    },
    {
      title: "Masa Tahun",
      dataIndex: "masaTahun",
    },
    {
      title: "Alasan Hukuman Disiplin",
      dataIndex: "alasanHukumanDisiplinNama",
    },
    {
      title: "Jenis Hukuman Disiplin",
      dataIndex: "jenisHukumanNama",
    },
    {
      title: "Keterangan",
      dataIndex: "keterangan",
    },
  ];

  return (
    <Card title="Hukuman Disiplin">
      <FormModalHukdis open={open} onClose={handleClose} />
      <Button
        style={{
          marginBottom: 10,
        }}
        onClick={handleOpen}
        type="primary"
      >
        Tambah Hukuman Disiplin
      </Button>
      <Table
        columns={columns}
        isLoading={isLoading}
        dataSource={data}
        rowKey={(row) => row?.id}
        pagination={false}
      />
    </Card>
  );
};

export default CompareHukdisByNip;

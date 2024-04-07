import { refJenisDiklat } from "@/services/siasn-services";
import { FileAddOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Upload,
} from "antd";
import { useEffect, useState } from "react";

import dayjs from "dayjs";
import "dayjs/locale/id";
dayjs.locale("id");

const ModalTransferToSIASN = ({ diklat, open, handleClose, data }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    form.setFieldsValue({
      namaKursus: data?.title,
      institusiPenyelenggara: data?.organizer,
      nomorSertipikat: data?.certificate_number,
      tahunKursus: dayjs(data?.start_date).format("YYYY"),
      tanggalKursus: dayjs(data?.start_date),
      tanggalSelesaiKursus: dayjs(data?.end_date),
      jumlahJam: data?.hour,
    });
  }, [form, data]);

  const handleChange = (info) => {
    let fileList = [...info.fileList];

    fileList = fileList.slice(-1);

    fileList = fileList.map((file) => {
      if (file.response) {
        file.url = file.response.url;
      }
      return file;
    });

    setFileList(fileList);
  };

  return (
    <Modal
      width={800}
      open={open}
      onCancel={handleClose}
      title="Transfer to SIASN"
    >
      <Form layout="vertical" form={form}>
        <Upload
          beforeUpload={() => false}
          maxCount={1}
          accept=".pdf"
          onChange={handleChange}
          fileList={fileList}
        >
          <Button icon={<FileAddOutlined />}>Upload</Button>
        </Upload>
        <Form.Item
          label="Jenis Diklat"
          name="jenisDiklatId"
          required
          rules={[
            { required: true, message: "Jenis Diklat Tidak boleh kosong" },
          ]}
        >
          <Select showSearch optionFilterProp="label" allowClear>
            {diklat?.map((item) => (
              <Select.Option label={item?.label} key={item.id} value={item.id}>
                {item.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Nama Diklat"
          rules={[{ required: true, message: "Nama Tidak boleh kosong" }]}
          name="namaKursus"
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="institusiPenyelenggara"
          label="Institusi Penyelenggara"
          rules={[
            {
              required: true,
              message: "Institusi Penyelenggara Tidak boleh kosong",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Nomor Sertifikat"
          name="nomorSertipikat"
          rules={[
            { required: true, message: "Nomor Sertifikat Tidak boleh kosong" },
          ]}
        >
          <Input />
        </Form.Item>
        <Row>
          <Col xs={24} md={8}>
            <Form.Item
              rules={[
                { required: true, message: "Tahun Diklat Tidak boleh kosong" },
              ]}
              label="Tahun Diklat"
              name="tahunKursus"
            >
              <InputNumber />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              rules={[
                { required: true, message: "Tanggal Mulai Tidak boleh kosong" },
              ]}
              label="Tanggal Mulai"
              name="tanggalKursus"
            >
              <DatePicker format="DD-MM-YYYY" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              rules={[
                {
                  required: true,
                  message: "Tanggal Selesai Tidak boleh kosong",
                },
              ]}
              label="Tanggal Selesai"
              name="tanggalSelesaiKursus"
            >
              <DatePicker format="DD-MM-YYYY" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          rules={[
            { required: true, message: "Durasi(Jam) Tidak boleh kosong" },
          ]}
          label="Durasi(Jam)"
          name="jumlahJam"
        >
          <InputNumber />
        </Form.Item>
      </Form>
      <div>{JSON.stringify(data)}</div>{" "}
    </Modal>
  );
};

function WebinarTransferToSIASN({ data }) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const { data: jenisDiklat, isLoading: loadingJenisDiklat } = useQuery(
    ["ref-jenis-diklat"],
    () => refJenisDiklat(),
    {
      refetchOnWindowFocus: false,
    }
  );

  return (
    <>
      <ModalTransferToSIASN
        diklat={jenisDiklat}
        open={open}
        handleClose={handleClose}
        data={data}
      />
      <Button onClick={handleOpen} type="primary">
        Transfer to SIASN
      </Button>
    </>
  );
}

export default WebinarTransferToSIASN;

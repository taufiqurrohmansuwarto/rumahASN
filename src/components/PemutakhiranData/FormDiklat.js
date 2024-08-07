import React, { useState } from "react";
import IPAsn from "../LayananSIASN/IPAsn";
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
  Space,
  Upload,
  message,
} from "antd";
import {
  getTokenSIASNService,
  postRwKursus,
  refDiklatStruktural,
  refJenisDiklat,
  refUrusanPemerintahan,
} from "@/services/siasn-services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileAddOutlined } from "@ant-design/icons";
import axios from "axios";

export const API_URL = "https://apimws.bkn.go.id:8243/apisiasn/1.0";

const ModalFormDiklat = ({
  open,
  onCancel,
  jenisDiklat,
  diklatStruktural,
  urusanPemerintan,
}) => {
  const [form] = Form.useForm();

  const queryClient = useQueryClient();

  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const { mutateAsync: tambah, isLoading } = useMutation(
    (data) => postRwKursus(data),
    {
      onSuccess: () => {
        message.success("Data berhasil disimpan");
        form.resetFields();
        setFileList([]);
        onCancel();
      },
      onError: (error) => {
        message.error(error?.response?.data?.message);
      },
      onSettled: () => {
        queryClient.invalidateQueries("riwayat-diklat");
      },
    }
  );

  const handleOk = async () => {
    try {
      setLoading(true);
      const result = await form.validateFields();
      const type = result?.jenisDiklatId === 1 ? "diklat" : "kursus";

      let payloadData;
      let id_ref_dokumen;

      const payload = {
        ...result,
        type,
        tanggalKursus: result?.tanggalKursus?.format("DD-MM-YYYY"),
        tanggalSelesaiKursus:
          result?.tanggalSelesaiKursus?.format("DD-MM-YYYY"),
      };

      const file = fileList[0]?.originFileObj;
      id_ref_dokumen = type === "diklat" ? "874" : "881";

      if (file) {
        const result = await getTokenSIASNService();

        const wso2 = result?.accessToken?.wso2;
        const sso = result?.accessToken?.sso;
        const currentPayload = await tambah(payload);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("id_ref_dokumen", id_ref_dokumen);
        formData.append("id_riwayat", currentPayload?.id);

        await axios.post(`${API_URL}/upload-dok-rw`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${wso2}`,
            Auth: `bearer ${sso}`,
          },
        });
      } else {
        await tambah(payload);
      }
      message.success("Data berhasil disimpan");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      confirmLoading={loading}
      onOk={handleOk}
      width={750}
      centered
      title="Tambah Data Diklat"
      open={open}
      onCancel={onCancel}
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
            {jenisDiklat?.map((item) => (
              <Select.Option label={item?.label} key={item.id} value={item.id}>
                {item.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.jenisDiklatId !== currentValues.jenisDiklatId
          }
        >
          {({ getFieldValue }) =>
            getFieldValue("jenisDiklatId") === 1 && (
              <Form.Item
                rules={[
                  {
                    required: true,
                    message: "Diklat Struktural Tidak boleh kosong",
                  },
                ]}
                label="Diklat Struktural"
                name="latihanStrukturalId"
              >
                <Select showSearch allowClear optionFilterProp="label">
                  {diklatStruktural?.map((item) => (
                    <Select.Option
                      label={item?.label}
                      key={item.id}
                      value={item.id}
                    >
                      {item.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )
          }
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
        <Form.Item label="Urusan Pemerintahan">
          <Select showSearch allowClear optionFilterProp="label">
            {urusanPemerintan?.map((item) => (
              <Select.Option label={item?.label} key={item.id} value={item.id}>
                {item.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

function FormDiklat() {
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

  const { data: diklatStruktural, isLoading: loadingDiklatStruktural } =
    useQuery(["ref-diklat-struktural"], () => refDiklatStruktural(), {
      refetchOnWindowFocus: false,
    });

  const { data: urusanPemerintan, isLoading: loadingUrusanPemerintan } =
    useQuery(["ref-urusan-pemerintahan"], () => refUrusanPemerintahan(), {
      refetchOnWindowFocus: false,
    });

  return (
    <Space direction="vertical">
      <Button type="primary" onClick={handleOpen}>
        Tambah Data Diklat
      </Button>
      <IPAsn tahun={2023} />
      <ModalFormDiklat
        jenisDiklat={jenisDiklat}
        diklatStruktural={diklatStruktural}
        urusanPemerintan={urusanPemerintan}
        open={open}
        onCancel={handleClose}
      />
    </Space>
  );
}

export default FormDiklat;

import { getTokenSIASNService, postRwJabatan } from "@/services/siasn-services";
import { API_URL } from "@/utils/client-utils";
import { FileAddOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Upload,
  message,
} from "antd";
import axios from "axios";
import { isObject } from "lodash";
import { useEffect, useState } from "react";
import FormJFT from "./FormJFT";
import FormJFU from "./FormJFU";
import FormUnitOrganisasi from "./FormUnitOrganisasi";

import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.locale("id");
dayjs.extend(relativeTime);

const format = "DD-MM-YYYY";
function EditRiwayatJabatanSIASN({ open, onClose, data, user }) {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        unor_id: data?.unorId,
        jenis_jabatan: data?.jenisJabatan === "2" ? "Fungsional" : "Pelaksana",
        fungsional_id: {
          value: data?.jabatanFungsionalId,
          label: data?.jabatanFungsionalNama,
        },
        fungsional_umum_id: {
          value: data?.jabatanFungsionalUmumId,
          label: data?.jabatanFungsionalUmumNama,
        },
        nomor_sk: data?.nomorSk,
        tmt_jabatan: dayjs(data?.tmtJabatan, "DD-MM-YYYY"),
        tmt_pelantikan: dayjs(data?.tmtJabatan, "DD-MM-YYYY"),
        tgl_sk: dayjs(data?.tanggalSk, "DD-MM-YYYY"),
      });
    }
  }, [data, form]);

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

  const handleFinish = async () => {
    const nip = user?.user?.employee_number;
    try {
      setLoading(true);
      const {
        tmt_jabatan,
        tgl_sk,
        tmt_pelantikan,
        fungsional_id,
        fungsional_umum_id,
        unor_id,
        nomor_sk,
        jenis_jabatan,
      } = await form.validateFields();

      let jenis_jabatan_id = jenis_jabatan === "Fungsional" ? "2" : "4";
      const jfu = isObject(fungsional_umum_id)
        ? fungsional_umum_id?.value
        : fungsional_umum_id;
      const jft = isObject(fungsional_id)
        ? fungsional_id?.value
        : fungsional_id;

      const data = {
        tmtJabatan: dayjs(tmt_jabatan).format("DD-MM-YYYY"),
        tanggalSk: dayjs(tgl_sk).format("DD-MM-YYYY"),
        tmtPelantikan: dayjs(tmt_pelantikan).format("DD-MM-YYYY"),
        jabatanFungsionalId: jft,
        jabatanFungsionalUmumId: jfu,
        unorId: unor_id,
        nomorSk: nomor_sk,
        jenisJabatan: jenis_jabatan_id,
        eselonId: "",
        satuanKerjaId: "A5EB03E24213F6A0E040640A040252AD",
        instansiId: "A5EB03E23CCCF6A0E040640A040252AD",
      };

      const currentFile = fileList[0]?.originFileObj;

      if (currentFile) {
        const result = await getTokenSIASNService();

        const wso2 = result?.accessToken?.wso2;
        const sso = result?.accessToken?.sso;

        const formData = new FormData();

        formData.append("file", currentFile);
        formData.append("id_ref_dokumen", "872");
        const hasil = await axios.post(`${API_URL}/upload-dok`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${wso2}`,
            Auth: `bearer ${sso}`,
          },
        });

        const postData = {
          ...data,
          path: [hasil?.data?.data],
        };

        await postRwJabatan({
          nip,
          data: postData,
        });

        message.success("Data berhasil disimpan");
        onClose();
        form.resetFields();
        setFileList([]);
        setLoading(false);
      } else {
        await postRwJabatan({
          nip,
          data,
        });

        message.success("Data berhasil disimpan");
        onClose();
        form.resetFields();
        setFileList([]);
        setLoading(false);
      }
      queryClient.invalidateQueries("data-jabatan");
    } catch (error) {
      message.error("Data gagal disimpan");
      setLoading(false);
      console.log(error);
    }
  };

  return (
    <Modal
      title="Entri Jabatan SIASN"
      centered
      width={800}
      open={open}
      onOk={handleFinish}
      onCancel={onClose}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Upload
          beforeUpload={() => false}
          maxCount={1}
          accept=".pdf"
          onChange={handleChange}
          fileList={fileList}
        >
          <Button icon={<FileAddOutlined />}>Upload</Button>
        </Upload>
        <FormUnitOrganisasi name="unor_id" />
        <Form.Item
          rules={[{ required: true, message: "Tidak boleh kosong" }]}
          name="jenis_jabatan"
          label="Jenis Jabatan"
        >
          <Select
            onChange={() => {
              form.setFieldsValue({
                fungsional_id: null,
                fungsional_umum_id: null,
              });
            }}
          >
            <Select.Option value="Pelaksana">Pelaksana</Select.Option>
            <Select.Option value="Fungsional">Fungsional</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.jenis_jabatan !== currentValues.jenis_jabatan
          }
        >
          {({ getFieldValue }) =>
            getFieldValue("jenis_jabatan") === "Fungsional" ? (
              <FormJFT name="fungsional_id" />
            ) : getFieldValue("jenis_jabatan") === "Pelaksana" ? (
              <FormJFU name="fungsional_umum_id" />
            ) : null
          }
        </Form.Item>
        <Form.Item
          rules={[
            {
              required: true,
              message: "'Nomer SK Tidak boleh kosong",
            },
          ]}
          name="nomor_sk"
          label="Nomor SK"
        >
          <Input />
        </Form.Item>
        <Row gutter={[8, 8]}>
          <Col md={8} xs={24}>
            <Form.Item
              rules={[
                {
                  required: true,
                  message: "TMT Jabatan Tidak boleh kosong",
                },
              ]}
              name="tmt_jabatan"
              label="TMT Jabatan"
            >
              <DatePicker format={format} />
            </Form.Item>
          </Col>
          <Col md={8} xs={24}>
            <Form.Item
              rules={[{ required: true }]}
              name="tmt_pelantikan"
              label="TMT Pelantikan"
            >
              <DatePicker format={format} />
            </Form.Item>
          </Col>
          <Col md={8} xs={24}>
            <Form.Item
              rules={[
                {
                  required: true,
                  message: "Tanggal SK Tidak boleh kosong",
                },
              ]}
              name="tgl_sk"
              label="Tanggal SK"
            >
              <DatePicker format={format} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}

export default EditRiwayatJabatanSIASN;

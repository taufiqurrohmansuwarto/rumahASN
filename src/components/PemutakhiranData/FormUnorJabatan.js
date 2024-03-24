import { getJenisJabatanId } from "@/utils/client-utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Upload,
  message,
} from "antd";
import moment from "moment";
import { useState } from "react";
import FormJFT from "./FormJFT";
import FormJFU from "./FormJFU";
import FormJenisMutasi from "./FormJenisMutasi";
import FormJenisPenugasan from "./FormJenisPenugasan";
import FormStruktural from "./FormStruktural";
import FormSubJabatan from "./FormSubJabatan";
import FormUnorSIASN from "./FormUnorSIASN";
import {
  getTokenSIASNService,
  postUnorJabatanByNip,
} from "@/services/siasn-services";
import axios from "axios";
import { InboxOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import DetailJabatanGuruDokter from "./Admin/DetailJabatanGuruDokter";
import { Text } from "@mantine/core";

export const API_URL = "https://apimws.bkn.go.id:8243/apisiasn/1.0";

const dateFormat = "DD-MM-YYYY";

function ModalFormJabatanUnor({ open, handleClose, handleOk, isLoading }) {
  const router = useRouter();

  const [filePath, setFilePath] = useState(null);

  const customRequest = async ({ file, onSuccess, onError }) => {
    // Pertama, dapatkan token
    try {
      const tokenResult = await getTokenSIASNService(); // Asumsikan ini adalah fungsi async Anda untuk mendapatkan token
      const { wso2, sso } = tokenResult.accessToken;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("id_ref_dokumen", "872");

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${wso2}`, // Gunakan token yang sesuai
          Auth: `bearer ${sso}`, // Contoh lain penggunaan token, sesuaikan dengan kebutuhan
        },
      };

      // Kemudian, unggah file dengan axios
      const response = await axios.post(
        `${API_URL}/upload-dok`,
        formData,
        config
      );

      // Jika berhasil, panggil onSuccess
      onSuccess(response.data?.data, file);
    } catch (error) {
      // Jika terjadi error, panggil onError
      onError(error);
      console.error("Upload error:", error);
    }
  };

  const handleFinish = async () => {
    try {
      const {
        tmtJabatan,
        tanggalSk,
        tmtPelantikan,
        tmtMutasi,
        fungsional_id,
        fungsional_umum_id,
        unorId,
        nomorSk,
        jenis_jabatan,
        eselon_id,
        jenisMutasiId,
        jenisPenugasanId,
        subJabatanId,
      } = await form.validateFields();

      let jenis_jabatan_id = getJenisJabatanId(jenis_jabatan);

      const data = {
        tmtJabatan: moment(tmtJabatan).format("DD-MM-YYYY"),
        tanggalSk: moment(tanggalSk).format("DD-MM-YYYY"),
        tmtPelantikan: moment(tmtPelantikan).format("DD-MM-YYYY"),
        tmtMutasi: moment(tmtMutasi).format("DD-MM-YYYY"),
        jabatanFungsionalId: fungsional_id ? fungsional_id : "",
        jabatanFungsionalUmumId: fungsional_umum_id ? fungsional_umum_id : "",
        jenisMutasiId: jenisMutasiId ? jenisMutasiId : "",
        jenisPenugasanId: jenisPenugasanId ? jenisPenugasanId : "",
        subJabatanId: subJabatanId ? subJabatanId : "",
        eselonId: eselon_id ? eselon_id : "",
        unorId,
        nomorSk,
        jenisJabatan: jenis_jabatan_id,
      };

      let payload = {};

      if (filePath) {
        payload = {
          ...data,
          path: [filePath],
        };
      } else {
        payload = data;
      }

      const myPayload = {
        nip: router.query.nip,
        data: payload,
      };

      await handleOk(myPayload);

      console.log(myPayload);
    } catch (error) {
      console.log(error);
    }
  };

  const [form] = Form.useForm();

  return (
    <Modal
      centered
      title={
        <Space>
          <Text>Tambah Jabatan</Text>
          <DetailJabatanGuruDokter />
        </Space>
      }
      width={800}
      confirmLoading={isLoading}
      onOk={handleFinish}
      open={open}
      onCancel={handleClose}
    >
      <Upload.Dragger
        onChange={(info) => {
          if (info.file.status === "done") {
            const currentFilePath = info?.file?.response;
            setFilePath(currentFilePath);
            message.success(`${info.file.name} file uploaded successfully.`);
          } else if (info.file.status === "error") {
            setFilePath(null);
            message.error(`${info.file.name} file upload failed.`);
          }
        }}
        customRequest={customRequest}
        maxCount={1}
        accept=".pdf"
        multiple={false}
        onRemove={() => setFilePath(null)}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Uggah SK Jabatan</p>
      </Upload.Dragger>
      <Form form={form} layout="vertical">
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
                eselon_id: null,
              });
            }}
          >
            <Select.Option value="Pelaksana">Pelaksana</Select.Option>
            <Select.Option value="Fungsional">Fungsional</Select.Option>
            <Select.Option value="Struktural">Struktural</Select.Option>
          </Select>
        </Form.Item>
        <FormJenisMutasi name="jenisMutasiId" />
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.jenis_jabatan !== currentValues.jenis_jabatan
          }
        >
          {({ getFieldValue }) =>
            getFieldValue("jenis_jabatan") === "Struktural" ? (
              <FormJenisPenugasan name="jenisPenugasanId" />
            ) : null
          }
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
            ) : getFieldValue("jenis_jabatan") === "Struktural" ? (
              <FormStruktural name="eselon_id" />
            ) : null
          }
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.jenis_jabatan !== currentValues.jenis_jabatan ||
            prevValues.fungsional_id !== currentValues.fungsional_id
          }
        >
          {({ getFieldValue }) =>
            getFieldValue("jenis_jabatan") === "Fungsional" ? (
              <FormSubJabatan
                name="subJabatanId"
                kelJabatanId={getFieldValue("fungsional_id")}
              />
            ) : null
          }
        </Form.Item>
        <FormUnorSIASN name="unorId" />
        <Form.Item required name="nomorSk" label="Nomor SK">
          <Input />
        </Form.Item>
        <Row>
          <Col span={6}>
            <Form.Item required name="tanggalSk" label="Tanggal SK">
              <DatePicker format={dateFormat} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item required name="tmtJabatan" label="TMT Jabatan">
              <DatePicker format={dateFormat} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item required name="tmtMutasi" label="TMT Mutasi">
              <DatePicker format={dateFormat} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item required name="tmtPelantikan" label="TMT Pelantikan">
              <DatePicker format={dateFormat} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}

const FormUnorJabatan = () => {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const { mutateAsync: addJabatanUnor, isLoading: isLoadingAddJabatanUnor } =
    useMutation((data) => postUnorJabatanByNip(data), {
      onSuccess: () => {
        queryClient.invalidateQueries("unor-jabatan");
        message.success("Data berhasil disimpan");
        handleClose();
      },
      onError: (error) => {
        message.error(error?.response?.data?.message);
      },
    });

  return (
    <>
      <Button type="primary" onClick={handleOpen}>
        Tambah Jabatan Unor
      </Button>
      <ModalFormJabatanUnor
        handleOk={addJabatanUnor}
        isLoading={isLoadingAddJabatanUnor}
        open={open}
        handleClose={handleClose}
      />
    </>
  );
};

export default FormUnorJabatan;

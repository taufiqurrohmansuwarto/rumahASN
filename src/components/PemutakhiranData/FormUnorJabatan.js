import {
  postUnorJabatanByNip,
  uploadDokRiwayat,
} from "@/services/siasn-services";
import { getJenisJabatanId } from "@/utils/client-utils";
import { FileAddOutlined } from "@ant-design/icons";
import { Text } from "@mantine/core";
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
import { useRouter } from "next/router";
import { useState } from "react";
import DetailJabatanGuruDokter from "./Admin/DetailJabatanGuruDokter";
import FormJFT from "./FormJFT";
import FormJFU from "./FormJFU";
import FormJenisMutasi from "./FormJenisMutasi";
import FormJenisPenugasan from "./FormJenisPenugasan";
import FormStruktural from "./FormStruktural";
import FormSubJabatan from "./FormSubJabatan";
import FormUnorSIASN from "./FormUnorSIASN";

import dayjs from "dayjs";
import "dayjs/locale/id";
dayjs.locale("id");

const dateFormat = "DD-MM-YYYY";

function ModalFormJabatanUnor({ open, handleClose, handleOk }) {
  const router = useRouter();
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

  const handleFinish = async () => {
    try {
      setLoading(true);
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
        tmtJabatan: dayjs(tmtJabatan).format("DD-MM-YYYY"),
        tanggalSk: dayjs(tanggalSk).format("DD-MM-YYYY"),
        tmtPelantikan: dayjs(tmtPelantikan).format("DD-MM-YYYY"),
        tmtMutasi: dayjs(tmtMutasi).format("DD-MM-YYYY"),
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

      const file = fileList[0]?.originFileObj;

      const myPayload = {
        nip: router.query.nip,
        data,
      };

      if (file) {
        const result = await handleOk(myPayload);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("id_ref_dokumen", "872");
        formData.append("id_riwayat", result?.id);
        await uploadDokRiwayat(formData);
        message.success("Data berhasil disimpan");
      } else {
        await handleOk(myPayload);
        message.success("Data berhasil disimpan");
      }
      queryClient.invalidateQueries(["unor-jabatan"]);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      handleClose();
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
      confirmLoading={loading}
      onOk={handleFinish}
      open={open}
      onCancel={handleClose}
    >
      <Form form={form} layout="vertical">
        <Upload
          beforeUpload={() => false}
          maxCount={1}
          accept=".pdf"
          onChange={handleChange}
          fileList={fileList}
        >
          <Button icon={<FileAddOutlined />}>Upload SK Jabatan</Button>
        </Upload>

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
      },
      onSettled: () => {
        queryClient.invalidateQueries("unor-jabatan");
      },
    });

  return (
    <>
      <Button type="primary" onClick={handleOpen}>
        Tambah Jabatan
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

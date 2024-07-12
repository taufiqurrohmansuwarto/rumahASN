import {
  postUnorJabatanByNip,
  uploadDokRiwayat,
} from "@/services/siasn-services";
import { getJenisJabatanId } from "@/utils/client-utils";
import { Loading3QuartersOutlined, SendOutlined } from "@ant-design/icons";
import { Text } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Col,
  DatePicker,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Tooltip,
  message,
} from "antd";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import DetailJabatanGuruDokter from "./Admin/DetailJabatanGuruDokter";
import FormJFT from "./FormJFT";
import FormJFU from "./FormJFU";
import FormJenisMutasi from "./FormJenisMutasi";
import FormJenisPenugasan from "./FormJenisPenugasan";
import FormStruktural from "./FormStruktural";
import FormSubJabatan from "./FormSubJabatan";
import FormUnorSIASN from "./FormUnorSIASN";

import { urlToPdf } from "@/services/master.services";
import dayjs from "dayjs";
import "dayjs/locale/id";
dayjs.locale("id");

const dateFormat = "DD-MM-YYYY";

function ModalFormJabatanUnor({
  kata,
  file,
  open,
  handleClose,
  handleOk,
  data,
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);

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

      const myPayload = {
        nip: router.query.nip,
        data,
      };

      if (!file) {
        await handleOk(myPayload);
        message.success("Berhasil menyimpan data tanpa file");
        handleClose();
      } else {
        console.log(file);
        const resultJabatan = await handleOk(myPayload);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("id_riwayat", resultJabatan.id);
        formData.append("id_ref_dokumen", "872");
        await uploadDokRiwayat(formData);
        queryClient.invalidateQueries("unor-jabatan");
        message.success("Berhasil menyimpan data dengan file");
        handleClose();
      }
    } catch (error) {
      message.error("Gagal menyimpan data");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const [form] = Form.useForm();

  useEffect(() => {
    if (data) {
      form.setFieldsValue(data);
    }
  }, [data, form]);

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
              <DatePicker disabled={kata === "Edit"} format={dateFormat} />
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
          <a href={data?.file} target="_blank" rel="noreferrer">
            {data?.file}
          </a>
        </Row>
      </Form>
    </Modal>
  );
}

const FormUnorJabatanTransfer = ({ data, kata = "Edit" }) => {
  const queryClient = useQueryClient();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const handleOpen = async () => {
    setLoading(true);
    const currentFile = data?.file;
    if (!currentFile) {
      setOpen(true);
    } else {
      const response = await urlToPdf({ url: currentFile });
      const file = new File([response], "file.pdf", {
        type: "application/pdf",
      });
      setFile(file);
      setOpen(true);
    }
    setLoading(false);
  };
  const handleClose = () => setOpen(false);

  const { mutateAsync: addJabatanUnor, isLoading: isLoadingAddJabatanUnor } =
    useMutation((data) => postUnorJabatanByNip(data), {
      onSuccess: () => {
        queryClient.invalidateQueries("unor-jabatan");
      },
      onError: (error) => {
        console.log(error);
      },
      onSettled: () => {
        queryClient.invalidateQueries("unor-jabatan");
      },
    });

  return (
    <>
      <Tooltip title="Transfer">
        <a onClick={handleOpen}>
          {loading ? <Loading3QuartersOutlined /> : <SendOutlined />}
        </a>
      </Tooltip>
      <ModalFormJabatanUnor
        kata={kata}
        data={data}
        handleOk={addJabatanUnor}
        open={open}
        file={file}
        handleClose={handleClose}
      />
    </>
  );
};

export default FormUnorJabatanTransfer;

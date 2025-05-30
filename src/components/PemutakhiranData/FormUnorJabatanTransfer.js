import {
  postUnorJabatanByNip,
  uploadDokRiwayat,
} from "@/services/siasn-services";
import { getJenisJabatanId } from "@/utils/client-utils";
import { SendOutlined } from "@ant-design/icons";
import { Alert, Text } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Col,
  DatePicker,
  Form,
  Input,
  Modal,
  Radio,
  Row,
  Space,
  Spin,
  Tooltip,
  message,
} from "antd";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import DetailJabatanGuruDokter from "./Admin/DetailJabatanGuruDokter";
import FormJenisMutasi from "./FormJenisMutasi";
import FormJenisPenugasan from "./FormJenisPenugasan";
import FormStruktural from "./FormStruktural";
import FormUnorSIASN from "./FormUnorSIASN";

import { urlToPdf } from "@/services/master.services";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { toLower, trim } from "lodash";
import FormJFTV2 from "./FormSIASN/FormJFTV2";
import FormJFUV2 from "./FormSIASN/FormJFUV2";
import FormSubJabatanV2 from "./FormSIASN/FormSubJabatanV2";
dayjs.locale("id");

const dateFormat = "DD-MM-YYYY";

const findJabatanExists = (data, jabatan) => {
  return data?.find(
    (item) => trim(toLower(item?.namaJabatan)) === trim(toLower(jabatan))
  );
};

function ModalFormJabatanUnor({
  siasn,
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
        tmtMutasi: tmtMutasi ? dayjs(tmtMutasi).format("DD-MM-YYYY") : "",
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
        queryClient.invalidateQueries("data-jabatan");
        handleClose();
      } else {
        const resultJabatan = await handleOk(myPayload);
        queryClient.invalidateQueries("data-jabatan");
        handleClose();
        const formData = new FormData();
        formData.append("file", file);
        formData.append("id_riwayat", resultJabatan.id);
        formData.append("id_ref_dokumen", "872");
        await uploadDokRiwayat(formData);
        message.success("Berhasil menyimpan data dengan file");
        queryClient.invalidateQueries("data-jabatan");
      }
    } catch (error) {
      const msg = error?.response?.data?.message || "Gagal menyimpan data";
      message.error(msg);
    } finally {
      queryClient.invalidateQueries("data-jabatan");
      setLoading(false);
    }
  };

  const [form] = Form.useForm();

  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        ...data,
        tmtPelantikan: dayjs(data?.tmtJabatan),
        tmtMutasi: dayjs(data?.tmtJabatan),
      });
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
      <>
        {!!findJabatanExists(siasn, data?.jabatan) && (
          <Alert title="Peringatan" color="red" style={{ marginBottom: 10 }}>
            {data?.jabatan} sudah ada di data SIASN
          </Alert>
        )}
      </>
      <Form form={form} layout="vertical">
        <Form.Item
          rules={[
            { required: true, message: "Jenis jabatan tidak boleh kosong" },
          ]}
          name="jenis_jabatan"
          label="Jenis Jabatan"
        >
          <Radio.Group
            onChange={() => {
              form.setFieldsValue({
                fungsional_id: null,
                fungsional_umum_id: null,
                eselon_id: null,
              });
            }}
          >
            <Radio.Button value="Pelaksana">Pelaksana</Radio.Button>
            <Radio.Button value="Fungsional">Fungsional</Radio.Button>
            <Radio.Button value="Struktural">Struktural</Radio.Button>
          </Radio.Group>
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
              <FormJFTV2 jabatan={`(${data?.jabatan})`} name="fungsional_id" />
            ) : getFieldValue("jenis_jabatan") === "Pelaksana" ? (
              <FormJFUV2
                jabatan={`(${data?.jabatan})`}
                name="fungsional_umum_id"
              />
            ) : getFieldValue("jenis_jabatan") === "Struktural" ? (
              <FormStruktural jabatan={`(${data?.jabatan})`} name="eselon_id" />
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
              <>
                <FormSubJabatanV2
                  name="subJabatanId"
                  fungsionalId={getFieldValue("fungsional_id")}
                />
              </>
            ) : null
          }
        </Form.Item>
        <FormUnorSIASN unor={`(${data?.unor})`} name="unorId" />
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
            <Form.Item required name="tmtPelantikan" label="TMT Pelantikan">
              <DatePicker format={dateFormat} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="tmtMutasi" label="TMT Mutasi">
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

const FormUnorJabatanTransfer = ({ data, kata = "Edit", dataSiasn = [] }) => {
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
        queryClient.invalidateQueries(["unor-jabatan"]);
      },
      onError: (error) => {
        console.log(error);
      },
      onSettled: () => {
        queryClient.invalidateQueries(["unor-jabatan"]);
      },
    });

  return (
    <>
      <Spin spinning={loading} fullscreen />
      <Tooltip title="Transfer">
        <a onClick={handleOpen}>
          <SendOutlined />
        </a>
      </Tooltip>
      <ModalFormJabatanUnor
        siasn={dataSiasn}
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

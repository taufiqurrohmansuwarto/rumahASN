import { getJenisJabatanId } from "@/utils/client-utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, DatePicker, Form, Input, Modal, Select } from "antd";
import moment from "moment";
import FormJFT from "./FormJFT";
import FormJFU from "./FormJFU";
import FormJenisMutasi from "./FormJenisMutasi";
import FormJenisPenugasan from "./FormJenisPenugasan";
import FormStruktural from "./FormStruktural";
import FormSubJabatan from "./FormSubJabatan";
import FormUnorSIASN from "./FormUnorSIASN";
import { useState } from "react";

const dateFormat = "DD-MM-YYYY";

function ModalFormJabatanUnor({ open, handleClose, handleOk, isLoading }) {
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
        jenisMutasiId,
        jenisPenugasanId,
        subJabatanId,
        eselonId: eselon_id ? eselon_id : "",
        unorId,
        nomorSk,
        jenisJabatan: jenis_jabatan_id,
      };
    } catch (error) {
      console.log(error);
    }
  };

  const [form] = Form.useForm();

  return (
    <Modal
      confirmLoading={isLoading}
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
        <FormUnorSIASN name="unorId" />
        <Form.Item name="nomorSK" label="Nomor SK">
          <Input />
        </Form.Item>
        <FormJenisMutasi name="jenisMutasiId" />
        <FormJenisPenugasan name="jenisPenugasanId" />
        <FormSubJabatan name="subJabatanId" />
        <Form.Item name="tanggalSk" label="Tanggal SK">
          <DatePicker format={dateFormat} />
        </Form.Item>
        <Form.Item name="tmtJabatan" label="TMT Jabatan">
          <DatePicker format={dateFormat} />
        </Form.Item>
        <Form.Item name="tmtMutasi" label="TMT Mutasi">
          <DatePicker format={dateFormat} />
        </Form.Item>
        <Form.Item name="tmtPelantikan" label="TMT Pelantikan">
          <DatePicker format={dateFormat} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

const FormUnorJabatan = () => {
  const queryClient = useQueryClient();
  const { mutate: addJabatanUnor, isLoading: isLoadingAddJabatanUnor } =
    useMutation();

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

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

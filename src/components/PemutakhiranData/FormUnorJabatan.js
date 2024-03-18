import { DatePicker, Form, Input, Select } from "antd";
import React from "react";
import FormSubJabatan from "./FormSubJabatan";
import FormJenisMutasi from "./FormJenisMutasi";
import FormJenisPenugasan from "./FormJenisPenugasan";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import FormUnorSIASN from "./FormUnorSIASN";
import FormJFT from "./FormJFT";
import FormJFU from "./FormJFU";
import FormStruktural from "./FormStruktural";

const dateFormat = "DD-MM-YYYY";

function FormUnorJabatan() {
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation();

  const handleFinish = async () => {
    try {
      const values = await form.validateFields();
    } catch (error) {}
  };

  const [form] = Form.useForm();

  return (
    <Form onFinish={handleFinish} form={form} layout="vertical">
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
  );
}

export default FormUnorJabatan;

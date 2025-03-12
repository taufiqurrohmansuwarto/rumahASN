import { createCpns } from "@/services/siasn-services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Modal, Form, Input, message, DatePicker } from "antd";
import React, { useState, useEffect } from "react";

const dayjs = require("dayjs");
require("dayjs/locale/id");

const format = "DD-MM-YYYY";

const CreateModal = ({ open, onCancel, form, isLoading, onSubmit, data }) => {
  return (
    <Modal
      destroyOnClose
      onOk={onSubmit}
      confirmLoading={isLoading}
      title="Ubah Status ke PNS"
      open={open}
      onCancel={onCancel}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Nomor SK PNS" name="nomor_sk_pns">
          <Input />
        </Form.Item>
        <Form.Item label="Tanggal SK PNS" name="tgl_sk_pns">
          <DatePicker format={format} />
        </Form.Item>
        <Form.Item label="Nomor SK CPNS" name="nomor_sk_cpns">
          <Input />
        </Form.Item>
        <Form.Item label="Tanggal SK CPNS" name="tgl_sk_cpns">
          <DatePicker format={format} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

function CreateCPNS({ nip, data }) {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const queryClient = useQueryClient();

  const handleCreate = () => {
    setOpen(true);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  useEffect(() => {
    form.setFieldsValue({
      nomor_sk_pns: data?.nomorSkPns,
      tgl_sk_pns: dayjs(data?.tglSkPns, format),
      nomor_sk_cpns: data?.nomorSkCpns,
      tgl_sk_cpns: dayjs(data?.tglSkCpns, format),
    });
  }, [data, form]);

  const { mutate, isLoading } = useMutation((data) => createCpns(data), {
    onSuccess: () => {
      message.success("Berhasil mengubah status ke PNS");
      queryClient.invalidateQueries({
        queryKey: ["data-utama-siasn"],
      });
    },
    onError: (error) => {
      message.error(error?.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["data-utama-siasn"],
      });
      setOpen(false);
    },
  });

  const handleSubmit = async () => {
    const value = await form.validateFields();
    const payload = {
      nip,
      data: {
        ...value,
        tgl_sk_pns: value?.tgl_sk_pns?.format(format),
        tgl_sk_cpns: value?.tgl_sk_cpns?.format(format),
      },
    };
    mutate(payload);
  };

  return (
    <div style={{ marginTop: 16 }}>
      <Button type="primary" onClick={handleCreate}>
        Ubah ke PNS
      </Button>
      <CreateModal
        open={open}
        onCancel={handleCancel}
        form={form}
        isLoading={isLoading}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default CreateCPNS;

import { createCpns, dataPangkatByNip } from "@/services/siasn-services";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  Button,
  Modal,
  Form,
  Input,
  message,
  DatePicker,
  Skeleton,
  Space,
} from "antd";
import React, { useState, useEffect } from "react";
import { FileExcelOutlined } from "@ant-design/icons";

const dayjs = require("dayjs");
require("dayjs/locale/id");

const format = "DD-MM-YYYY";

const dataPNS = (pangkat) =>
  pangkat?.find((d) => d?.jenis_kp_id === "12" || d?.jenis_kp_id === 12);
const dataCPNS = (pangkat) =>
  pangkat?.find((d) => d?.jenis_kp_id === "11" || d?.jenis_kp_id === 11);

const CreateModal = ({
  open,
  onCancel,
  form,
  isLoading,
  onSubmit,
  data,
  dataPangkat,
  isLoadingPangkat,
}) => {
  const gotoSKPNS = () => {
    window.open(
      `${dataPNS(dataPangkat?.pangkat_simaster)?.file_pangkat}`,
      "_blank"
    );
  };

  const gotoSKCPNS = () => {
    window.open(
      `${dataCPNS(dataPangkat?.pangkat_simaster)?.file_pangkat}`,
      "_blank"
    );
  };

  return (
    <Modal
      destroyOnClose
      onOk={onSubmit}
      confirmLoading={isLoading}
      title="Ubah Status ke PNS"
      open={open}
      onCancel={onCancel}
    >
      <Skeleton loading={isLoadingPangkat}>
        <Space>
          <Button type="link" onClick={gotoSKPNS}>
            <FileExcelOutlined />
            Unduh SK PNS
          </Button>
          <Button type="link" onClick={gotoSKCPNS}>
            <FileExcelOutlined />
            Unduh SK CPNS
          </Button>
        </Space>
        <Form form={form} layout="vertical">
          <Form.Item
            label="Nomor SK PNS"
            name="nomor_sk_pns"
            help={`No. SK: ${dataPNS(dataPangkat?.pangkat_simaster)?.no_sk}`}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Tanggal SK PNS"
            name="tgl_sk_pns"
            help={`Tanggal SK: ${
              dataPNS(dataPangkat?.pangkat_simaster)?.tgl_sk
            }`}
          >
            <DatePicker format={format} />
          </Form.Item>
          <Form.Item
            label="Nomor SK CPNS"
            name="nomor_sk_cpns"
            help={`No. SK: ${dataCPNS(dataPangkat?.pangkat_simaster)?.no_sk}`}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Tanggal SK CPNS"
            name="tgl_sk_cpns"
            help={`Tanggal SK: ${
              dataCPNS(dataPangkat?.pangkat_simaster)?.tgl_sk
            }`}
          >
            <DatePicker format={format} />
          </Form.Item>
        </Form>
      </Skeleton>
    </Modal>
  );
};

function CreateCPNS({ nip, data }) {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const { data: dataPangkat, isLoading: isLoadingPangkat } = useQuery(
    ["data-riwayat-pangkat", nip],
    () => dataPangkatByNip(nip),
    {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      staleTime: 500000,
    }
  );

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
        dataPangkat={dataPangkat}
        isLoadingPangkat={isLoadingPangkat}
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

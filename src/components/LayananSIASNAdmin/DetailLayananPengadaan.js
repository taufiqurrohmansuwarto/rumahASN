import {
  getDetailPengadaanProxy,
  usulkanPengadaanProxy,
} from "@/services/siasn-services";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import {
  Spin,
  Alert,
  Descriptions,
  Modal,
  Button,
  Form,
  Input,
  DatePicker,
  message,
} from "antd";

const ModalUsulan = ({ open, onClose, data }) => {
  const [form] = Form.useForm();
  const { mutate: usulkan, isLoading } = useMutation({
    mutationFn: (data) => usulkanPengadaanProxy(data),
    onSuccess: () => {
      message.success("Usulan berhasil");
      onClose();
      form.resetFields();
    },
    onError: () => {
      message.error("Usulan gagal");
    },
  });

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        no_peserta: data?.usulan_data?.data?.no_peserta,
        tahun_formasi: data?.periode,
      });
    }
  }, [open, data, form]);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload = {
      id: data?.id,
      data: {
        ...values,
        tgl_sk: values.tgl_sk.format("YYYY-MM-DD"),
        tgl_ttd_sk: values.tgl_ttd_sk.format("YYYY-MM-DD"),
        sk_pdf: data?.sk_pdf,
      },
    };
    usulkan(payload);
  };

  return (
    <Modal
      open={open}
      confirmLoading={isLoading}
      onCancel={onClose}
      title="Usulan"
      width={800}
      onOk={handleSubmit}
    >
      <div>
        <Form form={form} layout="vertical">
          <Form.Item label="No Peserta" name="no_peserta">
            <Input readOnly />
          </Form.Item>
          <Form.Item label="Tahun Formasi" name="tahun_formasi">
            <Input readOnly />
          </Form.Item>
          <Form.Item label="No SK" name="no_sk">
            <Input />
          </Form.Item>
          <Form.Item label="Tanggal SK" name="tgl_sk">
            <DatePicker format="DD-MM-YYYY" />
          </Form.Item>
          <Form.Item label="Tanggal TTD SK" name="tgl_ttd_sk">
            <DatePicker format="DD-MM-YYYY" />
          </Form.Item>
          <Form.Item label="Pejabat TTD SK" name="pejabat_ttd_sk">
            <Input />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

function DetailLayananPengadaan() {
  const router = useRouter();
  const { id } = router.query;
  const [openModalUsulan, setOpenModalUsulan] = useState(false);
  const [usulanData, setUsulanData] = useState(null);

  const handleOpenModalUsulan = (data) => {
    setOpenModalUsulan(true);
    setUsulanData(data);
  };

  const handleCloseModalUsulan = () => {
    setOpenModalUsulan(false);
    setUsulanData(null);
  };

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["detail-pengadaan-proxy", id],
    queryFn: () => getDetailPengadaanProxy(id),
    refetchOnWindowFocus: false,
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description="Gagal memuat data"
        type="error"
        style={{ margin: "20px" }}
      />
    );
  }

  if (!data?.sk_pdf) {
    return (
      <Alert
        message="PDF tidak tersedia"
        type="warning"
        style={{ margin: "20px" }}
      />
    );
  }

  // Konversi base64 ke data URL untuk PDF
  const getPdfDataUrl = (base64String) => {
    // Cek apakah sudah ada prefix data:application/pdf;base64,
    if (base64String.startsWith("data:application/pdf;base64,")) {
      return base64String;
    }
    // Jika belum, tambahkan prefix
    return `data:application/pdf;base64,${base64String}`;
  };

  const pdfUrl = getPdfDataUrl(data.sk_pdf);

  return (
    <div style={{ padding: "20px" }}>
      <Button onClick={() => refetch()}>Refresh</Button>
      <iframe
        src={pdfUrl}
        style={{
          width: "100%",
          height: "800px",
          border: "1px solid #d9d9d9",
        }}
        title="PDF Viewer"
      />
      <Descriptions>
        <Descriptions.Item label="Nama">{data?.data?.nama}</Descriptions.Item>
        <Descriptions.Item label="NIP">{data?.data?.nip}</Descriptions.Item>
        <Descriptions.Item label="No Peserta">
          {data?.data?.usulan_data?.data?.no_peserta}
        </Descriptions.Item>
        <Descriptions.Item label="Jenis Formasi Nama">
          {data?.data?.jenis_formasi_nama}
        </Descriptions.Item>
        <Descriptions.Item label="Tahun Formasi">
          {data?.data?.periode}
        </Descriptions.Item>
      </Descriptions>
      <ModalUsulan
        open={openModalUsulan}
        onClose={handleCloseModalUsulan}
        data={usulanData}
      />

      <Button
        onClick={() =>
          handleOpenModalUsulan({
            ...data?.data,
            sk_pdf: data?.sk_pdf,
          })
        }
      >
        Usulkan
      </Button>
    </div>
  );
}

export default DetailLayananPengadaan;

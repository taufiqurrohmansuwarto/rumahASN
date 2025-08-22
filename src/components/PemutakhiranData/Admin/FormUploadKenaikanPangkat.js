import { urlToPdf } from "@/services/master.services";
import { uploadDokumenKenaikanPangkat } from "@/services/siasn-services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  DatePicker,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useState } from "react";

const { Link } = Typography;

function FormUploadKenaikanPangkat({ data, open, handleClose, dataSimaster }) {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [selectedFileUrl, setSelectedFileUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isConverting, setIsConverting] = useState(false);

  const handlePangkatChange = async (value) => {
    const selectedData = dataSimaster.find((item) => item.kp_id === value);
    if (selectedData) {
      form.setFieldsValue({
        no_sk: selectedData.no_sk,
        tgl_sk: selectedData.tgl_sk
          ? dayjs(selectedData.tgl_sk, "DD-MM-YYYY")
          : null,
      });
      setSelectedFileUrl(selectedData.file_pangkat);

      // Convert file immediately when pangkat is selected
      if (selectedData.file_pangkat) {
        setIsConverting(true);
        try {
          const file = await urlToPdf({
            url: selectedData.file_pangkat,
          });
          setSelectedFile(file);
        } catch (error) {
          message.error("Gagal mengconvert file: " + error.message);
          setSelectedFile(null);
        } finally {
          setIsConverting(false);
        }
      }
    }
  };

  const { mutate, isLoading } = useMutation(
    (data) => uploadDokumenKenaikanPangkat(data),
    {
      onSuccess: () => {
        handleClose();
        message.success("Berhasil mengupload dokumen kenaikan pangkat");
        queryClient.invalidateQueries(["data-riwayat-pangkat"]);
      },
      onError: () => {
        message.error("Gagal mengupload dokumen kenaikan pangkat");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["data-riwayat-pangkat"]);
      },
    }
  );

  const handleSubmit = (values) => {
    const formData = new FormData();

    // Add form values
    formData.append("no_sk", values.no_sk);
    formData.append("tgl_sk", values.tgl_sk.format("DD-MM-YYYY"));
    formData.append("id_usulan", data.id);

    // Use pre-converted file
    if (selectedFile) {
      // Convert file to File object
      const currentFile = new File([selectedFile], "file.pdf", {
        type: "application/pdf",
      });
      formData.append("file", currentFile);
    }

    mutate(formData);
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title="Lengkapi data"
      footer={[
        <Button key="cancel" onClick={handleClose}>
          Batal
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={isLoading}
          onClick={() => form.submit()}
        >
          Upload
        </Button>,
      ]}
    >
      {data && (
        <Card
          size="small"
          style={{
            marginBottom: 16,
            backgroundColor: "#fafafa",
            border: "1px solid #d9d9d9",
          }}
        >
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#262626",
                marginBottom: 8,
              }}
            >
              Informasi Pegawai
            </div>
            <Space wrap>
              <Tag>NIP: {data.nipBaru || "-"}</Tag>
              <Tag>Golongan: {data.golongan || "-"}</Tag>
              <Tag>Pangkat: {data.pangkat || "-"}</Tag>
            </Space>
            {data.jenisKPNama && (
              <Tag style={{ marginTop: 4 }}>Jenis KP: {data.jenisKPNama}</Tag>
            )}
          </Space>
        </Card>
      )}

      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        <Form.Item
          name="pangkat"
          label="Pilih Pangkat"
          rules={[{ required: true, message: "Pilih pangkat terlebih dahulu" }]}
        >
          <Select
            placeholder={
              isConverting ? "Mengkonversi file..." : "Pilih pangkat"
            }
            onChange={handlePangkatChange}
            loading={isConverting}
            disabled={isConverting}
            options={dataSimaster?.map((item) => ({
              value: item.kp_id,
              label: `${item.pangkat?.pangkat} (${item.pangkat?.gol_ruang}) - ${item.jenis_kp?.name}`,
            }))}
          />
        </Form.Item>
        <Form.Item
          name="no_sk"
          label="Nomor SK"
          rules={[{ required: true, message: "Nomor SK diperlukan" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="tgl_sk"
          label="Tanggal SK"
          rules={[{ required: true, message: "Tanggal SK diperlukan" }]}
        >
          <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
        </Form.Item>
        {selectedFileUrl && (
          <Form.Item label="File Dokumen">
            <Link
              href={selectedFileUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Lihat Dokumen Pangkat (PDF)
            </Link>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}

export default FormUploadKenaikanPangkat;

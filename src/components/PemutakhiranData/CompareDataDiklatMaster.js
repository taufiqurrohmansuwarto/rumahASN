import FormTransferDiklat from "@/components/PemutakhiranData/FormTransferDiklat";
import { rwDiklatMaster } from "@/services/master.services";
import { getTokenSIASNService, postRwKursus } from "@/services/siasn-services";
import { InboxOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Form, Modal, Table, Upload, message } from "antd";
import axios from "axios";
import moment from "moment";
import { useEffect, useState } from "react";

export const API_URL = "https://apimws.bkn.go.id:8243/apisiasn/1.0";

const TransferModal = ({ open, handleClose, data }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const [filePath, setFilePath] = useState(null);

  const { mutate: tambah, isLoading } = useMutation(
    (data) => postRwKursus(data),
    {
      onSuccess: () => {
        message.success("Data berhasil disimpan");
        form.resetFields();
        handleClose();
        setFilePath(null);
      },
      onError: (error) => {
        message.error(error?.response?.data?.message);
      },
      onSettled: () => {
        queryClient.invalidateQueries("riwayat-diklat");
        setFilePath(null);
      },
    }
  );

  const handleFinish = async () => {
    const result = await form.validateFields();

    const type = result?.jenisDiklatId === 1 ? "diklat" : "kursus";

    const payload = {
      ...result,
      type,
      tanggalKursus: result?.tanggalKursus?.format("DD-MM-YYYY"),
      tanggalSelesaiKursus: result?.tanggalSelesaiKursus?.format("DD-MM-YYYY"),
    };

    if (!filePath) {
      tambah(payload);
    } else {
      const data = {
        ...payload,
        path: [filePath],
      };

      tambah(data);
    }

    // tambah(payload);
  };

  useEffect(() => {
    form.setFieldsValue({
      namaKursus: data?.nama_diklat,
      institusiPenyelenggara: data?.penyelenggara,
      nomorSertipikat: data?.no_sertifikat,
      tahunKursus: data?.tahun,
      jumlahJam: data?.jml,
      tanggalKursus: moment(data?.tanggal_mulai, "DD-MM-YYYY"),
    });
  }, [form, data]);

  const customRequest = async ({ file, onSuccess, onError }) => {
    // Pertama, dapatkan token
    try {
      const tokenResult = await getTokenSIASNService(); // Asumsikan ini adalah fungsi async Anda untuk mendapatkan token
      const { wso2, sso } = tokenResult.accessToken;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("id_ref_dokumen", "881");

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
      onSuccess(response, file);
    } catch (error) {
      // Jika terjadi error, panggil onError
      onError(error);
      console.error("Upload error:", error);
    }
  };

  return (
    <Modal
      width={800}
      title="Transfer Data"
      onOk={handleFinish}
      open={open}
      confirmLoading={isLoading}
      onCancel={handleClose}
    >
      <FormTransferDiklat
        namaDiklat={data?.diklat?.name}
        form={form}
        onFinish={handleFinish}
        data={data}
        handleClose={handleClose}
      />
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
        <p className="ant-upload-text">
          Click or drag file to this area to upload
        </p>
        <p className="ant-upload-hint">
          Support for a single or bulk upload. Strictly prohibit from uploading
          company data or other band files
        </p>
      </Upload.Dragger>
    </Modal>
  );
};

function CompareDataDiklatMaster() {
  const { data, isLoading } = useQuery(
    ["rw-diklat-master"],
    () => rwDiklatMaster(),
    {}
  );

  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleOpen = (data) => {
    setOpen(true);
    setSelectedRow(data);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRow(null);
  };

  const columns = [
    {
      title: "File",
      key: "file",
      render: (_, row) => {
        return (
          <div>
            <a href={row?.file_diklat} target="_blank" rel="noreferrer">
              File
            </a>
          </div>
        );
      },
    },
    {
      title: "Nama",
      dataIndex: "nama_diklat",
    },
    {
      title: "No. Sertifikat",
      dataIndex: "no_sertifikat",
    },
    {
      title: "Tahun",
      dataIndex: "tahun",
    },
    {
      title: "Institusi Penyelenggara",
      dataIndex: "penyelenggara",
    },
    {
      title: "Tanggal Mulai",
      dataIndex: "tanggal_mulai",
    },

    {
      title: "Jenis",
      key: "jenis",
      render: (_, row) => <>{row?.diklat?.name}</>,
    },
    {
      title: "Jumlah Jam",
      dataIndex: "jml",
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (_, row) => {
        if (
          row?.jenis_diklat_id === "1231" ||
          row?.jenis_diklat_id === "1232" ||
          row?.jenis_diklat_id === "1233" ||
          row?.jenis_diklat_id === "1237"
        ) {
          return <a onClick={() => handleOpen(row)}>Transfer</a>;
        } else {
          return null;
        }
      },
    },
  ];

  return (
    <div>
      <Table
        pagination={false}
        dataSource={data}
        rowKey={(row) => row?.diklat_id}
        columns={columns}
        loading={isLoading}
      />
      <TransferModal open={open} handleClose={handleClose} data={selectedRow} />
    </div>
  );
}

export default CompareDataDiklatMaster;

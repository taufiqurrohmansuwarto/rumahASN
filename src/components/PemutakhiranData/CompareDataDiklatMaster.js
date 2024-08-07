import FormTransferDiklat from "@/components/PemutakhiranData/FormTransferDiklat";
import { rwDiklatMaster, urlToPdf } from "@/services/master.services";
import { postRwKursus } from "@/services/siasn-services";
import { SendOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Descriptions,
  Form,
  Modal,
  Table,
  Tooltip,
  message,
} from "antd";
import { useEffect, useState } from "react";

import { uploadDokumenRiwayat } from "@/utils/client-utils";
import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.locale("id");
dayjs.extend(relativeTime);

export const API_URL = "https://apimws.bkn.go.id:8243/apisiasn/1.0";

const TransferModal = ({ open, handleClose, data }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const [file, setFile] = useState(null);

  useEffect(() => {
    if (data) {
      const fetchAndSetFile = async () => {
        const response = await urlToPdf({ url: data?.file_diklat });

        const file = new File([response], "file.pdf", {
          type: "application/pdf",
        });

        setFile(file);
      };
      fetchAndSetFile();
    }
  }, [data]);

  const { mutateAsync: tambah, isLoading } = useMutation(
    (data) => postRwKursus(data),
    {
      onSuccess: () => {
        message.success("Data berhasil disimpan");
        form.resetFields();
        handleClose();
        setFile(null);
      },
      onError: (error) => {
        message.error(error?.response?.data?.message);
      },
      onSettled: () => {
        queryClient.invalidateQueries("riwayat-diklat");
        setFile(null);
      },
    }
  );

  const handleFinish = async () => {
    try {
      const result = await form.validateFields();

      const type = result?.jenisDiklatId === 1 ? "diklat" : "kursus";
      const id_ref_dokumen = type === "diklat" ? "874" : "881";

      const payload = {
        ...result,
        type,
        tanggalKursus: result?.tanggalKursus?.format("DD-MM-YYYY"),
        tanggalSelesaiKursus:
          result?.tanggalSelesaiKursus?.format("DD-MM-YYYY"),
      };

      if (!!file) {
        const result = await tambah(payload);
        const formData = new FormData();
        formData.append("id_riwayat", result?.id);
        formData.append("id_ref_dokumen", id_ref_dokumen);
        formData.append("file", file);
        await uploadDokumenRiwayat(formData);
      } else {
        await tambah(payload);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    form.setFieldsValue({
      namaKursus: data?.nama_diklat,
      institusiPenyelenggara: data?.penyelenggara,
      nomorSertipikat: data?.no_sertifikat,
      tahunKursus: data?.tahun,
      jumlahJam: data?.jml,
      tanggalKursus: dayjs(data?.tanggal_mulai, "DD-MM-YYYY"),
    });
  }, [form, data]);

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
      {file && (
        <a href={data?.file_diklat} target="_blank" rel="noreferrer">
          {data?.file_diklat}
        </a>
      )}
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
      title: "Data",
      responsive: ["xs"],
      key: "data",
      render: (_, row) => {
        return (
          <Descriptions layout="vertical">
            <Descriptions.Item label="Nama">
              {row?.nama_diklat}
            </Descriptions.Item>
            <Descriptions.Item label="No. Sertifikat">
              {row?.no_sertifikat}
            </Descriptions.Item>
            <Descriptions.Item label="Tahun">{row?.tahun}</Descriptions.Item>
            <Descriptions.Item label="Institusi Penyelenggara">
              {row?.penyelenggara}
            </Descriptions.Item>
            <Descriptions.Item label="Tanggal Mulai">
              {row?.tanggal_mulai}
            </Descriptions.Item>
            <Descriptions.Item label="Jumlah Jam">{row?.jml}</Descriptions.Item>
            <Descriptions.Item label="Jenis">
              {row?.diklat?.name}
            </Descriptions.Item>
            <Descriptions.Item label="Aksi">
              <Button type="primary" onClick={() => handleOpen(row)}>
                Transfer
              </Button>
            </Descriptions.Item>
          </Descriptions>
        );
      },
    },
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
      responsive: ["sm"],
    },
    {
      title: "Nama",
      dataIndex: "nama_diklat",
      responsive: ["sm"],
    },
    {
      title: "No. Sertifikat",
      dataIndex: "no_sertifikat",
      responsive: ["sm"],
    },
    {
      title: "Tahun",
      dataIndex: "tahun",
      responsive: ["sm"],
    },
    {
      title: "Institusi Penyelenggara",
      dataIndex: "penyelenggara",
      responsive: ["sm"],
    },
    {
      title: "Tanggal Mulai",
      dataIndex: "tanggal_mulai",
      responsive: ["sm"],
    },

    {
      title: "Jenis",
      key: "jenis",
      render: (_, row) => <>{row?.diklat?.name}</>,
      responsive: ["sm"],
    },
    {
      title: "Jumlah Jam",
      dataIndex: "jml",
      responsive: ["sm"],
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (_, row) => {
        // if (
        //   row?.jenis_diklat_id === "1231" ||
        //   row?.jenis_diklat_id === "1232" ||
        //   row?.jenis_diklat_id === "1233" ||
        //   row?.jenis_diklat_id === "1237"
        // ) {
        //   return <a onClick={() => handleOpen(row)}>Transfer</a>;
        // } else {
        //   return null;
        // }
        return (
          <Tooltip title="Transfer">
            <a onClick={() => handleOpen(row)}>
              <SendOutlined />
            </a>
          </Tooltip>
        );
      },
      responsive: ["sm"],
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

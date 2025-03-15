import FormTransferDiklat from "@/components/PemutakhiranData/FormTransferDiklat";
import { rwDiklatMasterByNip, urlToPdf } from "@/services/master.services";
import {
  postRiwayatKursusByNip,
  uploadDokRiwayat,
} from "@/services/siasn-services";
import { SendOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Flex, Form, Modal, Spin, Table, Tooltip, message } from "antd";
import { useEffect, useState } from "react";

import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.locale("id");
dayjs.extend(relativeTime);

export const API_URL = "https://apimws.bkn.go.id:8243/apisiasn/1.0";

const TransferModal = ({ open, handleClose, data, nip, file }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);

  const { mutateAsync: tambah } = useMutation(
    (data) => postRiwayatKursusByNip(data),
    {}
  );

  const handleFinish = async () => {
    setLoading(true);
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

      const dataPayload = {
        data: payload,
        nip: nip,
      };

      if (file) {
        const responseDiklat = await tambah(dataPayload);
        const id_riwayat = responseDiklat?.id;

        const formData = new FormData();
        formData.append("id_ref_dokumen", id_ref_dokumen);
        formData.append("id_riwayat", id_riwayat);
        formData.append("file", file);

        await uploadDokRiwayat(formData);

        message.success("Data berhasil disimpan");
        form.resetFields();
        handleClose();
      } else {
        await tambah(dataPayload);
        message.success("Data berhasil disimpan");
        form.resetFields();
        handleClose();
      }
    } catch (error) {
      message.error("Gagal mengirim data");
      console.error(error);
    } finally {
      queryClient.invalidateQueries(["riwayat-diklat-by-nip", nip]);
      setLoading(false);
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
  }, [form, data, file]);

  return (
    <Modal
      width={800}
      title="Transfer Data"
      onOk={handleFinish}
      open={open}
      confirmLoading={loading}
      onCancel={handleClose}
    >
      <FormTransferDiklat
        namaDiklat={data?.diklat?.name}
        form={form}
        onFinish={handleFinish}
        data={data}
        file={file}
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

const data2024 = (data) => {
  return data?.filter(
    (item) =>
      item?.tahun === 2024 &&
      item?.diklat?.kode_jenis_bkn !== null &&
      item?.diklat?.kode_jenis_bkn !== 1 &&
      item?.diklat?.kode_pim_bkn === null &&
      item?.jml !== 0 &&
      !!item?.no_sertifikat
  );
};

function CompareDataDiklatMasterByNip({ nip }) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(
    ["rw-diklat-master", nip],
    () => rwDiklatMasterByNip(nip),
    {
      refetchOnWindowFocus: false,
    }
  );

  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [isLoadingTransfer, setIsLoadingTransfer] = useState(false);
  const lastYear = new Date().getFullYear() - 1;

  const handleOpenModal = async (data) => {
    setLoading(true);
    try {
      if (data?.file_diklat) {
        const response = await urlToPdf({ url: data?.file_diklat });
        const currentFile = new File([response], data?.file_diklat, {
          type: "application/pdf",
        });
        setFile(currentFile);
      } else {
        setFile(null);
      }
      setOpen(true);
      setSelectedRow(data);
    } catch (error) {
      console.error("Error processing file:", error);
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRow(null);
    setFile(null);
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
        return (
          <Tooltip title="Transfer Diklat">
            <a onClick={async () => await handleOpenModal(row)}>
              <SendOutlined />
            </a>
          </Tooltip>
        );
      },
    },
  ];

  const delay = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const handleTransfer = async () => {
    setIsLoadingTransfer(true);
    const dataLastYear = data2024(data);

    // console.log(dataLastYear);

    const payload = dataLastYear.map((item) => {
      return {
        type: "kursus",
        jenisDiklatId: item?.diklat?.kode_jenis_bkn,
        namaKursus: item?.nama_diklat,
        institusiPenyelenggara: item?.penyelenggara,
        nomorSertipikat: item?.no_sertifikat,
        tahunKursus: item?.tahun,
        jumlahJam: item?.jml,
        tanggalKursus: item?.tgl_sertifikat,
        tanggalSelesaiKursus: item?.tgl_sertifikat,
        fileDiklat: item?.file_diklat,
      };
    });

    const id_ref_dokumen = "881";
    try {
      for (const item of payload) {
        const requestBody = { nip, data: item };
        const result = await postRiwayatKursusByNip(requestBody);
        await delay(2000);

        if (item.fileDiklat) {
          const response = await urlToPdf({ url: item.fileDiklat });
          const file = new File([response], "file.pdf", {
            type: "application/pdf",
          });

          const formData = new FormData();
          formData.append("id_riwayat", result?.id);
          formData.append("id_ref_dokumen", id_ref_dokumen);
          formData.append("file", file);
          await uploadDokRiwayat(formData);
        }
      }
      message.success("Data berhasil disimpan");
      queryClient.invalidateQueries(["riwayat-diklat-by-nip", nip]);
    } catch (error) {
      console.log(error);
      const messageError =
        error?.response?.data?.message || "Gagal mengirim data";
      message.error(messageError);
    } finally {
      setIsLoadingTransfer(false);
    }
  };

  return (
    <div>
      <Spin spinning={loading} fullscreen />
      {/* <>
        {data && data2024(data)?.length && (
          <Flex justify="flex-end">
            <Button
              style={{ marginBottom: 8 }}
              type="primary"
              onClick={handleTransfer}
              loading={isLoadingTransfer}
              disabled={isLoadingTransfer}
            >
              Transfer Diklat 2024
            </Button>
          </Flex>
        )}
      </> */}
      <Table
        pagination={false}
        dataSource={data}
        rowKey={(row) => row?.diklat_id}
        columns={columns}
        loading={isLoading}
      />
      <TransferModal
        nip={nip}
        open={open}
        file={file}
        handleClose={handleClose}
        data={selectedRow}
      />
    </div>
  );
}

export default CompareDataDiklatMasterByNip;

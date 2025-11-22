import FormTransferDiklat from "@/components/PemutakhiranData/FormTransferDiklat";
import { rwDiklatMasterByNip, urlToPdf } from "@/services/master.services";
import {
  postRiwayatKursusByNip,
  uploadDokRiwayat,
} from "@/services/siasn-services";
import { Badge as MantineBadge, Text as MantineText } from "@mantine/core";
import { IconFileText, IconRefresh, IconSend } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Modal, Table, Tooltip, message } from "antd";
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
  const [file, setFile] = useState(null);
  const [loadingDiklatId, setLoadingDiklatId] = useState(null);

  const { mutate: loadPdfFile, isLoading: loadingFile } = useMutation({
    mutationFn: (record) => {
      setLoadingDiklatId(record?.diklat_id);
      return urlToPdf({ url: record?.file_diklat });
    },
    onSuccess: (data, record) => {
      const pdfFile = new File([data], "file.pdf", {
        type: "application/pdf",
      });
      setFile(pdfFile);
      setOpen(true);
      setSelectedRow(record);
      setLoadingDiklatId(null);
    },
    onError: (error) => {
      console.error("Error loading PDF:", error);
      message.error("Gagal memuat file PDF");
      setLoadingDiklatId(null);
    },
  });

  const handleOpenModal = (record) => {
    if (record?.file_diklat) {
      loadPdfFile(record);
    } else {
      setOpen(true);
      setSelectedRow(record);
      setFile(null);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRow(null);
    setFile(null);
    setLoadingDiklatId(null);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries(["rw-diklat-master", nip]);
  };

  const columns = [
    {
      title: "Dok",
      key: "file",
      width: 80,
      align: "center",
      render: (_, row) => {
        return (
          <>
            {row?.file_diklat && (
              <Tooltip title="File Diklat">
                <a href={row?.file_diklat} target="_blank" rel="noreferrer">
                  <Button
                    size="small"
                    type="link"
                    icon={<IconFileText size={14} />}
                  />
                </a>
              </Tooltip>
            )}
          </>
        );
      },
    },
    {
      title: "Nama Diklat & Jenis",
      key: "nama_jenis",
      width: 250,
      render: (_, row) => (
        <Tooltip title={row?.nama_diklat}>
          <div>
            <MantineText size="sm" fw={500} lineClamp={2}>
              {row?.nama_diklat}
            </MantineText>
            <MantineBadge size="xs" color="green" tt="none">
              {row?.diklat?.name}
            </MantineBadge>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "No. Sertifikat & Tahun",
      key: "sertifikat",
      width: 150,
      render: (_, record) => (
        <div>
          <MantineText size="xs" fw={500} lineClamp={1}>
            {record?.no_sertifikat}
          </MantineText>
          <MantineBadge size="xs" color="blue">
            {record?.tahun}
          </MantineBadge>
        </div>
      ),
    },
    {
      title: "Penyelenggara",
      dataIndex: "penyelenggara",
      width: 200,
      render: (text) => (
        <Tooltip title={text}>
          <MantineText size="xs" lineClamp={2}>
            {text}
          </MantineText>
        </Tooltip>
      ),
    },
    {
      title: "Tgl Mulai",
      dataIndex: "tanggal_mulai",
      width: 100,
      render: (tgl) => (
        <MantineText size="xs" c="dimmed">
          {tgl}
        </MantineText>
      ),
    },
    {
      title: "Jam",
      dataIndex: "jml",
      width: 70,
      align: "center",
      render: (jam) => (
        <MantineBadge size="sm" color="orange">
          {jam}
        </MantineBadge>
      ),
    },
    {
      title: "Aksi",
      key: "aksi",
      width: 80,
      align: "center",
      render: (_, row) => {
        return (
          <Tooltip title="Transfer Diklat">
            <Button
              size="small"
              type="primary"
              icon={<IconSend size={14} />}
              onClick={() => handleOpenModal(row)}
              loading={loadingFile && loadingDiklatId === row?.diklat_id}
            />
          </Tooltip>
        );
      },
    },
  ];

  return (
    <div>
      <Table
        title={() => (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <MantineText fw="bold">Data Diklat SIMASTER</MantineText>
            <Tooltip title="Refresh data SIMASTER">
              <Button
                size="small"
                icon={<IconRefresh size={14} />}
                onClick={handleRefresh}
                loading={isLoading}
              />
            </Tooltip>
          </div>
        )}
        pagination={false}
        dataSource={data}
        rowKey={(row) => row?.diklat_id}
        columns={columns}
        loading={isLoading}
        rowClassName={(_, index) =>
          index % 2 === 0 ? "table-row-light" : "table-row-dark"
        }
        size="small"
        scroll={{ x: 1000 }}
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

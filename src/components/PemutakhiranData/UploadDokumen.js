import { urlToPdf } from "@/services/master.services";
import { uploadDokRiwayat } from "@/services/siasn-services";
import { Stack, Text as MantineText } from "@mantine/core";
import { IconUpload } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Modal,
  Tooltip,
  Upload,
  message,
  Space,
  Divider,
  Select,
} from "antd";
import { useState } from "react";

const ModalUploadDokumen = ({
  nama,
  open,
  onCancel,
  id,
  idRefDokumen,
  invalidateQueries,
  dataMaster,
}) => {
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [selectedMasterData, setSelectedMasterData] = useState(null);
  const [selectedValue, setSelectedValue] = useState(null);
  const queryClient = useQueryClient();

  // Cek apakah ada data master yang valid (ada file)
  const hasValidMasterData =
    dataMaster &&
    Array.isArray(dataMaster) &&
    dataMaster.length > 0 &&
    dataMaster.some((master) => master?.file && master?.id && master?.jabatan);

  const { mutateAsync: uploadBerkasRiwayat, isLoading: loadingUpload } =
    useMutation((data) => uploadDokRiwayat(data), {
      onSuccess: () => {
        message.success("Berhasil mengunggah file.");
        queryClient.invalidateQueries(invalidateQueries);
        onCancel();
      },
      onSettled: () => {
        queryClient.invalidateQueries(invalidateQueries);
      },
      onError: (error) => {
        message.error(
          error?.response?.data?.message || "Gagal mengunggah file."
        );
      },
    });

  const handleUpload = async () => {
    try {
      if (fileList.length === 0) {
        message.error("Silakan upload file terlebih dahulu.");
        return;
      } else {
        const file = fileList[0];
        const currentFile = file?.originFileObj;
        const formData = new FormData();

        formData.append("file", currentFile);
        formData.append("id_riwayat", id);
        formData.append("id_ref_dokumen", idRefDokumen);
        await uploadBerkasRiwayat(formData);
      }
    } catch (error) {
    } finally {
    }
  };

  const handleTransferFromMaster = async () => {
    if (!selectedMasterData) {
      message.error("Silakan pilih riwayat jabatan terlebih dahulu");
      return;
    }

    if (!selectedMasterData?.file) {
      message.error("File dari riwayat yang dipilih tidak ditemukan");
      return;
    }

    Modal.confirm({
      centered: true,
      title: "Transfer Dokumen",
      content: (
        <div>
          <p>
            Apakah Anda yakin ingin mentransfer dokumen {nama} dari riwayat
            master ke SIASN?
          </p>
          <p style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
            <strong>Jabatan:</strong> {selectedMasterData.jabatan}
          </p>
        </div>
      ),
      okText: "Ya, Transfer",
      cancelText: "Batal",
      onOk: async () => {
        setTransferring(true);
        try {
          // Download file dari URL master menggunakan urlToPdf
          const response = await urlToPdf({ url: selectedMasterData.file });

          // Convert blob response ke File object
          const file = new File([response], `${nama}_transfer.pdf`, {
            type: "application/pdf",
          });

          // Create FormData
          const formData = new FormData();
          formData.append("file", file);
          formData.append("id_riwayat", id);
          formData.append("id_ref_dokumen", idRefDokumen);

          // Upload dokumen
          await uploadBerkasRiwayat(formData);
          setSelectedMasterData(null); // Reset selection
          setSelectedValue(null);
        } catch (error) {
          console.error("Transfer error:", error);
          message.error(
            error?.response?.data?.message ||
              error?.message ||
              "Gagal memproses transfer"
          );
        } finally {
          setTransferring(false);
        }
      },
    });
  };

  const handleModalCancel = () => {
    setSelectedMasterData(null);
    setSelectedValue(null);
    setFileList([]);
    onCancel();
  };

  const handleSelectChange = (value, option) => {
    setSelectedValue(value);
    setSelectedMasterData(option?.data || null);
  };

  const handleChange = (info) => {
    let fileList = [...info.fileList];

    fileList = fileList.slice(-1);

    fileList = fileList.map((file) => {
      if (file.response) {
        file.url = file.response.url;
      }
      return file;
    });

    setFileList(fileList);
  };

  const props = {
    onRemove: () => {
      setFileList([]);
    },
    beforeUpload: () => {
      return false;
    },
    maxCount: 1,
    accept: ".pdf",
    onChange: handleChange,
  };

  return (
    <Modal
      title={`Upload Dokumen ${nama}`}
      open={open}
      onCancel={handleModalCancel}
      onOk={handleUpload}
      confirmLoading={loadingUpload}
      footer={[
        <Button key="cancel" onClick={handleModalCancel}>
          Batal
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loadingUpload}
          onClick={handleUpload}
        >
          Upload
        </Button>,
      ]}
    >
      <Stack gap="md">
        {hasValidMasterData && (
          <>
            <div>
              <MantineText size="xs" c="dimmed" mb={8}>
                Transfer dari Master
              </MantineText>
              <Select
                showSearch
                placeholder="Cari berdasarkan nama jabatan"
                style={{ width: "100%" }}
                value={selectedValue}
                onChange={handleSelectChange}
                filterOption={(input, option) => {
                  const label = option?.label?.toLowerCase() || "";
                  const search = input.toLowerCase();
                  return label.includes(search);
                }}
                options={dataMaster
                  ?.filter(
                    (master) => master?.file && master?.id && master?.jabatan
                  )
                  ?.map((master, index) => ({
                    value: `${master.id}-${index}`,
                    label: `${master.jabatan}${
                      master.tmt_jabatan ? ` (${master.tmt_jabatan})` : ""
                    }`,
                    data: {
                      id: master.id,
                      jabatan: master.jabatan,
                      file: master.file,
                    },
                    key: `${master.id}-${index}`,
                  }))}
              />
            </div>

            {selectedMasterData && (
              <Space size="small">
                <Button
                  size="small"
                  onClick={handleTransferFromMaster}
                  loading={transferring}
                  disabled={!selectedMasterData}
                >
                  Transfer
                </Button>
                <a
                  href={selectedMasterData.file}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button size="small">Lihat</Button>
                </a>
              </Space>
            )}

            <Divider style={{ margin: "8px 0" }} />
          </>
        )}

        <div>
          <MantineText size="xs" c="dimmed" mb={8}>
            Upload Manual
          </MantineText>
          <Upload {...props}>
            <Button size="small">Pilih File</Button>
          </Upload>
        </div>
      </Stack>
    </Modal>
  );
};

function UploadDokumen({
  id,
  nama,
  idRefDokumen,
  invalidateQueries,
  dataMaster,
}) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Tooltip title={`Unggah Dokumen ${nama}`}>
        <Button
          size="small"
          type="primary"
          icon={<IconUpload size={14} />}
          onClick={handleOpen}
        />
      </Tooltip>
      <ModalUploadDokumen
        invalidateQueries={invalidateQueries}
        nama={nama}
        idRefDokumen={idRefDokumen}
        id={id}
        open={open}
        onCancel={handleClose}
        dataMaster={dataMaster}
      />
    </>
  );
}

export default UploadDokumen;

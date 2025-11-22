import { uploadDokRiwayat } from "@/services/siasn-services";
import { Alert, Stack } from "@mantine/core";
import { IconUpload } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Modal, Tooltip, Upload, message } from "antd";
import { useState } from "react";

const ModalUploadDokumen = ({
  nama,
  open,
  onCancel,
  id,
  idRefDokumen,
  invalidateQueries,
}) => {
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

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
        message.error("Please upload a file.");
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
      title={`Upload File ${nama}`}
      open={open}
      onCancel={onCancel}
      onOk={handleUpload}
      confirmLoading={loadingUpload}
    >
      <Stack>
        <Alert color="blue">
          Gunakan fitur ini untuk mengunggah kekurangan file {nama}
        </Alert>
        <Upload {...props}>
          <Button>Upload File</Button>
        </Upload>
      </Stack>
    </Modal>
  );
};

function UploadDokumen({ id, nama, idRefDokumen, invalidateQueries }) {
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
      />
    </>
  );
}

export default UploadDokumen;

import { getTokenSIASNService } from "@/services/siasn-services";
import { API_URL, uploadDokumenRiwayat } from "@/utils/client-utils";
import { CloudUploadOutlined } from "@ant-design/icons";
import { Alert, Stack } from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Form,
  Modal,
  Tooltip,
  Typography,
  Upload,
  message,
} from "antd";
import axios from "axios";
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

  const handleUpload = async () => {
    try {
      setLoading(true);
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
        await uploadDokumenRiwayat(formData);
        message.success("Berhasil mengunggah file.");
        onCancel();
      }
    } catch (error) {
      console.log(error);
      message.error("Gagal mengunggah file.");
    } finally {
      setLoading(false);
      queryClient.invalidateQueries(invalidateQueries);
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
      confirmLoading={loading}
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
    <div>
      <Typography.Link onClick={handleOpen}>
        <Tooltip title={`Unggah Dokumen ${nama}`}>
          <a>
            <CloudUploadOutlined />
          </a>
        </Tooltip>
      </Typography.Link>
      <ModalUploadDokumen
        nama={nama}
        idRefDokumen={idRefDokumen}
        id={id}
        open={open}
        onCancel={handleClose}
      />
    </div>
  );
}

export default UploadDokumen;

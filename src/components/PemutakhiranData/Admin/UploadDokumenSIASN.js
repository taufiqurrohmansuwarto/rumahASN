import { uploadDokumenSiasnBaru } from "@/services/siasn-services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, message, Modal, Upload } from "antd";
import { Text, Stack, Group, Flex } from "@mantine/core";
import { IconUpload, IconFileText, IconCheck } from "@tabler/icons-react";
import { useState } from "react";

const UploadDokumenSIASN = () => {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const queryClient = useQueryClient();

  const { mutate: upload, isLoading } = useMutation({
    mutationFn: (data) => uploadDokumenSiasnBaru(data),
    onSuccess: (result) => {
      message.success("Dokumen berhasil diupload");
      setUploadedFile(result);
      queryClient.invalidateQueries(["data-utama-siasn"]);
    },
    onError: (error) => {
      const errorMsg = error?.response?.data?.message || "Gagal upload dokumen";
      message.error(errorMsg);
      setFileList([]);
    },
  });

  const handleOpen = () => {
    setOpen(true);
    form.setFieldsValue({ id_ref_dokumen: "88" });
  };

  const handleClose = () => {
    setOpen(false);
    form.resetFields();
    setFileList([]);
    setUploadedFile(null);
  };

  const handleUpload = (file) => {
    const kodeDokumen = form.getFieldValue("id_ref_dokumen");

    if (!kodeDokumen) {
      message.error("Kode dokumen wajib diisi");
      return false;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("id_ref_dokumen", kodeDokumen);

    setFileList([
      {
        uid: file.uid,
        name: file.name,
        status: "uploading",
      },
    ]);

    upload(formData);
    return false;
  };

  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  return (
    <>
      <Button icon={<IconUpload size={16} />} onClick={handleOpen} size="small">
        Upload Dokumen
      </Button>

      <Modal
        open={open}
        onCancel={handleClose}
        title={
          <Group gap="xs">
            <IconFileText size={16} color="#1890ff" />
            <Text fw={600} size="sm">
              Upload Dokumen SIASN
            </Text>
          </Group>
        }
        footer={
          <Button onClick={handleClose} size="small">
            Tutup
          </Button>
        }
        width={500}
        centered
        destroyOnClose
      >
        <Stack gap="sm">
          <Form form={form} layout="vertical" size="small">
            <Text
              size="xs"
              fw={500}
              style={{ display: "block", marginBottom: 4 }}
            >
              Kode Dokumen
            </Text>
            <Form.Item
              name="id_ref_dokumen"
              rules={[{ required: true, message: "Wajib diisi" }]}
              style={{ marginBottom: 12 }}
            >
              <Input
                size="small"
                placeholder="88"
                prefix={<IconFileText size={14} />}
              />
            </Form.Item>

            <Text
              size="xs"
              fw={500}
              style={{ display: "block", marginBottom: 4 }}
            >
              File Dokumen
            </Text>
            <Upload
              accept=".pdf,.jpg,.jpeg,.png"
              beforeUpload={handleUpload}
              fileList={fileList}
              onChange={handleChange}
              maxCount={1}
            >
              <Button
                icon={<IconUpload size={14} />}
                loading={isLoading}
                block
                size="small"
              >
                Pilih File
              </Button>
            </Upload>
            <Text size="xs" c="dimmed" mt={4}>
              Format: PDF, JPG, JPEG, PNG
            </Text>
          </Form>

          {uploadedFile && (
            <Flex
              p="xs"
              style={{
                background: "#f6ffed",
                border: "1px solid #b7eb8f",
                borderRadius: "4px",
              }}
              gap="xs"
              align="center"
            >
              <IconCheck size={16} color="#52c41a" />
              <Stack gap={0}>
                <Text size="xs" fw={600} c="green">
                  Upload Berhasil
                </Text>
                <Text size="xs" c="dimmed">
                  File berhasil diupload ke SIASN
                </Text>
              </Stack>
            </Flex>
          )}
        </Stack>
      </Modal>
    </>
  );
};

export default UploadDokumenSIASN;

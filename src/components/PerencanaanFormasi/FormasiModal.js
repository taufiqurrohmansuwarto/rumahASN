import {
  createFormasi,
  updateFormasi,
} from "@/services/perencanaan-formasi.services";
import { useMediaQuery } from "@mantine/hooks";
import { IconCalendar, IconEdit, IconFileText, IconPlus, IconToggleLeft } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, InputNumber, message, Modal, Select } from "antd";
import { useEffect } from "react";

const { TextArea } = Input;

const FormasiModal = ({ open, onClose, data, onSuccess }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const isEdit = !!data;
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Reset form when data changes or modal opens
  useEffect(() => {
    if (open) {
      if (isEdit) {
        form.setFieldsValue({
          deskripsi: data.deskripsi,
          tahun: data.tahun,
          status: data.status,
        });
      } else {
        form.setFieldsValue({
          tahun: new Date().getFullYear(),
          status: "aktif",
          deskripsi: "",
        });
      }
    }
  }, [open, data, isEdit, form]);

  const { mutate: submit, isLoading } = useMutation(
    (values) =>
      isEdit ? updateFormasi(data.formasi_id, values) : createFormasi(values),
    {
      onSuccess: () => {
        message.success(
          isEdit ? "Formasi berhasil diperbarui" : "Formasi berhasil dibuat"
        );
        queryClient.invalidateQueries(["perencanaan-formasi"]);
        queryClient.invalidateQueries(["perencanaan-formasi-detail"]); // Also invalidate detail
        form.resetFields();
        onSuccess?.();
        onClose();
      },
      onError: (error) => {
        message.error(
          error?.response?.data?.message || "Gagal menyimpan formasi"
        );
      },
    }
  );

  const handleSubmit = (values) => {
    submit(values);
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isEdit ? <IconEdit size={18} /> : <IconPlus size={18} />}
          <span>{isEdit ? "Edit Formasi" : "Formasi Baru"}</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      width={isMobile ? "95%" : 500}
      destroyOnClose
      centered={isMobile}
      footer={
        <div style={{ textAlign: "right" }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            Batal
          </Button>
          <Button
            type="primary"
            loading={isLoading}
            onClick={() => form.submit()}
          >
            {isEdit ? "Simpan" : "Buat"}
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="deskripsi"
          label={
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <IconFileText size={14} />
              <span>Judul / Deskripsi</span>
            </div>
          }
          rules={[{ required: true, message: "Judul wajib diisi" }]}
        >
          <TextArea
            rows={3}
            placeholder="Contoh: KPPI 2026, CPNS 2026"
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="tahun"
          label={
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <IconCalendar size={14} />
              <span>Tahun</span>
            </div>
          }
          rules={[{ required: true, message: "Tahun wajib diisi" }]}
        >
          <InputNumber
            min={2020}
            max={2100}
            style={{ width: "100%" }}
            placeholder="2026"
          />
        </Form.Item>

        <Form.Item
          name="status"
          label={
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <IconToggleLeft size={14} />
              <span>Status</span>
            </div>
          }
        >
          <Select>
            <Select.Option value="aktif">Aktif</Select.Option>
            <Select.Option value="nonaktif">Nonaktif</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FormasiModal;

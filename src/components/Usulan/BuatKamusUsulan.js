import {
  createSubmissionReference,
  updateSubmissionReference,
} from "@/services/submissions.services";
import { renderMarkdown, uploadFile } from "@/utils/client-utils";
import { MarkdownEditor } from "@primer/react/drafts";
import { useMutation } from "@tanstack/react-query";
import { Button, Card, Col, Form, Input, Row, Select, message } from "antd";
import { useRouter } from "next/router";
import { useEffect } from "react";

function BuatKamusUsulan({ type = "create", data = null }) {
  const router = useRouter();
  const [form] = Form.useForm();

  useEffect(() => {
    if (type === "update") {
      form.setFieldsValue(data);
    }
  }, [data, form, type]);

  const { mutateAsync: create, isLoading: isLoadingCreate } = useMutation(
    (data) => createSubmissionReference(data),
    {
      onSuccess: () => {
        message.success("Berhasil membuat kamus usulan");
        router.push("/apps-managements/submissions/references");
      },
      onError: () => {
        message.error("Gagal membuat kamus usulan");
      },
    }
  );

  const { mutateAsync: update, isLoading: isLoadingUpdate } = useMutation(
    (data) => updateSubmissionReference(data),
    {
      onSuccess: () => {
        message.success("Berhasil mengubah kamus usulan");
      },
      onError: () => {
        message.error("Gagal mengubah kamus usulan");
      },
    }
  );

  const handleSubmit = async () => {
    try {
      const payload = await form.validateFields();

      if (type === "update") {
        await update({ id: data.id, data: payload });
      } else if (type === "create") {
        await create(payload);
      }
    } catch (error) {
      message.error("Gagal membuat kamus usulan");
    }
  };

  return (
    <Card title={type === "update" ? "Ubah Kamus Usulan" : "Buat Kamus Usulan"}>
      <Row>
        <Col md={12}>
          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <Form.Item
              rules={[{ required: true, message: "Tidak boleh kosong" }]}
              required
              label="Jenis Usulan"
              name="type"
            >
              <Input />
            </Form.Item>
            <Form.Item
              required
              rules={[{ required: true, message: "Tidak boleh kosong" }]}
              label="Deskripsi"
              name="description"
            >
              <MarkdownEditor
                acceptedFileTypes={[
                  "image/*",
                  // word, excel, txt, pdf
                  ".doc",
                  ".docx",
                  ".xls",
                  ".xlsx",
                  ".txt",
                  ".pdf",
                ]}
                onRenderPreview={renderMarkdown}
                onUploadFile={uploadFile}
                mentionSuggestions={null}
              />
            </Form.Item>
            <Form.Item
              rules={[{ required: true, message: "Tidak boleh kosong" }]}
              required
              label="Pengusul"
              name="submitter_type"
            >
              <Select mode="multiple">
                <Select.Option value="asn">ASN Personal</Select.Option>
                <Select.Option value="fasilitator">Fasilitator</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Button
                disabled={isLoadingCreate}
                loading={isLoadingCreate}
                type="primary"
                htmlType="submit"
              >
                {type === "update" ? "Ubah" : "Buat"}
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </Card>
  );
}

export default BuatKamusUsulan;

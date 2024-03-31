import React, { useEffect } from "react";
import { Button, Checkbox, Form, Input, message } from "antd";
import { useMutation } from "@tanstack/react-query";
import {
  createSubmissionsFileRefs,
  updateSubmissionsFileRefs,
} from "@/services/submissions.services";
import { useRouter } from "next/router";
import { MarkdownEditor } from "@primer/react/drafts";
import { renderMarkdown, uploadFile } from "@/utils/client-utils";

function FormKamusUsulanFile({ type = "create", data }) {
  const router = useRouter();
  const [form] = Form.useForm();

  //   create
  const { mutateAsync: create, isLoading: isLoadingCreate } = useMutation(
    (data) => createSubmissionsFileRefs(data),
    {
      onSuccess: () => {
        message.success("Berhasil menambahkan data");
        router.push("/apps-managements/submissions/files");
      },
      onError: (error) => {
        console.log(error);
        message.error("Gagal menambahkan data");
      },
    }
  );

  //   update
  const { mutateAsync: update, isLoading: isLoadingUpdate } = useMutation(
    (data) => updateSubmissionsFileRefs(data),
    {
      onSuccess: () => {
        message.success("Berhasil mengubah data");
        router.push("/apps-managements/submissions/files");
      },
      onError: (error) => {
        console.log(error);
        message.error("Gagal mengubah data");
      },
    }
  );

  useEffect(() => {
    if (type === "edit") {
      form.setFieldsValue({
        ...data,
      });
    }
  }, [data, form, type]);

  const handleFinish = async () => {
    try {
      const payload = await form.validateFields();

      if (type === "create") {
        await create(payload);
      } else if (type === "edit") {
        await update({ id: data.kode, data: payload });
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Form
      title="Form Kamus Usulan File"
      form={form}
      layout="vertical"
      onFinish={handleFinish}
    >
      <Form.Item name="kode" label="Kode">
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
      <Form.Item valuePropName="checked" name="is_primary" label="Wajib?">
        <Checkbox />
      </Form.Item>
      <Form.Item valuePropName="checked" name="is_active" label="Aktif?">
        <Checkbox />
      </Form.Item>
      <Form.Item>
        <Button
          htmlType="submit"
          loading={isLoadingCreate || isLoadingUpdate}
          type="primary"
        >
          {type === "create" ? "Tambah" : "Ubah"}
        </Button>
      </Form.Item>
    </Form>
  );
}

export default FormKamusUsulanFile;

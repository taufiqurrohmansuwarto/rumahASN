import {
  parseMarkdown,
  updateSavedReplies,
  uploadFiles,
} from "@/services/index";
import { MarkdownEditor } from "@primer/react/drafts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, message, Skeleton } from "antd";
import { useRouter } from "next/router";
import { useEffect } from "react";

const EditSavedReplies = ({ id, initialValues, loading, savedReplies }) => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const router = useRouter();

  useEffect(() => {
    form.setFieldsValue({
      name: initialValues?.name,
      content: initialValues?.content,
    });
  }, [initialValues, form]);

  const uploadFile = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadFiles(formData);
      return {
        url: result?.data,
        file,
      };
    } catch (error) {
      console.log(error);
    }
  };

  const renderMarkdown = async (markdown) => {
    if (!markdown) return;
    const result = await parseMarkdown(markdown);
    return result?.html;
  };

  const { mutate: update, isLoading } = useMutation(
    (data) => updateSavedReplies(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("saved-replies");
        form.resetFields();
        router.push(`/settings/saved-replies`);
        message.success("Balasan disimpan berhasil dibuat");
      },
      onError: () => {
        message.error(
          "Gagal membuat balasan disimpan, silahkan coba lagi nanti"
        );
        form.resetFields();
      },
    }
  );

  const handleFinish = async () => {
    const result = await form.validateFields();
    if (!isLoading) {
      const data = {
        id,
        data: {
          name: result.name,
          content: result.content,
        },
      };
      update(data);
    }
  };

  return (
    <Skeleton loading={loading}>
      <Form
        initialValues={{
          name: initialValues?.name,
          content: initialValues?.content,
        }}
        onFinish={handleFinish}
        form={form}
        layout="vertical"
      >
        <Form.Item
          rules={[{ required: true, message: "Judul tidak boleh kosong" }]}
          name="name"
          label="Nama"
        >
          <Input />
        </Form.Item>
        <Form.Item
          required
          name="content"
          label="Balasan"
          rules={[{ required: true, message: "Balasan tidak boleh kosong" }]}
        >
          <MarkdownEditor
            onRenderPreview={renderMarkdown}
            onUploadFile={uploadFile}
            savedReplies={savedReplies}
          >
            <MarkdownEditor.Toolbar>
              <MarkdownEditor.DefaultToolbarButtons />
            </MarkdownEditor.Toolbar>
          </MarkdownEditor>
        </Form.Item>
        <Form.Item>
          <Button
            style={{ marginTop: 10 }}
            disabled={isLoading}
            type="primary"
            htmlType="submit"
          >
            Edit Balasan Disimpan
          </Button>
        </Form.Item>
      </Form>
    </Skeleton>
  );
};

export default EditSavedReplies;

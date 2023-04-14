import {
  createSavedReplies,
  getSavedReplies,
  parseMarkdown,
  uploadFiles,
} from "@/services/index";
import { MarkdownEditor } from "@primer/react/drafts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, message, Skeleton } from "antd";

const CreateSavedReplies = () => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

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

  const { mutate: create, isLoading } = useMutation(
    (data) => createSavedReplies(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("saved-replies");
        message.success("Balasan disimpan berhasil dibuat");
        form.resetFields();
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
      create(result);
    }
  };

  const { data: savedReplies, isLoading: isLoadingSavedReplies } = useQuery(
    ["saved-replies"],
    () => getSavedReplies()
  );

  return (
    <Skeleton loading={isLoadingSavedReplies}>
      <Form onFinish={handleFinish} form={form} layout="vertical">
        <Form.Item
          rules={[{ required: true, message: "Judul tidak boleh kosong" }]}
          name="name"
          label="Judul"
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
            Tambahkan Balasan Disimpan
          </Button>
        </Form.Item>
      </Form>
    </Skeleton>
  );
};

export default CreateSavedReplies;

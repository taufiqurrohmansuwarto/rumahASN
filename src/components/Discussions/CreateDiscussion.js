import { createDiscussion } from "@/services/asn-connect-discussions.services";
import { parseMarkdown, uploadFiles } from "@/services/index";
import { MarkdownEditor } from "@primer/react/drafts";
import { useMutation } from "@tanstack/react-query";
import { Button, Card, Checkbox, Form, Input, message } from "antd";
import { useRouter } from "next/router";

const uploadFile = async (file) => {
  try {
    const formData = new FormData();

    // if file not image png, jpg, jpeg, gif
    const allowedTypes = ["image/png", "image/jpg", "image/jpeg", "image/gif"];

    if (!allowedTypes.includes(file.type)) {
      return;
    } else {
      formData.append("file", file);
      const result = await uploadFiles(formData);
      return {
        url: result?.data,
        file,
      };
    }
  } catch (error) {
    console.log(error);
  }
};

const renderMarkdown = async (markdown) => {
  if (!markdown) return;
  const result = await parseMarkdown(markdown);
  return result?.html;
};

function CreateDiscussion() {
  const router = useRouter();
  const [form] = Form.useForm();

  const { mutateAsync: create, isLoading: isLoadingCreate } = useMutation(
    (data) => createDiscussion(data),
    {
      onSuccess: () => {
        message.success("Discussion created successfully");
        router.push("/asn-connect/asn-discussions");
      },
      onError: (error) => {
        message.error(error?.response?.data?.message);
      },
    }
  );

  const handleFinish = async () => {
    try {
      const payload = await form.validateFields();
      await create(payload);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Card>
      <Form form={form} layout="vertical">
        <Form.Item
          label="Tambahkan Judul"
          name="title"
          required
          rules={[{ required: true, message: "Judul tidak boleh kosong" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Body"
          name="content"
          required
          rules={[{ required: true, message: "Konten tidak boleh kosong" }]}
        >
          <MarkdownEditor
            acceptedFileTypes={[
              "image/png",
              "image/jpg",
              "image/jpeg",
              "image/gif",
            ]}
            onRenderPreview={renderMarkdown}
            onUploadFile={uploadFile}
          >
            <MarkdownEditor.Toolbar>
              <MarkdownEditor.DefaultToolbarButtons />
            </MarkdownEditor.Toolbar>
          </MarkdownEditor>
        </Form.Item>
        <Form.Item>
          <Checkbox>
            Saya telah melakukan pencarian diskusi yang sejenis
          </Checkbox>
        </Form.Item>
        <Form.Item>
          <Button
            onClick={handleFinish}
            disabled={isLoadingCreate}
            type="primary"
            htmlType="submit"
            loading={isLoadingCreate}
          >
            Mulai Diskusi
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

export default CreateDiscussion;

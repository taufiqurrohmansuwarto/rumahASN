import {
  createDiscussion,
  updateDiscussion,
} from "@/services/asn-connect-discussions.services";
import { parseMarkdown, uploadFiles } from "@/services/index";
import { MarkdownEditor } from "@primer/react/drafts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Checkbox, Form, Input, Space, message } from "antd";
import { useRouter } from "next/router";
import { useEffect } from "react";

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

function CreateDiscussion({ action = "create", item = null, onCancel }) {
  const router = useRouter();
  const [form] = Form.useForm();

  const queryClient = useQueryClient();

  useEffect(() => {
    if (action === "edit" && item) {
      form.setFieldsValue({
        title: item?.title,
        content: item?.content,
      });
    }
  }, [action, item, form]);

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

  const { mutateAsync: update, isLoading: isLoadingUpdate } = useMutation(
    (data) => updateDiscussion(data),
    {
      onSuccess: () => {
        message.success("Diskusi berhasil diupdate");
        onCancel();
      },
      onError: (error) => {
        message.error(error?.response?.data?.message);
      },
      onSettled: () => {
        queryClient.invalidateQueries(["asn-discussions", item?.id]);
      },
    }
  );

  const handleFinish = async () => {
    try {
      if (action === "create") {
        const payload = await form.validateFields();
        await create(payload);
      } else if (action === "edit") {
        const result = await form.validateFields();
        const payload = {
          id: item?.id,
          data: result,
        };
        await update(payload);
      }
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
          <Space>
            {action === "edit" && (
              <Button onClick={onCancel} type="default">
                Batal
              </Button>
            )}
            <Button
              onClick={handleFinish}
              disabled={isLoadingCreate || isLoadingUpdate}
              type="primary"
              htmlType="submit"
              loading={isLoadingCreate || isLoadingUpdate}
            >
              {action === "edit" ? "Edit Diskusi" : "Buat Diskusi"}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}

export default CreateDiscussion;

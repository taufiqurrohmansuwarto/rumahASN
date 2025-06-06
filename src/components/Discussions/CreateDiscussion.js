import {
  createDiscussion,
  updateDiscussion,
} from "@/services/asn-connect-discussions.services";
import { parseMarkdown, uploadFiles } from "@/services/index";
import { MarkdownEditor } from "@primer/react/drafts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  Space,
  message,
  Typography,
  Row,
  Col,
  Flex,
} from "antd";
import { useRouter } from "next/router";
import { useEffect } from "react";

const { Title, Text } = Typography;

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
        message.success("Diskusi berhasil dibuat");
        router.push("/asn-connect/asn-discussions");
      },
      onError: (error) => {
        message.error(
          error?.response?.data?.message || "Gagal membuat diskusi"
        );
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
        message.error(
          error?.response?.data?.message || "Gagal mengupdate diskusi"
        );
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

  const isEdit = action === "edit";

  if (isEdit) {
    // Render inline untuk edit mode
    return (
      <div style={{ width: "100%" }}>
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            required
            rules={[{ required: true, message: "Judul tidak boleh kosong" }]}
            style={{ marginBottom: "12px" }}
          >
            <Input
              placeholder="Judul diskusi"
              style={{
                borderRadius: "4px",
                border: "1px solid #EDEFF1",
                fontSize: "16px",
                padding: "8px 12px",
              }}
            />
          </Form.Item>
          <Form.Item
            name="content"
            required
            rules={[{ required: true, message: "Konten tidak boleh kosong" }]}
            style={{ marginBottom: "12px" }}
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
              style={{
                border: "1px solid #EDEFF1",
                borderRadius: "4px",
                minHeight: "200px",
              }}
            >
              <MarkdownEditor.Toolbar>
                <MarkdownEditor.DefaultToolbarButtons />
              </MarkdownEditor.Toolbar>
            </MarkdownEditor>
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Flex gap={8}>
              <Button
                onClick={onCancel}
                style={{
                  borderRadius: "4px",
                  fontSize: "12px",
                  height: "32px",
                  padding: "0 16px",
                }}
              >
                Batal
              </Button>
              <Button
                onClick={handleFinish}
                disabled={isLoadingUpdate}
                type="primary"
                loading={isLoadingUpdate}
                style={{
                  backgroundColor: "#FF4500",
                  borderColor: "#FF4500",
                  borderRadius: "4px",
                  fontSize: "12px",
                  height: "32px",
                  padding: "0 16px",
                }}
              >
                Simpan Perubahan
              </Button>
            </Flex>
          </Form.Item>
        </Form>
      </div>
    );
  }

  // Render full page untuk create mode
  return (
    <div
      style={{
        backgroundColor: "#DAE0E6",
        minHeight: "100vh",
        padding: "20px 0",
      }}
    >
      <Row justify="center">
        <Col xs={24} sm={22} md={20} lg={18} xl={16}>
          {/* Header */}
          <div style={{ marginBottom: "20px", padding: "0 4px" }}>
            <Title
              level={2}
              style={{
                margin: 0,
                color: "#1A1A1B",
                fontSize: "28px",
                fontWeight: 400,
              }}
            >
              ASN Connect
            </Title>
            <Text
              style={{
                fontSize: "14px",
                color: "#787C7E",
                marginTop: "4px",
                display: "block",
              }}
            >
              Buat diskusi baru
            </Text>
          </div>

          {/* Form Card */}
          <Card
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #EDEFF1",
              borderRadius: "4px",
              marginBottom: "16px",
            }}
            bodyStyle={{ padding: "24px" }}
          >
            {/* Header Card */}
            <div
              style={{
                marginBottom: "24px",
                paddingBottom: "16px",
                borderBottom: "1px solid #EDEFF1",
              }}
            >
              <Title
                level={4}
                style={{
                  margin: 0,
                  color: "#1A1A1B",
                  fontSize: "18px",
                  fontWeight: 600,
                }}
              >
                Buat Diskusi Baru
              </Title>
              <Text
                style={{
                  fontSize: "14px",
                  color: "#787C7E",
                  marginTop: "4px",
                  display: "block",
                }}
              >
                Bagikan ide, pertanyaan, atau topik menarik dengan komunitas ASN
              </Text>
            </div>

            <Form form={form} layout="vertical">
              <Form.Item
                label={
                  <Text
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#1A1A1B",
                    }}
                  >
                    Judul Diskusi
                  </Text>
                }
                name="title"
                required
                rules={[
                  { required: true, message: "Judul tidak boleh kosong" },
                ]}
                style={{ marginBottom: "20px" }}
              >
                <Input
                  placeholder="Tulis judul yang menarik dan deskriptif"
                  style={{
                    borderRadius: "4px",
                    border: "1px solid #EDEFF1",
                    fontSize: "16px",
                    padding: "12px 16px",
                    minHeight: "44px",
                  }}
                />
              </Form.Item>

              <Form.Item
                label={
                  <Text
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#1A1A1B",
                    }}
                  >
                    Konten Diskusi
                  </Text>
                }
                name="content"
                required
                rules={[
                  { required: true, message: "Konten tidak boleh kosong" },
                ]}
                style={{ marginBottom: "24px" }}
              >
                <div
                  style={{
                    border: "1px solid #EDEFF1",
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
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
                    style={{
                      minHeight: "300px",
                    }}
                  >
                    <MarkdownEditor.Toolbar>
                      <MarkdownEditor.DefaultToolbarButtons />
                    </MarkdownEditor.Toolbar>
                  </MarkdownEditor>
                </div>
                <Text
                  style={{
                    fontSize: "12px",
                    color: "#787C7E",
                    marginTop: "8px",
                    display: "block",
                  }}
                >
                  Gunakan Markdown untuk formatting. Anda dapat upload gambar
                  (PNG, JPG, JPEG, GIF).
                </Text>
              </Form.Item>

              {/* Action Buttons */}
              <div
                style={{
                  paddingTop: "16px",
                  borderTop: "1px solid #EDEFF1",
                }}
              >
                <Flex justify="space-between" align="center">
                  <Text
                    style={{
                      fontSize: "12px",
                      color: "#787C7E",
                    }}
                  >
                    Pastikan diskusi Anda mematuhi aturan komunitas
                  </Text>

                  <Flex gap={12}>
                    <Button
                      onClick={() => router.back()}
                      style={{
                        borderRadius: "4px",
                        fontSize: "14px",
                        height: "40px",
                        padding: "0 20px",
                        border: "1px solid #EDEFF1",
                        color: "#787C7E",
                      }}
                    >
                      Batal
                    </Button>
                    <Button
                      onClick={handleFinish}
                      disabled={isLoadingCreate}
                      type="primary"
                      loading={isLoadingCreate}
                      style={{
                        backgroundColor: "#FF4500",
                        borderColor: "#FF4500",
                        borderRadius: "4px",
                        fontSize: "14px",
                        fontWeight: 600,
                        height: "40px",
                        padding: "0 24px",
                      }}
                    >
                      Publikasikan Diskusi
                    </Button>
                  </Flex>
                </Flex>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default CreateDiscussion;

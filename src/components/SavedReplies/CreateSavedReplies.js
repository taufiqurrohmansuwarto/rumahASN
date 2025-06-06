import {
  getSavedRepliesById,
  createSavedReplies,
  updateSavedReplies,
} from "@/services/index";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  Form,
  Input,
  message,
  Button,
  Row,
  Col,
  Typography,
  theme,
} from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import { useEffect } from "react";

const { Title } = Typography;
const { useToken } = theme;

function CreateSavedReplies() {
  const { token } = useToken();
  const router = useRouter();
  const id = router?.query?.id;
  const queryClient = useQueryClient();

  const [form] = Form.useForm();

  const { data } = useQuery(
    ["saved-replies", id],
    () => getSavedRepliesById(id),
    {
      enabled: !!id,
      refetchOnWindowFocus: false,
    }
  );

  const { mutate: create, isLoading: isLoadingCreate } = useMutation(
    (data) => createSavedReplies(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("saved-replies");
        message.success("Template berhasil dibuat");
        router.push(`/settings/profile/saved-replies`);
      },
      onError: () => {
        message.error("Gagal membuat template");
      },
    }
  );

  const { mutate: update, isLoading: isLoadingUpdate } = useMutation(
    (data) => updateSavedReplies(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("saved-replies");
        message.success("Template berhasil diperbarui");
        router.push(`/settings/profile/saved-replies`);
      },
      onError: () => {
        message.error("Gagal memperbarui template");
      },
    }
  );

  const handleSubmit = async (values) => {
    const payload = {
      name: values?.name,
      content: values?.content,
    };

    if (id) {
      update({ ...payload, id });
    } else {
      create(payload);
    }
  };

  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        name: data?.name,
        content: data?.content,
      });
    }
  }, [data, form]);

  return (
    <Row gutter={[24, 24]}>
      <Col span={24}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item
                label="Nama Template"
                name="name"
                rules={[
                  {
                    required: true,
                    message: "Nama template harus diisi",
                  },
                ]}
              >
                <Input
                  placeholder="Masukkan nama template..."
                  style={{
                    borderRadius: "8px",
                  }}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Isi Template"
                name="content"
                rules={[
                  {
                    required: true,
                    message: "Isi template harus diisi",
                  },
                ]}
              >
                <Input.TextArea
                  rows={8}
                  placeholder="Masukkan isi template balasan..."
                  style={{
                    borderRadius: "8px",
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ marginTop: "24px", textAlign: "right" }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              icon={<SaveOutlined />}
              loading={isLoadingCreate || isLoadingUpdate}
              disabled={isLoadingCreate || isLoadingUpdate}
              style={{
                borderRadius: "8px",
                fontWeight: 500,
              }}
            >
              {id ? "Perbarui Template" : "Simpan Template"}
            </Button>
          </div>
        </Form>
      </Col>
    </Row>
  );
}

export default CreateSavedReplies;

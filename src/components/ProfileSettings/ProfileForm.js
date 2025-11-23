import { updateOwnProfile } from "@/services/index";
import { Avatar, Flex, Paper, Stack, Text, Title } from "@mantine/core";
import {
  IconBriefcase,
  IconBuilding,
  IconCamera,
  IconFileText,
  IconId,
  IconUser,
} from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Col, Form, Input, message, Row, Upload } from "antd";

const ProfileForm = ({ data, user }) => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  const { mutate, isLoading } = useMutation(
    (values) => updateOwnProfile(values),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("profile");
        message.success("Berhasil memperbarui profil");
      },
      onError: (error) => {
        message.error(
          error?.response?.data?.message || "Gagal memperbarui profil"
        );
      },
    }
  );

  const handleFinish = async () => {
    try {
      const result = await form.validateFields();
      if (!isLoading) {
        mutate(result);
      }
    } catch (error) {
      console.error("Validation error:", error);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const names = name.split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  };

  return (
    <Stack spacing={8}>
      {/* Avatar Section - Ultra Compact */}
      <Paper p="sm" radius="md" withBorder>
        <Flex gap="sm" align="center">
          <div style={{ position: "relative" }}>
            <Avatar
              size={56}
              radius="xl"
              src={data?.image}
              color="orange"
              styles={{
                root: {
                  fontSize: "18px",
                  fontWeight: 600,
                },
              }}
            >
              {!data?.image && data?.username ? (
                getInitials(data.username)
              ) : (
                <IconUser size={20} />
              )}
            </Avatar>

            <Upload
              name="avatar"
              showUploadList={false}
              beforeUpload={() => false}
            >
              <Button
                shape="circle"
                size="small"
                icon={<IconCamera size={12} />}
                type="primary"
                style={{
                  position: "absolute",
                  bottom: -2,
                  right: -2,
                  minWidth: "22px",
                  width: "22px",
                  height: "22px",
                  padding: 0,
                }}
              />
            </Upload>
          </div>

          <Stack spacing={1}>
            <Title order={5} size="13px" fw={600}>
              {data?.username || "Nama Pengguna"}
            </Title>
            <Text size="12px" c="dimmed">
              {data?.info?.jabatan?.jabatan || "Jabatan tidak tersedia"}
            </Text>
            <Text size="11px" c="dimmed">
              {data?.employee_number || "NIP tidak tersedia"}
            </Text>
          </Stack>
        </Flex>
      </Paper>

      {/* Form Section - Ultra Compact */}
      <Paper p="sm" radius="md" withBorder>
        <Form
          onFinish={handleFinish}
          form={form}
          layout="vertical"
          size="small"
          initialValues={{
            ...data,
            jabatan: data?.info?.jabatan?.jabatan,
            perangkat_daerah: data?.info?.perangkat_daerah?.detail,
          }}
        >
          <Stack spacing={8}>
            {/* Informasi Dasar */}
            <div>
              <Flex align="center" gap={4} mb={6}>
                <IconUser size={14} style={{ color: "#6B7280" }} />
                <Text size="12px" fw={600}>
                  Informasi Dasar
                </Text>
              </Flex>

              <Row gutter={[6, 4]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Nama Lengkap"
                    name="username"
                    style={{ marginBottom: 4 }}
                  >
                    <Input
                      prefix={<IconUser size={12} style={{ color: "#999" }} />}
                      readOnly
                      disabled
                      style={{
                        backgroundColor: "#F9FAFB",
                        fontSize: "12px",
                      }}
                    />
                  </Form.Item>
                </Col>

                {user?.group !== "GOOGLE" && (
                  <>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Nomor Pegawai"
                        name="employee_number"
                        style={{ marginBottom: 4 }}
                      >
                        <Input
                          prefix={
                            <IconId size={12} style={{ color: "#999" }} />
                          }
                          readOnly
                          disabled
                          style={{
                            backgroundColor: "#F9FAFB",
                            fontSize: "12px",
                          }}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Jabatan"
                        name="jabatan"
                        style={{ marginBottom: 4 }}
                      >
                        <Input
                          prefix={
                            <IconBriefcase
                              size={12}
                              style={{ color: "#999" }}
                            />
                          }
                          readOnly
                          disabled
                          style={{
                            backgroundColor: "#F9FAFB",
                            fontSize: "12px",
                          }}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Perangkat Daerah"
                        name="perangkat_daerah"
                        style={{ marginBottom: 4 }}
                      >
                        <Input.TextArea
                          readOnly
                          disabled
                          rows={2}
                          style={{
                            backgroundColor: "#F9FAFB",
                            fontSize: "12px",
                          }}
                        />
                      </Form.Item>
                    </Col>
                  </>
                )}
              </Row>
            </div>

            {/* Tentang Saya */}
            <div>
              <Flex align="center" gap={4} mb={6}>
                <IconFileText size={14} style={{ color: "#6B7280" }} />
                <Text size="12px" fw={600}>
                  Tentang Saya
                </Text>
              </Flex>

              <Form.Item
                label="Deskripsi Pribadi"
                name="about_me"
                style={{ marginBottom: 4 }}
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Ceritakan tentang diri Anda..."
                  style={{ fontSize: "12px" }}
                />
              </Form.Item>

              <Flex justify="flex-end">
                <Button
                  loading={isLoading}
                  disabled={isLoading}
                  htmlType="submit"
                  type="primary"
                  size="small"
                >
                  Simpan
                </Button>
              </Flex>
            </div>
          </Stack>
        </Form>
      </Paper>
    </Stack>
  );
};

export default ProfileForm;

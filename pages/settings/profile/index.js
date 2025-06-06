import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import ProfileLayout from "@/components/ProfileSettings/ProfileLayout";
import { ownProfile, updateOwnProfile } from "@/services/index";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Col,
  Form,
  Grid,
  Input,
  Row,
  Skeleton,
  Space,
  Typography,
  Flex,
  theme,
  message,
} from "antd";
import {
  UserOutlined,
  IdcardOutlined,
  BankOutlined,
  HomeOutlined,
  EditOutlined,
  SaveOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useSession } from "next-auth/react";
import Head from "next/head";

const { Title, Text } = Typography;
const { useToken } = theme;

const ProfileForm = ({ data, user }) => {
  const queryClient = useQueryClient();
  const { token } = useToken();

  const { mutate, isLoading } = useMutation(
    (values) => updateOwnProfile(values),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("profile");
        message.success("Berhasil memperbarui profil");
      },
      onError: (error) => {
        message.error(error?.response?.data?.message);
      },
    }
  );

  const [form] = Form.useForm();

  const handleFinish = async () => {
    const result = await form.validateFields();
    if (!isLoading) {
      mutate(result);
    }
  };

  return (
    <>
      <Form
        onFinish={handleFinish}
        form={form}
        layout="vertical"
        initialValues={{
          ...data,
          jabatan: data?.info?.jabatan?.jabatan,
          perangkat_daerah: data?.info?.perangkat_daerah?.detail,
        }}
      >
        <Row gutter={[24, 24]}>
          {/* Informasi Dasar */}
          <Col span={24}>
            <Title level={4} style={{ margin: "0 0 24px 0", color: "#1F2937" }}>
              Informasi Dasar
            </Title>

            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item label="Nama Lengkap" name="username">
                  <Input
                    readOnly
                    disabled
                    style={{
                      backgroundColor: "#F9FAFB",
                      borderColor: "#E5E7EB",
                    }}
                  />
                </Form.Item>
              </Col>

              {user?.group !== "GOOGLE" && (
                <>
                  <Col xs={24} md={12}>
                    <Form.Item label="Nomor Pegawai" name="employee_number">
                      <Input
                        readOnly
                        disabled
                        style={{
                          backgroundColor: "#F9FAFB",
                          borderColor: "#E5E7EB",
                        }}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item label="Jabatan" name="jabatan">
                      <Input
                        readOnly
                        disabled
                        style={{
                          backgroundColor: "#F9FAFB",
                          borderColor: "#E5E7EB",
                        }}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item label="Perangkat Daerah" name="perangkat_daerah">
                      <Input.TextArea
                        readOnly
                        disabled
                        rows={3}
                        style={{
                          backgroundColor: "#F9FAFB",
                          borderColor: "#E5E7EB",
                        }}
                      />
                    </Form.Item>
                  </Col>
                </>
              )}
            </Row>
          </Col>

          {/* Tentang Saya */}
          <Col span={24}>
            <Title level={4} style={{ margin: "0 0 24px 0", color: "#1F2937" }}>
              Tentang Saya
            </Title>

            <Form.Item label="Deskripsi Pribadi" name="about_me">
              <Input.TextArea
                rows={5}
                placeholder="Ceritakan tentang diri Anda..."
                style={{
                  borderRadius: "8px",
                }}
              />
            </Form.Item>

            <div style={{ marginTop: "24px", textAlign: "right" }}>
              <Button
                loading={isLoading}
                disabled={isLoading}
                htmlType="submit"
                type="primary"
                size="large"
                style={{
                  borderRadius: "8px",
                  fontWeight: 500,
                }}
              >
                Simpan Perubahan
              </Button>
            </div>
          </Col>
        </Row>
      </Form>
    </>
  );
};

function Profile() {
  const { data: dataUser } = useSession();

  const { data, isLoading } = useQuery(["profile"], () => ownProfile(), {});
  const breakPoint = Grid.useBreakpoint();

  return (
    <>
      <Head>
        <title>Rumah ASN - Pengaturan - Profil</title>
      </Head>

      <Row>
        <Col md={24} xs={24}>
          <Skeleton loading={isLoading}>
            <ProfileForm user={dataUser?.user} data={data} />
          </Skeleton>
        </Col>
      </Row>
    </>
  );
}

Profile.getLayout = (page) => {
  return (
    <Layout>
      <ProfileLayout>{page}</ProfileLayout>
    </Layout>
  );
};

Profile.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Profile;

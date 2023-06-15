import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { ownProfile, updateOwnProfile } from "@/services/index";
import { Stack } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
  Breadcrumb,
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  message,
} from "antd";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const ProfileForm = ({ data, user }) => {
  const queryClient = useQueryClient();

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
      <Form.Item label="Nama" name="username">
        <Input readOnly disabled />
      </Form.Item>
      {user?.group !== "GOOGLE" && (
        <>
          <Form.Item label="Nomer Pegawai" name="employee_number">
            <Input readOnly disabled />
          </Form.Item>
          <Form.Item label="Jabatan" name="jabatan">
            <Input readOnly disabled />
          </Form.Item>
          <Form.Item label="Perangkat Daerah" name="perangkat_daerah">
            <Input readOnly disabled />
          </Form.Item>
        </>
      )}
      <Form.Item label="Tentang Saya" name="about_me">
        <Input.TextArea rows={5} />
      </Form.Item>

      <Form.Item>
        <Button
          loading={isLoading}
          disabled={isLoading}
          htmlType="submit"
          type="primary"
        >
          Ubah
        </Button>
      </Form.Item>
    </Form>
  );
};

function Profile() {
  const router = useRouter();

  const { data: dataUser, status } = useSession();

  const handleBack = () => {
    router.back();
  };

  const { data, isLoading } = useQuery(["profile"], () => ownProfile(), {});

  return (
    <>
      <Head>
        <title>Rumah ASN - Pengaturan - Profil</title>
      </Head>
      <PageContainer
        onBack={handleBack}
        loading={isLoading}
        title="Pengaturan"
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/feeds">
                <a>Beranda</a>
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Pengaturan Profil</Breadcrumb.Item>
          </Breadcrumb>
        )}
        subTitle="Profil"
      >
        <Card loading={isLoading || status === "loading"}>
          <Row>
            <Col md={12} xs={24}>
              <Stack>
                <Avatar size={100} src={data?.image} />
                <ProfileForm user={dataUser?.user} data={data} />
              </Stack>
            </Col>
          </Row>
        </Card>
      </PageContainer>
    </>
  );
}

Profile.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

Profile.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Profile;

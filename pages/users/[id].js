import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { getProfile } from "@/services/index";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import {
  Avatar,
  Breadcrumb,
  Button,
  Card,
  Descriptions,
  Divider,
  Image,
  List,
  Rate,
  Space,
  Typography,
} from "antd";
import Link from "next/link";
import Head from "next/head";
import { stringToNumber } from "@/utils/client-utils";
import { MailOutlined } from "@ant-design/icons";

const DetailInformation = ({ user }) => {
  if (user?.group !== "GOOGLE") {
    return (
      <div>
        {/* {JSON.stringify(user?.rating)} */}
        <Image height={100} src={user?.image} alt="User Photo" />
        <Descriptions>
          <Descriptions.Item label="Nama">{user?.username}</Descriptions.Item>
          {user?.employee_number && (
            <Descriptions.Item label="NIP/NIPTT">
              {user?.employee_number}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Tentang">
            {user?.about_me}
          </Descriptions.Item>
          <Descriptions.Item label="Aplikasi">{user?.group}</Descriptions.Item>
          <Descriptions.Item label="Jabatan">tunggu</Descriptions.Item>
          <Descriptions.Item label="Perangkat Daerah">Tunggu</Descriptions.Item>
        </Descriptions>
        <Button icon={<MailOutlined />} type="primary">
          Kirim Pesan
        </Button>
        {(user?.current_role === "admin" || user?.current_role === "agent") && (
          <>
            <Divider />
            <Descriptions
              layout="horizontal"
              title="Informasi Pengerjaan Tugas"
            >
              <Descriptions.Item label="Tiket Diampu">
                {user?.tickets?.[0]?.total_ticket}
              </Descriptions.Item>
              <Descriptions.Item label="Tiket Dikerjakan">
                {user?.tickets?.[0]?.tiket_dikerjakan}
              </Descriptions.Item>
              <Descriptions.Item label="Tiket Diselesaikan">
                {user?.tickets?.[0]?.tiket_diselesaikan}
              </Descriptions.Item>
              <Descriptions.Item label="Tiket Diajukan">
                {user?.tickets?.[0]?.tiket_diajukan}
              </Descriptions.Item>
              <Descriptions.Item label="Rating">
                <Rate
                  disabled
                  value={stringToNumber(user?.tickets?.[0]?.avg_rating)}
                />
                ({user?.tickets?.[0]?.tiket_dinilai})
              </Descriptions.Item>
            </Descriptions>
            <Divider />
            <List
              rowKey={(row) => row?.id}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Link href={`/users/${item?.customer?.custom_id}`}>
                        <Typography.Link>
                          {item?.customer?.username}
                        </Typography.Link>
                      </Link>
                    }
                    avatar={
                      <Link href={`/users/${item?.customer?.custom_id}`}>
                        <Avatar
                          style={{ cursor: "pointer" }}
                          src={item?.customer?.image}
                        />
                      </Link>
                    }
                    description={
                      <>
                        <Space>
                          {item?.requester_comment}
                          <Rate disabled value={stringToNumber(item?.stars)} />
                        </Space>
                      </>
                    }
                  />
                </List.Item>
              )}
              dataSource={user?.rating}
            />
          </>
        )}
      </div>
    );
  } else {
    return (
      <>
        <Image height={100} src={user?.image} alt="User Photo" />
        <Descriptions title="Informasi Akun">
          <Descriptions.Item label="Nama">{user?.username}</Descriptions.Item>
          <Descriptions.Item label="Tentang">
            {user?.about_me}
          </Descriptions.Item>
          <Descriptions.Item label="Aplikasi">{user?.group}</Descriptions.Item>
        </Descriptions>
      </>
    );
  }
};

const Users = () => {
  const router = useRouter();

  const { id } = router.query;

  const { data, isLoading } = useQuery(
    ["profile", id],
    () => getProfile(id),
    {}
  );

  const handleBack = () => {
    router.back();
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - Detail User</title>
      </Head>
      <PageContainer
        loading={isLoading}
        onBack={handleBack}
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/feeds">
                <a>Beranda</a>
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Detail User</Breadcrumb.Item>
          </Breadcrumb>
        )}
        title="User"
        subTitle="Detail User"
      >
        <Card>
          <DetailInformation user={data} />
        </Card>
      </PageContainer>
    </>
  );
};

Users.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

Users.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Users;

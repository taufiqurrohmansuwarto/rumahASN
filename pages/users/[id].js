import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { getProfile } from "@/services/index";
import { stringToNumber } from "@/utils/client-utils";
import { Comment } from "@ant-design/compatible";
import { IconMail } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import {
  Breadcrumb,
  Button,
  Col,
  Descriptions,
  Divider,
  Grid,
  Image,
  List,
  Rate,
  Row,
  Space,
} from "antd";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import UserProfile from "@/components/Profile/UserProfile";
import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
import UserTickets from "@/components/Ticket/UserTickets";
dayjs.locale("id");
dayjs.extend(relativeTime);

const DetailInformation = ({ user }) => {
  const router = useRouter();
  const { data } = useSession();

  const gotoDetailPegawai = () => {
    router.push(`/apps-managements/integrasi/siasn/${user?.employee_number}`);
  };

  // Navigate to compose page with recipient pre-filled
  const handleSendMessage = () => {
    const params = new URLSearchParams({
      to: user?.custom_id,
      toName: user?.username,
    });
    router.push(`/mails/compose?${params.toString()}`);
  };

  if (user?.group !== "GOOGLE") {
    return (
      <div>
        <Image height={100} src={user?.image} alt="User Photo" />
        <Descriptions layout="vertical">
          <Descriptions.Item label="Nama">{user?.username}</Descriptions.Item>
          <Descriptions.Item label="Jumlah Pertanyaan">
            {user?.total_post}
          </Descriptions.Item>
          {user?.employee_number && (
            <Descriptions.Item label="NIP/NIPTT">
              {user?.employee_number}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Tentang">
            {user?.about_me}
          </Descriptions.Item>
          <Descriptions.Item label="Aplikasi">{user?.group}</Descriptions.Item>
          <Descriptions.Item label="Jabatan">
            {user?.info?.jabatan?.jabatan}
          </Descriptions.Item>
          <Descriptions.Item label="Perangkat Daerah">
            {user?.info?.perangkat_daerah?.detail}
          </Descriptions.Item>
        </Descriptions>
        <Space>
          {user?.custom_id !== data?.user?.id && (
            <Button
              onClick={handleSendMessage}
              icon={<IconMail size={16} />}
              type="primary"
            >
              Kirim Pesan
            </Button>
          )}
          {(data?.user?.current_role === "admin" ||
            (data?.user?.current_role === "agent" &&
              user?.group === "MASTER")) && (
            <Button onClick={gotoDetailPegawai} type="primary">
              Data Pegawai
            </Button>
          )}
        </Space>
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
            <Row>
              <Col md={10}>
                <List
                  rowKey={(row) => row?.id}
                  renderItem={(item) => (
                    <>
                      <Comment
                        content={
                          <Space direction="vertical">
                            <Rate
                              style={{
                                fontSize: 16,
                              }}
                              disabled
                              value={stringToNumber(item?.stars)}
                            />
                            {item?.requester_comment}
                          </Space>
                        }
                        author={item?.customer?.username}
                        avatar={item?.customer?.image}
                        datetime={dayjs(item?.created_at).format("DD-MM-YYYY")}
                      />
                    </>
                  )}
                  dataSource={user?.rating}
                />
              </Col>
            </Row>
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
  const { data: currentUser, status: currentUserStatus } = useSession();

  const { id } = router.query;

  const { data, isLoading } = useQuery(
    ["profile", id],
    () => getProfile(id),
    {}
  );

  const handleBack = () => {
    router.back();
  };

  const breakPoint = Grid.useBreakpoint();

  return (
    <>
      <Head>
        <title>{data?.username} </title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        loading={
          isLoading || status === "loading" || currentUserStatus === "loading"
        }
        onBack={handleBack}
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/feeds">Beranda</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Detail User</Breadcrumb.Item>
          </Breadcrumb>
        )}
        title="Detail Informasi Pengguna"
      >
        <Row gutter={[16, 16]}>
          <Col md={24} xs={24}>
            <UserProfile
              user={data}
              isAdmin={currentUser?.user?.current_role === "admin"}
              isPegawaiBKD={
                data?.current_role === "agent" || data?.current_role === "admin"
              }
            />
          </Col>
          <Col md={24} xs={24}>
            {currentUser?.user?.current_role === "admin" && <UserTickets />}
          </Col>
        </Row>
        {/* <Tabs defaultActiveKey="1" type="card">
            <Tabs.TabPane tab="Informasi" key="1">
              <UserProfile />
            </Tabs.TabPane>
            <>
              {currentUser?.user?.current_role === "admin" && (
                <Tabs.TabPane tab="Daftar Pertanyaan" key="3">
                  <UserTickets />
                </Tabs.TabPane>
              )}
            </>
          </Tabs> */}
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

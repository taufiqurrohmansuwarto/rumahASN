import Layout from "@/components/Layout";
import { renderMarkdown, uploadFile } from "@/utils/client-utils";
import PageContainer from "@/components/PageContainer";
import { getProfile } from "@/services/index";
import { MarkdownEditor } from "@primer/react/drafts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import {
  Avatar,
  Breadcrumb,
  Button,
  Card,
  Descriptions,
  Divider,
  Image,
  Input,
  List,
  Modal,
  Rate,
  Space,
  Tabs,
  Typography,
} from "antd";
import Link from "next/link";
import Head from "next/head";
import { stringToNumber } from "@/utils/client-utils";
import { MailOutlined } from "@ant-design/icons";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Stack } from "@mantine/core";
import SiasnTab from "@/components/PemutakhiranData/Admin/SiasnTab";

const CreateModal = ({ open, onCancel, receiver }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState();
  const [message, setMessage] = useState();

  const { mutate: sendMessgae, isLoading } = useMutation();

  const handleSendMessage = () => {
    if (!title || !message) return message.error("Judul dan pesan harus diisi");
    else {
    }
  };

  return (
    <Modal
      centered
      onOk={handleSendMessage}
      width={600}
      title={`Kirim Pesan ke ${receiver?.username}`}
      open={open}
      onCancel={onCancel}
    >
      <Stack>
        <Input
          value={title}
          placeholder="Judul"
          onChange={(e) => setTitle(e?.target?.value)}
        />
        <MarkdownEditor
          value={message}
          acceptedFileTypes={[
            "image/*",
            // word, excel, txt, pdf
            ".doc",
            ".docx",
            ".xls",
            ".xlsx",
            ".txt",
            ".pdf",
          ]}
          onChange={setMessage}
          placeholder="Pesan"
          onRenderPreview={renderMarkdown}
          onUploadFile={uploadFile}
          mentionSuggestions={null}
        />
      </Stack>
    </Modal>
  );
};

const DetailInformation = ({ user }) => {
  const { data, status } = useSession();

  const [open, setOpen] = useState();
  const handleCancel = () => setOpen(false);
  const handleOpen = () => setOpen(true);

  if (user?.group !== "GOOGLE") {
    return (
      <div>
        <CreateModal receiver={user} open={open} onCancel={handleCancel} />
        <Image height={100} src={user?.image} alt="User Photo" />
        <Descriptions>
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
        {user?.custom_id !== data?.user?.id && (
          <Button onClick={handleOpen} icon={<MailOutlined />} type="primary">
            Kirim Pesan
          </Button>
        )}
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

  return (
    <>
      <Head>
        <title>{data?.username} </title>
      </Head>
      <PageContainer
        loading={
          isLoading || status === "loading" || currentUserStatus === "loading"
        }
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
          <Tabs defaultActiveKey="1">
            <Tabs.TabPane tab="Informasi" key="1">
              <DetailInformation user={data} />
            </Tabs.TabPane>
            {currentUser?.user?.current_role === "admin" && (
              <Tabs.TabPane tab="Peremajaan Data" key="2">
                <SiasnTab nip={data?.employee_number} />
              </Tabs.TabPane>
            )}
          </Tabs>
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

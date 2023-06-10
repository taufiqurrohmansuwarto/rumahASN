import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { getListMeetings } from "@/services/index";
import { AudioOutlined } from "@ant-design/icons";
import { Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Alert, Button, Table } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

const meetingsType = [
  { type: 1, name: "Instans Meeting" },
  {
    type: 2,
    name: "Scheduled Meeting",
  },
  {
    type: 3,
    name: "Recurring Meeting with no fixed time",
  },
  {
    type: 8,
    name: "Recurring Meeting with fixed time",
  },
];

const WebinarLive = () => {
  const router = useRouter();

  const { data, isLoading } = useQuery(["meetings"], () => getListMeetings(), {
    refetchOnWindowFocus: false,
  });

  const gotoRouter = (meetingId) => {
    router.push(`/webinars/live/${meetingId}/meeting`);
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "topic",
      key: "topic",
    },
    {
      title: "Tipe",
      dataIndex: "type",
      render: (_, record) => {
        const currentType = meetingsType.find(
          (item) => parseInt(item.type) === parseInt(record.type)
        );
        return currentType?.name;
      },
    },
    {
      title: "Durasi",
      dataIndex: "duration",
      key: "duration",
    },
    {
      title: "Waktu Mulai",
      dataIndex: "start_time",
      render: (_, record) => {
        return new Date(record.start_time).toLocaleString();
      },
    },
    {
      title: "Dibuat pada",
      dataIndex: "created_at",
      render: (_, record) => {
        return new Date(record.created_at).toLocaleString();
      },
    },
    {
      title: "Aksi",
      dataIndex: "join",
      render: (_, record) => {
        return (
          <Button
            onClick={() => gotoRouter(record?.id)}
            icon={<AudioOutlined />}
          >
            Join
          </Button>
        );
      },
    },
  ];

  return (
    <>
      <Head>
        <title>Webinar Live</title>
      </Head>
      <PageContainer title="Webinar Rumah ASN" subTitle="Live Meeting">
        <Stack>
          <Alert
            type="error"
            description="Fitur dalam pengembangan!!"
            showIcon
          />
          <Table
            columns={columns}
            rowKey={(row) => row?.uuid}
            loading={isLoading}
            dataSource={data?.meetings}
          />
        </Stack>
      </PageContainer>
    </>
  );
};

WebinarLive.Auth = {
  action: "manage",
  subject: "tickets",
};

WebinarLive.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

export default WebinarLive;

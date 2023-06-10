import PageContainer from "@/components/PageContainer";
import { adminDeleteMeetings, adminListMeetings } from "@/services/index";
import { meetingType } from "@/utils/client-utils";
import { AudioOutlined } from "@ant-design/icons";
import { Stack } from "@mantine/core";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Button, Table, Space, Alert } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

const { default: Layout } = require("@/components/Layout");

const AdminWebinar = () => {
  const router = useRouter();

  const queryClient = useQueryClient();

  const gotoCreateWebinar = () => {
    router.push("/apps-managements/webinars/create");
  };

  const startMeeting = (id) => {
    router.push(`/apps-managements/webinars/${id}/start`);
  };

  const { data: meetings, isLoading: isLoadingMeetings } = useQuery(
    ["admin-meetings"],
    () => adminListMeetings(),
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  const { mutate: removeMeeting, isLoading: isLoadingRemoveMeeting } =
    useMutation((id) => adminDeleteMeetings(id), {
      onSuccess: () => {
        queryClient.invalidateQueries("admin-meetings");
      },
      onError: (error) => {
        console.log(error);
      },
    });

  const columns = [
    {
      title: "Topic",
      key: "topic",
      dataIndex: "topic",
    },
    {
      title: "Meeting ID",
      key: "id",
      dataIndex: "id",
    },
    {
      title: "Agenda",
      key: "agenda",
      dataIndex: "agenda",
    },
    {
      title: "Type",
      key: "type",
      render: (_, record) => {
        return meetingType.find((item) => item.value === record?.type)?.label;
      },
    },
    {
      title: "Start Time",
      key: "start_time",
      render: (_, record) => {
        return new Date(record?.start_time).toLocaleString();
      },
    },
    {
      title: "Duration",
      key: "duration",
      dataIndex: "duration",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => {
        return (
          <Space>
            <Button
              icon={<AudioOutlined />}
              onClick={() => startMeeting(record?.id)}
            >
              Start
            </Button>
            <Button
              onClick={() => {
                removeMeeting(record.id);
              }}
            >
              Delete
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <Head>
        <title>Rumah ASN - Admin Webinar</title>
      </Head>
      <PageContainer
        title="Admin Webinar"
        subTitle="Pembuatan Webinar untuk peserta"
      >
        <Stack>
          <Alert
            type="error"
            description="Fitur dalam pengembangan!!"
            showIcon
          />
          <Table
            title={() => (
              <Button onClick={gotoCreateWebinar}>Buat Webinar</Button>
            )}
            pagination={{
              total: meetings?.total_records,
              pageSize: 30,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
            }}
            loading={isLoadingMeetings || isLoadingRemoveMeeting}
            columns={columns}
            dataSource={meetings?.meetings}
          />
        </Stack>
      </PageContainer>
    </>
  );
};

AdminWebinar.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

AdminWebinar.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default AdminWebinar;

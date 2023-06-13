import PageContainer from "@/components/PageContainer";
import { adminDeleteMeetings, adminListMeetings } from "@/services/index";
import { meetingType } from "@/utils/client-utils";
import { AudioOutlined } from "@ant-design/icons";
import { Stack } from "@mantine/core";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Button, Table, Space, Alert, Select } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";

const { default: Layout } = require("@/components/Layout");

const filter = [
  "scheduled",
  "live",
  "upcoming",
  "upcoming_meetings",
  "previous_meetings",
];

const AdminWebinar = () => {
  const router = useRouter();

  const [filterType, setFilterType] = useState({
    type: router.query.type || "scheduled",
  });

  const queryClient = useQueryClient();

  const gotoCreateWebinar = () => {
    router.push("/apps-managements/webinars/create");
  };

  const handleChange = (value) => {
    router.push({
      pathname: "/apps-managements/webinars",
      query: { type: value },
    });
    setFilterType({ type: value });
  };

  const startMeeting = (id) => {
    router.push(`/apps-managements/webinars/${id}/start`);
  };

  const {
    data: meetings,
    isFetching,
    isLoading,
    refetch,
  } = useQuery(
    ["admin-meetings", filterType],
    () => adminListMeetings(filterType),
    {
      keepPreviousData: true,
      enabled: !!filterType,
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
          <Select onChange={handleChange} defaultValue={filterType.type}>
            {filter.map((item) => (
              <Select.Option key={item} value={item}>
                {item}
              </Select.Option>
            ))}
          </Select>

          <Table
            title={() => (
              <Button onClick={gotoCreateWebinar}>Buat Webinar</Button>
            )}
            rowKey={(row) => row?.id}
            pagination={{
              total: meetings?.total_records,
              pageSize: 30,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
            }}
            loading={isFetching || isLoadingRemoveMeeting}
            columns={columns}
            dataSource={meetings?.meetings}
          />
        </Stack>
      </PageContainer>
    </>
  );
};

AdminWebinar.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

AdminWebinar.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default AdminWebinar;

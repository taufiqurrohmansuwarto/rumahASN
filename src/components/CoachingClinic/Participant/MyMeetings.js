import {
  cancelRequestMeeting,
  meetingsParticipant,
} from "@/services/coaching-clinics.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Divider, Popconfirm, Space, Table, Tag, message } from "antd";
import { useRouter } from "next/router";
import React from "react";
import moment from "moment";
import { Stack } from "@mantine/core";
import { setColorStatusCoachingClinic } from "@/utils/client-utils";
import FilterParticipantMeetings from "./FilterParticipantMeetings";
import Link from "next/link";

function MyMeetings() {
  const router = useRouter();

  const query = router?.query;

  const { data, isLoading } = useQuery(
    ["myMeetings", query],
    () => meetingsParticipant(query),
    {
      enabled: !!query,
      keepPreviousData: true,
    }
  );

  const queryClient = useQueryClient();

  const { mutateAsync: batal, isLoading: isLoadingBatal } = useMutation(
    (data) => cancelRequestMeeting(data),
    {
      onSuccess: () => {
        message.success("Berhasil membatalkan coaching clinic");
        queryClient.invalidateQueries(["myMeetings"]);
      },
      onError: (error) => {
        message.error(error?.response?.data?.message);
      },
    }
  );

  const handleBatal = async (row) => {
    await batal(row?.meeting?.id);
  };

  const gotoDetailMeetingParticipant = (row) =>
    router.push(`/coaching-clinic/${row?.id}/detail`);

  const columns = [
    {
      title: "Coaching Clinic",
      key: "coaching_clinic",
      responsive: ["xs"],
      render: (_, row) => (
        <>
          <Stack>
            <Link href={`/coaching-clinic/${row?.meeting?.id}/detail`}>
              {row?.meeting?.title}
            </Link>
            <div>{row?.meeting?.coach?.username}</div>
            <div>{row?.meeting?.status}</div>
            <div>
              {moment(row?.meeting?.start_date).format("DD MMMM YYYY")}{" "}
            </div>
            <div>
              {row?.meeting?.start_hours} - {row?.meeting?.end_hours}
            </div>
            <Space>
              <a onClick={() => gotoDetailMeetingParticipant(row)}>Detail</a>
              <Divider type="vertical" />
              <Popconfirm
                onConfirm={async () => await handleBatal(row)}
                title="Apakah anda yakin ingin membatalkan coaching clinic ini?"
              >
                <a>Batal</a>
              </Popconfirm>
            </Space>
          </Stack>
        </>
      ),
    },
    {
      title: "Judul",
      key: "title",
      render: (_, row) => (
        <Link href={`/coaching-clinic/${row?.meeting?.id}/detail`}>
          {row?.meeting?.title}
        </Link>
      ),
      responsive: ["sm"],
    },
    {
      title: "Coaching",
      key: "coaching",
      render: (_, row) => <>{row?.meeting?.coach?.username}</>,
      responsive: ["sm"],
    },
    {
      title: "Tanggal Coaching Clinic",
      key: "tanggal",
      render: (_, row) => (
        <>{moment(row?.meeting?.start_date).format("DD MMMM YYYY")}</>
      ),
      responsive: ["sm"],
    },
    {
      title: "Jam",
      key: "jam",
      render: (_, row) => (
        <>
          {row?.meeting?.start_hours} - {row?.meeting?.end_hours}
        </>
      ),
      responsive: ["sm"],
    },
    {
      title: "Status",
      key: "status",
      render: (_, row) => (
        <Tag color={setColorStatusCoachingClinic(row?.meeting?.status)}>
          {row?.meeting?.status}
        </Tag>
      ),
      responsive: ["sm"],
    },
    {
      title: "Tanggal Daftar",
      key: "tanggal_daftar",
      render: (_, row) => (
        <>{moment(row?.created_at).format("DD MMMM YYYY HH:mm:ss")}</>
      ),
    },
    {
      title: "Aksi",
      responsive: ["sm"],
      render: (_, row) => {
        return (
          <>
            <Space>
              <a onClick={() => gotoDetailMeetingParticipant(row)}>Lihat</a>
              <Divider type="vertical" />
              <Popconfirm
                onConfirm={async () => await handleBatal(row)}
                title="Apakah anda yakin ingin membatalkan coaching clinic ini?"
              >
                <a>Batal</a>
              </Popconfirm>
            </Space>
          </>
        );
      },
    },
  ];

  return (
    <>
      <FilterParticipantMeetings />
      <Table columns={columns} dataSource={data?.data} loading={isLoading} />
    </>
  );
}

export default MyMeetings;
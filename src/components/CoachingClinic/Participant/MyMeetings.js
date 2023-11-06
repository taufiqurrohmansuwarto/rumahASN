import {
  cancelRequestMeeting,
  meetingsParticipant,
} from "@/services/coaching-clinics.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
  Card,
  Col,
  Divider,
  Popconfirm,
  Row,
  Space,
  Table,
  Tag,
  Tooltip,
  message,
} from "antd";
import { useRouter } from "next/router";
import React from "react";
import moment from "moment";
import { Stack } from "@mantine/core";
import { setColorStatusCoachingClinic } from "@/utils/client-utils";
import FilterParticipantMeetings from "./FilterParticipantMeetings";
import Link from "next/link";
import { upperCase } from "lodash";

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
            <Link href={`/coaching-clinic/${row?.id}/detail`}>
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
        <Link href={`/coaching-clinic/${row?.id}/detail`}>
          {row?.meeting?.title}
        </Link>
      ),
      responsive: ["sm"],
    },
    {
      title: "Coaching",
      key: "coaching",
      render: (_, row) => (
        <Tooltip title={row?.meeting?.coach?.username}>
          <Avatar src={row?.meeting?.coach?.image} />
        </Tooltip>
      ),
      responsive: ["sm"],
    },
    {
      title: "Tanggal Coaching",
      key: "tanggal",
      render: (_, row) => (
        <Space direction="vertical">
          <div>{moment(row?.meeting?.start_date).format("DD MMMM YYYY")}</div>
          <div>
            {row?.meeting?.start_hours} - {row?.meeting?.end_hours}
          </div>
        </Space>
      ),
      responsive: ["sm"],
    },
    {
      title: "Status",
      key: "status",
      render: (_, row) => (
        <Space>
          <Tag color={setColorStatusCoachingClinic(row?.meeting?.status)}>
            {upperCase(row?.meeting?.status)}
          </Tag>
          <Tag>{upperCase(row?.is_private ? "Private" : "Public")}</Tag>
        </Space>
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
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Card>
          <FilterParticipantMeetings />
        </Card>
      </Col>
      <Col span={24}>
        <Card>
          <Table
            size="small"
            pagination={{
              position: ["bottomRight", "topRight"],
              total: data?.total,
              showTotal: (total, range) =>
                `Total ${total} data | Halaman ${range[0]} - ${range[1]}`,
            }}
            columns={columns}
            dataSource={data?.data}
            loading={isLoading}
          />
        </Card>
      </Col>
    </Row>
  );
}

export default MyMeetings;

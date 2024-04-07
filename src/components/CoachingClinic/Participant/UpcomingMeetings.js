import {
  cancelRequestMeeting,
  requestMeeting,
  upcomingMeetings,
} from "@/services/coaching-clinics.services";
import { setColorStatusCoachingClinic } from "@/utils/client-utils";
import { CloseOutlined } from "@ant-design/icons";
import { Alert, Stack } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Calendar,
  Collapse,
  Descriptions,
  Divider,
  Drawer,
  Grid,
  Modal,
  Skeleton,
  Space,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import { useRouter } from "next/router";
import { useState } from "react";

import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

const { Panel } = Collapse;

const ButtonKonsultasi = ({ item, handleBatal, gotoDetail, handleGabung }) => {
  if (item?.is_join) {
    return (
      <Space>
        <Button
          icon={<CloseOutlined />}
          danger
          onClick={() => handleBatal(item)}
        >
          Batal
        </Button>
        <Button onClick={() => gotoDetail(item)}>Lihat Detail</Button>
      </Space>
    );
  }

  if (!item?.is_join && item?.status === "upcoming") {
    return (
      <Button type="primary" onClick={() => handleGabung(item)}>
        Ikuti Coaching Clinic
      </Button>
    );
  }

  if (!item?.is_join && (item?.status === "live" || item?.status === "end")) {
    return (
      <Alert color="red">
        Kamu tidak bisa mengikuti coaching clinic ini karena statusnya{" "}
        {item?.status}
      </Alert>
    );
  }
};

const PickCoachingModal = ({ open, onCancel, onOk, row }) => {
  const router = useRouter();

  const breakpoint = Grid.useBreakpoint();

  const queryClient = useQueryClient();

  const { mutateAsync: gabung, isLoading: isLoadingGabung } = useMutation(
    (data) => requestMeeting(data),
    {
      onSuccess: () => {
        message.success("Berhasil gabung");
        queryClient.invalidateQueries(["participantModalMeeting"]);
      },
      onError: (error) => {
        message.error(error?.response?.data?.message);
      },
    }
  );

  const { mutateAsync: batal, isLoading: isLoadingBatal } = useMutation(
    (data) => cancelRequestMeeting(data),
    {
      onSuccess: () => {
        message.success("Berhasil membatalkan coaching clinic");
        queryClient.invalidateQueries(["participantModalMeeting"]);
      },
      onError: (error) => {
        message.error(error?.response?.data?.message);
      },
    }
  );

  const handleGabung = (row) => {
    Modal.confirm({
      title: "Konfirmasi",
      content: "Apakah anda yakin ingin mengikuti coaching clinic ini?",
      okText: "Ya",
      cancelText: "Tidak",
      centered: true,
      onOk: async () => {
        await gabung(row?.id);
      },
    });
  };

  const handleBatal = (row) => {
    Modal.confirm({
      title: "Batal",
      content: "Apakah anda yakin ingin membatalkan coaching clinic ini?",
      okText: "Ya",
      cancelText: "Tidak",
      centered: true,
      onOk: async () => {
        await batal(row?.id);
      },
    });
  };

  const { data, isLoading } = useQuery(
    ["participantModalMeeting", row],
    () => upcomingMeetings(row),
    {
      enabled: !!row,
      keepPreviousData: true,
    }
  );

  const gotoDetail = (row) => {
    router.push(`/coaching-clinic/${row?.detail_id}/detail`);
  };

  return (
    <Drawer
      title={`Jadwal Konsultasi Coaching Clinic`}
      open={open}
      onClose={onCancel}
      width={
        breakpoint.md ? 800 : breakpoint.sm ? 600 : breakpoint.xs ? 400 : 300
      }
    >
      <Skeleton loading={isLoading}>
        <Collapse accordion>
          {data?.map((item) => (
            <Panel
              header={
                <Space>
                  <Avatar size="small" src={item?.coach?.image} />
                  <Typography.Text>{item?.coach?.username}</Typography.Text>
                </Space>
              }
              key={item?.id}
            >
              <Space direction="vertical">
                <Descriptions
                  title="Informasi Coaching Clinic"
                  layout="vertical"
                  size="small"
                >
                  <Descriptions.Item label="Judul">
                    {item?.title}
                  </Descriptions.Item>
                  <Descriptions.Item label="Deskripsi">
                    {item?.description}
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag color={setColorStatusCoachingClinic(item?.status)}>
                      {item?.status}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Tanggal" span={3}>
                    {dayjs(item?.start_date).format("DD MMMM YYYY")}
                  </Descriptions.Item>
                  <Descriptions.Item label="Jam" span={3}>
                    {item?.start_hours} - {item?.end_hours}
                  </Descriptions.Item>
                  <Descriptions.Item label="Maksimum Peserta">
                    {item?.max_participants}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={`${item?.participants_count} Peserta Mendaftar`}
                  >
                    <Avatar.Group maxCount={6} size="small">
                      {item?.participants?.map((item) => (
                        <Tooltip
                          key={item?.id}
                          title={item?.participant?.username}
                        >
                          <Avatar src={item?.participant?.image} />
                        </Tooltip>
                      ))}
                    </Avatar.Group>
                  </Descriptions.Item>
                </Descriptions>
                <Space>
                  <ButtonKonsultasi
                    item={item}
                    handleBatal={handleBatal}
                    gotoDetail={gotoDetail}
                    handleGabung={handleGabung}
                  />
                </Space>
              </Space>
            </Panel>
          ))}
        </Collapse>
      </Skeleton>
    </Drawer>
  );
};

function UpcomingMeetings() {
  const [query, setQuery] = useState({});
  const [open, setOpen] = useState(false);
  const [row, setRow] = useState({});

  const handleOpen = (row) => {
    const month = dayjs(row).format("MM");
    const year = dayjs(row).format("YYYY");
    const day = dayjs(row).format("DD");

    setRow({
      month,
      year,
      day,
    });

    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const { data, isLoading } = useQuery(
    ["upcomingMeetings", query],
    () => upcomingMeetings(query),
    {
      enabled: !!query,
      keepPreviousData: true,
    }
  );

  const handleChange = (value) => {
    const month = dayjs(value).format("MM");
    const year = dayjs(value).format("YYYY");
    const newQuery = {
      year,
      month,
    };

    setQuery({
      ...query,
      ...newQuery,
    });
  };

  const { mutateAsync: requestJoin, isLoading: isLoadingRequestJoin } =
    useMutation((data) => requestMeeting(data), {
      onError: (error) => {
        message.error(error?.response?.data?.message);
      },
    });

  const { mutate: cancelJoin, isLoading: isLoadingCancelJoin } = useMutation(
    (data) => cancelRequestMeeting(data),
    {}
  );

  const handleRequest = (row) => {
    Modal.confirm({
      title: "Request",
      content: "Apakah anda yakin ingin request?",
      okText: "Ya",
      cancelText: "Tidak",
      centered: true,
      onOk: async () => {
        await requestJoin(row?.id);
      },
    });
  };

  const columns = [
    {
      title: "status",
      dataIndex: "status",
    },
    {
      title: "Peserta",
      dataIndex: "max_participants",
    },
    {
      title: "Start Date",
      dataIndex: "start_date",
    },
    {
      key: "aksi",
      title: "Aksi",
      render: (_, row) => {
        return (
          <>
            <a onClick={() => handleRequest(row)}>Request</a>
            <Divider type="vertical" />
          </>
        );
      },
    },
  ];

  return (
    <>
      <PickCoachingModal open={open} onCancel={handleClose} row={row} />
      <Calendar
        onPanelChange={handleChange}
        disabledDate={(value) => {
          const currentMonth = dayjs(value).format("YYYY-MM-DD");
          const findData = data?.filter(
            (item) =>
              dayjs(item?.start_date).format("YYYY-MM-DD") === currentMonth
          );
          if (findData?.length > 0) {
            return false;
          } else {
            return true;
          }
        }}
        mode="month"
        cellRender={(value) => {
          const currentMonth = dayjs(value).format("YYYY-MM-DD");
          const findData = data?.filter(
            (item) =>
              dayjs(item?.start_date).format("YYYY-MM-DD") === currentMonth
          );

          if (findData?.length > 0) {
            return (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                }}
                onClick={() => handleOpen(value)}
              >
                <Stack>
                  <Avatar.Group maxCount={3} size="small">
                    {findData?.map((item) => (
                      <Tooltip key={item?.id} title={item?.coach?.username}>
                        <Avatar src={item?.coach?.image} />
                      </Tooltip>
                    ))}
                  </Avatar.Group>
                </Stack>
              </div>
            );
          } else {
            return null;
          }
        }}
      />
    </>
  );
}

export default UpcomingMeetings;

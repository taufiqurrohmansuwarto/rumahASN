import {
  cancelRequestMeeting,
  requestMeeting,
  upcomingMeetings,
} from "@/services/coaching-clinics.services";
import { setColorStatusCoachingClinic } from "@/utils/client-utils";
import { CloseOutlined, ReloadOutlined } from "@ant-design/icons";
import { Alert, Stack } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Flex,
  Avatar,
  Button,
  Calendar,
  Collapse,
  Descriptions,
  Drawer,
  Grid,
  Modal,
  Skeleton,
  Space,
  Tag,
  Tooltip,
  Typography,
  message,
  Form,
  Input,
} from "antd";
import { useRouter } from "next/router";
import { useState } from "react";

import dayjs from "dayjs";
import "dayjs/locale/id";
import { toNumber } from "lodash";

dayjs.locale("id");

const { Panel } = Collapse;

const ButtonKonsultasi = ({
  item,
  handleBatal,
  gotoDetail,
  handleGabung,
  disabled,
}) => {
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
      <Button
        type="primary"
        onClick={() => handleGabung(item)}
        // disabled={disabled}
      >
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

const ModalConfirmation = ({ open, onCancel, gabung, confirmLoading, row }) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    const values = await form.validateFields();

    await gabung({
      id: row?.id,
      data: {
        reason: values?.reason,
      },
    });
  };

  return (
    <Modal
      onOk={handleOk}
      title="Apakah anda yakin ingin mengikuti coaching clinic ini?"
      open={open}
      onCancel={onCancel}
      centered
      okText="Ya"
      confirmLoading={confirmLoading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="reason"
          label="Alasan Mengikuti"
          rules={[{ required: true }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const PickCoachingModal = ({ open, onCancel, onOk, row }) => {
  const router = useRouter();

  const [showModalConfirmation, setShowModalConfirmation] = useState(false);
  const [rowModalConfirmation, setRowModalConfirmation] = useState({});

  const handleShowModalConfirmation = (row) => {
    setShowModalConfirmation(true);
    setRowModalConfirmation(row);
  };

  const handleCloseModalConfirmation = () => {
    setShowModalConfirmation(false);
    setRowModalConfirmation(null);
  };

  const breakpoint = Grid.useBreakpoint();

  const queryClient = useQueryClient();

  const { mutateAsync: gabung, isLoading: isLoadingGabung } = useMutation(
    ({ id, data }) => requestMeeting({ id, data }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["participantModalMeeting"]);
        handleCloseModalConfirmation();
        message.success("Berhasil mengikuti coaching clinic");
      },
      onError: (error) => {
        message.error(error?.response?.data?.message);
      },
      onSettled: () => {
        queryClient.invalidateQueries(["participantModalMeeting"]);
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

  const { data, isLoading, refetch, isRefetching } = useQuery(
    ["participantModalMeeting", row],
    () => upcomingMeetings(row),
    {
      enabled: !!row,
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    }
  );

  const gotoDetail = (row) => {
    router.push(`/coaching-clinic/${row?.detail_id}/detail`);
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <Drawer
      title={
        <Flex justify="space-between" align="center">
          <span>Jadwal Konsultasi Coaching Clinic</span>
          <Button
            type="text"
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            size="small"
          >
            Refresh
          </Button>
        </Flex>
      }
      open={open}
      onClose={onCancel}
      width={
        breakpoint.md ? 800 : breakpoint.sm ? 600 : breakpoint.xs ? 400 : 300
      }
    >
      <Skeleton loading={isLoading || isRefetching}>
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
                    {dayjs(item?.start_date).format("DD-MM-YYYY")}
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
                    disabled={
                      toNumber(item?.participants_count) ===
                      toNumber(item?.max_participants)
                    }
                    item={item}
                    handleBatal={handleBatal}
                    gotoDetail={gotoDetail}
                    handleGabung={() => handleShowModalConfirmation(item)}
                  />
                </Space>
              </Space>
            </Panel>
          ))}
        </Collapse>
        <ModalConfirmation
          row={rowModalConfirmation}
          open={showModalConfirmation}
          onCancel={handleCloseModalConfirmation}
          gabung={gabung}
          confirmLoading={isLoadingGabung}
        />
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

  const { data, isLoading, refetch, isRefetching } = useQuery(
    ["upcomingMeetings", query],
    () => upcomingMeetings(query),
    {
      enabled: !!query,
      refetchOnWindowFocus: false,
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

  return (
    <>
      <PickCoachingModal open={open} onCancel={handleClose} row={row} />
      <Flex justify="end">
        <Button
          icon={<ReloadOutlined />}
          type="text"
          onClick={() => refetch()}
          loading={isRefetching || isLoading}
        >
          Refresh
        </Button>
      </Flex>
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
                  <Avatar.Group max={{ count: 3 }} size="small">
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

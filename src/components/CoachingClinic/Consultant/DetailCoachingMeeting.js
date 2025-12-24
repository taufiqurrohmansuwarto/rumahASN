import {
  addParticipant,
  detailMeeting,
  removeParticipant,
  startMeeting,
} from "@/services/coaching-clinics.services";
import {
  IconArrowsMaximize,
  IconEdit,
  IconInfoCircle,
  IconTrash,
  IconUserPlus,
  IconUsers,
  IconVideo,
} from "@tabler/icons-react";
import {
  Box,
  Flex,
  Group,
  Indicator,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Empty,
  FloatButton,
  Form,
  Input,
  List,
  Modal,
  Row,
  Space,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import EditCoachingClinicModal from "./EditCoachingClinicModal";
import FormParticipants from "./FormParticipants";

import useVideoConferenceStore from "@/store/useVideoConference";
import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.locale("id");
dayjs.extend(relativeTime);

const ModalAddParticipant = ({ open, onClose }) => {
  const [form] = Form.useForm();

  const queryClient = useQueryClient();
  const router = useRouter();
  const { id } = router.query;

  const { mutateAsync: add, isLoading: isLoadingAdd } = useMutation(
    (data) => addParticipant(data),
    {
      onSuccess: () => {
        message.success("Peserta berhasil ditambahkan");
        queryClient.invalidateQueries(["meeting", id]);
        onClose();
      },
      onError: () => {
        message.error("Gagal menambahkan peserta");
      },
    }
  );

  const handleFinish = async () => {
    const value = await form.validateFields();
    const payload = {
      meetingId: id,
      data: {
        user_id: value?.user_id,
      },
    };

    add(payload);
  };

  return (
    <Modal
      confirmLoading={isLoadingAdd}
      width={600}
      onOk={handleFinish}
      centered
      open={open}
      onCancel={onClose}
      title="Tambah Peserta Coaching Clinic"
    >
      <Form layout="vertical" form={form}>
        <FormParticipants name="user_id" />
      </Form>
    </Modal>
  );
};

const DaftarPeserta = ({ data, meeting, openDrawer, handleCancelDrawer }) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { id } = router.query;
  const [filterData, setFilterData] = useState(data);

  useEffect(() => {
    setFilterData(data);
  }, [data]);

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const { mutateAsync: remove } = useMutation(
    (data) => removeParticipant(data),
    {
      onSuccess: () => {
        message.success("Peserta berhasil dihapus");
        queryClient.invalidateQueries(["meeting", id]);
      },
      onError: () => {
        message.error("Gagal menghapus peserta");
      },
    }
  );

  const handleRemove = (participant) => {
    Modal.confirm({
      title: "Hapus Peserta",
      centered: true,
      content: `Apakah anda yakin ingin menghapus peserta ${participant?.participant?.username} dari coaching clinic ini?`,
      okText: "Ya",
      onOk: async () => {
        try {
          const payload = {
            meetingId: id,
            participantId: participant?.id,
          };
          await remove(payload);
        } catch (error) {
          console.log(error);
        }
      },
      cancelText: "Tidak",
    });
  };

  return (
    <Drawer
      open={openDrawer}
      onClose={handleCancelDrawer}
      title="Daftar Peserta"
      width={600}
    >
      <Stack spacing="md">
        <Group position="apart">
          <Tooltip title="Tambah Peserta">
            <Button
              shape="circle"
              onClick={handleOpen}
              type="primary"
              icon={<IconUserPlus size={16} />}
            />
          </Tooltip>
          <Text weight={500} color="dimmed">
            {data?.length} dari {meeting?.max_participants} Peserta
          </Text>
        </Group>
        <Input.Search
          allowClear
          placeholder="Cari peserta..."
          onChange={(e) => {
            const value = e.target.value;
            if (!value) {
              setFilterData(data);
            } else {
              const filter = data.filter((item) => {
                const username = item?.participant?.username?.toLowerCase();
                return username.includes(value.toLowerCase());
              });
              setFilterData(filter);
            }
          }}
        />
      </Stack>
      <ScrollArea h={450} mt="md">
        <ModalAddParticipant open={open} onClose={handleClose} />
        <List
          size="small"
          dataSource={filterData}
          rowKey={(row) => row?.custom_id}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button
                  key="hapus"
                  size="small"
                  danger
                  onClick={() => handleRemove(item)}
                  icon={<IconTrash size={14} />}
                />,
              ]}
            >
              <List.Item.Meta
                title={<Space>{item?.participant?.username}</Space>}
                description={
                  <Space direction="vertical" size="small">
                    <>
                      {item?.participant?.info?.perangkat_daerah?.detail && (
                        <Typography.Text
                          style={{
                            fontSize: 12,
                          }}
                          type="secondary"
                        >
                          {item?.participant?.info?.perangkat_daerah?.detail}
                        </Typography.Text>
                      )}
                    </>
                    <Typography.Text type="secondary">
                      {dayjs(item?.created_at).format("DD MMMM YYYY HH:mm:ss")}
                    </Typography.Text>
                  </Space>
                }
                avatar={<Avatar size="small" src={item?.participant?.image} />}
              />
            </List.Item>
          )}
        />
      </ScrollArea>
    </Drawer>
  );
};

const ModalInformation = ({ open, onClose, item }) => {
  return (
    <Modal
      centered
      title="Informasi Coaching & Mentoring"
      open={open}
      onCancel={onClose}
      footer={null}
      closable={true}
    >
      <Descriptions layout="vertical" size="small">
        <Descriptions.Item label="Judul">{item?.title}</Descriptions.Item>
        <Descriptions.Item label="Deskripsi" span={2}>
          {item?.description}
        </Descriptions.Item>
        <Descriptions.Item label="Private">
          {item?.is_private ? "Privat" : "Publik"}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color="blue">{item?.status}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Tanggal" span={3}>
          {dayjs(item?.start_date).format("DD MMMM YYYY")}
        </Descriptions.Item>
        <Descriptions.Item label="Jam" span={3}>
          {item?.start_hours} - {item?.end_hours}
        </Descriptions.Item>
        <Descriptions.Item label="Maksimum Peserta" span={3}>
          {item?.max_participants}
        </Descriptions.Item>
        <Descriptions.Item label="Coaching">
          {item?.coach?.username}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

// Live Meeting Status Banner
function LiveMeetingBanner({ data, onMaximize }) {
  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #40c057 0%, #2f9e44 100%)",
        borderRadius: 12,
        padding: 24,
        marginBottom: 16,
      }}
    >
      <Flex align="center" justify="space-between" wrap="wrap" gap="md">
        <Group spacing="md">
          <Indicator color="white" processing size={14}>
            <IconVideo size={28} color="white" />
          </Indicator>
          <Box>
            <Text color="white" weight={600} size="lg">
              Meeting Sedang Berlangsung
            </Text>
            <Text color="rgba(255,255,255,0.9)" size="sm">
              {data?.title} • Anda bisa minimize video dan navigasi ke halaman
              lain
            </Text>
          </Box>
        </Group>
        <Button
          type="primary"
          ghost
          size="large"
          icon={<IconArrowsMaximize size={18} />}
          onClick={onMaximize}
          style={{
            borderColor: "white",
            color: "white",
            fontWeight: 600,
          }}
        >
          Buka Video
        </Button>
      </Flex>
    </Box>
  );
}

function DetailCoachingMeeting() {
  const router = useRouter();
  const { id } = router.query;

  const queryClient = useQueryClient();

  // Global video conference store
  const {
    startMeeting: startGlobalMeeting,
    isOpen,
    maximizeFromPip,
    meetingData,
    wasMeetingEnded,
    clearEndedMeeting,
  } = useVideoConferenceStore();

  const { data, isLoading, refetch } = useQuery(
    ["meeting", id],
    () => detailMeeting(id),
    {
      enabled: !!id,
      refetchOnWindowFocus: false,
    }
  );

  // Check if current meeting is the one in global store
  const isCurrentMeetingLive = isOpen && meetingData?.id === id;
  
  // Check if this meeting was manually ended (to prevent auto-restart)
  const wasMeetingManuallyEnded = wasMeetingEnded(id);

  const { mutateAsync: start, isLoading: isLoadingStart } = useMutation(
    (meetingId) => startMeeting(meetingId),
    {
      onSuccess: async () => {
        message.success("Meeting dimulai!");
        // Refetch to get JWT
        const updatedData = await refetch();
        // Start global video conference with meeting data
        if (updatedData?.data) {
          startGlobalMeeting({
            ...updatedData.data,
            id: id,
          });
        }
        queryClient.invalidateQueries(["meeting", id]);
        queryClient.invalidateQueries(["meetings"]);
      },
      onError: (error) => {
        message.error(error?.response?.data?.message || "Gagal memulai meeting");
      },
    }
  );

  const handleStartMeeting = () => {
    Modal.confirm({
      title: "Mulai Coaching & Mentoring",
      content: "Apakah anda yakin ingin memulai coaching & mentoring ini?",
      okText: "Ya, Mulai",
      cancelText: "Batal",
      centered: true,
      onOk: async () => {
        await start(id);
      },
    });
  };

  const handleMaximize = () => {
    if (isCurrentMeetingLive) {
      maximizeFromPip();
    } else if (data?.status === "live" && data?.jwt) {
      // Clear the ended state so we can rejoin
      if (wasMeetingManuallyEnded) {
        clearEndedMeeting(id);
      }
      // If meeting is live but not in global store, start it
      startGlobalMeeting({
        ...data,
        id: id,
      });
    }
  };

  const [open, setOpen] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);

  const handleOpenDrawer = () => setOpenDrawer(true);
  const handleCancelDrawer = () => setOpenDrawer(false);

  const handleEdit = () => {
    setOpenEditModal(true);
  };

  const handleEditModalClose = () => {
    setOpenEditModal(false);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Auto-start global video if meeting is live and has JWT
  // But NOT if meeting was manually ended by user
  useEffect(() => {
    if (
      data?.status === "live" &&
      data?.jwt &&
      !isOpen &&
      !wasMeetingManuallyEnded
    ) {
      startGlobalMeeting({
        ...data,
        id: id,
      });
    }
  }, [data?.status, data?.jwt, id, isOpen, wasMeetingManuallyEnded, startGlobalMeeting]);

  return (
    <>
      <FloatButton.BackTop />
      <EditCoachingClinicModal
        id={router?.query?.id}
        open={openEditModal}
        onClose={handleEditModalClose}
      />
      <Card
        extra={
          <Space>
            <Tooltip title="Info">
              <Button
                type="text"
                icon={<IconInfoCircle size={18} />}
                onClick={handleOpen}
              />
            </Tooltip>
            <Button
              type="primary"
              icon={<IconUsers size={16} />}
              onClick={handleOpenDrawer}
            >
              Peserta
            </Button>
          </Space>
        }
        title={
          <Group spacing="sm">
            <Typography.Text strong>{data?.title}</Typography.Text>
            <Tooltip title="Edit">
              <Button
                type="text"
                size="small"
                icon={<IconEdit size={16} />}
                onClick={handleEdit}
              />
            </Tooltip>
            {(data?.status === "live" || isCurrentMeetingLive) && (
              <Tag color="green">🔴 LIVE</Tag>
            )}
          </Group>
        }
        loading={isLoading}
      >
        <ModalInformation open={open} item={data} onClose={handleClose} />

        {/* Show Live Banner if meeting is live */}
        {(data?.status === "live" || isCurrentMeetingLive) && (
          <LiveMeetingBanner data={data} onMaximize={handleMaximize} />
        )}

        {data?.status === "live" || isCurrentMeetingLive ? (
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card size="small">
                <Stack spacing="sm">
                  <Text color="dimmed" size="sm">
                    Video conference sedang berjalan di latar belakang. Anda
                    dapat mengakses menu lain dan video akan tetap ada. Untuk
                    mengakhiri meeting, klik tombol "Akhiri Meeting" di video.
                  </Text>
                  <Group>
                    <Button
                      type="primary"
                      icon={<IconArrowsMaximize size={16} />}
                      onClick={handleMaximize}
                    >
                      Buka Video Fullscreen
                    </Button>
                  </Group>
                </Stack>
              </Card>
            </Col>
            <Col md={24} xs={24}>
              <DaftarPeserta
                meeting={data}
                data={data?.participants}
                openDrawer={openDrawer}
                handleCancelDrawer={handleCancelDrawer}
              />
            </Col>
          </Row>
        ) : (
          <>
            <Row gutter={[32, 32]}>
              <Col md={24} xs={24}>
                <Flex
                  align="center"
                  justify="center"
                  sx={{
                    borderRadius: 12,
                    height: "50vh",
                    background:
                      "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                  }}
                >
                  <Empty
                    image={<IconVideo size={64} color="#667eea" stroke={1.5} />}
                    description={
                      <Stack align="center" spacing={4}>
                        <Text weight={600} size="lg">
                          Coaching Clinic Belum Dimulai
                        </Text>
                        <Text color="dimmed" size="sm">
                          Klik tombol di bawah untuk memulai sesi coaching
                        </Text>
                      </Stack>
                    }
                  >
                    <Button
                      size="large"
                      onClick={handleStartMeeting}
                      loading={isLoadingStart}
                      disabled={isLoading}
                      type="primary"
                      icon={<IconVideo size={18} />}
                      style={{
                        height: 48,
                        paddingLeft: 32,
                        paddingRight: 32,
                        borderRadius: 24,
                        fontWeight: 600,
                      }}
                    >
                      Mulai Coaching Clinic
                    </Button>
                  </Empty>
                </Flex>
              </Col>
              <Col md={24} xs={24}>
                <DaftarPeserta
                  meeting={data}
                  data={data?.participants}
                  openDrawer={openDrawer}
                  handleCancelDrawer={handleCancelDrawer}
                />
              </Col>
            </Row>
          </>
        )}
      </Card>
    </>
  );
}

export default DetailCoachingMeeting;

import { detailMeetingParticipant } from "@/services/coaching-clinics.services";
import {
  IconArrowsMaximize,
  IconInfoCircle,
  IconRefresh,
  IconUsers,
  IconVideo,
  IconChevronLeft,
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
import { useQuery } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Empty,
  FloatButton,
  Input,
  List,
  Modal,
  Row,
  Skeleton,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import AddRating from "./CoachingClinicRating";
import useVideoConferenceStore from "@/store/useVideoConference";

import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.locale("id");
dayjs.extend(relativeTime);

const DaftarPeserta = ({ data, meeting, open, handleCancel }) => {
  const [filterData, setFilterData] = useState(data);

  useEffect(() => {
    setFilterData(data);
  }, [data]);

  return (
    <Drawer
      width={600}
      open={open}
      onClose={handleCancel}
      title="Daftar Peserta"
      placement="right"
    >
      <Stack spacing="md">
        <Group position="apart">
          <Text weight={500} color="dimmed">
            {data?.length} dari {meeting?.meeting?.max_participants} Peserta
          </Text>
        </Group>
        <Input.Search
          allowClear
          placeholder="Cari peserta..."
          onChange={(e) => {
            const value = e.target.value;

            if (!value) return setFilterData(data);
            else {
              const filtered = data?.filter((item) =>
                item?.participant?.username
                  ?.toLowerCase()
                  .includes(value?.toLowerCase())
              );
              setFilterData(filtered);
            }
          }}
        />
      </Stack>
      <ScrollArea h={450} mt="md">
        <List
          dataSource={filterData}
          rowKey={(row) => row?.custom_id}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={item?.participant?.username}
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
                avatar={<Avatar src={item?.participant?.image} />}
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
      title="Informasi Coaching Clinic"
      open={open}
      onCancel={onClose}
      footer={null}
    >
      <Descriptions layout="vertical" size="small">
        <Descriptions.Item label="Judul">{item?.title}</Descriptions.Item>
        <Descriptions.Item label="Deskripsi">
          {item?.description}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={item?.status === "live" ? "green" : "default"}>
            {item?.status?.toUpperCase()}
          </Tag>
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

// Live Meeting Status Banner for Participant
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
              {data?.meeting?.title} • Anda bisa minimize video dan navigasi ke
              halaman lain
            </Text>
          </Box>
        </Group>
        <Button
          type="primary"
          size="large"
          icon={<IconArrowsMaximize size={18} />}
          onClick={onMaximize}
        >
          Buka Video
        </Button>
      </Flex>
    </Box>
  );
}

function DetailMeetingParticipant() {
  const router = useRouter();
  const { id } = router.query;

  const [open, setOpen] = useState(false);
  const [openParticipant, setOpenParticipant] = useState(false);

  // Global video conference store
  const {
    startMeeting: startGlobalMeeting,
    isOpen,
    maximizeFromPip,
  } = useVideoConferenceStore();

  const handleOpenParticipant = () => setOpenParticipant(true);
  const handleCloseParticipant = () => setOpenParticipant(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const { data, isLoading, refetch, isFetching } = useQuery(
    ["detailMeetingParticipant", id],
    () => detailMeetingParticipant(id),
    {
      enabled: !!id,
      refetchOnWindowFocus: false,
    }
  );

  // Check if current meeting is the one in global store
  const { meetingData } = useVideoConferenceStore();
  const isCurrentMeetingLive = isOpen && meetingData?.id === data?.meeting?.id;

  // Get current participant info from participants list
  const currentParticipant = data?.participants?.find(
    (p) => p?.id === id
  );

  const handleMaximize = () => {
    if (isCurrentMeetingLive) {
      maximizeFromPip();
    } else if (data?.meeting?.status === "live" && data?.jwt) {
      // Start global video conference with meeting data
      startGlobalMeeting({
        ...data?.meeting,
        jwt: data?.jwt,
        id: data?.meeting?.id,
        isParticipant: true,
        participant: currentParticipant?.participant || { username: "Peserta" },
      });
    }
  };

  // Auto-start global video if meeting is live and has JWT
  useEffect(() => {
    if (data?.meeting?.status === "live" && data?.jwt && !isOpen) {
      startGlobalMeeting({
        ...data?.meeting,
        jwt: data?.jwt,
        id: data?.meeting?.id,
        isParticipant: true,
        participant: currentParticipant?.participant || { username: "Peserta" },
      });
    }
  }, [data?.meeting?.status, data?.jwt, data?.meeting?.id, currentParticipant]);

  return (
    <>
      <FloatButton.BackTop />
      <Card
        extra={
          <Space>
            <AddRating meetingId={data?.meeting?.id} />
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
              onClick={handleOpenParticipant}
            >
              Peserta
            </Button>
          </Space>
        }
        loading={isLoading}
        title={
          <Group spacing="sm">
            <Typography.Text strong>{data?.meeting?.title}</Typography.Text>
            {(data?.meeting?.status === "live" || isCurrentMeetingLive) && (
              <Tag color="green">🔴 LIVE</Tag>
            )}
          </Group>
        }
      >
        <Skeleton loading={isLoading} active>
          <>
            <ModalInformation
              open={open}
              item={data?.meeting}
              onClose={handleClose}
            />
            <DaftarPeserta
              meeting={data}
              data={data?.participants}
              open={openParticipant}
              handleCancel={handleCloseParticipant}
            />

            {/* Show Live Banner if meeting is live */}
            {(data?.meeting?.status === "live" || isCurrentMeetingLive) && (
              <LiveMeetingBanner data={data} onMaximize={handleMaximize} />
            )}

            {data?.meeting?.status === "live" || isCurrentMeetingLive ? (
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Card size="small">
                    <Stack spacing="sm">
                      <Text color="dimmed" size="sm">
                        Video conference sedang berjalan di latar belakang. Anda
                        dapat mengakses menu lain dan video akan tetap ada.
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
              </Row>
            ) : (
              <Row gutter={[16, 16]}>
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
                      image={
                        <IconVideo size={64} color="#667eea" stroke={1.5} />
                      }
                      description={
                        <Stack align="center" spacing={4}>
                          <Text weight={600} size="lg">
                            Coaching Clinic Belum Dimulai
                          </Text>
                          <Text color="dimmed" size="sm">
                            Silakan tunggu coach untuk memulai sesi atau refresh
                            halaman
                          </Text>
                        </Stack>
                      }
                    >
                      <Space>
                        <Button
                          icon={<IconChevronLeft size={16} />}
                          onClick={() => router.back()}
                        >
                          Kembali
                        </Button>
                        <Button
                          loading={isLoading || isFetching}
                          disabled={isLoading || isFetching}
                          type="primary"
                          icon={<IconRefresh size={16} />}
                          onClick={() => refetch()}
                        >
                          Refresh
                        </Button>
                      </Space>
                    </Empty>
                  </Flex>
                </Col>
              </Row>
            )}
          </>
        </Skeleton>
      </Card>
    </>
  );
}

export default DetailMeetingParticipant;

import JitsiMeeting from "@/components/VideoConference/JitsiMeeting";
import { detailMeetingParticipant } from "@/services/coaching-clinics.services";
import { QuestionCircleTwoTone } from "@ant-design/icons";
import { Group, ScrollArea, Stack } from "@mantine/core";
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
  Typography,
} from "antd";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import AddRating from "./CoachingClinicRating";

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
      <Stack>
        <Stack>
          <Group position="right">
            <Typography.Text type="secondary">
              {data?.length} dari {meeting?.meeting?.max_participants} Peserta
            </Typography.Text>
          </Group>
          <Input.Search
            allowClear
            onChange={(e) => {
              const value = e.target.value;

              if (!value) return setFilterData(data);
              else {
                const data = filterData?.filter((item) =>
                  item?.participant?.username
                    ?.toLowerCase()
                    .includes(value?.toLowerCase())
                );
                setFilterData(data);
              }
            }}
          />
        </Stack>
        <ScrollArea>
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
                        {dayjs(item?.created_at).format(
                          "DD MMMM YYYY HH:mm:ss"
                        )}
                      </Typography.Text>
                    </Space>
                  }
                  avatar={<Avatar src={item?.participant?.image} />}
                />
              </List.Item>
            )}
          />
        </ScrollArea>
      </Stack>
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
    >
      <Descriptions layout="vertical" size="small">
        <Descriptions.Item label="Judul">{item?.title}</Descriptions.Item>
        <Descriptions.Item label="Deskripsi">
          {item?.description}
        </Descriptions.Item>
        <Descriptions.Item label="Status">{item?.status}</Descriptions.Item>
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

function DetailMeetingParticipant() {
  const router = useRouter();
  const { id } = router.query;

  const [open, setOpen] = useState(false);
  const [openParticipant, setOpenParticipant] = useState(false);

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

  const leaveMeeting = () => {
    router.push("/coaching-clinic/all");
  };

  return (
    <Card
      extra={[
        <Space key="action">
          <AddRating meetingId={data?.meeting?.id} key="rating" />
          <Button onClick={handleOpenParticipant} key="participant">
            Peserta
          </Button>
        </Space>,
      ]}
      loading={isLoading}
      title={
        <Space>
          <Typography.Text>{data?.meeting?.title}</Typography.Text>
          <QuestionCircleTwoTone
            onClick={handleOpen}
            style={{
              cursor: "pointer",
            }}
          />
        </Space>
      }
    >
      <Skeleton loading={isLoading} active>
        <>
          <ModalInformation
            open={open}
            item={data?.meeting}
            onClose={handleClose}
          />
          {data?.meeting?.status === "live" ? (
            <Row gutter={[16, 16]}>
              <Col md={24} xs={24}>
                <JitsiMeeting
                  domain="coaching-online.site"
                  jwt={data?.jwt}
                  roomName={data?.meeting?.id}
                  getIFrameRef={(iframeRef) => {
                    iframeRef.style.height = "800px";
                  }}
                  configOverwrite={{
                    startWithAudioMuted: true,
                    prejoinPageEnabled: false,
                    startScreenSharing: true,
                    enableEmailInStats: false,
                  }}
                  interfaceConfigOverwrite={{
                    DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
                    APP_NAME: "Coaching Clinic",
                  }}
                  onReadyToClose={() => {
                    leaveMeeting();
                  }}
                  onApiReady={(api) => {
                    // here you can attach custom event listeners to the Jitsi Meet External API
                    // you can also store it locally to execute commands
                  }}
                />
              </Col>
              <Col md={6} xs={24}>
                <DaftarPeserta
                  meeting={data}
                  data={data?.participants}
                  open={openParticipant}
                  handleCancel={handleCloseParticipant}
                />
              </Col>
            </Row>
          ) : (
            <Row gutter={[16, 16]}>
              <Col md={24} xs={24}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 8,
                    height: "50vh",
                    backgroundColor: "#eee",
                  }}
                >
                  <FloatButton.BackTop />
                  <Empty
                    description={`Coaching clinic belum dimulai atau Coaching clinic sudah berakhir`}
                  >
                    <Space>
                      <Button danger onClick={() => router.back()}>
                        Kembali
                      </Button>
                      <Button
                        loading={isLoading || isFetching}
                        disabled={isLoading || isFetching}
                        type="primary"
                        onClick={() => refetch()}
                      >
                        Refresh
                      </Button>
                    </Space>
                  </Empty>
                </div>
              </Col>
              <Col md={6} xs={24}>
                <DaftarPeserta
                  meeting={data}
                  data={data?.participants}
                  open={openParticipant}
                  handleCancel={handleCloseParticipant}
                />
              </Col>
            </Row>
          )}
        </>
      </Skeleton>
    </Card>
  );
}

export default DetailMeetingParticipant;

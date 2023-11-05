import JitsiMeeting from "@/components/VideoConference/JitsiMeeting";
import moment from "moment";
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
  Empty,
  Input,
  List,
  Modal,
  Row,
  Skeleton,
  Space,
  Tag,
  Typography,
} from "antd";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import AddRating from "./CoachingClinicRating";

const DaftarPeserta = ({ data, meeting }) => {
  useEffect(() => {
    setFilterData(data);
  }, [data]);

  const [filterData, setFilterData] = useState(data);

  const handleFilter = (e) => {
    const value = e.target.value;
    const newData = data.filter((item) => {
      return item?.participant?.username
        .toLowerCase()
        .includes(value.toLowerCase());
    });
    setFilterData(newData);
  };

  return (
    <Stack>
      <Stack>
        <Group position="apart">
          <AddRating meetingId={meeting?.meeting?.id} />
          <Typography.Text strong>
            {data?.length} dari {meeting?.meeting?.max_participants} Peserta
          </Typography.Text>
          <Input.Search allowClear onChange={handleFilter} />
        </Group>
      </Stack>
      <ScrollArea h={450}>
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
                      {moment(item?.created_at).format("DD MMMM YYYY HH:mm:ss")}
                    </Typography.Text>
                  </Space>
                }
                avatar={<Avatar size="small" src={item?.participant?.image} />}
              />
            </List.Item>
          )}
        />
      </ScrollArea>
    </Stack>
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
          {moment(item?.start_date).format("DD MMMM YYYY")}
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
              <Col md={18} xs={24}>
                <JitsiMeeting
                  domain="coaching-online.site"
                  jwt={data?.jwt}
                  roomName={data?.meeting?.id}
                  getIFrameRef={(iframeRef) => {
                    iframeRef.style.height = "800px";
                  }}
                  configOverwrite={{
                    startWithAudioMuted: true,
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
                <DaftarPeserta meeting={meeting} data={data?.participants} />
              </Col>
            </Row>
          ) : (
            <Row gutter={[16, 16]}>
              <Col md={18} xs={24}>
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
                  <Empty
                    description={`Hmmm... sepertinya coaching clinic belum dimulai atau coaching clinic sudah berakhir`}
                  >
                    <Space>
                      <Button onClick={() => router.back()}>Kembali</Button>
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
                <DaftarPeserta meeting={data} data={data?.participants} />
              </Col>
            </Row>
          )}
        </>
      </Skeleton>
    </Card>
  );
}

export default DetailMeetingParticipant;

import JitsiMeeting from "@/components/VideoConference/JitsiMeeting";
import moment from "moment";
import { detailMeetingParticipant } from "@/services/coaching-clinics.services";
import { QuestionCircleTwoTone } from "@ant-design/icons";
import { ScrollArea } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  List,
  Modal,
  Row,
  Skeleton,
  Space,
  Tag,
  Typography,
} from "antd";
import { useRouter } from "next/router";
import { useState } from "react";
import AddRating from "./CoachingClinicRating";

const DaftarPeserta = ({ data }) => {
  return (
    <ScrollArea h={600}>
      <List
        header={<div>{data?.length} Peserta</div>}
        dataSource={data}
        rowKey={(row) => row?.custom_id}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              title={item?.participant?.username}
              description={
                <Space direction="vertical" size="small">
                  <Tag color="blue">
                    {item?.participant?.info?.jabatan?.jabatan}
                  </Tag>
                  <div>{item?.participant?.info?.perangkat_daerah?.detail}</div>
                  <Tag color="yellow">
                    {moment(item?.created_at).format("DD MMMM YYYY HH:mm:ss")}
                  </Tag>
                </Space>
              }
              avatar={<Avatar src={item?.participant?.image} />}
            />
          </List.Item>
        )}
      />
    </ScrollArea>
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
              <Col md={16} xs={24}>
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
              <Col md={8} xs={24}>
                <DaftarPeserta data={data?.participants} />
              </Col>
            </Row>
          ) : (
            <Row gutter={[16, 16]}>
              <Col md={16} xs={24}>
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
              </Col>
              <Col md={8} xs={24}>
                <DaftarPeserta data={data?.participants} />
              </Col>
            </Row>
          )}
        </>
      </Skeleton>
    </Card>
  );
}

export default DetailMeetingParticipant;

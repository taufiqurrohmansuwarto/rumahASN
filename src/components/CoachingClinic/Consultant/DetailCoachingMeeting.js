import JitsiMeeting from "@/components/VideoConference/JitsiMeeting";
import {
  detailMeeting,
  startMeeting,
} from "@/services/coaching-clinics.services";
import { QuestionCircleTwoTone, SoundOutlined } from "@ant-design/icons";
import { ScrollArea } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  Space,
  Tag,
  Typography,
  message,
} from "antd";
import moment from "moment";
import { useRouter } from "next/router";
import { useState } from "react";

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

function DetailCoachingMeeting() {
  const router = useRouter();
  const { id } = router.query;

  const [renderKey, setRenderKey] = useState(0);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    ["meeting", id],
    () => detailMeeting(id),
    {}
  );

  const { mutateAsync: start, isLoading: isLoadingStart } = useMutation(
    (data) => startMeeting(data),
    {
      onSuccess: () => {
        message.success("Meeting started");
        queryClient.invalidateQueries(["meeting", id]);
        queryClient.invalidateQueries(["detailMeetingParticipant"]);
        setRenderKey((prev) => prev + 1);
      },
      onSettled: () => {
        queryClient.invalidateQueries(["meeting", id]);
      },
    }
  );

  const handleStartMeeting = () => {
    Modal.confirm({
      title: "Mulai Coaching Clinic",
      content: "Apakah anda yakin ingin memulai coaching clinic ini?",
      okText: "Ya",
      cancelText: "Tidak",
      centered: true,
      onOk: async () => {
        await start(id);
      },
    });
  };

  const closeMeeting = () => {
    Modal.info({
      title: "Coaching Clinic telah selesai",
      content:
        "Terima kasih telah menggunakan layanan coaching clinic Rumah ASN",
      okText: "Tutup",
      centered: true,
      onOk: () => {
        router.push("/coaching-clinic-consultant");
      },
    });
  };

  const [open, setOpen] = useState(false);
  const [api, setApi] = useState(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleMuteAll = async () => {
    const result = await api.getParticipantsInfo();
    const participantId = result?.[0]?.participantId;

    api.executeCommand("grantModerator", participantId);
  };

  return (
    <Card
      title={
        <Space>
          <Typography.Text>{data?.title}</Typography.Text>
          <QuestionCircleTwoTone
            onClick={handleOpen}
            style={{
              cursor: "pointer",
            }}
          />
        </Space>
      }
      loading={isLoading}
    >
      <ModalInformation open={open} item={data} onClose={handleClose} />
      {data?.status === "live" ? (
        <Row gutter={[16, 16]}>
          <Col md={18}>
            <JitsiMeeting
              key={renderKey}
              domain="coaching-online.site"
              jwt={data?.jwt}
              roomName={data?.id}
              getIFrameRef={(iframeRef) => {
                iframeRef.style.height = "800px";
              }}
              configOverwrite={{
                startWithAudioMuted: true,
                disableModeratorIndicator: false,
                startScreenSharing: true,
                enableEmailInStats: false,
                whiteboard: {
                  enabled: true,
                  collabServerBaseUrl:
                    "https://siasn.bkd.jatimprov.go.id/whiteboard",
                },
              }}
              interfaceConfigOverwrite={{
                DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
                APP_NAME: "Coaching Clinic",
              }}
              onReadyToClose={() => {
                closeMeeting();
              }}
              onApiReady={(api) => {
                setApi(api);
                // here you can attach custom event listeners to the Jitsi Meet External API
                // you can also store it locally to execute commands
              }}
            />
          </Col>
          <Col md={6} xs={24}>
            <DaftarPeserta data={data?.participants} />
          </Col>
        </Row>
      ) : (
        <>
          <Row gutter={[16, 16]}>
            <Col md={18} xs={24}>
              <Empty
                description={`Hmmm... sepertinya coaching clinic belum dimulai atau coaching clinic sudah berakhir`}
              >
                <Button
                  onClick={handleStartMeeting}
                  loading={isLoadingStart}
                  disabled={isLoading}
                  type="primary"
                  icon={<SoundOutlined />}
                >
                  Mulai Coaching Clinic
                </Button>
              </Empty>
            </Col>
            <Col md={6} xs={24}>
              <DaftarPeserta data={data?.participants} />
            </Col>
          </Row>
        </>
      )}
    </Card>
  );
}

export default DetailCoachingMeeting;

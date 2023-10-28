import JitsiMeeting from "@/components/VideoConference/JitsiMeeting";
import { detailMeetingParticipant } from "@/services/coaching-clinics.services";
import { Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Col, List, Row, Skeleton, Space } from "antd";
import { useRouter } from "next/router";

const DaftarPeserta = ({ data }) => {
  return (
    <List
      header={<div>Daftar Peserta</div>}
      dataSource={data}
      rowKey={(row) => row?.custom_id}
      renderItem={(item) => (
        <List.Item>
          <List.Item.Meta
            title={item?.participant?.username}
            description={
              <Space direction="vertical" size="small">
                <div>{item?.participant?.info?.jabatan?.jabatan}</div>
                <div>{item?.participant?.info?.perangkat_daerah?.detail}</div>
              </Space>
            }
            avatar={<Avatar src={item?.participant?.image} />}
          />
        </List.Item>
      )}
    />
  );
};

function DetailMeetingParticipant() {
  const router = useRouter();
  const { id } = router.query;

  const { data, isLoading } = useQuery(
    ["detailMeetingParticipant", id],
    () => detailMeetingParticipant(id),
    {
      enabled: !!id,
    }
  );

  const leaveMeeting = () => {
    router.push("/coaching-clinic");
  };

  return (
    <>
      <Skeleton loading={isLoading} active>
        {data?.meeting?.status === "live" && (
          <Row gutter={[16, 16]}>
            <Col md={16}>
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
            <Col md={8}>
              <DaftarPeserta data={data?.participants} />
            </Col>
          </Row>
        )}
      </Skeleton>
    </>
  );
}

export default DetailMeetingParticipant;

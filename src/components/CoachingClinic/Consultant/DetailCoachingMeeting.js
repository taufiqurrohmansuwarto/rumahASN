import {
  detailMeeting,
  startMeeting,
} from "@/services/coaching-clinics.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Col, Modal, Row, Skeleton, message } from "antd";
import { useRouter } from "next/router";
import JitsiMeeting from "@/components/VideoConference/JitsiMeeting";
import { useState } from "react";
import { SoundOutlined } from "@ant-design/icons";

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

  return (
    <Skeleton loading={isLoading}>
      <Button
        style={{
          marginBottom: 20,
        }}
        onClick={handleStartMeeting}
        loading={isLoadingStart}
        disabled={isLoading}
        type="primary"
        icon={<SoundOutlined />}
      >
        Mulai Coaching Clinic
      </Button>
      {data?.status === "live" && (
        <Row>
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
              }}
              interfaceConfigOverwrite={{
                DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
              }}
              onReadyToClose={() => {
                closeMeeting();
              }}
              onApiReady={(api) => {
                // here you can attach custom event listeners to the Jitsi Meet External API
                // you can also store it locally to execute commands
              }}
            />
          </Col>
        </Row>
      )}
    </Skeleton>
  );
}

export default DetailCoachingMeeting;

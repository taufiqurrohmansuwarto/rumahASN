import {
  detailMeeting,
  startMeeting,
} from "@/services/coaching-clinics.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Skeleton, message } from "antd";
import { useRouter } from "next/router";
import JitsiMeeting from "@/components/VideoConference/JitsiMeeting";

function DetailCoachingMeeting() {
  const router = useRouter();
  const { id } = router.query;

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    ["meeting", id],
    () => detailMeeting(id),
    {}
  );

  const { mutate: start, isLoading: isLoadingStart } = useMutation(
    (data) => startMeeting(data),
    {
      onSuccess: () => {
        message.success("Meeting started");
        queryClient.invalidateQueries(["meeting", id]);
      },
      onSettled: () => {
        queryClient.invalidateQueries(["meeting", id]);
      },
    }
  );

  const handleStartMeeting = () => {
    start(id);
  };

  return (
    <Skeleton loading={isLoading}>
      {JSON.stringify(data?.jwt)}
      <Button
        onClick={handleStartMeeting}
        loading={isLoadingStart}
        disabled={isLoading}
      >
        Start
      </Button>
      {data?.status === "live" && (
        <JitsiMeeting
          domain="coaching-online.site"
          jwt={data?.jwt}
          roomName="somethingUsefullHelloworld"
          getIFrameRef={(iframeRef) => {
            iframeRef.style.height = "800px";
          }}
          configOverwrite={{
            startWithAudioMuted: true,
            disableModeratorIndicator: true,
            startScreenSharing: true,
            enableEmailInStats: false,
          }}
          interfaceConfigOverwrite={{
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          }}
          onReadyToClose={() => {
            console.log("onReadyToClose");
          }}
          onApiReady={(api) => {
            // here you can attach custom event listeners to the Jitsi Meet External API
            // you can also store it locally to execute commands
          }}
        />
      )}
    </Skeleton>
  );
}

export default DetailCoachingMeeting;

import Layout from "@/components/Layout";
import JitsiMeeting from "@/components/VideoConference/JitsiMeeting";

const CoachingClinic = () => {
  return (
    <div>
      <JitsiMeeting
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
        userInfo={{
          displayName: "YOUR_USERNAME",
        }}
        onApiReady={(externalApi) => {
          console.log(externalApi);
          // here you can attach custom event listeners to the Jitsi Meet External API
          // you can also store it locally to execute commands
        }}
      />
    </div>
  );
};

CoachingClinic.Auth = {
  action: "manage",
  subject: "tickets",
};

CoachingClinic.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

export default CoachingClinic;

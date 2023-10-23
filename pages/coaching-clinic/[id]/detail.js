import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import JitsiMeeting from "@/components/VideoConference/JitsiMeeting";
import { useSession } from "next-auth/react";
import Head from "next/head";

const jwt =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiIzNzVlNDYyMmYyM2QwOTExNjE2Y2E2NjA4ZDFiZTM0YjA1MjRkYzAzOWIwMTM2ZDlkYjA1ZTgzYWQ4NjQ1YTQwIiwiaXNzIjoiMzc1ZTQ2MjJmMjNkMDkxMTYxNmNhNjYwOGQxYmUzNGIwNTI0ZGMwMzliMDEzNmQ5ZGIwNWU4M2FkODY0NWE0MCIsInN1YiI6ImNvYWNoaW5nLW9ubGluZS5zaXRlIiwicm9vbSI6IioifQ.vLeS0MSYWRXH9IOkvV_ClD-H1MAmbHvUlBZu_4sYj_E";

const DetailCoachingClinic = () => {
  const { data, status } = useSession();
  return (
    <>
      <Head>
        <title>Rumah ASN - Coaching Clinic</title>
      </Head>
      <PageContainer
        title="Coaching Clinic"
        content="Rumah ASN Coaching Clinic"
      >
        {status === "authenticated" && (
          <>
            {JSON.stringify(data?.user?.name)}
            <JitsiMeeting
              domain="coaching-online.site"
              jwt={jwt}
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
              userInfo={{
                displayName: data?.user?.name,
                email: data?.user?.image,
              }}
              onApiReady={(api) => {
                console.log(api);
                api.executeCommand("avatarUrl", data?.user?.image);
                // here you can attach custom event listeners to the Jitsi Meet External API
                // you can also store it locally to execute commands
              }}
            />
          </>
        )}
      </PageContainer>
    </>
  );
};

DetailCoachingClinic.Auth = {
  action: "manage",
  subject: "tickets",
};

DetailCoachingClinic.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

export default DetailCoachingClinic;

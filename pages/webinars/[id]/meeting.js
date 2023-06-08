import Layout from "@/components/Layout";
import { createSignatureZoom } from "@/services/index";
import { useQuery } from "@tanstack/react-query";
import { Col, Row, Typography } from "antd";
import { useSession } from "next-auth/react";
// import { ZoomMtg } from "@zoomus/websdk";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";

const sdkKey = "qxzOwcf4Q_eaDuiICc7glg";

const Meeting = () => {
  const router = useRouter();
  const zoomRef = useRef(null);
  const zoomMeetingChatRef = useRef(null);

  const { data: user, status: statusUser } = useSession();
  const { data, isLoading, status } = useQuery(
    ["meeting", router.query.id],
    () => createSignatureZoom(router.query.id),
    { enabled: !!router.query.id, refetchOnWindowFocus: false }
  );

  useEffect(() => {
    const client = ZoomMtgEmbedded.createClient();

    if (status === "success" && statusUser === "authenticated") {
      client.init({
        debug: true,
        zoomAppRoot: zoomRef.current,
        language: "en-US",
        customize: {
          video: {
            popper: {
              disableDraggable: true,
            },
          },
          chat: {
            popper: {
              disableDraggable: true,
              anchorElement: zoomMeetingChatRef.current,
              placement: "top",
            },
          },
          meetingInfo: [
            "topic",
            "host",
            "mn",
            "pwd",
            "telPwd",
            "invite",
            "participant",
            "dc",
            "enctype",
          ],
          toolbar: {
            buttons: [
              {
                text: "Custom Button",
                className: "CustomButton",
                onClick: () => {
                  console.log("custom button");
                },
              },
            ],
          },
        },
      });

      client.join({
        signature: data?.token,
        sdkKey,
        meetingNumber: router?.query?.id,
        password: "",
        userName: user?.user?.name,
      });
    }
  }, [data?.token, router?.query?.id, status, statusUser, user?.user?.name]);

  return (
    <>
      <link
        type="text/css"
        rel="stylesheet"
        href="https://source.zoom.us/2.2.0/css/bootstrap.css"
      />
      <link
        type="text/css"
        rel="stylesheet"
        href="https://source.zoom.us/2.2.0/css/react-select.css"
      />

      <Row>
        <Col md={8}>
          <div id="meetingSDKElement" ref={zoomRef} />
        </Col>
        <Col md={8}>
          <Typography.Paragraph>hello world</Typography.Paragraph>
        </Col>
        <Col md={8}>
          <div id="meetingChatElement" ref={zoomMeetingChatRef} />
        </Col>
      </Row>
    </>
  );
};

Meeting.Auth = {
  action: "manage",
  subject: "tickets",
};

Meeting.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

export const getServerSideProps = async (ctx) => {
  const sdkKey = process.env.ZOOM_MEETING_SDK_KEY;
  return {
    props: {
      data: {
        sdkKey,
      },
    },
  };
};

export default Meeting;

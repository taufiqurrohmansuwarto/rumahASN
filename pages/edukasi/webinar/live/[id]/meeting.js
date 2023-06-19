import Layout from "@/components/Layout";
import { createSignatureZoom } from "@/services/index";
import { useQuery } from "@tanstack/react-query";
import { Col, Row, Skeleton } from "antd";
import { getSession, useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
const sdkKey = "qxzOwcf4Q_eaDuiICc7glg";

const Meeting = ({ data: { user } }) => {
  const router = useRouter();
  const zoomRef = useRef(null);

  const { data, isLoading, status } = useQuery(
    ["meeting", router.query.id],
    () => createSignatureZoom(router.query.id),
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchIntervalInBackground: false,
    }
  );

  useEffect(() => {
    (async () => {
      if (typeof window !== "undefined") {
        if (window.fcWidget) window.fcWidget.hide();
        await import("@zoomus/websdk");
        const ZoomMtg = window.ZoomMtg;
        ZoomMtg?.setZoomJSLib("https://source.zoom.us/2.13.0/lib", "/av");

        ZoomMtg?.preLoadWasm();
        ZoomMtg?.prepareWebSDK();
        // loads language files, also passes any error messages to the ui
        ZoomMtg?.i18n.load("en-US");
        ZoomMtg?.i18n.reload("en-US");

        document.getElementById("zmmtg-root").style.display = "block";
        document.getElementById("zmmtg-root").style.zIndex = "999";

        ZoomMtg.init({
          leaveUrl: window.location.origin + "/helpdesk/edukasi/webinar/live",
          success: (success) => {
            console.log(success);

            ZoomMtg.join({
              signature: data?.token,
              sdkKey: sdkKey,
              meetingNumber: router?.query?.id,
              passWord: "",
              userName: user?.name,
              success: (success) => {
                console.log(success);
              },
              error: (error) => {
                console.log(error);
              },
            });
          },
          error: (error) => {
            console.log(error);
          },
        });
      }
    })();

    return () => {
      if (typeof window !== "undefined") {
        if (window.fcWidget) window.fcWidget.show();
        if (window.ZoomMtg) window.ZoomMtg.endMeeting({});
      }
    };
  }, [data, router.query.id, user]);

  return (
    <>
      <Head>
        <link
          type="text/css"
          rel="stylesheet"
          href="https://source.zoom.us/2.13.0/css/bootstrap.css"
        />
        <link
          type="text/css"
          rel="stylesheet"
          href="https://source.zoom.us/2.13.0/css/react-select.css"
        />
      </Head>
      <Skeleton loading={isLoading}>
        <Skeleton loading={isLoading}>
          <Row>
            <Col span={8}>
              <div id="zmmtg-root" />
            </Col>
          </Row>
        </Skeleton>
      </Skeleton>
    </>
  );
};

export const getServerSideProps = async (ctx) => {
  const session = await getSession(ctx);

  return {
    props: {
      data: {
        user: session?.user,
      },
    },
  };
};

Meeting.Auth = {
  action: "manage",
  subject: "tickets",
};

Meeting.getLayout = (page) => {
  return <Layout collapsed={true}>{page}</Layout>;
};

export default Meeting;

import Layout from "@/components/Layout";
import { adminSignature } from "@/services/index";
import { useQuery } from "@tanstack/react-query";
import { Col, Row, Skeleton } from "antd";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
const sdkKey = "qxzOwcf4Q_eaDuiICc7glg";

const Meeting = () => {
  const router = useRouter();
  const zoomRef = useRef(null);

  const { data: user, status: statusUser } = useSession();
  const { data, isLoading, status } = useQuery(
    ["meeting", router.query.id],
    () => adminSignature(router.query.id),
    { enabled: !!router.query.id }
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
            viewSizes: {
              default: {
                width: 1500,
                height: 600,
              },
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
                onClick: () => {},
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
  }, [data, router.query.id, status, statusUser, user]);

  return (
    <>
      {/* <link
        type="text/css"
        rel="stylesheet"
        href="https://source.zoom.us/2.13.0/css/bootstrap.css"
      />
      <link
        type="text/css"
        rel="stylesheet"
        href="https://source.zoom.us/2.13.0/css/react-select.css"
      />
 */}
      <Skeleton loading={isLoading}>
        <Row>
          <Col span={8}>
            <div id="meetingSDKElement" ref={zoomRef} />
          </Col>
        </Row>
      </Skeleton>
    </>
  );
};

Meeting.Auth = {
  action: "manage",
  subject: "tickets",
};

Meeting.getLayout = (page) => {
  return <Layout collapsed={true}>{page}</Layout>;
};

export default Meeting;

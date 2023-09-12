import Layout from "@/components/Layout";
import AdminLayoutDetailWebinar from "@/components/WebinarSeries/AdminLayoutDetailWebinar";
import { downloadSurvey, reportSurvey } from "@/services/webinar.services";
import { DownloadOutlined } from "@ant-design/icons";
import { Bar } from "@ant-design/plots";
import { Stack } from "@mantine/core";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Card, Col, Row, message } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";
import { useRef } from "react";

const Chart = ({ data }) => {
  const ref = useRef();

  const config = {
    data: data?.chart,
    xField: "value",
    yField: "label",
    seriesField: "label",
    label: {
      position: "middle",
    },
    // legend: { position: "top-left" },
    title: {
      text: "something",
    },
  };

  const handleDownload = () => {
    ref.current?.downloadImage();
  };

  return (
    <Row>
      <Col lg={16} xs={24}>
        {data?.chart && (
          <Card
            extra={<a onClick={handleDownload}>Unduh</a>}
            title={data?.question}
          >
            <Bar onReady={(plot) => (ref.current = plot)} {...config} />
          </Card>
        )}
      </Col>
    </Row>
  );
};

function Surveys() {
  const router = useRouter();
  const { id } = router.query;

  const { mutateAsync: webinarSurveys, isLoading: isLoadingWebinarSurveys } =
    useMutation((data) => downloadSurvey(data), {});

  const { data, isLoading } = useQuery(
    ["admin-survey", id],
    () => reportSurvey(id),
    {}
  );

  const handleDownloadSurvey = async () => {
    try {
      const data = await webinarSurveys(id);

      if (data) {
        const blob = new Blob([data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "file.xlsx";
        link.click();

        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.log(error);
      message.error("Gagal mengunduh data");
    }
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - Webinar Series - Survey</title>
      </Head>
      <AdminLayoutDetailWebinar loading={isLoading} active="survey">
        <Button
          style={{
            marginBottom: 16,
          }}
          onClick={handleDownloadSurvey}
          loading={isLoadingWebinarSurveys}
          type="primary"
          icon={<DownloadOutlined />}
        >
          Unduh Data Survey
        </Button>
        {data?.length && (
          <Stack>
            {data?.map((item) => (
              <Chart key={item?.question} data={item} />
            ))}
          </Stack>
        )}
      </AdminLayoutDetailWebinar>
    </>
  );
}

Surveys.getLayout = function getLayout(page) {
  return <Layout active="/apps-managements/webinar-series">{page}</Layout>;
};

Surveys.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default Surveys;

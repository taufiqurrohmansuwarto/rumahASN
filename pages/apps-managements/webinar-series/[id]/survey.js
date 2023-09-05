import Layout from "@/components/Layout";
import AdminLayoutDetailWebinar from "@/components/WebinarSeries/AdminLayoutDetailWebinar";
import { reportSurvey } from "@/services/webinar.services";
import { Bar } from "@ant-design/plots";
import { Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Card, Col, Row } from "antd";
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

  const { data, isLoading } = useQuery(
    ["admin-survey", id],
    () => reportSurvey(id),
    {}
  );

  return (
    <>
      <Head>
        <title>Rumah ASN - Webinar Series - Survey</title>
      </Head>
      <AdminLayoutDetailWebinar loading={isLoading} active="survey">
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

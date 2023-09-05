import Layout from "@/components/Layout";
import AdminLayoutDetailWebinar from "@/components/WebinarSeries/AdminLayoutDetailWebinar";
import { reportSurvey } from "@/services/webinar.services";
import { Bar } from "@ant-design/plots";
import { Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Card } from "antd";
import { useRouter } from "next/router";

const Chart = ({ data }) => {
  const config = {
    data: data?.chart,
    xField: "value",
    yField: "label",
    seriesField: "label",
    label: {
      position: "middle",
    },
    legend: { position: "top-left" },
  };

  return (
    <>
      {data?.chart && (
        <Card title={data?.question}>
          <Bar {...config} />
        </Card>
      )}
    </>
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
    <AdminLayoutDetailWebinar loading={isLoading} active="survey">
      {data?.length && (
        <Stack>
          {data?.map((item) => (
            <Chart key={item?.question} data={item} />
          ))}
        </Stack>
      )}
    </AdminLayoutDetailWebinar>
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

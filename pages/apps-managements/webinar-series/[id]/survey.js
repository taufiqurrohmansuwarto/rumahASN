import Layout from "@/components/Layout";
import AdminLayoutDetailWebinar from "@/components/WebinarSeries/AdminLayoutDetailWebinar";

function Surveys() {
  return (
    <AdminLayoutDetailWebinar active="survey">
      <div>survey</div>
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

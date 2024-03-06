import Layout from "@/components/Layout";
import AdminLayoutDetailWebinar from "@/components/WebinarSeries/AdminLayoutDetailWebinar";
import AdminViewCerttificate from "@/components/WebinarSeries/AdminViewCerttificate";
import { Card } from "antd";
import { useRouter } from "next/router";

function Absences() {
  const router = useRouter();
  return (
    <AdminLayoutDetailWebinar active="view-certificate">
      <Card>
        <AdminViewCerttificate id={router?.query.id} />
      </Card>
    </AdminLayoutDetailWebinar>
  );
}

Absences.getLayout = function getLayout(page) {
  return <Layout active="/apps-managements/webinar-series">{page}</Layout>;
};

Absences.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default Absences;

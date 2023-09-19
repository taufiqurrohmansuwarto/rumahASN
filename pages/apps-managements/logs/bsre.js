import Layout from "@/components/Layout";

function LogBSRE() {
  return <div>ini adalah log bsre</div>;
}

LogBSRE.getLayout = function getLayout(page) {
  return <Layout active="/apps-managements/logs">{page}</Layout>;
};

LogBSRE.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default LogBSRE;

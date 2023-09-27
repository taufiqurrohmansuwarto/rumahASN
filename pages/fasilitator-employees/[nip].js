import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";

const EmployeeNumberFasilitator = () => {
  return <PageContainer>Hello world</PageContainer>;
};

EmployeeNumberFasilitator.Auth = {
  action: "manage",
  subject: "Feeds",
};

EmployeeNumberFasilitator.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default EmployeeNumberFasilitator;

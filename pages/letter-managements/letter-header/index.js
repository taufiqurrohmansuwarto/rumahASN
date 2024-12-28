import Layout from "@/components/Layout";
import HeaderLetter from "@/components/LetterManagements/HeaderLetter";
import PageContainer from "@/components/PageContainer";

const LetterHeader = () => {
  return (
    <PageContainer title="Letter Header" subTitle="Letter Header">
      <HeaderLetter />
    </PageContainer>
  );
};

LetterHeader.getLayout = function getLayout(page) {
  return <Layout active="/letter-managements/letter-header">{page}</Layout>;
};

LetterHeader.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default LetterHeader;

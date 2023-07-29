import Layout from "@/components/Layout";
import CompareDataUtama from "@/components/PemutakhiranData/CompareDataUtama";
import LayoutPemutakhiranData from "@/components/PemutakhiranData/LayoutPemutakhiranData";

const DataUtama = () => {
  return <CompareDataUtama />;
};

DataUtama.Auth = {
  action: "manage",
  subject: "Tickets",
};

DataUtama.getLayout = (page) => {
  return (
    <Layout active="/pemutakhiran-data/data-utama">
      <LayoutPemutakhiranData>{page}</LayoutPemutakhiranData>
    </Layout>
  );
};

export default DataUtama;

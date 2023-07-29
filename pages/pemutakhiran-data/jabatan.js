import Layout from "@/components/Layout";
import CompareJabatan from "@/components/PemutakhiranData/CompareJabatan";
import LayoutPemutakhiranData from "@/components/PemutakhiranData/LayoutPemutakhiranData";

const Jabatan = () => {
  return <CompareJabatan />;
};

Jabatan.Auth = {
  action: "manage",
  subject: "Tickets",
};

Jabatan.getLayout = (page) => {
  return (
    <Layout active="/pemutakhiran-data/data-utama">
      <LayoutPemutakhiranData active="2">{page}</LayoutPemutakhiranData>
    </Layout>
  );
};

export default Jabatan;

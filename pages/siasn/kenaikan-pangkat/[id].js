import Layout from "@/components/Layout";

const DaftarKenaikanPangkat = () => {
  return (
    <div>
      <h1>Daftar Kenaikan Pangkat</h1>
    </div>
  );
};

DaftarKenaikanPangkat.getLayout = function getLayout(page) {
  return <Layout active="/siasn/kenaikan-pangkat">{page}</Layout>;
};

DaftarKenaikanPangkat.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default DaftarKenaikanPangkat;

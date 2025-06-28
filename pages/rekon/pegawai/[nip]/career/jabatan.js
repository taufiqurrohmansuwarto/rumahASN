import RekonLayout from "@/components/Rekon/RekonLayout";
import RekonPegawaiLayoutDetail from "@/components/Rekon/RekonPegawaiLayoutDetail";
import Head from "next/head";

const CareerJabatan = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Jabatan</title>
      </Head>
      <div>Jabatan</div>
    </>
  );
};

CareerJabatan.getLayout = (page) => {
  return (
    <RekonLayout active="/rekon/pegawai">
      <RekonPegawaiLayoutDetail
        activeMenu="/career/jabatan"
        activeSegmented="/career/jabatan"
      >
        {page}
      </RekonPegawaiLayoutDetail>
    </RekonLayout>
  );
};

CareerJabatan.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default CareerJabatan;

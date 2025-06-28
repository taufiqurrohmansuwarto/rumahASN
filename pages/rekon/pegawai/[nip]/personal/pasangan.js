import RekonLayout from "@/components/Rekon/RekonLayout";
import RekonPegawaiLayoutDetail from "@/components/Rekon/RekonPegawaiLayoutDetail";
import Head from "next/head";

const PersonalPasangan = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Pasangan</title>
      </Head>
      <div>Pasangan</div>
    </>
  );
};

PersonalPasangan.getLayout = (page) => {
  return (
    <RekonLayout active="/rekon/pegawai">
      <RekonPegawaiLayoutDetail
        activeMenu="/personal/keluarga"
        activeSegmented="/personal/pasangan"
      >
        {page}
      </RekonPegawaiLayoutDetail>
    </RekonLayout>
  );
};

PersonalPasangan.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default PersonalPasangan;

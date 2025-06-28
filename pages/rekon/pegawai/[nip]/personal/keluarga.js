import RekonLayout from "@/components/Rekon/RekonLayout";
import RekonPegawaiLayoutDetail from "@/components/Rekon/RekonPegawaiLayoutDetail";
import Head from "next/head";

const PersonalKeluarga = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Keluarga</title>
      </Head>
      <div>Keluarga</div>
    </>
  );
};

PersonalKeluarga.getLayout = (page) => {
  return (
    <RekonLayout active="/rekon/pegawai">
      <RekonPegawaiLayoutDetail
        activeMenu="/personal/keluarga"
        activeSegmented="/personal/keluarga"
      >
        {page}
      </RekonPegawaiLayoutDetail>
    </RekonLayout>
  );
};

PersonalKeluarga.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default PersonalKeluarga;

import RekonLayout from "@/components/Rekon/RekonLayout";
import RekonPegawaiLayoutDetail from "@/components/Rekon/RekonPegawaiLayoutDetail";
import Head from "next/head";
import { useParams } from "next/navigation";

const EducationKompetensi = () => {
  const { nip } = useParams();
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Kompetensi</title>
      </Head>
    </>
  );
};

EducationKompetensi.getLayout = (page) => {
  return (
    <RekonLayout active="/rekon/pegawai">
      <RekonPegawaiLayoutDetail
        activeMenu="/education/kompetensi"
        activeSegmented="/education/kompetensi"
      >
        {page}
      </RekonPegawaiLayoutDetail>
    </RekonLayout>
  );
};

EducationKompetensi.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default EducationKompetensi;

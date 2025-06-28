import RekonLayout from "@/components/Rekon/RekonLayout";
import RekonPegawaiLayoutDetail from "@/components/Rekon/RekonPegawaiLayoutDetail";
import CompareKedudukanHukumByNip from "@/components/PemutakhiranData/Admin/CompareKedudukanHukumByNip";
import Head from "next/head";
import { useParams } from "next/navigation";

const PersonalKedudukanHukum = () => {
  const { nip } = useParams();
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Kedudukan Hukum</title>
      </Head>
      <CompareKedudukanHukumByNip nip={nip} />
    </>
  );
};

PersonalKedudukanHukum.getLayout = (page) => {
  return (
    <RekonLayout active="/rekon/pegawai">
      <RekonPegawaiLayoutDetail
        activeMenu="/personal/keluarga"
        activeSegmented="/personal/kedudukan-hukum"
      >
        {page}
      </RekonPegawaiLayoutDetail>
    </RekonLayout>
  );
};

PersonalKedudukanHukum.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default PersonalKedudukanHukum;

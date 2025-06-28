import RekonLayout from "@/components/Rekon/RekonLayout";
import RekonPegawaiLayoutDetail from "@/components/Rekon/RekonPegawaiLayoutDetail";
import Head from "next/head";
import { useParams } from "next/navigation";

const EducationPendidikan = () => {
  const { nip } = useParams();
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Pendidikan</title>
      </Head>
    </>
  );
};

EducationPendidikan.getLayout = (page) => {
  return (
    <RekonLayout active="/rekon/pegawai">
      <RekonPegawaiLayoutDetail
        activeMenu="/education/pendidikan"
        activeSegmented="/education/pendidikan"
      >
        {page}
      </RekonPegawaiLayoutDetail>
    </RekonLayout>
  );
};

EducationPendidikan.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default EducationPendidikan;

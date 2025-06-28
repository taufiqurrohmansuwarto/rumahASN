import RekonLayout from "@/components/Rekon/RekonLayout";
import RekonPegawaiLayoutDetail from "@/components/Rekon/RekonPegawaiLayoutDetail";
import Head from "next/head";
import { useParams } from "next/navigation";

const EducationPotensi = () => {
  const { nip } = useParams();
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Potensi</title>
      </Head>
    </>
  );
};

EducationPotensi.getLayout = (page) => {
  return (
    <RekonLayout active="/rekon/pegawai">
      <RekonPegawaiLayoutDetail
        activeMenu="/education/pendidikan"
        activeSegmented="/education/potensi"
      >
        {page}
      </RekonPegawaiLayoutDetail>
    </RekonLayout>
  );
};

EducationPotensi.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default EducationPotensi;

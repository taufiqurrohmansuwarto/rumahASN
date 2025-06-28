import RekonLayout from "@/components/Rekon/RekonLayout";
import RekonPegawaiLayoutDetail from "@/components/Rekon/RekonPegawaiLayoutDetail";
import Head from "next/head";
import { useParams } from "next/navigation";

const EducationDiklat = () => {
  const { nip } = useParams();
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Diklat</title>
      </Head>
    </>
  );
};

EducationDiklat.getLayout = (page) => {
  return (
    <RekonLayout active="/rekon/pegawai">
      <RekonPegawaiLayoutDetail
        activeMenu="/education/diklat"
        activeSegmented="/education/diklat"
      >
        {page}
      </RekonPegawaiLayoutDetail>
    </RekonLayout>
  );
};

EducationDiklat.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default EducationDiklat;

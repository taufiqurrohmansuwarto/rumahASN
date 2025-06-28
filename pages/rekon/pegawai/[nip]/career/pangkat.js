import RekonLayout from "@/components/Rekon/RekonLayout";
import RekonPegawaiLayoutDetail from "@/components/Rekon/RekonPegawaiLayoutDetail";
import ComparePangkatByNip from "@/components/PemutakhiranData/Admin/ComparePangkatByNip";
import Head from "next/head";
import { useParams } from "next/navigation";

const CareerPangkat = () => {
  const { nip } = useParams();
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Pangkat</title>
      </Head>
      <ComparePangkatByNip nip={nip} />
    </>
  );
};

CareerPangkat.getLayout = (page) => {
  return (
    <RekonLayout active="/rekon/pegawai">
      <RekonPegawaiLayoutDetail
        activeMenu="/career/jabatan"
        activeSegmented="/career/pangkat"
      >
        {page}
      </RekonPegawaiLayoutDetail>
    </RekonLayout>
  );
};

CareerPangkat.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default CareerPangkat;

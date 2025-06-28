import RekonLayout from "@/components/Rekon/RekonLayout";
import RekonPegawaiLayoutDetail from "@/components/Rekon/RekonPegawaiLayoutDetail";
import CompareMasaKerjaByNip from "@/components/PemutakhiranData/Admin/CompareMasaKerjaByNip";
import Head from "next/head";
import { useParams } from "next/navigation";

const CareerMasaKerja = () => {
  const { nip } = useParams();
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Masa Kerja</title>
      </Head>
      <CompareMasaKerjaByNip nip={nip} />
    </>
  );
};

CareerMasaKerja.getLayout = (page) => {
  return (
    <RekonLayout active="/rekon/pegawai">
      <RekonPegawaiLayoutDetail
        activeMenu="/career/jabatan"
        activeSegmented="/career/masa-kerja"
      >
        {page}
      </RekonPegawaiLayoutDetail>
    </RekonLayout>
  );
};

CareerMasaKerja.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default CareerMasaKerja;

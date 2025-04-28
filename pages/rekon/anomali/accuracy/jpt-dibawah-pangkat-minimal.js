import JPTDibawahPangkatMinimal from "@/components/Fasilitator/KualitasData/Accuracy/JPTDibawahPangkatMinimal";
import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import { Grid } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

const AccuracyJabatanPimpinanTinggiDibawahPangkatMinimal = () => {
  const breakPoint = Grid.useBreakpoint();
  const router = useRouter();

  const gotoRekonAnomali = () => {
    router.push("/rekon/anomali");
  };

  return (
    <>
      <Head>
        <title>
          Rumah ASN - Kualitas Data - Jabatan Pimpinan Tinggi Dibawah Pangkat
          Minimal
        </title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        onBack={gotoRekonAnomali}
        title="Dimensi Accuracy - Jenis Pegawai DPK Tidak Sesuai"
        content="Jenis pegawai DPK tidak sesuai"
      >
        <JPTDibawahPangkatMinimal />
      </PageContainer>
    </>
  );
};

AccuracyJabatanPimpinanTinggiDibawahPangkatMinimal.getLayout = (page) => {
  return <RekonLayout active="/rekon/anomali">{page}</RekonLayout>;
};

AccuracyJabatanPimpinanTinggiDibawahPangkatMinimal.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default AccuracyJabatanPimpinanTinggiDibawahPangkatMinimal;

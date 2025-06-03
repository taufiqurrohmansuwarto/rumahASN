import LayananKeuanganLayout from "@/components/LayananKeuangan/LayananKeuanganLayout";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import FormPengajuan from "@/components/LayananKeuangan/BankJatim/FormPengajuan";

const KonfirmasiPengajuanBankJatim = () => {
  const router = useRouter();

  const handleStepChange = (step) => {
    console.log(`Konfirmasi step: ${step}`);

    // Jika user klik "Pengajuan Baru", redirect ke dashboard
    if (step === 1) {
      router.push("/layanan-keuangan/bank-jatim");
    }
  };

  return (
    <>
      <Head>
        <title>Konfirmasi Pengajuan - Bank Jatim</title>
      </Head>
      <PageContainer
        onBack={() => router.back()}
        title="Konfirmasi Pengajuan"
        subTitle="Bank Jatim - Hasil"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/layanan-keuangan/bank-jatim">Dashboard</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/layanan-keuangan/bank-jatim/pengajuan">
                  Pengajuan
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/layanan-keuangan/bank-jatim/pengajuan/data-pinjaman">
                  Data Pinjaman
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Konfirmasi</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <FormPengajuan step={3} onStepChange={handleStepChange} />
      </PageContainer>
    </>
  );
};

KonfirmasiPengajuanBankJatim.getLayout = function getLayout(page) {
  return (
    <LayananKeuanganLayout active="/layanan-keuangan/bank-jatim">
      {page}
    </LayananKeuanganLayout>
  );
};

KonfirmasiPengajuanBankJatim.Auth = {
  action: "manage",
  subject: "Layanan Keuangan",
};

export default KonfirmasiPengajuanBankJatim;

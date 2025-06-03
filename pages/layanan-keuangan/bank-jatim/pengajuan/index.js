import LayananKeuanganLayout from "@/components/LayananKeuangan/LayananKeuanganLayout";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb, message } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import FormPengajuan from "@/components/LayananKeuangan/BankJatim/FormPengajuan";
import { useState } from "react";

const PengajuanBankJatim = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  const handleStepChange = (step) => {
    setCurrentStep(step);
    console.log(`Current step: ${step}`);

    // Redirect ke halaman data-pinjaman saat klik "Selanjutnya" dari step 1
    if (step === 2) {
      message.success("Data pegawai telah dikonfirmasi!");
      setTimeout(() => {
        router.push("/layanan-keuangan/bank-jatim/pengajuan/data-pinjaman");
      }, 1000);
    }
  };

  return (
    <>
      <Head>
        <title>Pengajuan Kredit - Bank Jatim</title>
      </Head>
      <PageContainer
        onBack={() => router.back()}
        title="Pengajuan Kredit"
        subTitle="Bank Jatim - Step 1"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/layanan-keuangan/bank-jatim">Dashboard</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Pengajuan Kredit</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <FormPengajuan step={currentStep} onStepChange={handleStepChange} />
      </PageContainer>
    </>
  );
};

PengajuanBankJatim.getLayout = function getLayout(page) {
  return (
    <LayananKeuanganLayout active="/layanan-keuangan/bank-jatim">
      {page}
    </LayananKeuanganLayout>
  );
};

PengajuanBankJatim.Auth = {
  action: "manage",
  subject: "Layanan Keuangan",
};

export default PengajuanBankJatim;

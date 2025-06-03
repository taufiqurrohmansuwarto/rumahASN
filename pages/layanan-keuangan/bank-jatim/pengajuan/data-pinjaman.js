import LayananKeuanganLayout from "@/components/LayananKeuangan/LayananKeuanganLayout";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb, message } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import FormPengajuan from "@/components/LayananKeuangan/BankJatim/FormPengajuan";

const DataPinjamanBankJatim = () => {
  const router = useRouter();

  const handleStepChange = (step) => {
    console.log(`Step changed to: ${step}`);

    // Jika berhasil submit dari step 2, redirect ke konfirmasi
    if (step === 3) {
      message.success("Data pinjaman berhasil disimpan!");
      setTimeout(() => {
        router.push("/layanan-keuangan/bank-jatim/pengajuan/konfirmasi");
      }, 1000);
    }
  };

  return (
    <>
      <Head>
        <title>Data Pinjaman - Bank Jatim</title>
      </Head>
      <PageContainer
        onBack={() => router.back()}
        title="Data Pinjaman"
        subTitle="Bank Jatim - Step 2"
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
              <Breadcrumb.Item>Data Pinjaman</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <FormPengajuan step={2} onStepChange={handleStepChange} />
      </PageContainer>
    </>
  );
};

DataPinjamanBankJatim.getLayout = function getLayout(page) {
  return (
    <LayananKeuanganLayout active="/layanan-keuangan/bank-jatim">
      {page}
    </LayananKeuanganLayout>
  );
};

DataPinjamanBankJatim.Auth = {
  action: "manage",
  subject: "Layanan Keuangan",
};

export default DataPinjamanBankJatim;

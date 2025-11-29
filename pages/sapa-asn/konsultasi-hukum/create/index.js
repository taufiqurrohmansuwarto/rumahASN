import PageContainer from "@/components/PageContainer";
import FormKonsultasiHukum from "@/components/SapaASN/KonsultasiHukum/FormKonsultasiHukum";
import SapaASNLayout from "@/components/SapaASN/SapaASNLayout";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { createKonsultasiHukum } from "@/services/sapa-asn.services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Breadcrumb, FloatButton, message } from "antd";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const CreateKonsultasiHukum = () => {
  useScrollRestoration();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  // Fetch user info from session
  const userInfo = {
    name: session?.user?.name,
    nip: session?.user?.nip,
    jabatan: session?.user?.jabatan,
    perangkatDaerah: session?.user?.perangkat_daerah?.detail,
  };

  // Submit mutation
  const { mutateAsync: submitKonsultasi, isLoading: submitLoading } =
    useMutation({
      mutationFn: createKonsultasiHukum,
      onSuccess: () => {
        message.success("Konsultasi hukum berhasil dikirim");
        queryClient.invalidateQueries(["konsultasi-hukum"]);
      },
      onError: (error) => {
        message.error(
          error?.response?.data?.message || "Gagal mengirim konsultasi"
        );
      },
    });

  const handleSubmit = async (values) => {
    // Convert to FormData for file upload
    const formData = new FormData();
    formData.append("no_hp", values.noHp);
    formData.append("email", values.email);
    formData.append(
      "jenis_permasalahan",
      JSON.stringify(values.jenisPermasalahan || [])
    );
    if (values.jenisPermasalahanLainnya) {
      formData.append("jenis_permasalahan_lainnya", values.jenisPermasalahanLainnya);
    }
    formData.append("ringkasan_permasalahan", values.ringkasan);
    formData.append("is_persetujuan", values.persetujuan ? "true" : "false");

    // Append files
    if (values.lampiran?.fileList) {
      values.lampiran.fileList.forEach((file) => {
        formData.append("lampiran", file.originFileObj);
      });
    }

    await submitKonsultasi(formData);
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - Form Pengajuan Konsultasi Hukum</title>
      </Head>
      <PageContainer
        title="Form Pengajuan Layanan Konsultasi Hukum"
        onBack={() => router.back()}
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/sapa-asn/dashboard">Sapa ASN</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href="/sapa-asn/konsultasi-hukum">Konsultasi Hukum</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Form Pengajuan</Breadcrumb.Item>
          </Breadcrumb>
        )}
      >
        <FormKonsultasiHukum
          user={userInfo}
          loading={false}
          onSubmit={handleSubmit}
          submitLoading={submitLoading}
        />
        <FloatButton.BackTop />
      </PageContainer>
    </>
  );
};

CreateKonsultasiHukum.getLayout = (page) => (
  <SapaASNLayout active="/sapa-asn/konsultasi-hukum">{page}</SapaASNLayout>
);

CreateKonsultasiHukum.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default CreateKonsultasiHukum;

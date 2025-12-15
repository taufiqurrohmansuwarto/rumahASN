import PageContainer from "@/components/PageContainer";
import FormPendampinganHukum from "@/components/SapaASN/PendampinganHukum/FormPendampinganHukum";
import SapaASNLayout from "@/components/SapaASN/SapaASNLayout";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { createPendampinganHukum, getProfile } from "@/services/sapa-asn.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Breadcrumb, FloatButton, message } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const CreatePendampinganHukum = () => {
  useScrollRestoration();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["sapa-asn-profile"],
    queryFn: getProfile,
  });

  // Map profile to user info
  const userInfo = {
    image: profile?.image,
    name: profile?.nama,
    nip: profile?.nip,
    jabatan: profile?.jabatan,
    perangkatDaerah: profile?.perangkat_daerah,
    statusKepegawaian: profile?.status_kepegawaian,
    noHp: profile?.no_hp,
    email: profile?.email,
  };

  // Submit mutation
  const { mutateAsync: submitPendampingan, isLoading: submitLoading } =
    useMutation({
      mutationFn: createPendampinganHukum,
      onSuccess: () => {
        message.success("Permohonan pendampingan hukum berhasil dikirim");
        queryClient.invalidateQueries(["pendampingan-hukum"]);
      },
      onError: (error) => {
        message.error(
          error?.response?.data?.message || "Gagal mengirim permohonan"
        );
      },
    });

  const handleSubmit = async (values) => {
    // Convert to FormData for file upload
    const formData = new FormData();
    formData.append("no_hp", values.noHp);
    formData.append("email", values.email);
    if (values.noPerkara) {
      formData.append("no_perkara", values.noPerkara);
    }
    formData.append("jenis_perkara", JSON.stringify(values.jenisPerkara ? [values.jenisPerkara] : []));
    if (values.jenisPerkaraLainnya) {
      formData.append("jenis_perkara_lainnya", values.jenisPerkaraLainnya);
    }
    if (values.tempatPengadilan) {
      formData.append("tempat_pengadilan", values.tempatPengadilan);
    }
    if (values.jadwalPengadilan) {
      formData.append("jadwal_pengadilan", values.jadwalPengadilan);
    }
    formData.append("ringkasan_perkara", values.ringkasan_perkara);
    formData.append(
      "bentuk_pendampingan",
      JSON.stringify(values.bentukPendampingan || [])
    );
    if (values.bentukPendampinganLainnya) {
      formData.append(
        "bentuk_pendampingan_lainnya",
        values.bentukPendampinganLainnya
      );
    }
    formData.append("is_persetujuan", values.persetujuan ? "true" : "false");

    // Append files
    if (values.lampiran?.fileList) {
      values.lampiran.fileList.forEach((file) => {
        formData.append("lampiran", file.originFileObj);
      });
    }

    await submitPendampingan(formData);
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - Form Pengajuan Pendampingan Hukum</title>
      </Head>
      <PageContainer
        title="Form Pengajuan Layanan Pendampingan Hukum"
        onBack={() => router.back()}
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/sapa-asn/dashboard">Sapa ASN</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href="/sapa-asn/pendampingan-hukum">Pendampingan Hukum</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Form Pengajuan</Breadcrumb.Item>
          </Breadcrumb>
        )}
      >
        <FormPendampinganHukum
          user={userInfo}
          loading={profileLoading}
          onSubmit={handleSubmit}
          submitLoading={submitLoading}
        />
        <FloatButton.BackTop />
      </PageContainer>
    </>
  );
};

CreatePendampinganHukum.getLayout = (page) => (
  <SapaASNLayout active="/sapa-asn/pendampingan-hukum">{page}</SapaASNLayout>
);

CreatePendampinganHukum.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default CreatePendampinganHukum;

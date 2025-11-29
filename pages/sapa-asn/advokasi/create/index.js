import PageContainer from "@/components/PageContainer";
import FormAdvokasi from "@/components/SapaASN/Advokasi/FormAdvokasi";
import SapaASNLayout from "@/components/SapaASN/SapaASNLayout";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import {
  createAdvokasi,
  getJadwalAdvokasi,
} from "@/services/sapa-asn.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Breadcrumb, FloatButton, message } from "antd";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const CreateAdvokasi = () => {
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

  // Fetch jadwal
  const { data: jadwalData, isLoading: jadwalLoading } = useQuery({
    queryKey: ["advokasi-jadwal"],
    queryFn: getJadwalAdvokasi,
  });

  // Submit mutation
  const { mutateAsync: submitAdvokasi, isLoading: submitLoading } = useMutation(
    {
      mutationFn: createAdvokasi,
      onSuccess: () => {
        message.success("Permohonan advokasi berhasil dikirim");
        queryClient.invalidateQueries(["advokasi"]);
      },
      onError: (error) => {
        message.error(error?.response?.data?.message || "Gagal mengirim permohonan");
      },
    }
  );

  const handleSubmit = async (values) => {
    // Map values to DB column names
    const payload = {
      no_hp: values.noHp,
      email: values.email,
      kategori_isu: values.kategori || [],
      kategori_lainnya: values.kategoriLainnya || null,
      sensitif: values.sensitif === "ya",
      poin_konsultasi: values.poinKonsultasi || null,
      jadwal_id: values.jadwal,
      is_persetujuan: values.persetujuan || false,
    };
    await submitAdvokasi(payload);
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - Form Pengajuan Advokasi</title>
      </Head>
      <PageContainer
        title="Form Pengajuan Layanan Advokasi"
        onBack={() => router.back()}
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/sapa-asn/dashboard">Sapa ASN</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href="/sapa-asn/advokasi">Pengaduan & Advokasi</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Form Pengajuan</Breadcrumb.Item>
          </Breadcrumb>
        )}
      >
        <FormAdvokasi
          user={userInfo}
          loading={false}
          jadwalData={jadwalData}
          jadwalLoading={jadwalLoading}
          onSubmit={handleSubmit}
          submitLoading={submitLoading}
        />
        <FloatButton.BackTop />
      </PageContainer>
    </>
  );
};

CreateAdvokasi.getLayout = (page) => (
  <SapaASNLayout active="/sapa-asn/advokasi">{page}</SapaASNLayout>
);

CreateAdvokasi.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default CreateAdvokasi;

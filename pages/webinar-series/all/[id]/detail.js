import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import DetailWebinarNew from "@/components/WebinarSeries/DetailWebinarBaru";
import {
  detailAllWebinar,
  registerWebinar,
  unregisterWebinar,
} from "@/services/webinar.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Breadcrumb, Grid, message } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

function Detail() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const id = router?.query?.id;
  const breakPoint = Grid.useBreakpoint();

  const { mutateAsync: register, isLoading: isLoadingRegister } = useMutation(
    (data) => registerWebinar(data),
    {
      onSuccess: () => {
        message.success("Berhasil mendaftar webinar");
      },
      onError: (error) => {
        message.error(error?.response?.data?.message);
      },
      onSettled: () => {
        queryClient.invalidateQueries(["webinar-series-all", id]);
      },
    }
  );

  const { mutateAsync: unregister, isLoading: isLoadingUnregister } =
    useMutation((data) => unregisterWebinar(data), {
      onSuccess: () => {
        message.success("Berhasil membatalkan pendaftaran webinar");
      },
      onError: (error) => {
        message.error(error?.response?.data?.message);
      },
      onSettled: () => {
        queryClient.invalidateQueries(["webinar-series-all", id]);
      },
    });

  const { data, isLoading } = useQuery(
    ["webinar-series-all", id],
    () => detailAllWebinar(id),
    {}
  );

  const handleBack = () => router.back();

  return (
    <>
      <Head>
        <title>Rumah ASN - Detail Webinar</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        loading={isLoading}
        onBack={handleBack}
        title="Detail Webinar Series"
        content="Webinar Series"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">
                  <a>Beranda</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/webinar-series/all">
                  <a>Daftar Semua Webinar</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/webinar-series/my-webinar">
                  <a>Webinar Saya</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Detail Webinar</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <DetailWebinarNew
          register={register}
          unregister={unregister}
          unregisterLoading={isLoadingUnregister}
          registerLoading={isLoadingRegister}
          data={data}
        />
      </PageContainer>
    </>
  );
}

Detail.getLayout = function getLayout(page) {
  return <Layout active="/webinar-series/all">{page}</Layout>;
};

Detail.Auth = {
  action: "manage",
  subject: "tickets",
};

export default Detail;

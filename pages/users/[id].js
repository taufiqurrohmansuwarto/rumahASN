import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { getProfile } from "@/services/index";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { Breadcrumb } from "antd";
import Link from "next/link";

const Users = () => {
  const router = useRouter();

  const { id } = router.query;

  const { data, isLoading } = useQuery(
    ["profile", id],
    () => getProfile(id),
    {}
  );

  const handleBack = () => {
    router.back();
  };

  return (
    <PageContainer
      loading={isLoading}
      onBack={handleBack}
      breadcrumbRender={() => (
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link href="/feeds">
              <a>Beranda</a>
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Detail User</Breadcrumb.Item>
        </Breadcrumb>
      )}
      title="User"
      subTitle="Detail User"
    >
      {JSON.stringify(data)}
    </PageContainer>
  );
};

Users.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

Users.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Users;

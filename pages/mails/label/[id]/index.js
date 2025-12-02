import GmailLayout from "@/components/GmailLayout";
import PageContainer from "@/components/PageContainer";
import EmailListComponent from "@/components/mail/EmailList/EmailListComponent";
import { useUserLabels } from "@/hooks/useEmails";
import { IconTag } from "@tabler/icons-react";
import { Breadcrumb, Grid } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const LabelPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const breakPoint = Grid.useBreakpoint();

  // Get label info
  const { data: labelsData } = useUserLabels();
  const label = labelsData?.data?.find((l) => l.id === id);

  if (!label) {
    return (
      <div style={{ padding: "24px" }}>
        <div>Label tidak ditemukan</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Rumah ASN - {label.name}</title>
      </Head>
      <PageContainer
        title={label.name}
        subTitle="Pesan dengan label ini"
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/feeds">Beranda</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href="/mails">Pesan Pribadi</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Label: {label.name}</Breadcrumb.Item>
          </Breadcrumb>
        )}
      >
        <EmailListComponent
          folder="label"
          onEmailClick={(email) => {
            router.push(`/mails/label/${id}/${email.id}`);
          }}
          customConfig={{
            title: label.name,
            subtitle: label.name,
            icon: <IconTag size={16} style={{ color: label.color }} />,
            primaryColor: label.color,
            labelId: id,
            emptyTitle: `Belum ada email dengan label "${label.name}"`,
            emptyDescription: "Email yang diberi label ini akan muncul di sini",
          }}
        />
      </PageContainer>
    </>
  );
};

LabelPage.getLayout = function getLayout(page) {
  return <GmailLayout active="/mails/label">{page}</GmailLayout>;
};

LabelPage.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default LabelPage;

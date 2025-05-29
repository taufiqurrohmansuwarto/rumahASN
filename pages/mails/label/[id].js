import GmailLayout from "@/components/GmailLayout";
import EmailListComponent from "@/components/mail/EmailList/EmailListComponent";
import { useUserLabels } from "@/hooks/useEmails";
import { TagOutlined } from "@ant-design/icons";
import Head from "next/head";
import { useRouter } from "next/router";

const LabelPage = () => {
  const router = useRouter();
  const { id } = router.query;

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
      <EmailListComponent
        folder="label"
        customConfig={{
          title: label.name,
          subtitle: label.name,
          icon: <TagOutlined style={{ color: label.color }} />,
          primaryColor: label.color,
          labelId: id, // Pass label ID untuk query
          emptyTitle: `Belum ada email dengan label "${label.name}"`,
          emptyDescription: "Email yang diberi label ini akan muncul di sini",
        }}
      />
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

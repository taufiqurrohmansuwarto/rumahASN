import PageContainer from "@/components/PageContainer";
import { getEvent } from "@/services/events.services";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";

function LayoutEvent({
  children,
  tabActiveKey = "detail",
  title = "Rumah ASN - Smart ASN Connect - Event",
}) {
  const router = useRouter();
  const id = router?.query?.eventId;
  const { data, isLoading } = useQuery(
    ["smart-asn-connect-events"],
    () => getEvent(id),
    {
      enabled: !!id,
    }
  );

  const handleBack = () => router.push("/fasilitator/smart-asn-connect/events");

  const handleChangeTabList = (key) => {
    router.push(
      `/fasilitator/smart-asn-connect/events/${router.query.eventId}/${key}`
    );
  };

  return (
    <>
      <PageContainer
        onBack={handleBack}
        title={title}
        content={data?.title}
        loading={isLoading}
        onTabChange={handleChangeTabList}
        tabActiveKey={tabActiveKey}
        tabList={[
          { label: "Detail", key: "detail" },
          { label: "Lokasi Kegiatan", key: "maps" },
          { label: "Peserta Pameran", key: "exhibitors" },
          { label: "Peserta", key: "participants" },
          { label: "Pesan", key: "messages" },
          { label: "Pembicara", key: "speakers" },
          { label: "Penyandang Dana", key: "sponsors" },
          { label: "Materi", key: "materials" },
        ]}
      />
      {children}
    </>
  );
}

export default LayoutEvent;

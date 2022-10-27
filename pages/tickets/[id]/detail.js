import { useRouter } from "next/router";
import Layout from "../../../src/components/Layout";
import PageContainer from "../../../src/components/PageContainer";
import { useQuery } from "@tanstack/react-query";
import { detailTicket } from "../../../services/users.services";
import ButtonFeedback from "../../../src/components/ButtonFeedback";
import ActiveLayout from "../../../src/components/ActiveLayout";

const DetailTicket = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data, isLoading } = useQuery(
    ["tickets", router.query.id],
    () => detailTicket(router.query.id),
    {
      enabled: !!router.query.id,
    }
  );

  return (
    <ActiveLayout active="detail" id={id} role="requester">
      {JSON.stringify(data)}
      <div>
        <ButtonFeedback id={id} />
      </div>
    </ActiveLayout>
  );
};

DetailTicket.Auth = {
  action: "manage",
  subject: "Tickets",
};

DetailTicket.getLayout = function (page) {
  return <Layout active={"/tickets"}>{page}</Layout>;
};

export default DetailTicket;

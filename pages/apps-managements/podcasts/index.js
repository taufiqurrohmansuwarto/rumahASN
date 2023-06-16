import Layout from "@/components/Layout";
import { getPodcast } from "@/services/index";
import { useQuery } from "@tanstack/react-query";

function Podcast() {
  const { data, isLoading } = useQuery(["podcasts"], () => getPodcast(), {});
  return <div>{JSON.stringify(data)}</div>;
}

Podcast.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

Podcast.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default Podcast;

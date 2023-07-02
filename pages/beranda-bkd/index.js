import Layout from "@/components/Layout";

const BerandaBKD = () => {
  return <div>Beranda BKD</div>;
};

MyWebinar.Auth = {
  action: "manage",
  subject: "tickets",
};

BerandaBKD.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

export default BerandaBKD;

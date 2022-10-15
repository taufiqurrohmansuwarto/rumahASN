// import dynamic components from ant design pro components statistic
const StatisticCard = dynamic(
  () => import("@ant-design/pro-components").then(mod => mod.StatisticCard),
  {
    ssr: false,
  }
);

export default StatisticCard;

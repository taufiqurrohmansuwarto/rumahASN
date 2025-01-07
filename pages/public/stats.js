import PerangkatDaerahStatistics from "@/components/Statistics/PerangkatDaerahStatistics";
import Head from "next/head";

function Stats() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Statistik</title>
      </Head>
      <PerangkatDaerahStatistics />
    </>
  );
}

export default Stats;

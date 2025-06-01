import BankJatimDetailLayanan from "../BankJatimDetailLayanan";

function BankJatimDetailLayananMultiguna() {
  const handleSimulasi = () => {
    console.log("Simulasi");
  };

  const handlePengajuan = () => {
    console.log("Pengajuan");
  };

  const handleCekStatus = () => {
    console.log("Cek Status");
  };

  return (
    <BankJatimDetailLayanan
      title="Kredit Multiguna"
      subtitle="Wujudkan Impian Multiguna Idaman Anda"
      category="Kredit Multiguna"
      description="Kredit Multiguna Bank Jatim memberikan kemudahan bagi Anda untuk memiliki kendaraan impian dengan suku bunga kompetitif dan tenor yang fleksibel. Dilengkapi dengan proses yang mudah dan cepat, serta berbagai keunggulan yang memberikan nilai lebih untuk nasabah. Dapatkan kendaraan idaman Anda dengan cicilan yang terjangkau dan proses approval yang cepat."
      features={[
        "Suku Bunga Kompetitif",
        "Tenor Hingga 25 Tahun",
        "DP Mulai 10%",
        "Proses Cepat",
        "Asuransi Jiwa & Kebakaran",
        "Take Over dari Bank Lain",
      ]}
      onSimulasi={handleSimulasi}
      onPengajuan={handlePengajuan}
      onCekStatus={handleCekStatus}
      imageUrl="/images/kpr-banner.jpg" // Optional: gambar banner
    />
  );
}

export default BankJatimDetailLayananMultiguna;

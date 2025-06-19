import BankJatimDetailLayanan from "../BankJatimDetailLayanan";

function BankJatimDetailLayananKPR() {
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
      title="Kredit Pemilikan Rumah (KPR)"
      subtitle="Wujudkan Impian Rumah Idaman Anda"
      category="Kredit Properti"
      description="Kredit Multiguna adalah fasilitas kredit yang diberikan kepada nasabah yang memiliki penghasilan maupun tunjungan tetap dan digunakan untuk memenuhi segala kebutuhan nasaba. Nasabah yang dapat menerima ini tidak hanya pegawai aktif namun juga tenaga kontrak hingga pensiunan termasuk janda/duda pensiuanan"
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
      imageUrl="https://siasn.bkd.jatimprov.go.id:9000/public/bankjatim-kpr.jpg" // Optional: gambar banner
    />
  );
}

export default BankJatimDetailLayananKPR;

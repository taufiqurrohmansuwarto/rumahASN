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
      description="KPR Bank Jatim adalah Kredit Pemilikan Rumah Bank Jatim yang diberikan kepada perorangan maupun non perorangan untuk pemilikan rumah tinggal atau apartemen atau ruko/rukan, baik melalui developer atau non developer"
      features={[
        "KPR",
        "KPR Top Up",
        "KPR Take Over",
        "KPR Take Over dan Top Up",
        "KPR Milia",
        "KPR Lelang",
        "KPR Renovasi/Pembangunan",
        "Kredit Konsumsi Beragun Properti",
      ]}
      keuntungan={[
        "Jangka waktu maksimal 20 tahun",
        "Suku bunga murah dan bervariasi",
        "Persyaratan mudah",
        "Dapat dilunasi sebagaian secara keseluruhan",
        "Program referral bagi nasabah Bank yang tidak memliki hubungan keluarga dengan pegawai Bank yang dapat mereferensikan realisasi KPR Bank Jatim dengan imbalan berupa reward hingga 1% dari plafond yang disetujui",
      ]}
      persyaratan={[
        "Warga Negara Indonesia",
        {
          title: "Persyaratan Pegawai",
          items: ["Telah menjadi pegawai tetap di perusahaan saat permohonan"],
        },
        {
          title: "Persyaratan Pegawai Swasta",
          items: [
            "Status telah menjadi pegawai tetap di perusahaan saat permohonan",
            "Masa kerja minimum 1 tahun (termasuk masa kerja sebelum diangkat menjadi pegawai tetap) di perusahaan yang sama saat ini",
          ],
        },
        {
          title: "Persyaratan Profesional",
          items: [
            "Memiliki pengalaman di bidang yang sama minimum 2 tahun berturut-turut, dibuktikan oleh ijin usaha/praktek atau surat kepengurusan perpanjangan ijin praktek",
            "Memiliki penghasilan yang dapat diverifikasi",
          ],
        },
        {
          title: "Persyaratan Wiraswasta",
          items: [
            "Usaha telah berjalan minimal 3 (tiga) tahun, dibuktikan dengan SPT Tahunan",
            "Memiliki tempat usaha sendiri",
          ],
        },
        {
          title: "Tenaga Alih Daya Bank, P3K dan Tenaga Kontrak",
          items: [
            "Berpenghasilan tetap dan payroll gaji melalui Bank Jatim",
            "Lama bekerja di perusahaan sama minimal 2 tahun",
          ],
        },
      ]}
      onSimulasi={handleSimulasi}
      onPengajuan={handlePengajuan}
      onCekStatus={handleCekStatus}
      imageUrl="https://siasn.bkd.jatimprov.go.id:9000/public/bankjatim-kpr.jpg" // Optional: gambar banner
    />
  );
}

export default BankJatimDetailLayananKPR;

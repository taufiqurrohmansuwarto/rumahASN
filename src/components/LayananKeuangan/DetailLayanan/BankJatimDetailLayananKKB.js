import BankJatimDetailLayanan from "../BankJatimDetailLayanan";

function BankJatimDetailLayananKKB() {
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
      title="Kredit Kendaraan Bermotor (KKB)"
      subtitle="Wujudkan Impian Kendaraan Idaman Anda"
      category="Kredit Kendaraan"
      keuntungan={[
        "Suku bunga kompetitif dan murah",
        "Keringanan suku bunga untuk KKB kendaraan listrik",
        "Angsuran Ringan dan Tetap - Bebas dari perubahan suku bunga",
        "Persyaratan mudah dan proses persetujuan cepat",
        "Praktis - Pembayaran angsuran autodebet dari rekening debitur di Bank",
        "Jaminan keamanan penyimpanan BPKB",
        "Uang muka minimal 0% atau sesuai ketentuan Bank Indonesia",
        "Program referral bagi nasabah Bank yang tidak memiliki hubungan keluarga dengan pegawai Bank yang dapat mereferensikan realisasi KKB Bank Jatim dengan imbalan berupa reward hingga 0,5% dari plafond yang disetujui",
      ]}
      persyaratan={[
        "Warga Negara Indonesia",
        {
          title: "Usia calon/debitur",
          items: [
            "Minimal 21 tahun atau telah menikah",
            "Maksimal 65 tahun pada saat akhir jangka waktu kredit",
          ],
        },
        "Calon/ debitur yang sudah pernah menerima fasilitas kredit maupun yang belum pernah menerima fasilitas kredit",
        "Tidak memiliki tunggakan kredit dan tidak terdaftar dalam daftar hitam nasional",
        {
          title: "Persyaratan Wiraswasta",
          items: [
            "Usaha telah berjalan minimal 3(tiga) tahun, dibuktikan dengan SPT Tahunan",
            "Memiliki tempat usaha sendiri",
          ],
        },
        {
          title: "Persyaratan Tenaga Alih Daya Bank, P3K dan Tenaga Kontrak",
          items: [
            "Berpenghasilan tetap dan payroll gaji melalui Bank Jatim",
            "Lama bekerja di perusahaan sama minimal 2 tahun",
          ],
        },
      ]}
      description="KKB Bank Jatim adalah kredit untuk mewujudkan kebutuhan akan kendaraan idaman masyarakat"
      features={[
        "KKB Financing",
        "KKB Refinancing - alternatif sumber dana untuk berbagai kebutuhan dengan menjaminkan BPKB kendaraan dimiliki dan diperoleh dari pembiayaan Bank Jatim",
        "KKB Kendaraan Listrik",
      ]}
      onSimulasi={handleSimulasi}
      onPengajuan={handlePengajuan}
      onCekStatus={handleCekStatus}
      imageUrl="https://siasn.bkd.jatimprov.go.id:9000/public/bankjatim-kkb.jpg" // Optional: gambar banner
    />
  );
}

export default BankJatimDetailLayananKKB;

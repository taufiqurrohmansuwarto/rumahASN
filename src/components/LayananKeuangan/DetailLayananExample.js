import React from "react";
import { message } from "antd";
import {
  CreditCardOutlined,
  HomeOutlined,
  CarOutlined,
  BookOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import BankJatimDetailLayanan from "./BankJatimDetailLayanan";

// Contoh penggunaan untuk KPR (Kredit Pemilikan Rumah)
export function DetailLayananKPR() {
  const handleSimulasi = () => {
    message.success("Membuka simulasi KPR...");
    // Logic untuk navigasi ke halaman simulasi
  };

  const handlePengajuan = () => {
    message.info("Membuka form pengajuan KPR...");
    // Logic untuk navigasi ke halaman pengajuan
  };

  const handleCekStatus = () => {
    message.info("Membuka halaman cek status...");
    // Logic untuk navigasi ke halaman cek status
  };

  return (
    <BankJatimDetailLayanan
      title="Kredit Pemilikan Rumah (KPR)"
      subtitle="Wujudkan Impian Rumah Idaman Anda"
      category="Kredit Properti"
      description="KPR Bank Jatim memberikan kemudahan bagi Anda untuk memiliki rumah impian dengan suku bunga kompetitif dan tenor yang fleksibel. Dilengkapi dengan proses yang mudah dan cepat, serta berbagai keunggulan yang memberikan nilai lebih untuk nasabah. Dapatkan rumah idaman Anda dengan cicilan yang terjangkau dan proses approval yang cepat."
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

// Contoh penggunaan untuk Kredit Kendaraan
export function DetailLayananKreditKendaraan() {
  const customActions = [
    {
      key: "simulasi",
      label: "Simulasi Kredit",
      icon: <CarOutlined />,
      description: "Hitung cicilan kendaraan impian Anda",
      onClick: () => message.success("Membuka kalkulator kredit kendaraan..."),
    },
    {
      key: "katalog",
      label: "Katalog Kendaraan",
      icon: <BookOutlined />,
      description: "Lihat daftar kendaraan yang tersedia",
      onClick: () => message.info("Membuka katalog kendaraan..."),
    },
    {
      key: "pengajuan",
      label: "Ajukan Kredit",
      icon: <CreditCardOutlined />,
      description: "Mulai proses pengajuan kredit",
      onClick: () => message.info("Membuka form pengajuan..."),
    },
    {
      key: "cek-status",
      label: "Cek Status",
      icon: <SafetyOutlined />,
      description: "Pantau status pengajuan Anda",
      onClick: () => message.info("Membuka status pengajuan..."),
    },
  ];

  return (
    <BankJatimDetailLayanan
      title="Kredit Kendaraan Bermotor"
      subtitle="Solusi Mudah Memiliki Kendaraan Impian"
      category="Kredit Kendaraan"
      description="Kredit kendaraan Bank Jatim hadir untuk mewujudkan impian Anda memiliki kendaraan bermotor dengan mudah dan terjangkau. Tersedia untuk mobil baru, mobil bekas, motor baru, dan motor bekas dengan proses yang simpel serta suku bunga yang bersaing. Nikmati kemudahan dalam berkendara dengan dukungan finansial terpercaya dari Bank Jatim."
      features={[
        "Bunga Rendah & Tetap",
        "DP Ringan Mulai 20%",
        "Tenor Fleksibel 1-7 Tahun",
        "Proses Approval Cepat",
        "Asuransi Comprehensive",
        "Mobil & Motor Baru/Bekas",
      ]}
      customActions={customActions}
    />
  );
}

// Contoh penggunaan untuk Tabungan
export function DetailLayananTabungan() {
  const handleSimulasi = () => {
    message.success("Membuka simulasi tabungan...");
  };

  const handleBukaRekening = () => {
    message.info("Membuka form pembukaan rekening...");
  };

  const handleInfoSyarat = () => {
    message.info("Menampilkan syarat & ketentuan...");
  };

  const customActions = [
    {
      key: "simulasi",
      label: "Simulasi Bunga",
      icon: <CreditCardOutlined />,
      description: "Hitung proyeksi bunga tabungan Anda",
      onClick: handleSimulasi,
    },
    {
      key: "buka-rekening",
      label: "Buka Rekening",
      icon: <HomeOutlined />,
      description: "Daftar pembukaan rekening baru",
      onClick: handleBukaRekening,
    },
    {
      key: "info-syarat",
      label: "Syarat & Ketentuan",
      icon: <BookOutlined />,
      description: "Lihat detail syarat pembukaan rekening",
      onClick: handleInfoSyarat,
    },
  ];

  return (
    <BankJatimDetailLayanan
      title="Tabungan Jatim Prima"
      subtitle="Tabungan dengan Bunga Menarik & Fitur Lengkap"
      category="Tabungan"
      description="Tabungan Jatim Prima adalah produk simpanan yang memberikan kemudahan transaksi dengan bunga yang kompetitif. Dilengkapi dengan fasilitas ATM yang luas, internet banking, mobile banking, dan berbagai kemudahan transaksi lainnya. Cocok untuk Anda yang ingin menyimpan dana dengan aman sambil mendapatkan keuntungan optimal."
      features={[
        "Bunga Kompetitif",
        "Gratis Biaya Admin",
        "ATM di Seluruh Indonesia",
        "Internet & Mobile Banking",
        "Setoran Awal Ringan",
        "Kartu ATM Chip",
      ]}
      customActions={customActions}
    />
  );
}

// Contoh penggunaan sederhana dengan props minimal
export function DetailLayananMinimal() {
  return (
    <BankJatimDetailLayanan
      title="Layanan Perbankan Digital"
      description="Nikmati kemudahan layanan perbankan digital Bank Jatim yang memungkinkan Anda melakukan berbagai transaksi kapan saja dan dimana saja."
      onSimulasi={() => message.info("Fitur simulasi")}
      onPengajuan={() => message.info("Form pengajuan")}
      onCekStatus={() => message.info("Cek status")}
    />
  );
}

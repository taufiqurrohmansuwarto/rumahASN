import { formatCurrency } from "@/utils/client-utils";
import { Descriptions, Divider } from "antd";
import { trim } from "lodash";
import AdministrasiByNip from "../Berkas/AdministrasiByNip";

function InformationDetail({ data }) {
  return (
    <>
      <Descriptions
        title="Personal Information"
        size="middle"
        column={3}
        layout="vertical"
        id="personal-information"
      >
        <Descriptions.Item label="Nama Lengkap">
          {trim(`${data?.gelarDepan} ${data?.nama} ${data?.gelarBelakang}`)}
        </Descriptions.Item>
        <Descriptions.Item label="Jenis Kelamin">
          {data?.jenisKelamin}
        </Descriptions.Item>
        <Descriptions.Item label="Tempat Lahir">
          {data?.tempatLahir}
        </Descriptions.Item>
        <Descriptions.Item label="Tanggal Lahir">
          {data?.tglLahir}
        </Descriptions.Item>
        <Descriptions.Item label="Agama">{data?.agama}</Descriptions.Item>
        <Descriptions.Item label="Status">
          {data?.statusPegawai}
        </Descriptions.Item>
        <Descriptions.Item label="Status Hidup">
          {data?.statusHidup}
        </Descriptions.Item>
        <Descriptions.Item label="NIK">{data?.nik}</Descriptions.Item>
        <Descriptions.Item label="NPWP">{data?.noNpwp}</Descriptions.Item>
        <Descriptions.Item label="BPJS">{data?.bpjs}</Descriptions.Item>
      </Descriptions>
      <Divider />
      <Descriptions
        title="Contact Information"
        size="middle"
        column={2}
        layout="vertical"
        id="contact-information"
      >
        <Descriptions.Item label="Alamat">{data?.alamat}</Descriptions.Item>
        <Descriptions.Item label="Email Pribadi">
          {data?.email}
        </Descriptions.Item>
        <Descriptions.Item label="Email Kantor">
          {data?.emailGov}
        </Descriptions.Item>
        <Descriptions.Item label="No. HP">{data?.noHp}</Descriptions.Item>
        <Descriptions.Item label="No. Telepon">
          {data?.noTelp}
        </Descriptions.Item>
      </Descriptions>
      <Divider />
      <Descriptions
        title="Professional Information"
        size="middle"
        column={2}
        layout="vertical"
        id="professional-information"
      >
        <Descriptions.Item label="NIP">{data?.nipBaru}</Descriptions.Item>
        <Descriptions.Item label="Nama Jabatan">
          {data?.jabatanNama}
        </Descriptions.Item>
        <Descriptions.Item label="Lokasi Kerja">
          {data?.lokasiKerja}
        </Descriptions.Item>
        <Descriptions.Item label="Instansi Induk">
          {data?.instansiIndukNama}
        </Descriptions.Item>
        <Descriptions.Item label="Unit Organisasi">
          {data?.unorNama}
        </Descriptions.Item>
        <Descriptions.Item label="Unit Organisasi Induk">
          {data?.unorIndukNama}
        </Descriptions.Item>
        <Descriptions.Item label="Jenis Pegawai">
          {data?.jenisPegawaiNama}
        </Descriptions.Item>
        <Descriptions.Item label="Pangkat">
          {data?.pangkatAkhir}
        </Descriptions.Item>
        <Descriptions.Item label="Pangkat Awal">
          {data?.pangkatAwal}
        </Descriptions.Item>
        <Descriptions.Item label="Gol. Awal/Akhir">
          {data?.golRuangAwal} - {data?.golRuangAkhir}
        </Descriptions.Item>
        <Descriptions.Item label="Masa Kerja">
          {data?.masaKerja}
        </Descriptions.Item>
        <Descriptions.Item label="Gaji Pokok">
          {formatCurrency(data?.gajiPokok)}
        </Descriptions.Item>
      </Descriptions>
      <Divider />
      <Descriptions
        title="Pendidikan"
        column={2}
        layout="vertical"
        id="pendidikan"
      >
        <Descriptions.Item label="Tingkat Pendidikan">
          {data?.tkPendidikanTerakhir}
        </Descriptions.Item>
        <Descriptions.Item label="Program Studi">
          {data?.pendidikanTerakhirNama}
        </Descriptions.Item>
        <Descriptions.Item label="Tahun Lulus">
          {data?.tahunLulus}
        </Descriptions.Item>
      </Descriptions>
      <Divider />
      <Descriptions title="Informasi ASN" column={2} layout="vertical" id="asn">
        <Descriptions.Item label="TMT CPNS">{data?.tmtCpns}</Descriptions.Item>
        <Descriptions.Item label="TMT PNS">{data?.tmtPns}</Descriptions.Item>
        <Descriptions.Item label="Kartu ASN">
          {data?.kartuAsn}
        </Descriptions.Item>
        <Descriptions.Item label="Status Kepegawaian">
          {data?.kedudukanPnsNama}
        </Descriptions.Item>
      </Descriptions>
      <Divider />
      <Descriptions
        title="Tambahan Informasi"
        column={2}
        layout="vertical"
        id="tambahan-informasi"
      >
        <Descriptions.Item label="Surat Keterangan Bebas Narkoba">
          {data?.noSuratKeteranganBebasNarkoba}
        </Descriptions.Item>
        <Descriptions.Item label="Tanggal Surat Keterangan Bebas Narkoba">
          {data?.tglSuratKeteranganBebasNarkoba}
        </Descriptions.Item>
        <Descriptions.Item label="SKCK">{data?.skck}</Descriptions.Item>
        <Descriptions.Item label="Tanggal SKCK">
          {data?.tglSkck}
        </Descriptions.Item>
      </Descriptions>
      <Divider />
      <Descriptions
        title="Dokumen Layanan"
        column={2}
        layout="vertical"
        id="dokumen-layanan"
      >
        <Descriptions.Item label="SK CPNS">
          {data?.nomorSkCpns} | {data?.tglSkCpns}
        </Descriptions.Item>
        <Descriptions.Item label="SK PNS">
          {data?.nomorSkPns} | {data?.tglSkPns}
        </Descriptions.Item>
      </Descriptions>

      <Divider orientation="left"> Administrasi </Divider>
      <AdministrasiByNip />
    </>
  );
}

export default InformationDetail;
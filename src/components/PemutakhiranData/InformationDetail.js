import { updateDataUtamaByNip } from "@/services/siasn-services";
import { formatCurrency } from "@/utils/client-utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Descriptions, Divider, Typography, message } from "antd";
import { trim } from "lodash";
import TextSensor from "../TextSensor";

function InformationDetail({ data }) {
  const queryClient = useQueryClient();

  const { mutate: updateData, isLoading } = useMutation(
    (data) => updateDataUtamaByNip(data),
    {
      onSuccess: (data) => {
        message.success(data?.message);
      },
      onError: (error) => {
        message.error(error?.message);
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: ["data-utama-siasn", data.nipBaru],
        });
      },
    }
  );

  const handleUpdateData = (email) => {
    const payload = {
      nip: data.nipBaru,
      data: {
        email,
      },
    };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      message.error("Email tidak valid");
      return;
    } else {
      updateData(payload);
    }
  };

  return (
    <>
      <Descriptions
        title="Informasi Pribadi"
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
          <TextSensor text={data?.tglLahir} />
        </Descriptions.Item>
        <Descriptions.Item label="Agama">{data?.agama}</Descriptions.Item>
        <Descriptions.Item label="Status">
          {data?.statusPegawai}
        </Descriptions.Item>
        <Descriptions.Item label="Status Hidup">
          {data?.statusHidup}
        </Descriptions.Item>
        <Descriptions.Item label="NIK">
          <TextSensor text={data?.nik} />
        </Descriptions.Item>
        <Descriptions.Item label="NPWP">
          <TextSensor text={data?.noNpwp} />
        </Descriptions.Item>
        <Descriptions.Item label="BPJS">
          <TextSensor text={data?.bpjs} />
        </Descriptions.Item>
      </Descriptions>
      <Divider />
      <Descriptions
        title="Informasi Kontak"
        size="middle"
        column={2}
        layout="vertical"
        id="contact-information"
      >
        <Descriptions.Item label="Alamat">{data?.alamat}</Descriptions.Item>
        <Descriptions.Item label="Email Pribadi">
          <Typography.Text
            editable={{
              onChange: (value) => handleUpdateData(value),
            }}
          >
            {data?.email}
          </Typography.Text>
        </Descriptions.Item>
        <Descriptions.Item label="Email Kantor">
          <TextSensor text={data?.emailGov} />
        </Descriptions.Item>
        <Descriptions.Item label="No. HP">
          <TextSensor text={data?.noHp} />
        </Descriptions.Item>
        <Descriptions.Item label="No. Telepon">
          <TextSensor text={data?.noTelp} />
        </Descriptions.Item>
      </Descriptions>
      <Divider />
      <Descriptions
        title="Informasi Professional"
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
    </>
  );
}

export default InformationDetail;

import { getUserInformation } from "@/services/index";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { Alert, Grid } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Skeleton, Space, Tooltip } from "antd";

const getUsername = (data) => {
  if (data?.group === "GOOGLE") {
    return `${data?.info?.gelar_depan} ${data?.info?.username} ${data?.info?.gelar_belakang}`;
  } else {
    return data?.username;
  }
};

const getEmployeeNumber = (data) => {
  if (data?.group === "GOOGLE") {
    return data?.info?.employee_number;
  } else {
    return data?.employee_number;
  }
};

const getJabatan = (data) => data?.info?.jabatan?.jabatan;
const getEmail = (data) => data?.email;
const getPerangkatDaerah = (data) => data?.info?.perangkat_daerah?.detail;
const getCaraMasuk = (data) => {
  if (data?.group === "GOOGLE") {
    return "Google";
  } else if (data?.group === "MASTER") {
    return "Aplikasi SIMASTER";
  } else if (data?.group === "PTTPK") {
    return "Aplikasi PTTPK";
  }
};

function UserInfo() {
  const { data: information, isLoading } = useQuery(
    ["user-information"],
    () => getUserInformation(),
    {}
  );

  const kataKataToltip = (data) => {
    if (data?.group === "GOOGLE") {
      return "Cek Kembali data yang ada pada informasi pengiriman sertifikat ini, jika ada kesalahan anda bisa mengubah dengan menekan tombol Edit Informasi";
    } else if (data?.group === "MASTER") {
      return "Cek Kembali data yang ada pada informasi pengiriman sertifikat ini, jika ada kesalahan anda bisa mengubah pada aplikasi SIMASTER. Kemudian masuk kembali ke Rumah ASN";
    } else if (data?.group === "PTTPK") {
      return "Cek Kembali data yang ada pada informasi pengiriman sertifikat ini, jika ada kesalahan anda bisa mengubah pada aplikasi PTTPK. Kemudian masuk kembali ke Rumah ASN";
    }
  };

  return (
    <Skeleton loading={isLoading}>
      <Tooltip
        placement="leftTop"
        arrowPointAtCenter
        title={kataKataToltip(information)}
      >
        <Alert
          variant="light"
          color="blue"
          title={
            <div>
              <Space>
                Informasi Pengiriman Sertifikat{" "}
                <QuestionCircleOutlined
                  color="black"
                  style={{
                    backgroundColor: "white",
                  }}
                />{" "}
              </Space>
            </div>
          }
        >
          <Grid>
            <Grid.Col span={3}>Nama</Grid.Col>
            <Grid.Col span={7}>{getUsername(information)}</Grid.Col>
          </Grid>
          <Grid>
            <Grid.Col span={3}>Nomer Pegawai</Grid.Col>
            <Grid.Col span={7}>{getEmployeeNumber(information)}</Grid.Col>
          </Grid>
          <Grid>
            <Grid.Col span={3}>Email</Grid.Col>
            <Grid.Col span={7}>{getEmail(information)}</Grid.Col>
          </Grid>
          <Grid>
            <Grid.Col span={3}>Perangkat Daerah</Grid.Col>
            <Grid.Col span={7}>{getPerangkatDaerah(information)}</Grid.Col>
          </Grid>
          <Grid>
            <Grid.Col span={3}>Jabatan</Grid.Col>
            <Grid.Col span={7}>{getJabatan(information)}</Grid.Col>
          </Grid>
          <Grid>
            <Grid.Col span={3}>Cara Masuk</Grid.Col>
            <Grid.Col span={7}>{getCaraMasuk(information)}</Grid.Col>
          </Grid>
        </Alert>
      </Tooltip>
    </Skeleton>
  );
}

export default UserInfo;

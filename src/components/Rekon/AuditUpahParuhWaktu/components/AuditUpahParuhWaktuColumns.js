import AvatarUser from "@/components/Users/AvatarUser";
import UserText from "@/components/Users/UserText";
import { Badge, Text } from "@mantine/core";
import { Space, Tooltip } from "antd";
import { IconWorld, IconBuildingHospital, IconMapPin } from "@tabler/icons-react";
import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
import { formatCurrency, getGajiChange } from "../utils/helpers";

dayjs.extend(relativeTime);
dayjs.locale("id");

const AuditUpahParuhWaktuColumns = () => {
  return [
    {
      title: "Operator",
      key: "operator",
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <AvatarUser
            src={record.user?.image}
            userId={record.user?.custom_id}
            user={record.user}
            size={36}
          />
          <div style={{ lineHeight: "1.1" }}>
            <div>
              <UserText
                userId={record.user?.custom_id}
                text={record.user?.username || "-"}
              />
            </div>
            {record.user?.nama_jabatan && (
              <div style={{ marginTop: "2px" }}>
                <Text size="10px" c="dimmed">
                  {record.user.nama_jabatan}
                </Text>
              </div>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: "Pegawai",
      key: "pegawai",
      width: 200,
      render: (_, record) => (
        <div style={{ lineHeight: "1.1" }}>
          <div>
            <Text fw={600} size="xs">
              {record.detail?.nama || "-"}
            </Text>
          </div>
          {record.detail?.nip && (
            <div style={{ marginTop: "2px" }}>
              <Text size="10px" c="dimmed">
                {record.detail.nip}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Perubahan Gaji",
      key: "gaji",
      width: 180,
      render: (_, record) => {
        const oldGaji = record.old_data?.gaji || "0";
        const newGaji = record.new_data?.gaji || "0";
        const change = getGajiChange(oldGaji, newGaji);

        return (
          <div style={{ lineHeight: "1.1" }}>
            <div>
              <Text size="xs" c="dimmed">
                Dari: {formatCurrency(oldGaji)}
              </Text>
            </div>
            <div style={{ marginTop: "4px" }}>
              <Text size="xs" fw={600}>
                Ke: {formatCurrency(newGaji)}
              </Text>
            </div>
            {change.value !== 0 && (
              <div style={{ marginTop: "4px" }}>
                <Badge
                  color={change.color}
                  size="sm"
                  variant="light"
                  styles={{
                    root: { marginTop: "2px" },
                  }}
                >
                  {change.value > 0 ? "+" : "-"}
                  {formatCurrency(change.value.toString())}
                </Badge>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Perubahan Unit Kerja PK",
      key: "unor_pk",
      width: 250,
      render: (_, record) => {
        const oldUnor = record.old_data?.unor_pk_text || "-";
        const newUnor = record.new_data?.unor_pk_text || "-";
        const hasChange = oldUnor !== newUnor;

        return (
          <div style={{ lineHeight: "1.1" }}>
            <div>
              <Text size="xs" c="dimmed">
                Dari: {oldUnor}
              </Text>
            </div>
            <div style={{ marginTop: "4px" }}>
              <Text size="xs" fw={600}>
                Ke: {newUnor}
              </Text>
            </div>
            {hasChange && (
              <div style={{ marginTop: "4px" }}>
                <Badge
                  color="blue"
                  size="sm"
                  variant="light"
                  styles={{
                    root: { marginTop: "2px" },
                  }}
                >
                  Berubah
                </Badge>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "BLUD",
      key: "is_blud",
      width: 100,
      align: "center",
      render: (_, record) => {
        const oldBlud = record.old_data?.is_blud;
        const newBlud = record.new_data?.is_blud;
        const hasChange = oldBlud !== newBlud;

        return (
          <div style={{ lineHeight: "1.1" }}>
            <div>
              <Text size="xs" c="dimmed">
                Dari: {oldBlud ? "Ya" : "Tidak"}
              </Text>
            </div>
            <div style={{ marginTop: "4px" }}>
              <Text size="xs" fw={600}>
                Ke: {newBlud ? "Ya" : "Tidak"}
              </Text>
            </div>
            {hasChange && (
              <div style={{ marginTop: "4px" }}>
                <Badge
                  color="blue"
                  size="sm"
                  variant="light"
                  leftSection={
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <IconBuildingHospital size={10} />
                    </div>
                  }
                  styles={{
                    root: { marginTop: "2px" },
                    section: { display: "flex", alignItems: "center" },
                    label: { display: "flex", alignItems: "center" },
                  }}
                >
                  Berubah
                </Badge>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Luar PD",
      key: "luar_perangkat_daerah",
      width: 110,
      align: "center",
      render: (_, record) => {
        const oldLuarPD = record.old_data?.luar_perangkat_daerah;
        const newLuarPD = record.new_data?.luar_perangkat_daerah;
        const hasChange = oldLuarPD !== newLuarPD;

        return (
          <div style={{ lineHeight: "1.1" }}>
            <div>
              <Text size="xs" c="dimmed">
                Dari: {oldLuarPD ? "Ya" : "Tidak"}
              </Text>
            </div>
            <div style={{ marginTop: "4px" }}>
              <Text size="xs" fw={600}>
                Ke: {newLuarPD ? "Ya" : "Tidak"}
              </Text>
            </div>
            {hasChange && (
              <div style={{ marginTop: "4px" }}>
                <Badge
                  color="teal"
                  size="sm"
                  variant="light"
                  leftSection={
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <IconMapPin size={10} />
                    </div>
                  }
                  styles={{
                    root: { marginTop: "2px" },
                    section: { display: "flex", alignItems: "center" },
                    label: { display: "flex", alignItems: "center" },
                  }}
                >
                  Berubah
                </Badge>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "IP Address",
      dataIndex: "ip_address",
      key: "ip_address",
      width: 140,
      render: (ip) => {
        const isLocalhost =
          ip && (ip.includes("127.0.0.1") || ip.includes("::ffff:127.0.0.1"));
        return (
          <Badge
            color={isLocalhost ? "orange" : "blue"}
            size="sm"
            variant="outline"
            leftSection={
              <div style={{ display: "flex", alignItems: "center" }}>
                <IconWorld size={12} />
              </div>
            }
            styles={{
              section: { display: "flex", alignItems: "center" },
              label: { display: "flex", alignItems: "center" },
            }}
          >
            {isLocalhost ? "LOCALHOST" : ip || "N/A"}
          </Badge>
        );
      },
    },
    {
      title: "Waktu",
      dataIndex: "change_at",
      key: "change_at",
      width: 120,
      render: (text) => (
        <Tooltip title={dayjs(text).format("DD MMMM YYYY, HH:mm:ss")}>
          <div style={{ lineHeight: "1.1", cursor: "pointer" }}>
            <Text size="xs">{dayjs(text).format("DD/MM/YY")}</Text>
            <div style={{ marginTop: "2px" }}>
              <Text size="10px" c="dimmed">
                {dayjs(text).format("HH:mm")}
              </Text>
            </div>
            <div style={{ marginTop: "2px" }}>
              <Text size="10px" c="dimmed">
                {dayjs(text).fromNow()}
              </Text>
            </div>
          </div>
        </Tooltip>
      ),
    },
  ];
};

export default AuditUpahParuhWaktuColumns;


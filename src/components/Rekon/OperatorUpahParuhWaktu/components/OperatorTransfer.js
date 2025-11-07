import { TeamOutlined } from "@ant-design/icons";
import { Text } from "@mantine/core";
import { Transfer } from "antd";
import { renderTransferItem } from "./TransferItem";

export const OperatorTransfer = ({
  transferData,
  targetKeys,
  isLoadingUnorFasilitator,
  isLoadingOperatorGajiPW,
  isAddingOperator,
  isDeletingOperator,
  onTransferChange,
}) => {
  return (
    <div style={{ marginTop: "16px", width: "100%" }}>
      <Transfer
        dataSource={transferData}
        titles={["Daftar Fasilitator", "Operator Aktif"]}
        targetKeys={targetKeys}
        onChange={onTransferChange}
        render={renderTransferItem}
        listStyle={{
          width: "100%",
          height: 500,
        }}
        style={{ width: "100%" }}
        operations={["Tambah", "Hapus"]}
        showSearch
        filterOption={(inputValue, item) =>
          item.title
            ?.toLowerCase()
            .includes(inputValue.toLowerCase()) ||
          item.description
            ?.toLowerCase()
            .includes(inputValue.toLowerCase()) ||
          item.nama?.toLowerCase().includes(inputValue.toLowerCase())
        }
        loading={isLoadingUnorFasilitator || isLoadingOperatorGajiPW}
        disabled={isAddingOperator || isDeletingOperator}
        locale={{
          itemUnit: "fasilitator",
          itemsUnit: "fasilitator",
          searchPlaceholder: "Cari fasilitator...",
          notFoundContent: (
            <div style={{ padding: "40px", textAlign: "center" }}>
              <Text size="sm" c="dimmed">
                Tidak ada data
              </Text>
            </div>
          ),
        }}
      />
    </div>
  );
};


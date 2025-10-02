import React, { memo } from "react";
import { Button, Flex } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Text as MantineText } from "@mantine/core";
import SignerItem from "./SignerItem";

function SignersList({ signers, onAdd, onUpdate, onRemove, totalPages = 1 }) {
  return (
    <div>
      <Flex justify="space-between" align="center" style={{ marginBottom: 6 }}>
        <MantineText style={{ fontSize: 14, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>
          Daftar Penandatangan
        </MantineText>
        <Button
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          onClick={onAdd}
          style={{
            background: "#FF4500",
            borderColor: "#FF4500",
            borderRadius: 6,
            fontWeight: 500
          }}
        >
          Tambah
        </Button>
      </Flex>

      <div style={{ padding: "16px", background: "#f0f5ff", borderRadius: "8px", border: "1px solid #adc6ff" }}>
        {signers.length === 0 ? (
          <Flex justify="center" style={{ padding: "32px 0" }}>
            <MantineText c="dimmed" size="sm">
              Belum ada penandatangan. Klik "Tambah" untuk menambahkan.
            </MantineText>
          </Flex>
        ) : (
          <Flex vertical gap="middle">
            {signers.map((signer, index) => (
              <SignerItem
                key={signer.id}
                signer={signer}
                index={index}
                onUpdate={onUpdate}
                onRemove={onRemove}
                totalPages={totalPages}
              />
            ))}
          </Flex>
        )}
      </div>
    </div>
  );
}

export default memo(SignersList);
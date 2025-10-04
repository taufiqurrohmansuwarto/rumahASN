import { Space, Modal, Radio } from "antd";
import { memo, useMemo, useRef, useState } from "react";
import {
  Card,
  Badge,
  Group,
  Text,
  Stack,
  ActionIcon,
  Button,
  Avatar,
  Paper,
  Divider,
} from "@mantine/core";
import {
  IconFileText,
  IconMapPin,
  IconTrash,
  IconUserPlus,
} from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import PdfViewer from "./PdfViewer";
import SignerSelector from "./SignerSelector";
import useSignatureStore from "@/store/useSignatureStore";
import { getSignatureCountByPage } from "@/utils/signature-coordinate-helper";

function SignaturePlacementForm({
  pdfBase64,
  initialMode = "self",
  onModeChange,
  onSignersChange, // ADD THIS PROP
  initialSignatures = [],
  canEdit = true,
}) {
  const { data: session } = useSession();
  const user = session?.user;

  const [mode, setMode] = useState(initialMode);
  const [signers, setSigners] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [activeSigner, setActiveSigner] = useState(null);
  const [showSignerSelector, setShowSignerSelector] = useState(false);

  const signCoordinates = useSignatureStore((state) => state.signCoordinates);
  const clearSignCoordinates = useSignatureStore(
    (state) => state.clearSignCoordinates
  );
  const pdfViewerRef = useRef(null);

  const currentSignerInfo = useMemo(() => {
    if (mode === "self") {
      return {
        id: user?.id || "self",
        name: user?.name || "Saya",
        image: user?.image,
        type: "signer",
      };
    } else if (activeSigner) {
      return activeSigner;
    }
    return null;
  }, [mode, user, activeSigner]);

  const signaturesBySigner = useMemo(() => {
    const grouped = {};
    signCoordinates.forEach((coord) => {
      const signerId = coord.signerId || "self";
      if (!grouped[signerId]) {
        grouped[signerId] = [];
      }
      grouped[signerId].push(coord);
    });
    return grouped;
  }, [signCoordinates]);

  const currentSignerSignatures = useMemo(() => {
    if (!currentSignerInfo) return [];
    return signaturesBySigner[currentSignerInfo.id] || [];
  }, [currentSignerInfo, signaturesBySigner]);

  const signatureCounts = useMemo(() => {
    const sigs = currentSignerSignatures.map((coord, idx) => ({
      id: `sig_${idx}`,
      page: coord.page,
    }));
    return getSignatureCountByPage(sigs);
  }, [currentSignerSignatures]);

  const totalCount = currentSignerSignatures.length;

  // Combine all participants (signers + reviewers) in sequence order
  const allParticipants = useMemo(() => {
    const combined = [
      ...signers.map((s) => ({
        ...s,
        type: "signer",
        sequence: s.sequence_order || signers.indexOf(s) + 1,
      })),
      ...reviewers.map((r) => ({
        ...r,
        type: "reviewer",
        sequence: r.sequence_order || signers.length + reviewers.indexOf(r) + 1,
      })),
    ];
    // Sort by sequence_order to maintain original order
    return combined.sort((a, b) => a.sequence - b.sequence);
  }, [signers, reviewers]);

  const handleModeChange = (e) => {
    const newMode = e.target.value;

    Modal.confirm({
      title: "Ganti Mode",
      content:
        "Mengganti mode akan menghapus semua data TTE dan peserta. Lanjutkan?",
      okText: "Ya, Ganti",
      cancelText: "Batal",
      onOk: () => {
        // Clear all TTE from PdfViewer
        if (pdfViewerRef.current) {
          pdfViewerRef.current.clearAllSignatures();
        }

        // Clear Zustand store
        clearSignCoordinates();

        // Reset local states
        setMode(newMode);
        setSigners([]);
        setReviewers([]);
        setActiveSigner(null);

        // Notify parent about empty signers
        if (onSignersChange) {
          onSignersChange([]);
        }

        if (onModeChange) {
          onModeChange(newMode);
        }

        if (newMode === "request") {
          setShowSignerSelector(true);
        }
      },
    });
  };

  const handleSaveSigners = ({
    signers: newSigners,
    reviewers: newReviewers,
  }) => {
    setSigners(newSigners);
    setReviewers(newReviewers);

    if (newSigners.length > 0) {
      setActiveSigner(newSigners[0]);
    } else {
      setActiveSigner(null);
    }

    // ADD THIS: Notify parent about signers change
    if (onSignersChange) {
      const formattedSigners = newSigners.map((s, idx) => ({
        user_id: s.id,
        name: s.name,
        image: s.image,
        role_type: "signer",
        sequence_order: idx + 1,
      }));
      const formattedReviewers = newReviewers.map((r, idx) => ({
        user_id: r.id,
        name: r.name,
        image: r.image,
        role_type: "reviewer",
        sequence_order: newSigners.length + idx + 1,
      }));
      onSignersChange([...formattedSigners, ...formattedReviewers]);
    }
  };

  const handleRemovePerson = (personId, personType) => {
    Modal.confirm({
      title: "Hapus dari Daftar",
      content: "TTE yang sudah ditempatkan akan ikut terhapus. Lanjutkan?",
      okText: "Hapus",
      cancelText: "Batal",
      okButtonProps: { danger: true },
      onOk: () => {
        if (personType === "signer") {
          setSigners((prev) => {
            const newSigners = prev.filter((s) => s.id !== personId);
            // Notify parent
            if (onSignersChange) {
              const formattedSigners = newSigners.map((s, idx) => ({
                user_id: s.id,
                name: s.name,
                image: s.image,
                role_type: "signer",
                sequence_order: idx + 1,
              }));
              const formattedReviewers = reviewers.map((r, idx) => ({
                user_id: r.id,
                name: r.name,
                image: r.image,
                role_type: "reviewer",
                sequence_order: newSigners.length + idx + 1,
              }));
              onSignersChange([...formattedSigners, ...formattedReviewers]);
            }
            return newSigners;
          });
        } else {
          setReviewers((prev) => {
            const newReviewers = prev.filter((r) => r.id !== personId);
            // Notify parent
            if (onSignersChange) {
              const formattedSigners = signers.map((s, idx) => ({
                user_id: s.id,
                name: s.name,
                image: s.image,
                role_type: "signer",
                sequence_order: idx + 1,
              }));
              const formattedReviewers = newReviewers.map((r, idx) => ({
                user_id: r.id,
                name: r.name,
                image: r.image,
                role_type: "reviewer",
                sequence_order: signers.length + idx + 1,
              }));
              onSignersChange([...formattedSigners, ...formattedReviewers]);
            }
            return newReviewers;
          });
        }

        if (pdfViewerRef.current) {
          pdfViewerRef.current.removeSignaturesBySignerId(personId);
        }

        if (activeSigner?.id === personId) {
          const remaining = allParticipants.filter((p) => p.id !== personId);
          setActiveSigner(remaining.length > 0 ? remaining[0] : null);
        }
      },
    });
  };

  const handleJumpToPage = (page) => {
    if (pdfViewerRef.current) {
      pdfViewerRef.current.changePage(page);
    }
  };

  const handleRemoveByPage = (page) => {
    Modal.confirm({
      title: "Hapus Logo TTE",
      content: `Hapus semua logo TTE di halaman ${page}?`,
      okText: "Hapus",
      cancelText: "Batal",
      okButtonProps: { danger: true },
      onOk: () => {
        if (pdfViewerRef.current) {
          pdfViewerRef.current.removeSignaturesByPage(page);
        }
      },
    });
  };

  const handleClearAll = () => {
    const signerName = currentSignerInfo?.name || "ini";
    Modal.confirm({
      title: "Hapus Semua Logo TTE",
      content: `Hapus semua ${totalCount} logo TTE milik ${signerName}?`,
      okText: "Hapus Semua",
      cancelText: "Batal",
      okButtonProps: { danger: true },
      onOk: () => {
        if (pdfViewerRef.current) {
          pdfViewerRef.current.clearAllSignatures();
        }
      },
    });
  };

  const showTTEPlacement = currentSignerInfo?.type === "signer";

  return (
    <Space direction="vertical" style={{ width: "100%" }} size="large">
      {/* COMPACT: Simple Radio Group */}
      <Card shadow="sm" padding="sm" radius="md" withBorder>
        <Group justify="space-between" wrap="nowrap">
          <Text size="sm" fw={600}>
            Mode Tanda Tangan
          </Text>
          <Radio.Group value={mode} onChange={handleModeChange} size="small">
            <Radio value="self">Tanda Tangan Mandiri</Radio>
            <Radio value="request">Pengajuan ke Pihak Lain</Radio>
          </Radio.Group>
        </Group>
      </Card>

      {/* Request Mode: Daftar Peserta Sequential */}
      {mode === "request" && (
        <Card shadow="sm" padding="md" radius="md" withBorder>
          <Stack gap="sm">
            <Group justify="space-between">
              <Text size="sm" fw={500}>
                Daftar Peserta Sequential ({allParticipants.length})
              </Text>
              <Button
                size="xs"
                variant="light"
                leftSection={<IconUserPlus size={14} />}
                onClick={() => setShowSignerSelector(true)}
              >
                Kelola
              </Button>
            </Group>

            {allParticipants.length === 0 ? (
              <Text size="xs" c="dimmed" ta="center" py="xs">
                Belum ada peserta pengajuan
              </Text>
            ) : (
              <Stack gap={4}>
                {allParticipants.map((person) => {
                  const sigCount = (signaturesBySigner[person.id] || []).length;
                  const isActive = activeSigner?.id === person.id;
                  const isSigner = person.type === "signer";

                  return (
                    <Paper
                      key={person.id}
                      withBorder
                      p="xs"
                      style={{
                        backgroundColor: isActive ? "#f0f7ff" : "white",
                        borderColor: isActive ? "#1890ff" : undefined,
                      }}
                    >
                      <Group justify="space-between">
                        <Group
                          gap="xs"
                          style={{
                            cursor: "pointer",
                            flex: 1,
                            opacity: !isSigner ? 0.8 : 1,
                          }}
                          onClick={() => setActiveSigner(person)}
                        >
                          {/* Sequence Badge */}
                          <Badge
                            size="lg"
                            variant="filled"
                            color={isSigner ? "blue" : "gray"}
                            style={{
                              minWidth: 28,
                              height: 28,
                              padding: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {person.sequence}
                          </Badge>

                          <Avatar src={person.image} size="sm" radius="xl">
                            {person.name.charAt(0)}
                          </Avatar>

                          <div style={{ flex: 1 }}>
                            <Group gap={4}>
                              <Text size="xs" fw={500}>
                                {person.name}
                              </Text>
                              <Badge
                                size="xs"
                                color={isSigner ? "blue" : "gray"}
                                variant="light"
                              >
                                {isSigner ? "Penandatangan" : "Reviewer"}
                              </Badge>
                              {isActive && (
                                <Badge size="xs" color="green">
                                  Aktif
                                </Badge>
                              )}
                            </Group>
                            <Text size="xs" c="dimmed">
                              {isSigner ? `${sigCount} TTE` : "Preview saja"}
                            </Text>
                          </div>
                        </Group>

                        <ActionIcon
                          size="sm"
                          color="red"
                          variant="subtle"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemovePerson(person.id, person.type);
                          }}
                        >
                          <IconTrash size={14} />
                        </ActionIcon>
                      </Group>
                    </Paper>
                  );
                })}
              </Stack>
            )}

            {/* Info Sequential */}
            {allParticipants.length > 0 && (
              <>
                <Divider my="xs" />
                <Text size="xs" c="dimmed" ta="center">
                  Urutan pengajuan sequential: 1 → {allParticipants.length}
                </Text>
              </>
            )}
          </Stack>
        </Card>
      )}

      {/* Self Sign: Info TTE */}
      {mode === "self" && (
        <Card shadow="sm" padding="md" radius="md" withBorder>
          <Stack gap="sm">
            <Group justify="space-between">
              <Group gap="xs">
                <Avatar src={user?.image} size="sm" radius="xl">
                  {user?.name?.charAt(0) || "S"}
                </Avatar>
                <Text size="sm" fw={500}>
                  Saya Menandatangani ({totalCount} TTE)
                </Text>
              </Group>
              {canEdit && totalCount > 0 && (
                <Button
                  size="xs"
                  color="red"
                  variant="light"
                  leftSection={<IconTrash size={14} />}
                  onClick={handleClearAll}
                >
                  Hapus Semua
                </Button>
              )}
            </Group>

            {totalCount === 0 ? (
              <Text size="xs" c="dimmed" ta="center" py="md">
                Belum ada TTE yang ditempatkan. Klik tombol "Tambah TTE" di
                bawah untuk menambahkan tanda tangan.
              </Text>
            ) : (
              <Stack gap={4}>
                {Object.keys(signatureCounts)
                  .sort((a, b) => {
                    const pageA = parseInt(a.replace("page", ""));
                    const pageB = parseInt(b.replace("page", ""));
                    return pageA - pageB;
                  })
                  .map((pageKey) => {
                    const page = parseInt(pageKey.replace("page", ""));
                    return (
                      <Paper key={pageKey} withBorder p="xs">
                        <Group justify="space-between">
                          <Group gap="xs">
                            <IconMapPin size={14} />
                            <Text size="xs">Halaman {page}</Text>
                            <Badge size="xs" variant="light">
                              {signatureCounts[pageKey]} logo
                            </Badge>
                          </Group>
                          <Group gap={4}>
                            <ActionIcon
                              size="xs"
                              variant="light"
                              onClick={() => handleJumpToPage(page)}
                              title="Lihat Halaman"
                            >
                              <IconFileText size={14} />
                            </ActionIcon>
                            {canEdit && (
                              <ActionIcon
                                size="xs"
                                variant="light"
                                color="red"
                                onClick={() => handleRemoveByPage(page)}
                                title="Hapus TTE di Halaman Ini"
                              >
                                <IconTrash size={14} />
                              </ActionIcon>
                            )}
                          </Group>
                        </Group>
                      </Paper>
                    );
                  })}
              </Stack>
            )}
          </Stack>
        </Card>
      )}

      {/* Request Mode: Summary per Signer */}
      {mode === "request" &&
        currentSignerInfo &&
        showTTEPlacement &&
        totalCount > 0 && (
          <Card shadow="sm" padding="md" radius="md" withBorder>
            <Stack gap="sm">
              <Group justify="space-between">
                <Group gap="xs">
                  <Avatar src={currentSignerInfo.image} size="sm" radius="xl">
                    {currentSignerInfo.name.charAt(0)}
                  </Avatar>
                  <Text size="sm" fw={500}>
                    {currentSignerInfo.name} ({totalCount} TTE)
                  </Text>
                </Group>
                {canEdit && (
                  <Button
                    size="xs"
                    color="red"
                    variant="light"
                    leftSection={<IconTrash size={14} />}
                    onClick={handleClearAll}
                  >
                    Hapus
                  </Button>
                )}
              </Group>

              <Stack gap={4}>
                {Object.keys(signatureCounts)
                  .sort((a, b) => {
                    const pageA = parseInt(a.replace("page", ""));
                    const pageB = parseInt(b.replace("page", ""));
                    return pageA - pageB;
                  })
                  .map((pageKey) => {
                    const page = parseInt(pageKey.replace("page", ""));
                    return (
                      <Paper key={pageKey} withBorder p="xs">
                        <Group justify="space-between">
                          <Group gap="xs">
                            <IconMapPin size={14} />
                            <Text size="xs">Hal. {page}</Text>
                            <Badge size="xs" variant="light">
                              {signatureCounts[pageKey]} logo
                            </Badge>
                          </Group>
                          <Group gap={4}>
                            <ActionIcon
                              size="xs"
                              variant="light"
                              onClick={() => handleJumpToPage(page)}
                            >
                              <IconFileText size={14} />
                            </ActionIcon>
                            {canEdit && (
                              <ActionIcon
                                size="xs"
                                variant="light"
                                color="red"
                                onClick={() => handleRemoveByPage(page)}
                              >
                                <IconTrash size={14} />
                              </ActionIcon>
                            )}
                          </Group>
                        </Group>
                      </Paper>
                    );
                  })}
              </Stack>
            </Stack>
          </Card>
        )}

      {/* PDF Viewer - Always show */}
      {((mode === "self" && currentSignerInfo) || mode === "request") && (
        <>
          {/* Message for Request mode without active signer */}
          {mode === "request" && !currentSignerInfo && (
            <Card shadow="sm" padding="md" radius="md" withBorder>
              <Text size="sm" c="dimmed" ta="center" py="md">
                Tambahkan penandatangan dengan klik tombol{" "}
                <strong>"Kelola"</strong> di atas,
                <br />
                kemudian pilih penandatangan untuk menempatkan TTE.
              </Text>
            </Card>
          )}

          {/* Message for Reviewer - shown above PDF viewer */}
          {mode === "request" && currentSignerInfo && !showTTEPlacement && (
            <Card shadow="sm" padding="md" radius="md" withBorder>
              <Text size="sm" c="dimmed" ta="center">
                Reviewer hanya dapat melihat dokumen, tidak perlu menempatkan
                TTE.
                <br />
                Untuk menempatkan TTE, pilih penandatangan dari daftar di atas.
              </Text>
            </Card>
          )}

          <PdfViewer
            ref={pdfViewerRef}
            pdfBase64={pdfBase64}
            title="Dokumen untuk Ditandatangani"
            enableSignaturePlacement={!!currentSignerInfo && showTTEPlacement}
            initialSignatures={initialSignatures}
            signerName={currentSignerInfo?.name || "Preview"}
            signerAvatar={currentSignerInfo?.image}
            signerId={currentSignerInfo?.id || "preview"}
            canEdit={canEdit && !!currentSignerInfo && showTTEPlacement}
          />
        </>
      )}

      {/* Signer Selector Modal */}
      <SignerSelector
        visible={showSignerSelector}
        onClose={() => setShowSignerSelector(false)}
        onSave={handleSaveSigners}
        initialSigners={signers}
        initialReviewers={reviewers}
      />
    </Space>
  );
}

export default memo(SignaturePlacementForm);

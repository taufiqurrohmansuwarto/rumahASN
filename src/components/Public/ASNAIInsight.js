import { useQuery } from "@tanstack/react-query";
import React from "react";
import { aiInsightByIdService } from "@/services/public.services";

function ASNAIInsight({ id }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["ai-insight", id],
    queryFn: () => aiInsightByIdService(id),
    refetchOnWindowFocus: false,
    enabled: !!id,
  });

  if (!id) {
    return null;
  }

  if (isLoading) {
    return (
      <div style={{ marginTop: 16 }}>
        <div style={{
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 8,
          color: "#fa8c16",
          display: "flex",
          alignItems: "center",
          gap: 6
        }}>
          <span>🤖</span>
          <span>BestieAI</span>
        </div>
        <div style={{ padding: "12px 0" }}>
          <div style={{ height: 20, background: "#f0f0f0", borderRadius: 4, marginBottom: 8 }} />
          <div style={{ height: 20, background: "#f0f0f0", borderRadius: 4, marginBottom: 8 }} />
          <div style={{ height: 20, background: "#f0f0f0", borderRadius: 4, width: "80%" }} />
        </div>
      </div>
    );
  }

  if (isError || !data?.success) {
    return null;
  }

  const profile = data?.profile_summary || {};
  const insight = data?.insight || {};
  const header = insight?.header || {};
  const snapshot = insight?.snapshot || {};
  const deepInsight = insight?.deep_insight || {};
  const closing = insight?.closing || {};

  return (
    <div style={{ marginTop: 16, width: "100%", overflow: "hidden" }}>
      <div style={{
        fontSize: 14,
        fontWeight: 600,
        marginBottom: 8,
        color: "#fa8c16",
        display: "flex",
        alignItems: "center",
        gap: 6
      }}>
        <span>🤖</span>
        <span>BestieAI</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
        {/* Sapaan Hangat */}
        {header?.sapaan_hangat && (
          <div
            style={{
              background: "#fffbf5",
              border: "1px solid #ffe7ba",
              padding: 10,
              borderRadius: 6,
              fontStyle: "italic",
              wordWrap: "break-word",
              overflowWrap: "break-word",
            }}
          >
            <div style={{ fontSize: 13, lineHeight: 1.5, color: "#594a3a" }}>
              {header.sapaan_hangat}
            </div>
          </div>
        )}

        {/* Profile Info */}
        {(profile.jabatan || profile.unit) && (
          <div style={{ marginBottom: 4 }}>
            {profile.jabatan && (
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 2 }}>
                <span style={{ fontWeight: 600 }}>Jabatan:</span> {profile.jabatan}
              </div>
            )}
            {profile.unit && (
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                <span style={{ fontWeight: 600 }}>Unit:</span> {profile.unit}
              </div>
            )}
          </div>
        )}

        {/* Snapshot - Minimal */}
        {snapshot?.fase_karir && (
          <div style={{ marginBottom: 4 }}>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 2 }}>
              Fase Karir
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, color: "#1f2937" }}>
              {snapshot.fase_karir}
            </div>
          </div>
        )}

        {snapshot?.highlight_kekuatan && (
          <div style={{ marginBottom: 4 }}>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 2 }}>
              Kekuatan
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.4, color: "#1f2937" }}>
              {snapshot.highlight_kekuatan}
            </div>
          </div>
        )}

        {snapshot?.area_pengembangan && (
          <div style={{ marginBottom: 4 }}>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 2 }}>
              Area Pengembangan
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.4, color: "#1f2937" }}>
              {snapshot.area_pengembangan}
            </div>
          </div>
        )}

        {/* Peluang Tersembunyi */}
        {deepInsight?.peluang_tersembunyi && (
          <div
            style={{
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              padding: 8,
              borderRadius: 6,
              wordWrap: "break-word",
              overflowWrap: "break-word",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: "#166534" }}>
              💡 Peluang
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.4, color: "#166534" }}>
              {deepInsight.peluang_tersembunyi}
            </div>
          </div>
        )}

        {/* Langkah Selanjutnya */}
        {deepInsight?.next_level && (
          <div
            style={{
              background: "#fff7e6",
              border: "1px solid #ffd591",
              padding: 8,
              borderRadius: 6,
              wordWrap: "break-word",
              overflowWrap: "break-word",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: "#1f2937" }}>
              🎯 Langkah Selanjutnya
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.4, color: "#1f2937" }}>
              {deepInsight.next_level}
            </div>
          </div>
        )}

        {/* Tips Praktis */}
        {closing?.tips_praktis && (
          <div
            style={{
              background: "#fff7e6",
              border: "1px solid #ffd591",
              padding: 8,
              borderRadius: 6,
              wordWrap: "break-word",
              overflowWrap: "break-word",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: "#1f2937" }}>
              ⚡ Tips Praktis
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.4, color: "#1f2937" }}>
              {closing.tips_praktis}
            </div>
          </div>
        )}

        {/* Motivasi */}
        {closing?.motivasi && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              padding: 8,
              borderRadius: 6,
              wordWrap: "break-word",
              overflowWrap: "break-word",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: "#991b1b" }}>
              ❤️ Motivasi
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.4, color: "#991b1b" }}>
              {closing.motivasi}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ASNAIInsight;

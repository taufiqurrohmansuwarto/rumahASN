// Helper untuk mendapatkan URL file lengkap
export const getFileUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `https://master.bkd.jatimprov.go.id/files_jatimprov/${url}`;
};

// Helper untuk cek apakah file adalah image
export const isImage = (url) => /\.(jpg|jpeg|png|gif|webp)$/i.test(url || "");

// Helper untuk cek apakah file adalah PDF
export const isPdf = (url) => /\.pdf$/i.test(url || "");

// Helper untuk mendapatkan URL download dokumen SIASN
export const getSiasnDownloadUrl = (dokUri) => {
  if (!dokUri) return null;
  return `/helpdesk/api/siasn/ws/download?filePath=${dokUri}`;
};

// Helper untuk convert base64 ke File
export const base64ToFile = (base64Data, fileName) => {
  try {
    const base64Content = base64Data.split(",")[1];
    const byteCharacters = atob(base64Content);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/pdf" });
    return new File([blob], fileName, { type: "application/pdf" });
  } catch (error) {
    console.error("Error converting base64 to file:", error);
    return null;
  }
};

// Helper untuk parsing path data dari response SIASN
export const parsePathData = (siasn) => {
  let pathData = siasn?.data?.path || siasn?.path || siasn?.data?.data?.path;
  if (typeof pathData === "string") {
    try {
      pathData = JSON.parse(pathData);
    } catch {
      pathData = null;
    }
  }
  return pathData;
};

// Helper untuk mendapatkan ID riwayat dari response SIASN
export const getIdRiwayat = (siasn) =>
  siasn?.data?.data?.id || siasn?.data?.id || siasn?.id;


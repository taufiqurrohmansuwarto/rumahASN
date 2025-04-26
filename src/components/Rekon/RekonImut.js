import { useQuery } from "@tanstack/react-query";
import { getImut } from "@/services/rekon.services";
import { useRouter } from "next/router";
import { Alert, Spin, Cascader, Skeleton } from "antd";
import { useState, useEffect } from "react";
import { imutKategori, imutJenis, imutSubJenis } from "@/utils/data-utils";

function RekonImut() {
  const router = useRouter();
  const { kategori_id, jenis_id, sub_jenis_id } = router.query;
  const [options, setOptions] = useState([]);

  // Menyiapkan opsi cascader saat komponen dimuat
  useEffect(() => {
    const cascaderOptions = imutKategori.map((kategori) => ({
      value: kategori.id_kategori,
      label: kategori.kategori,
      children: imutJenis
        .filter((jenis) => jenis.id_kat_detail === kategori.id_kategori)
        .map((jenis) => {
          // Filter sub jenis berdasarkan jenis
          const subJenisOptions = imutSubJenis
            .filter((subJenis) => subJenis.id_kat_jenis === jenis.id)
            .map((subJenis) => ({
              value: subJenis.id,
              label: subJenis.nama,
            }));

          // Tambahkan opsi default jika tidak ada sub jenis
          if (subJenisOptions.length === 0) {
            subJenisOptions.push({
              value: "",
              label: "Tidak Ada Sub Jenis",
            });
          }

          return {
            value: jenis.id,
            label: jenis.nama_kat_detail,
            children: subJenisOptions,
          };
        }),
    }));

    setOptions(cascaderOptions);
  }, []);

  // Menangani perubahan pada cascader
  const handleCascaderChange = (value) => {
    if (value && value.length >= 2) {
      // Jika ada nilai yang dipilih
      const [kategoriId, jenisId, subJenisId = ""] = value;

      router.push({
        pathname: router.pathname,
        query: {
          ...router.query,
          kategori_id: kategoriId,
          jenis_id: jenisId,
          sub_jenis_id: subJenisId,
        },
      });
    } else {
      // Jika filter dihapus
      const { kategori_id, jenis_id, sub_jenis_id, ...restQuery } =
        router.query;

      router.push({
        pathname: router.pathname,
        query: restQuery,
      });
    }
  };

  // Mengambil data IMUT
  const { data, isLoading, isFetching, error, isError } = useQuery(
    ["imut", router?.query],
    () => getImut(router?.query),
    {
      keepPreviousData: true,
      enabled: !!router?.query,
    }
  );

  // Tampilkan pesan error
  if (isError) {
    return (
      <Alert
        message="Terjadi Kesalahan"
        description={error?.message || "Gagal memuat data IMUT"}
        type="error"
        showIcon
      />
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      {/* Filter Section */}
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ marginBottom: "10px" }}>Filter IMUT</h2>
        <Cascader
          options={options}
          onChange={handleCascaderChange}
          placeholder="Pilih Kategori, Jenis, dan Sub Jenis"
          style={{ width: "100%" }}
          value={[kategori_id, jenis_id, sub_jenis_id].filter(Boolean)}
          allowClear
          showSearch={{
            filter: (inputValue, path) =>
              path.some(
                (option) =>
                  option.label.toLowerCase().indexOf(inputValue.toLowerCase()) >
                  -1
              ),
          }}
          expandTrigger="hover"
          dropdownStyle={{
            maxHeight: "500px",
            overflow: "auto",
            fontSize: "16px",
          }}
          size="large"
          popupClassName="imut-cascader-dropdown"
          listHeight={400}
        />
      </div>

      {/* Data Display Section */}
      <div style={{ marginTop: "20px" }}>
        <h3>Parameter yang Dipilih:</h3>
        <pre
          style={{
            background: "#f5f5f5",
            padding: "15px",
            borderRadius: "4px",
            overflow: "auto",
          }}
        >
          <Skeleton active loading={isLoading || isFetching}>
            {JSON.stringify(router?.query, null, 2)}
            {JSON.stringify(data, null, 2)}
          </Skeleton>
        </pre>
      </div>
    </div>
  );
}

export default RekonImut;

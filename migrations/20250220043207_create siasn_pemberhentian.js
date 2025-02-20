/**
 *  {
    id: 'e688a057-e243-43a1-95de-b9ba20aa7f2d',
    nama: 'SUYONO',
    statusUsulan: '32',
    statusUsulanNama: 'Sudah TTE SK',
    pnsId: 'A5EB041BC91EF6A0E040640A040252AD',
    nipBaru: '196703301994031005',
    pertekNomor: 'PH-23500000695',
    skNomor: '800.1.6.3/2519/204/2024',
    pathSk: 'sk-instansi-preview-A5EB03E23CCCF6A0E040640A040252AD/INS.SK.06.15/sign-final/d04e9a3b6e28389366c3495a5a945fa1947c6e87b89ad4ba07eac211-2024-07-30T02:31:55.673954/d04e9a3b6e28389366c3495a5a945fa1947c6e87b89ad4ba07eac211-2024-07-30T02:31:55.673954.pdf',
    pathPertek: 'pertek/BKN.PT.05.01/no-sign/53f1898819f0735dbfa2c19cb214876480cb9e86500049b64b8cb62d-2024-07-03T07:10:16.143579/53f1898819f0735dbfa2c19cb214876480cb9e86500049b64b8cb62d-2024-07-03T07:10:16.143579.pdf',
    pertekTgl: '03-07-2024',
    skTgl: '30-07-2024',
    instansiId: 'A5EB03E23CCCF6A0E040640A040252AD',
    instansiNama: 'Pemerintah Provinsi Jawa Timur',
    detailLayananNama: 'BUP KPP',
    tglLahir: '30-03-1967',
    golonganId: '34',
    golonganKppId: '41',
    tmtPensiun: '01-04-2025',
    pathSkPreview: 'sk-instansi-preview-A5EB03E23CCCF6A0E040640A040252AD/INS.SK.06.15/no-sign/d04e9a3b6e28389366c3495a5a945fa1947c6e87b89ad4ba07eac211-2024-07-30T02:31:55.673954/d04e9a3b6e28389366c3495a5a945fa1947c6e87b89ad4ba07eac211-2024-07-30T02:31:55.673954.pdf'
  },
 */

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("siasn_pemberhentian", (table) => {
    table.string("id").primary();
    table.string("nama");
    table.string("statusUsulan");
    table.string("statusUsulanNama");
    table.string("pnsId");
    table.string("nipBaru");
    table.string("pertekNomor");
    table.string("skNomor");
    table.string("pathSk");
    table.string("pathPertek");
    table.string("pertekTgl");
    table.string("skTgl");
    table.string("instansiId");
    table.string("instansiNama");
    table.string("detailLayananNama");
    table.string("tglLahir");
    table.string("golonganId");
    table.string("golonganKppId");
    table.string("tmtPensiun");
    table.string("pathSkPreview");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("siasn_pemberhentian");
};

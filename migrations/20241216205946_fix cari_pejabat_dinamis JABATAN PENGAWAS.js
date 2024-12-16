/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(`create or replace
function cari_pejabat_dinamis(skpd_input text,
nama_input text)
returns table(
    nip_master text,
    skpd_id text,
    nama_master text,
    similarity_score DOUBLE precision,
    distance INT
) as $$
begin
    return QUERY
    select
	sp.nip_master::text,
	sp.skpd_id::text,
	sp.nama_master::text,
	cast(similarity(LOWER(TRIM(sp.nama_master)),
	LOWER(nama_input)) as DOUBLE precision) as similarity_score,
	levenshtein(LOWER(TRIM(sp.nama_master)),
	LOWER(nama_input)) as distance
from
	sync_pegawai sp
where
	sp.skpd_id ilike skpd_input || '%'
	and (sp.jabatan_asn = 'JABATAN ADMINISTRATOR'
		or sp.jabatan_asn = 'JABATAN PIMPINAN TINGGI PRATAMA'
		or sp.jabatan_asn = 'JABATAN PENGAWAS')
	and (
           sp.nama_master ilike '%' || nama_input || '%'
		or LOWER(TRIM(sp.nama_master)) % LOWER(nama_input)
			or levenshtein(LOWER(TRIM(sp.nama_master)),
			LOWER(nama_input)) <= 10
				or soundex(sp.nama_master) = soundex(nama_input)
      )
order by
	similarity_score desc,
	distance asc
limit 1;
end;

$$ language plpgsql;`);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};

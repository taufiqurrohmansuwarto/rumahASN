/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(
    `
	create table webinar_series_participants_absence
(
    id                              varchar(255) primary key,
    webinar_series_absence_entry_id varchar(255),
    user_id                         varchar(255),
    created_at                      timestamp default current_timestamp,
    updated_at                      timestamp default current_timestamp,

    foreign key (user_id) references users (custom_id),
    foreign key (webinar_series_absence_entry_id) references webinar_series_absence_entries (id),
    unique (webinar_series_absence_entry_id, user_id)
)
	`
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};

const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class VerbatimAudioFiles extends Model {
  static get tableName() {
    return "verbatim_ai.audio_files";
  }

  $beforeInsert() {
    this.id = nanoid(10);
  }
}

module.exports = VerbatimAudioFiles;

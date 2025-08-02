const { Model } = require("objection");
const knex = require("../../db");

Model.knex(knex);

class VerbatimAudioFiles extends Model {
  static get tableName() {
    return "verbatim_ai.audio_files";
  }
}

module.exports = VerbatimAudioFiles;

const { Model } = require("objection");
const knex = require("../db");
const { nanoid } = require("nanoid");
Model.knex(knex);

class WebinarSeriesSurveysQuestions extends Model {
  static get tableName() {
    return "webinar_series_surveys_questions";
  }

  $beforeInsert() {
    this.id = nanoid(10);
  }

  static get relationMappings() {
    const WebinarSeriesSurveys = require("@/models/webinar-series-surveys.model");

    return {
      webinar_series_surveys: {
        relation: Model.HasManyRelation,
        modelClass: WebinarSeriesSurveys,
        join: {
          from: "webinar_series_surveys_questions.id",
          to: "webinar_series_surveys.webinar_series_surveys_question_id",
        },
      },
    };
  }

  static get idColumn() {
    return "id";
  }
}

module.exports = WebinarSeriesSurveysQuestions;

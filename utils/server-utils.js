// markdown to text using marked
module.exports.markdownToText = (markdown) => {
  const marked = require("marked");
  const html = marked(markdown);
  const text = html.replace(/<[^>]*>/g, "");
  return text;
};

const opdModel = require("@/models/sync-unor-master.model");

module.exports.getDetailOpd = async (id) => {
  if (!id) {
    return "SKPD tidak ada";
  } else if (id === 1) {
    const hasil = await opdModel.query().findById(id);
    return hasil.name;
  } else {
    const pttSkpd = id.toString();
    //  contoh : 101010101
    // kode skpd = 3, 5, 7, 9, 11, 13
    let arr = [];
    for (let x = 3; x < pttSkpd.length; x = x + 2) {
      arr.push(pttSkpd.substring(0, x));
    }

    arr.push(pttSkpd);

    const result = await opdModel
      .query()
      .select(["id", "name"])
      .whereIn("id", arr);

    const detail = arr.map((x) => {
      const findItems = result.find((a) => a.id === x);
      if (findItems) {
        return { name: findItems.name, id: x };
      } else {
        return { name: "", id: null };
      }
    });

    return {
      id,
      detail,
    };
  }
};

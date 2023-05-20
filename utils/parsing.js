const { marked } = require("marked");

const extractMentions = (text) => {
  const regex = /@([a-zA-Z0-9_]+)/g;
  const mentions = text.match(regex);
  return mentions || [];
};

const extractHashtags = (text) => {
  const regex = /#([a-zA-Z0-9_]+)/g;
  const hashtags = text.match(regex);
  return hashtags || [];
};

const renderImage = (href, title, text) => {
  // resize image scale 0.5 using inline style
  const img = `<img src="${href}" title="${text}" alt="${text}" style="width: 70%;"/>`;
  return img;
};

const renderText = (text) => {
  // check if includes html symbol
  if (text.includes("&#39;")) {
    text = text.replace(/&#39;/g, "'");
  }

  const hashTags = extractHashtags(text);
  const mentions = extractMentions(text);

  if (hashTags.length > 0) {
    hashTags.forEach((tag) => {
      const hashtag = tag.replace("#", "");
      text = text.replace(tag, `<a href="#${tag}">${hashtag}</a>`);
    });
  }

  // check sekali lagi di users table
  if (mentions.length > 0) {
    mentions.forEach((mention) => {
      const username = mention.replace("@", "");
      text = text.replace(
        mention,
        `<a href="/helpdesk/user/${username}">@${username}</a>`
      );
    });
    // kalau sudah selesai insert di notification users
  }

  return text;
};

const renderListItem = function (text, task) {
  // Check if the list item is a task item
  if (task) {
    // Render a checkbox
    return '<li><input type="checkbox" checked disabled>' + text + "</li>";
  } else {
    // Render a regular list item
    return "<li>" + text + "</li>";
  }
};

const blockquote = function (quote) {
  return (
    `<blockquote style="color: #666;
    padding-left: 3em;
    margin-bottom: 1em;
    margin-top: 1em;
    border-left: 0.5em #eee solid">` +
    quote +
    "</blockquote>"
  );
};

const link = function (href, title, text) {
  // add http if not present in href example : bkd.jatimprov.go.id => http://bkd.jatimprov.go.id
  const regex = /^(http|https):\/\//;
  if (!regex.test(href)) {
    href = "https://" + href;
  }

  return `<a href="${href}" title="${text}" target="_blank" rel="noopener noreferrer">${text}</a>`;
};

const renderer = {
  text(string) {
    return renderText(string);
  },
  image(href, title, text) {
    return renderImage(href, title, text);
  },
  lisitem(text, task) {
    return renderListItem(text, task);
  },
  link(href, title, text) {
    return link(href, title, text);
  },
  blockquote(quote) {
    return blockquote(quote);
  },
};

marked.use({ renderer, gfm: true, breaks: true });

const parseMarkdown = (text) => {
  return marked.parse(text);
};

const serializeComments = (comments) => {
  if (comments.length > 0) {
    return comments.map((comment) => {
      return {
        ...comment,
        custom_id: `comment-${comment.id}`,
        comment: parseMarkdown(comment.comment),
        commentMarkdown: comment.comment,
        status: null,
        type: "comment",
      };
    });
  } else {
    return [];
  }
};

const serializeHistories = (histories) => {
  if (histories.length > 0) {
    return histories.map((history) => {
      return {
        ...history,
        custom_id: `history-${history.id}`,
        commentMarkdown: null,
        role: null,
        type: "history",
      };
    });
  } else {
    return [];
  }
};

const serializeData = (data) => {
  const serializedData = [];

  for (let i = 0; i < data.length; i++) {
    if (data[i].type === "comment") {
      const timelineItems = [];

      for (let j = i + 1; j < data.length; j++) {
        if (data[j].type === "history") {
          timelineItems.push(data[j]);
        } else if (data[j].type === "comment") {
          break;
        }
      }

      serializedData.push({
        ...data[i],
        timelineItems,
      });
    } else if (data[i].type === "history" && i === 0) {
      serializedData.push({
        type: "comment",
        id: null,
        author: null,
        content: null,
        timelineItems: [data[i]],
      });
    }
  }

  return serializedData;
};

// create function to check is markdown or html
const isMarkdown = (text) => {
  const regex = /<[^>]*>/;
  return regex.test(text);
};

module.exports = {
  serializeData,
  extractMentions,
  extractHashtags,
  parseMarkdown,
  serializeComments,
  serializeHistories,
};

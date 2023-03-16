export class CustomerTicket {
  static get modelName() {
    return "CustomerTicket";
  }

  constructor({
    id,
    title,
    description,
    content,
    status_code,
    assignee,
    requester,
    is_published,
    is_pinned,
    is_locked,
  }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.content = content;
    this.status_code = status_code;
    this.assignee = assignee;
    this.requester = requester;
    this.is_published = is_published;
    this.is_pinned = is_pinned;
    this.is_locked = is_locked;
  }
}

export class Comment {
  static get modelName() {
    return "Comment";
  }

  constructor({ id, ticket_id, comment, user_id }) {
    this.id = id;
    this.ticket_id = ticket_id;
    this.comment = comment;
    this.user_id = user_id;
  }
}

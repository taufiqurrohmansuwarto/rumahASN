// RASN Chat Models - Index file for easy imports

const WorkspaceRole = require("./workspace-roles.model");
const WorkspaceMember = require("./workspace-members.model");
const ChannelRole = require("./channel-roles.model");
const Channel = require("./channels.model");
const ChannelMember = require("./channel-members.model");
const Message = require("./messages.model");
const Reaction = require("./reactions.model");
const Mention = require("./mentions.model");
const Attachment = require("./attachments.model");
const UserPresence = require("./user-presence.model");
const PinnedMessage = require("./pinned-messages.model");
const VideoCall = require("./video-calls.model");
const CallParticipant = require("./call-participants.model");

module.exports = {
  // Roles
  WorkspaceRole,
  WorkspaceMember,
  ChannelRole,

  // Channel & Messaging
  Channel,
  ChannelMember,
  Message,
  Reaction,
  Mention,
  Attachment,
  UserPresence,
  PinnedMessage,

  // Video Call
  VideoCall,
  CallParticipant,
};

/**
 * RASN Chat Controller
 * Controller untuk fitur chat seperti Slack
 */

const { handleError } = require("@/utils/helper/controller-helper");
const { uploadFilePublic } = require("@/utils/helper/minio-helper");
const { nanoid } = require("nanoid");
const {
  WorkspaceRole,
  WorkspaceMember,
  ChannelRole,
  Channel,
  ChannelMember,
  Message,
  Reaction,
  Mention,
  Attachment,
  UserPresence,
  PinnedMessage,
  Bookmark,
  VideoCall,
  CallParticipant,
} = require("@/models/rasn_chat");

// ============================================
// WORKSPACE ROLES & MEMBERS
// ============================================

const getWorkspaceRoles = async (req, res) => {
  try {
    const roles = await WorkspaceRole.getAllRoles();
    res.json(roles);
  } catch (error) {
    handleError(res, error);
  }
};

const getWorkspaceMembers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "" } = req.query;
    const result = await WorkspaceMember.getAllMembers({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
    });
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

const getMyWorkspaceMembership = async (req, res) => {
  try {
    const { customId } = req.user;
    const membership = await WorkspaceMember.getByUserId(customId);
    res.json(membership);
  } catch (error) {
    handleError(res, error);
  }
};

const updateMemberWorkspaceRole = async (req, res) => {
  try {
    const { userId } = req.query;
    const { roleId } = req.body;
    await WorkspaceMember.updateRole(userId, roleId);
    res.json({ message: "Role berhasil diupdate" });
  } catch (error) {
    handleError(res, error);
  }
};

// ============================================
// CHANNEL ROLES
// ============================================

const getChannelRoles = async (req, res) => {
  try {
    const roles = await ChannelRole.getAllRoles();
    res.json(roles);
  } catch (error) {
    handleError(res, error);
  }
};

// ============================================
// CHANNELS
// ============================================

const getChannels = async (req, res) => {
  try {
    const { customId } = req.user;
    const channels = await Channel.getAccessibleChannels(customId);
    res.json(channels);
  } catch (error) {
    handleError(res, error);
  }
};

const getMyChannels = async (req, res) => {
  try {
    const { customId } = req.user;
    const channels = await Channel.getUserChannels(customId);
    res.json(channels);
  } catch (error) {
    handleError(res, error);
  }
};

// Get all public channels (for browsing)
const getPublicChannels = async (req, res) => {
  try {
    const { customId } = req.user;

    // Get all public channels
    const publicChannels = await Channel.query()
      .where("type", "public")
      .where("is_archived", false)
      .withGraphFetched("[creator(simpleWithImage)]")
      .orderBy("name", "asc");

    // Mark channels that user is already a member of
    const userChannels = await Channel.getUserChannels(customId);
    const userChannelIds = userChannels.map((c) => c.id);

    const channelsWithMemberStatus = publicChannels.map((channel) => ({
      ...channel,
      is_member: userChannelIds.includes(channel.id),
    }));

    res.json(channelsWithMemberStatus);
  } catch (error) {
    handleError(res, error);
  }
};

// Get user's archived channels
const getArchivedChannels = async (req, res) => {
  try {
    const { customId } = req.user;

    const archivedChannels = await Channel.query()
      .whereExists(Channel.relatedQuery("members").where("user_id", customId))
      .where("is_archived", true)
      .withGraphFetched("[creator(simpleWithImage)]")
      .orderBy("name", "asc");

    res.json(archivedChannels);
  } catch (error) {
    handleError(res, error);
  }
};

const getChannelById = async (req, res) => {
  try {
    const { channelId } = req.query;
    const { customId } = req.user;

    const channel = await Channel.query()
      .findById(channelId)
      .withGraphFetched(
        "[creator(simpleWithImage), members.[user(simpleWithImage), role], kanban_project]"
      );

    if (!channel) {
      return res.status(404).json({ message: "Channel tidak ditemukan" });
    }

    // Check access
    if (channel.type === "private") {
      const isMember = await channel.isMember(customId);
      if (!isMember) {
        return res
          .status(403)
          .json({ message: "Anda tidak memiliki akses ke channel ini" });
      }
    } else {
      // For public channels, auto-join if not already a member
      const isMember = await channel.isMember(customId);
      if (!isMember) {
        await ChannelMember.addMember(channelId, customId);
        // Refresh channel data with new member
        const updatedChannel = await Channel.query()
          .findById(channelId)
          .withGraphFetched(
            "[creator(simpleWithImage), members.[user(simpleWithImage), role], kanban_project]"
          );
        return res.json(updatedChannel);
      }
    }

    res.json(channel);
  } catch (error) {
    handleError(res, error);
  }
};

const createChannel = async (req, res) => {
  try {
    const { customId } = req.user;
    const { name, description, icon, type, kanbanProjectId } = req.body;

    const channel = await Channel.createChannel({
      name,
      description,
      icon,
      type,
      createdBy: customId,
      kanbanProjectId,
    });

    res.status(201).json(channel);
  } catch (error) {
    handleError(res, error);
  }
};

const updateChannel = async (req, res) => {
  try {
    const { channelId } = req.query;
    const { name, description, icon } = req.body;

    const channel = await Channel.query().patchAndFetchById(channelId, {
      name,
      description,
      icon,
    });

    res.json(channel);
  } catch (error) {
    handleError(res, error);
  }
};

const deleteChannel = async (req, res) => {
  try {
    const { channelId } = req.query;
    await Channel.query().deleteById(channelId);
    res.json({ message: "Channel berhasil dihapus" });
  } catch (error) {
    handleError(res, error);
  }
};

const archiveChannel = async (req, res) => {
  try {
    const { channelId } = req.query;
    const channel = await Channel.query().findById(channelId);
    await channel.archive();
    res.json({ message: "Channel berhasil diarsipkan" });
  } catch (error) {
    handleError(res, error);
  }
};

const unarchiveChannel = async (req, res) => {
  try {
    const { channelId } = req.query;
    const channel = await Channel.query().findById(channelId);
    await channel.unarchive();
    res.json({ message: "Channel berhasil diaktifkan kembali" });
  } catch (error) {
    handleError(res, error);
  }
};

// ============================================
// CHANNEL MEMBERS
// ============================================

const getChannelMembers = async (req, res) => {
  try {
    const { channelId } = req.query;
    const members = await ChannelMember.getChannelMembers(channelId);
    res.json(members);
  } catch (error) {
    handleError(res, error);
  }
};

const joinChannel = async (req, res) => {
  try {
    const { channelId } = req.query;
    const { customId } = req.user;

    const channel = await Channel.query().findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel tidak ditemukan" });
    }

    if (channel.type === "private") {
      return res
        .status(403)
        .json({ message: "Tidak dapat bergabung ke channel private" });
    }

    await ChannelMember.addMember(channelId, customId);
    res.json({ message: "Berhasil bergabung ke channel" });
  } catch (error) {
    handleError(res, error);
  }
};

const leaveChannel = async (req, res) => {
  try {
    const { channelId } = req.query;
    const { customId } = req.user;

    await ChannelMember.removeMember(channelId, customId);
    res.json({ message: "Berhasil keluar dari channel" });
  } catch (error) {
    handleError(res, error);
  }
};

const inviteMember = async (req, res) => {
  try {
    const { channelId } = req.query;
    const { userId, roleId } = req.body;

    await ChannelMember.addMember(channelId, userId, roleId);
    res.json({ message: "Member berhasil diundang" });
  } catch (error) {
    handleError(res, error);
  }
};

const removeMember = async (req, res) => {
  try {
    const { channelId, userId } = req.query;
    await ChannelMember.removeMember(channelId, userId);
    res.json({ message: "Member berhasil dihapus" });
  } catch (error) {
    handleError(res, error);
  }
};

const updateMemberRole = async (req, res) => {
  try {
    const { channelId, userId } = req.query;
    const { roleId } = req.body;

    await ChannelMember.updateRole(channelId, userId, roleId);
    res.json({ message: "Role member berhasil diupdate" });
  } catch (error) {
    handleError(res, error);
  }
};

const toggleMuteChannel = async (req, res) => {
  try {
    const { channelId } = req.query;
    const { customId } = req.user;

    const result = await ChannelMember.toggleMute(channelId, customId);
    res.json({ muted: result?.muted });
  } catch (error) {
    handleError(res, error);
  }
};

const updateNotificationPref = async (req, res) => {
  try {
    const { channelId } = req.query;
    const { customId } = req.user;
    const { preference } = req.body;

    await ChannelMember.updateNotificationPref(channelId, customId, preference);
    res.json({ message: "Preferensi notifikasi berhasil diupdate" });
  } catch (error) {
    handleError(res, error);
  }
};

// ============================================
// MESSAGES
// ============================================

const getMessages = async (req, res) => {
  try {
    const { channelId, page = 1, limit = 50, before, after, around } = req.query;
    const { customId } = req.user;

    // Check membership for private channels
    const channel = await Channel.query().findById(channelId);
    if (channel?.type === "private") {
      const isMember = await channel.isMember(customId);
      if (!isMember) {
        return res.status(403).json({ message: "Tidak memiliki akses" });
      }
    }

    // Get user's workspace membership to check permissions
    let membership = await WorkspaceMember.getByUserId(customId);
    const { current_role } = req.user;
    const expectedRoleId =
      current_role === "admin" ? "ws-role-superadmin" : null;

    // Auto-enroll user in workspace if not a member yet
    if (!membership) {
      const roleId = expectedRoleId || "ws-role-member";
      await WorkspaceMember.addMember(customId, roleId);
      membership = await WorkspaceMember.getByUserId(customId);
    }
    // Sync role: if user is admin in main system but not superadmin in chat, upgrade
    else if (expectedRoleId && membership.role_id !== expectedRoleId) {
      await WorkspaceMember.updateRole(customId, expectedRoleId);
      membership = await WorkspaceMember.getByUserId(customId);
    }

    // Check permissions from role
    let canDeleteAny = false;
    let canEditAny = false;

    if (membership?.role) {
      const perms =
        typeof membership.role.permissions === "string"
          ? JSON.parse(membership.role.permissions)
          : membership.role.permissions || {};

      canDeleteAny =
        perms.all === true || perms.can_delete_any_message === true;
      canEditAny = perms.all === true || perms.can_edit_any_message === true;
    }

    const result = await Message.getChannelMessages(channelId, {
      page: parseInt(page),
      limit: parseInt(limit),
      before,
      after,
      around,
    });

    // Add is_own, can_edit, can_delete to each message
    const messagesWithPermissions = result.results.map((msg) => ({
      ...msg,
      is_own: msg.user_id === customId,
      can_edit: msg.user_id === customId || canEditAny,
      can_delete: msg.user_id === customId || canDeleteAny,
    }));

    // Update last read
    await ChannelMember.updateLastRead(channelId, customId);

    res.json({
      ...result,
      results: messagesWithPermissions,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Get channel date range for jump to date feature
const getChannelDateRange = async (req, res) => {
  try {
    const { channelId } = req.query;
    const dateRange = await Message.getChannelDateRange(channelId);
    res.json(dateRange);
  } catch (error) {
    handleError(res, error);
  }
};

const getThreadMessages = async (req, res) => {
  try {
    const { messageId } = req.query;
    const replies = await Message.getThreadMessages(messageId);
    res.json({ replies });
  } catch (error) {
    handleError(res, error);
  }
};

const sendMessage = async (req, res) => {
  try {
    const { channelId } = req.query;
    const { customId } = req.user;
    const { mc } = req;
    const {
      content,
      contentType,
      parentId,
      linkedTaskId,
      linkedEmailId,
      mentions,
      files, // Array of { name, size, type, dataUrl }
    } = req.body;

    // Create message first
    const message = await Message.sendMessage({
      channelId,
      userId: customId,
      content,
      contentType,
      parentId,
      linkedTaskId,
      linkedEmailId,
      mentions,
    });

    // Upload and attach files if any
    if (files && files.length > 0) {
      for (const file of files) {
        try {
          // Convert base64 to buffer
          const base64Data = file.dataUrl.split(",")[1];
          const buffer = Buffer.from(base64Data, "base64");

          // Determine attachment type
          let attachmentType = "file";
          if (file.type?.startsWith("image/")) attachmentType = "image";
          else if (file.type?.startsWith("video/")) attachmentType = "video";
          else if (file.type?.startsWith("audio/")) attachmentType = "audio";

          // Generate unique filename
          const ext = file.name.split(".").pop();
          const uniqueFilename = `rasn-chat/files/${nanoid()}.${ext}`;

          // Upload to Minio
          await uploadFilePublic(
            mc,
            buffer,
            uniqueFilename,
            file.size,
            file.type,
            {
              "uploaded-by": customId,
              "original-name": file.name,
            }
          );

          // Generate URL
          const baseUrl =
            process.env.MINIO_PUBLIC_URL ||
            "https://siasn.bkd.jatimprov.go.id:9000";
          const fileUrl = `${baseUrl}/public/${uniqueFilename}`;

          // Save attachment with message_id
          await Attachment.query().insert({
            id: nanoid(),
            message_id: message.id,
            file_name: file.name,
            file_url: fileUrl,
            file_size: file.size,
            file_type: file.type,
            attachment_type: attachmentType,
            metadata: { uploaded_by: customId },
          });
        } catch (fileError) {
          console.error("Error uploading file:", fileError);
          // Continue with other files even if one fails
        }
      }
    }

    // Fetch message with attachments
    const messageWithAttachments = await Message.query()
      .findById(message.id)
      .withGraphFetched(
        "[user(simpleWithImage), attachments, reactions, mentions.[mentioned_user(simpleWithImage)]]"
      );

    res.status(201).json(messageWithAttachments);
  } catch (error) {
    handleError(res, error);
  }
};

const editMessage = async (req, res) => {
  try {
    const { messageId } = req.query;
    const { customId } = req.user;
    const { content } = req.body;

    const message = await Message.query().findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Pesan tidak ditemukan" });
    }

    if (message.user_id !== customId) {
      return res
        .status(403)
        .json({ message: "Tidak dapat mengedit pesan orang lain" });
    }

    const updated = await message.editMessage(content);
    res.json(updated);
  } catch (error) {
    handleError(res, error);
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.query;
    const { customId } = req.user;

    const message = await Message.query().findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Pesan tidak ditemukan" });
    }

    // Check if user is owner or has permission
    if (message.user_id !== customId) {
      const member = await ChannelMember.getMember(
        message.channel_id,
        customId
      );
      if (!member?.role?.hasPermission("can_delete_any_message")) {
        return res
          .status(403)
          .json({ message: "Tidak dapat menghapus pesan orang lain" });
      }
    }

    await message.deleteMessage();
    res.json({ message: "Pesan berhasil dihapus" });
  } catch (error) {
    handleError(res, error);
  }
};

const searchMessages = async (req, res) => {
  try {
    const { q, channelId, limit = 50 } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({ message: "Query minimal 2 karakter" });
    }

    const messages = await Message.searchMessages(
      q,
      channelId,
      parseInt(limit)
    );
    res.json(messages);
  } catch (error) {
    handleError(res, error);
  }
};

// ============================================
// REACTIONS
// ============================================

const toggleReaction = async (req, res) => {
  try {
    const { messageId } = req.query;
    const { customId } = req.user;
    const { emoji } = req.body;

    const result = await Reaction.toggleReaction(messageId, customId, emoji);
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

const getMessageReactions = async (req, res) => {
  try {
    const { messageId } = req.query;
    const reactions = await Reaction.getMessageReactions(messageId);
    res.json(reactions);
  } catch (error) {
    handleError(res, error);
  }
};

// ============================================
// MENTIONS
// ============================================

const getMyMentions = async (req, res) => {
  try {
    const { customId } = req.user;
    const { page = 1, limit = 20, filter = "all" } = req.query;

    const result = await Mention.getAllMentions(customId, {
      page: parseInt(page),
      limit: parseInt(limit),
      filter, // "all", "unread", or "read"
    });

    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

const markMentionAsRead = async (req, res) => {
  try {
    const { mentionId } = req.query;
    await Mention.markAsRead(mentionId);
    res.json({ message: "Mention ditandai sudah dibaca" });
  } catch (error) {
    handleError(res, error);
  }
};

const markAllMentionsAsRead = async (req, res) => {
  try {
    const { customId } = req.user;
    await Mention.markAllAsRead(customId);
    res.json({ message: "Semua mention ditandai sudah dibaca" });
  } catch (error) {
    handleError(res, error);
  }
};

const getMentionCount = async (req, res) => {
  try {
    const { customId } = req.user;
    const count = await Mention.getUnreadCount(customId);
    res.json({ count });
  } catch (error) {
    handleError(res, error);
  }
};

// ============================================
// PINNED MESSAGES
// ============================================

const getPinnedMessages = async (req, res) => {
  try {
    const { channelId } = req.query;
    const pinned = await PinnedMessage.getChannelPinnedMessages(channelId);
    res.json(pinned);
  } catch (error) {
    handleError(res, error);
  }
};

const togglePinMessage = async (req, res) => {
  try {
    const { messageId } = req.query;
    const { channelId } = req.body;
    const { customId } = req.user;

    const result = await PinnedMessage.togglePin(
      channelId,
      messageId,
      customId
    );
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

// ============================================
// BOOKMARKS
// ============================================

const getMyBookmarks = async (req, res) => {
  try {
    const { customId } = req.user;
    const { page = 1, limit = 20, search } = req.query;

    let result;
    if (search && search.length >= 2) {
      result = await Bookmark.searchBookmarks(customId, search, {
        page: parseInt(page),
        limit: parseInt(limit),
      });
    } else {
      result = await Bookmark.getUserBookmarks(customId, {
        page: parseInt(page),
        limit: parseInt(limit),
      });
    }

    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

const toggleBookmark = async (req, res) => {
  try {
    const { messageId } = req.query;
    const { customId } = req.user;
    const { note } = req.body;

    const result = await Bookmark.toggleBookmark(customId, messageId, note);
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

const updateBookmarkNote = async (req, res) => {
  try {
    const { messageId } = req.query;
    const { customId } = req.user;
    const { note } = req.body;

    await Bookmark.updateNote(customId, messageId, note);
    res.json({ message: "Catatan bookmark berhasil diupdate" });
  } catch (error) {
    handleError(res, error);
  }
};

const getBookmarkCount = async (req, res) => {
  try {
    const { customId } = req.user;
    const count = await Bookmark.getBookmarkCount(customId);
    res.json({ count });
  } catch (error) {
    handleError(res, error);
  }
};

const checkBookmarkStatus = async (req, res) => {
  try {
    const { messageId } = req.query;
    const { customId } = req.user;

    const bookmarked = await Bookmark.isBookmarked(customId, messageId);
    res.json({ bookmarked });
  } catch (error) {
    handleError(res, error);
  }
};

// ============================================
// USER PRESENCE
// ============================================

const updatePresence = async (req, res) => {
  try {
    const { customId } = req.user;
    const { status, statusText, statusEmoji } = req.body;

    await UserPresence.updatePresence(customId, {
      status,
      statusText,
      statusEmoji,
    });
    res.json({ message: "Status berhasil diupdate" });
  } catch (error) {
    handleError(res, error);
  }
};

const getOnlineUsers = async (req, res) => {
  try {
    const users = await UserPresence.getOnlineUsers();
    res.json(users);
  } catch (error) {
    handleError(res, error);
  }
};

const getChannelOnlineUsers = async (req, res) => {
  try {
    const { channelId } = req.query;
    const users = await UserPresence.getOnlineUsersInChannel(channelId);
    res.json(users);
  } catch (error) {
    handleError(res, error);
  }
};

const heartbeat = async (req, res) => {
  try {
    const { customId } = req.user;
    await UserPresence.updateLastSeen(customId);
    res.json({ message: "OK" });
  } catch (error) {
    handleError(res, error);
  }
};

// ============================================
// VIDEO CALLS
// ============================================

const startVideoCall = async (req, res) => {
  try {
    const { channelId } = req.query;
    const { customId } = req.user;
    const { callType = "video", title } = req.body;

    // Check if there's an active call
    const activeCall = await VideoCall.getActiveCall(channelId);
    if (activeCall) {
      return res.status(400).json({
        message: "Sudah ada panggilan aktif di channel ini",
        call: activeCall,
      });
    }

    const call = await VideoCall.startCall({
      channelId,
      startedBy: customId,
      callType,
      title,
    });

    res.status(201).json(call);
  } catch (error) {
    handleError(res, error);
  }
};

const endVideoCall = async (req, res) => {
  try {
    const { callId } = req.query;

    const call = await VideoCall.query().findById(callId);
    if (!call) {
      return res.status(404).json({ message: "Panggilan tidak ditemukan" });
    }

    await call.endCall();
    res.json({ message: "Panggilan berhasil diakhiri" });
  } catch (error) {
    handleError(res, error);
  }
};

const getActiveCall = async (req, res) => {
  try {
    const { channelId } = req.query;
    const call = await VideoCall.getActiveCall(channelId);
    res.json(call);
  } catch (error) {
    handleError(res, error);
  }
};

const joinCall = async (req, res) => {
  try {
    const { callId } = req.query;
    const { customId } = req.user;

    await CallParticipant.joinCall(callId, customId);

    const call = await VideoCall.query()
      .findById(callId)
      .withGraphFetched("[participants.[user(simpleWithImage)]]");

    res.json(call);
  } catch (error) {
    handleError(res, error);
  }
};

const leaveCall = async (req, res) => {
  try {
    const { callId } = req.query;
    const { customId } = req.user;

    await CallParticipant.leaveCall(callId, customId);

    // Check if no more participants, auto-end call
    const participants = await CallParticipant.getActiveParticipants(callId);
    if (participants.length === 0) {
      const call = await VideoCall.query().findById(callId);
      await call.endCall();
    }

    res.json({ message: "Berhasil keluar dari panggilan" });
  } catch (error) {
    handleError(res, error);
  }
};

const getCallHistory = async (req, res) => {
  try {
    const { channelId, page = 1, limit = 20 } = req.query;
    const result = await VideoCall.getCallHistory(channelId, {
      page: parseInt(page),
      limit: parseInt(limit),
    });
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

// ============================================
// ATTACHMENTS
// ============================================

const getChannelMedia = async (req, res) => {
  try {
    const { channelId, type, page = 1, limit = 50 } = req.query;
    const result = await Attachment.getChannelMedia(channelId, {
      type,
      page: parseInt(page),
      limit: parseInt(limit),
    });
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

// ============================================
// STATS & MISC
// ============================================

const getChatStats = async (req, res) => {
  try {
    const { customId } = req.user;

    // Get user's channel IDs first
    const userChannelIds = Channel.query()
      .select("id")
      .whereExists(Channel.relatedQuery("members").where("user_id", customId));

    const [channelCount, messageCount, unreadMentions] = await Promise.all([
      Channel.query()
        .whereExists(Channel.relatedQuery("members").where("user_id", customId))
        .where("is_archived", false)
        .count("* as count")
        .first(),
      Message.query()
        .whereIn("channel_id", userChannelIds)
        .count("* as count")
        .first(),
      Mention.getUnreadCount(customId),
    ]);

    res.json({
      channels: parseInt(channelCount?.count || 0),
      messages: parseInt(messageCount?.count || 0),
      unreadMentions,
    });
  } catch (error) {
    handleError(res, error);
  }
};

const getUnreadCounts = async (req, res) => {
  try {
    const { customId } = req.user;

    // Get channels user is member of
    const channels = await Channel.getUserChannels(customId);

    const unreadCounts = {};
    for (const channel of channels) {
      unreadCounts[channel.id] = await ChannelMember.getUnreadCount(
        channel.id,
        customId
      );
    }

    res.json(unreadCounts);
  } catch (error) {
    handleError(res, error);
  }
};

// ============================================
// FILE UPLOAD
// ============================================

const uploadChatFile = async (req, res) => {
  try {
    const { customId: userId } = req.user;
    const { mc } = req;

    if (!req.file) {
      return res.status(400).json({ message: "File tidak ditemukan" });
    }

    const { buffer, originalname, size, mimetype } = req.file;

    // Determine attachment type
    let attachmentType = "file";
    if (mimetype.startsWith("image/")) attachmentType = "image";
    else if (mimetype.startsWith("video/")) attachmentType = "video";
    else if (mimetype.startsWith("audio/")) attachmentType = "audio";
    else if (
      mimetype.includes("pdf") ||
      mimetype.includes("document") ||
      mimetype.includes("sheet") ||
      mimetype.includes("text")
    ) {
      attachmentType = "document";
    }

    // Generate unique filename
    const ext = originalname.split(".").pop();
    const uniqueFilename = `rasn-chat/files/${nanoid()}.${ext}`;

    // Upload to Minio
    await uploadFilePublic(mc, buffer, uniqueFilename, size, mimetype, {
      "uploaded-by": userId,
      "original-name": originalname,
    });

    // Generate URL
    const baseUrl =
      process.env.MINIO_PUBLIC_URL || "https://siasn.bkd.jatimprov.go.id:9000";
    const fileUrl = `${baseUrl}/public/${uniqueFilename}`;

    // Save to database
    const attachment = await Attachment.query().insert({
      id: nanoid(),
      message_id: null, // Will be linked when message is sent
      file_name: originalname,
      file_url: fileUrl,
      file_size: size,
      file_type: mimetype,
      attachment_type: attachmentType,
      metadata: { uploaded_by: userId },
    });

    res.json({
      id: attachment.id,
      url: fileUrl,
      name: originalname,
      size,
      type: mimetype,
      attachmentType,
    });
  } catch (error) {
    handleError(res, error);
  }
};

const uploadVoiceMessage = async (req, res) => {
  try {
    const { customId: userId } = req.user;
    const { mc } = req;
    const { channelId, duration } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "File tidak ditemukan" });
    }

    const { buffer, size, mimetype } = req.file;

    // Generate unique filename
    const uniqueFilename = `rasn-chat/voice/${nanoid()}.webm`;

    // Upload to Minio
    await uploadFilePublic(mc, buffer, uniqueFilename, size, mimetype, {
      "uploaded-by": userId,
      "channel-id": channelId,
    });

    // Generate URL
    const baseUrl =
      process.env.MINIO_PUBLIC_URL || "https://siasn.bkd.jatimprov.go.id:9000";
    const fileUrl = `${baseUrl}/public/${uniqueFilename}`;

    // Save to database
    const attachment = await Attachment.query().insert({
      id: nanoid(),
      message_id: null,
      file_name: `voice_${new Date().toISOString()}.webm`,
      file_url: fileUrl,
      file_size: size,
      file_type: mimetype,
      attachment_type: "voice",
      duration: duration ? parseInt(duration) : null,
      metadata: { uploaded_by: userId },
    });

    res.json({
      id: attachment.id,
      url: fileUrl,
      size,
      type: "voice",
      duration: attachment.voice_duration,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ============================================
// SEARCH USERS
// ============================================

const Users = require("@/models/users.model");
const { raw } = require("objection");

const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const { organization_id } = req?.user;

    let query = Users.query()
      .select(
        "custom_id",
        "username",
        "image",
        "info",
        raw("info->'jabatan'->>'jabatan' as jabatan"),
        raw("info->'perangkat_daerah'->>'detail' as perangkat_daerah")
      )
      .orderByRaw(
        `
    CASE
      WHEN organization_id = ? THEN 0
      WHEN organization_id LIKE ? THEN 1
      ELSE 2
    END,
    LENGTH(organization_id),
    organization_id
    `,
        [organization_id, `${organization_id}%`]
      )
      .orderBy("username", "asc")
      .limit(15);

    // If query provided, filter by it
    if (q && q.length >= 1) {
      query = query.where((builder) => {
        builder
          .where("username", "ilike", `%${q}%`)
          .andWhere("group", "=", "MASTER")
          .andWhere("role", "=", "USER");
      });
    }

    const users = await query;
    res.json(users);
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  // Workspace Roles & Members
  getWorkspaceRoles,
  getWorkspaceMembers,
  getMyWorkspaceMembership,
  updateMemberWorkspaceRole,

  // Channel Roles
  getChannelRoles,

  // Channels
  getChannels,
  getMyChannels,
  getPublicChannels,
  getArchivedChannels,
  getChannelById,
  createChannel,
  updateChannel,
  deleteChannel,
  archiveChannel,
  unarchiveChannel,

  // Channel Members
  getChannelMembers,
  joinChannel,
  leaveChannel,
  inviteMember,
  removeMember,
  updateMemberRole,
  toggleMuteChannel,
  updateNotificationPref,

  // Messages
  getMessages,
  getChannelDateRange,
  getThreadMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  searchMessages,

  // Reactions
  toggleReaction,
  getMessageReactions,

  // Mentions
  getMyMentions,
  markMentionAsRead,
  markAllMentionsAsRead,
  getMentionCount,

  // Pinned Messages
  getPinnedMessages,
  togglePinMessage,

  // Bookmarks
  getMyBookmarks,
  toggleBookmark,
  updateBookmarkNote,
  getBookmarkCount,
  checkBookmarkStatus,

  // User Presence
  updatePresence,
  getOnlineUsers,
  getChannelOnlineUsers,
  heartbeat,

  // Video Calls
  startVideoCall,
  endVideoCall,
  getActiveCall,
  joinCall,
  leaveCall,
  getCallHistory,

  // Attachments
  getChannelMedia,

  // Stats
  getChatStats,
  getUnreadCounts,

  // Upload & Search
  uploadChatFile,
  uploadVoiceMessage,
  searchUsers,
};

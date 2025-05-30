// migrations/20250530_create_email_user_actions_table.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.raw(`
    -- Create email_user_actions table
    CREATE TABLE IF NOT EXISTS rasn_mail.email_user_actions (
      id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
      email_id VARCHAR(255) NOT NULL 
        REFERENCES rasn_mail.emails(id) ON DELETE CASCADE,
      user_id VARCHAR(255) NOT NULL 
        REFERENCES public.users(custom_id) ON DELETE CASCADE,
      
      -- User interaction flags
      is_starred BOOLEAN DEFAULT false,
      is_read BOOLEAN DEFAULT false,
      is_important BOOLEAN DEFAULT false,
      is_archived BOOLEAN DEFAULT false,
      
      -- Folder management (Gmail-like labels)
      folder VARCHAR(50) DEFAULT 'inbox' 
        CHECK (folder IN ('inbox', 'sent', 'drafts', 'starred', 'archive', 'trash', 'spam')),
      
      -- Snooze functionality (Gmail feature)
      is_snoozed BOOLEAN DEFAULT false,
      snoozed_until TIMESTAMP WITH TIME ZONE,
      
      -- Timestamps
      read_at TIMESTAMP WITH TIME ZONE,
      starred_at TIMESTAMP WITH TIME ZONE,
      deleted_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      
      -- Ensure one record per user per email
      CONSTRAINT unique_user_email UNIQUE(email_id, user_id)
    );

    -- Indexes for performance
    CREATE INDEX idx_email_user_actions_user ON rasn_mail.email_user_actions(user_id);
    CREATE INDEX idx_email_user_actions_email ON rasn_mail.email_user_actions(email_id);
    CREATE INDEX idx_email_user_actions_folder ON rasn_mail.email_user_actions(user_id, folder);
    CREATE INDEX idx_email_user_actions_starred ON rasn_mail.email_user_actions(user_id, is_starred) WHERE is_starred = true;
    CREATE INDEX idx_email_user_actions_unread ON rasn_mail.email_user_actions(user_id, is_read) WHERE is_read = false;
    CREATE INDEX idx_email_user_actions_snoozed ON rasn_mail.email_user_actions(user_id, is_snoozed, snoozed_until) WHERE is_snoozed = true;
    CREATE INDEX idx_email_user_actions_deleted ON rasn_mail.email_user_actions(user_id, deleted_at) WHERE deleted_at IS NULL;

    -- Trigger untuk auto-update updated_at
    CREATE OR REPLACE FUNCTION rasn_mail.update_email_user_actions_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER trigger_email_user_actions_updated_at
        BEFORE UPDATE ON rasn_mail.email_user_actions
        FOR EACH ROW
        EXECUTE FUNCTION rasn_mail.update_email_user_actions_updated_at();
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.raw(`
    DROP TRIGGER IF EXISTS trigger_email_user_actions_updated_at ON rasn_mail.email_user_actions;
    DROP FUNCTION IF EXISTS rasn_mail.update_email_user_actions_updated_at();
    DROP TABLE IF EXISTS rasn_mail.email_user_actions;
  `);
};

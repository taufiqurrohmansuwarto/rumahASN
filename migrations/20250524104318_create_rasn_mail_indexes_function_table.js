/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.raw(`
    -- Full-text search index
    CREATE INDEX IF NOT EXISTS idx_emails_search 
    ON rasn_mail.emails USING gin(to_tsvector('indonesian', COALESCE(subject, '') || ' ' || COALESCE(content, '')));
    
    -- Composite indexes untuk performa
    CREATE INDEX IF NOT EXISTS idx_recipients_user_folder_deleted 
    ON rasn_mail.recipients (recipient_id, folder, is_deleted);
    
    CREATE INDEX IF NOT EXISTS idx_recipients_user_unread 
    ON rasn_mail.recipients (recipient_id, is_read) WHERE is_read = false AND is_deleted = false;
    
    CREATE INDEX IF NOT EXISTS idx_emails_sent_date 
    ON rasn_mail.emails (sent_at DESC) WHERE is_draft = false;
    
    -- Function untuk get unread count
    CREATE OR REPLACE FUNCTION rasn_mail.get_unread_count(p_user_id varchar)
    RETURNS integer AS $$
    BEGIN
        RETURN (
            SELECT COUNT(*)::integer
            FROM rasn_mail.recipients r
            JOIN rasn_mail.emails e ON r.email_id = e.id
            WHERE r.recipient_id = p_user_id
            AND r.is_read = false
            AND r.is_deleted = false
            AND r.folder = 'inbox'
            AND e.is_draft = false
        );
    END;
    $$ LANGUAGE plpgsql;
    
    -- Function untuk mark as read
    CREATE OR REPLACE FUNCTION rasn_mail.mark_as_read(p_email_id varchar, p_user_id varchar)
    RETURNS boolean AS $$
    DECLARE
        v_updated integer;
    BEGIN
        UPDATE rasn_mail.recipients 
        SET 
            is_read = true, 
            read_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE email_id = p_email_id 
        AND recipient_id = p_user_id 
        AND is_read = false;
        
        GET DIAGNOSTICS v_updated = ROW_COUNT;
        RETURN v_updated > 0;
    END;
    $$ LANGUAGE plpgsql;
    
    -- Function untuk move to folder
    CREATE OR REPLACE FUNCTION rasn_mail.move_to_folder(
        p_email_id varchar, 
        p_user_id varchar, 
        p_folder varchar
    )
    RETURNS boolean AS $$
    DECLARE
        v_updated integer;
    BEGIN
        UPDATE rasn_mail.recipients 
        SET 
            folder = p_folder,
            is_deleted = CASE WHEN p_folder = 'trash' THEN true ELSE false END,
            deleted_at = CASE WHEN p_folder = 'trash' THEN CURRENT_TIMESTAMP ELSE NULL END,
            updated_at = CURRENT_TIMESTAMP
        WHERE email_id = p_email_id 
        AND recipient_id = p_user_id;
        
        GET DIAGNOSTICS v_updated = ROW_COUNT;
        RETURN v_updated > 0;
    END;
    $$ LANGUAGE plpgsql;
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.raw(`
    DROP FUNCTION IF EXISTS rasn_mail.move_to_folder(varchar, varchar, varchar);
    DROP FUNCTION IF EXISTS rasn_mail.mark_as_read(varchar, varchar);
    DROP FUNCTION IF EXISTS rasn_mail.get_unread_count(varchar);
    DROP INDEX IF EXISTS rasn_mail.idx_emails_sent_date;
    DROP INDEX IF EXISTS rasn_mail.idx_recipients_user_unread;
    DROP INDEX IF EXISTS rasn_mail.idx_recipients_user_folder_deleted;
    DROP INDEX IF EXISTS rasn_mail.idx_emails_search;
  `);
};

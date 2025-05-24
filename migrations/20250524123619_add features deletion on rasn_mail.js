/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.raw(`
    -- Add delete tracking to emails table
    ALTER TABLE rasn_mail.emails 
    ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(255) REFERENCES public.users(custom_id);

    -- Create email_deletions table untuk track individual user deletions
    CREATE TABLE IF NOT EXISTS rasn_mail.email_deletions (
        id VARCHAR(255) PRIMARY KEY,
        email_id VARCHAR(255) NOT NULL 
            REFERENCES rasn_mail.emails(id) ON DELETE CASCADE,
        user_id VARCHAR(255) NOT NULL 
            REFERENCES public.users(custom_id) ON DELETE CASCADE,
        deletion_type VARCHAR(20) NOT NULL DEFAULT 'soft'
            CHECK (deletion_type IN ('soft', 'trash', 'permanent')),
        deleted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        restored_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        
        UNIQUE(email_id, user_id)
    );

    -- Add indexes
    CREATE INDEX idx_email_deletions_email ON rasn_mail.email_deletions(email_id);
    CREATE INDEX idx_email_deletions_user ON rasn_mail.email_deletions(user_id);
    CREATE INDEX idx_email_deletions_type ON rasn_mail.email_deletions(deletion_type);
    CREATE INDEX idx_emails_deleted ON rasn_mail.emails(is_deleted, deleted_at);

    -- Function untuk soft delete email untuk user tertentu
    CREATE OR REPLACE FUNCTION rasn_mail.delete_email_for_user(
        p_email_id VARCHAR,
        p_user_id VARCHAR,
        p_deletion_type VARCHAR DEFAULT 'soft'
    )
    RETURNS BOOLEAN AS $$
    DECLARE
        v_recipient_updated INTEGER;
        v_is_sender BOOLEAN;
    BEGIN
        -- Check if user is sender
        SELECT COUNT(*) > 0 INTO v_is_sender
        FROM rasn_mail.emails 
        WHERE id = p_email_id AND sender_id = p_user_id;
        
        -- Update recipient record if user is recipient
        UPDATE rasn_mail.recipients 
        SET 
            folder = CASE WHEN p_deletion_type = 'trash' THEN 'trash' ELSE folder END,
            is_deleted = true,
            deleted_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE email_id = p_email_id 
        AND recipient_id = p_user_id;
        
        GET DIAGNOSTICS v_recipient_updated = ROW_COUNT;
        
        -- Insert deletion record
        INSERT INTO rasn_mail.email_deletions (
            id, email_id, user_id, deletion_type, deleted_at
        ) VALUES (
            gen_random_uuid()::varchar, p_email_id, p_user_id, p_deletion_type, CURRENT_TIMESTAMP
        ) ON CONFLICT (email_id, user_id) DO UPDATE SET
            deletion_type = p_deletion_type,
            deleted_at = CURRENT_TIMESTAMP,
            restored_at = NULL,
            updated_at = CURRENT_TIMESTAMP;
        
        -- If user is sender and it's permanent delete, mark email as deleted
        IF v_is_sender AND p_deletion_type = 'permanent' THEN
            UPDATE rasn_mail.emails 
            SET 
                is_deleted = true,
                deleted_at = CURRENT_TIMESTAMP,
                deleted_by = p_user_id,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = p_email_id;
        END IF;
        
        RETURN true;
    END;
    $$ LANGUAGE plpgsql;

    -- Function untuk restore email
    CREATE OR REPLACE FUNCTION rasn_mail.restore_email_for_user(
        p_email_id VARCHAR,
        p_user_id VARCHAR
    )
    RETURNS BOOLEAN AS $$
    DECLARE
        v_updated INTEGER;
    BEGIN
        -- Restore recipient record
        UPDATE rasn_mail.recipients 
        SET 
            folder = 'inbox',
            is_deleted = false,
            deleted_at = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE email_id = p_email_id 
        AND recipient_id = p_user_id;
        
        GET DIAGNOSTICS v_updated = ROW_COUNT;
        
        -- Update deletion record
        UPDATE rasn_mail.email_deletions 
        SET 
            restored_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE email_id = p_email_id 
        AND user_id = p_user_id;
        
        RETURN v_updated > 0;
    END;
    $$ LANGUAGE plpgsql;

    -- Function untuk permanent delete (hard delete)
    CREATE OR REPLACE FUNCTION rasn_mail.permanent_delete_email(
        p_email_id VARCHAR,
        p_user_id VARCHAR
    )
    RETURNS BOOLEAN AS $$
    DECLARE
        v_is_sender BOOLEAN;
        v_other_recipients INTEGER;
    BEGIN
        -- Check if user is sender
        SELECT COUNT(*) > 0 INTO v_is_sender
        FROM rasn_mail.emails 
        WHERE id = p_email_id AND sender_id = p_user_id;
        
        -- Count other recipients who haven't permanently deleted
        SELECT COUNT(*) INTO v_other_recipients
        FROM rasn_mail.recipients r
        LEFT JOIN rasn_mail.email_deletions ed ON r.email_id = ed.email_id AND r.recipient_id = ed.user_id
        WHERE r.email_id = p_email_id 
        AND r.recipient_id != p_user_id
        AND (ed.deletion_type IS NULL OR ed.deletion_type != 'permanent');
        
        -- If sender and no other recipients, completely delete email
        IF v_is_sender AND v_other_recipients = 0 THEN
            -- Delete in correct order
            DELETE FROM rasn_mail.email_deletions WHERE email_id = p_email_id;
            DELETE FROM rasn_mail.email_labels WHERE email_id = p_email_id;
            DELETE FROM rasn_mail.attachments WHERE email_id = p_email_id;
            DELETE FROM rasn_mail.recipients WHERE email_id = p_email_id;
            DELETE FROM rasn_mail.emails WHERE id = p_email_id;
        ELSE
            -- Just mark as permanently deleted for this user
            INSERT INTO rasn_mail.email_deletions (
                id, email_id, user_id, deletion_type, deleted_at
            ) VALUES (
                gen_random_uuid()::varchar, p_email_id, p_user_id, 'permanent', CURRENT_TIMESTAMP
            ) ON CONFLICT (email_id, user_id) DO UPDATE SET
                deletion_type = 'permanent',
                deleted_at = CURRENT_TIMESTAMP,
                restored_at = NULL,
                updated_at = CURRENT_TIMESTAMP;
                
            -- Remove recipient record
            DELETE FROM rasn_mail.recipients 
            WHERE email_id = p_email_id AND recipient_id = p_user_id;
        END IF;
        
        RETURN true;
    END;
    $$ LANGUAGE plpgsql;

    -- Function untuk bulk delete
    CREATE OR REPLACE FUNCTION rasn_mail.bulk_delete_emails(
        p_email_ids VARCHAR[],
        p_user_id VARCHAR,
        p_deletion_type VARCHAR DEFAULT 'soft'
    )
    RETURNS INTEGER AS $$
    DECLARE
        v_email_id VARCHAR;
        v_count INTEGER := 0;
    BEGIN
        FOREACH v_email_id IN ARRAY p_email_ids
        LOOP
            IF rasn_mail.delete_email_for_user(v_email_id, p_user_id, p_deletion_type) THEN
                v_count := v_count + 1;
            END IF;
        END LOOP;
        
        RETURN v_count;
    END;
    $$ LANGUAGE plpgsql;

    -- Function untuk cleanup old deleted emails
    CREATE OR REPLACE FUNCTION rasn_mail.cleanup_old_deleted_emails(
        p_days_old INTEGER DEFAULT 30
    )
    RETURNS INTEGER AS $$
    DECLARE
        v_cutoff_date TIMESTAMP WITH TIME ZONE;
        v_deleted_count INTEGER := 0;
    BEGIN
        v_cutoff_date := CURRENT_TIMESTAMP - (p_days_old || ' days')::INTERVAL;
        
        -- Get emails that are in trash for more than specified days
        WITH old_trash_emails AS (
            SELECT DISTINCT ed.email_id
            FROM rasn_mail.email_deletions ed
            WHERE ed.deletion_type = 'trash'
            AND ed.deleted_at < v_cutoff_date
            AND ed.restored_at IS NULL
        )
        -- Permanently delete them
        DELETE FROM rasn_mail.emails 
        WHERE id IN (SELECT email_id FROM old_trash_emails);
        
        GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
        
        RETURN v_deleted_count;
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
    DROP FUNCTION IF EXISTS rasn_mail.cleanup_old_deleted_emails(INTEGER);
    DROP FUNCTION IF EXISTS rasn_mail.bulk_delete_emails(VARCHAR[], VARCHAR, VARCHAR);
    DROP FUNCTION IF EXISTS rasn_mail.permanent_delete_email(VARCHAR, VARCHAR);
    DROP FUNCTION IF EXISTS rasn_mail.restore_email_for_user(VARCHAR, VARCHAR);
    DROP FUNCTION IF EXISTS rasn_mail.delete_email_for_user(VARCHAR, VARCHAR, VARCHAR);
    
    DROP TABLE IF EXISTS rasn_mail.email_deletions;
    
    ALTER TABLE rasn_mail.emails 
    DROP COLUMN IF EXISTS deleted_by,
    DROP COLUMN IF EXISTS deleted_at,
    DROP COLUMN IF EXISTS is_deleted;
  `);
};

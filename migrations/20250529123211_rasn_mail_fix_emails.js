/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.raw(`
    -- 1. Pastikan kolom is_archived ada di emails table
    DO $$ 
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'rasn_mail' 
            AND table_name = 'emails' 
            AND column_name = 'is_archived'
        ) THEN
            ALTER TABLE rasn_mail.emails 
            ADD COLUMN is_archived BOOLEAN DEFAULT false;
        END IF;
    END $$;
    
    -- 2. Update folder constraint untuk recipients jika belum ada semua values
    DO $$
    BEGIN
        -- Drop existing constraint jika ada
        ALTER TABLE rasn_mail.recipients 
        DROP CONSTRAINT IF EXISTS recipients_folder_check;
        
        -- Add constraint dengan semua folder values
        ALTER TABLE rasn_mail.recipients 
        ADD CONSTRAINT recipients_folder_check 
        CHECK (folder IN ('inbox', 'sent', 'drafts', 'starred', 'archive', 'trash', 'spam', 'important'));
        
        -- Update data yang tidak sesuai
        UPDATE rasn_mail.recipients 
        SET folder = 'inbox' 
        WHERE folder NOT IN ('inbox', 'sent', 'drafts', 'starred', 'archive', 'trash', 'spam', 'important');
        
    EXCEPTION WHEN OTHERS THEN
        -- Jika gagal, berarti struktur berbeda, skip
        NULL;
    END $$;
    
    -- 3. Add helpful indexes
    CREATE INDEX IF NOT EXISTS idx_recipients_folder_user_active
    ON rasn_mail.recipients(folder, recipient_id, is_deleted)
    WHERE is_deleted = false;
    
    CREATE INDEX IF NOT EXISTS idx_emails_starred_active  
    ON rasn_mail.emails(is_starred, is_draft, sender_id)
    WHERE is_starred = true AND is_draft = false;
    
    CREATE INDEX IF NOT EXISTS idx_emails_archived_flag
    ON rasn_mail.emails(is_archived)
    WHERE is_archived = true;
    
    -- 4. Simple function untuk toggle star (dengan error handling)
    CREATE OR REPLACE FUNCTION rasn_mail.safe_toggle_star(
        p_email_id VARCHAR,
        p_user_id VARCHAR
    )
    RETURNS BOOLEAN AS $$
    DECLARE
        v_has_access BOOLEAN := false;
        v_current_starred BOOLEAN := false;
    BEGIN
        -- Check access (sender atau recipient)
        SELECT COUNT(*) > 0 INTO v_has_access
        FROM rasn_mail.emails e
        LEFT JOIN rasn_mail.recipients r ON e.id = r.email_id
        WHERE e.id = p_email_id
        AND (e.sender_id = p_user_id OR r.recipient_id = p_user_id);
        
        IF NOT v_has_access THEN
            RETURN false;
        END IF;
        
        -- Get current status
        SELECT COALESCE(is_starred, false) INTO v_current_starred
        FROM rasn_mail.emails 
        WHERE id = p_email_id;
        
        -- Toggle
        UPDATE rasn_mail.emails 
        SET is_starred = NOT v_current_starred
        WHERE id = p_email_id;
        
        RETURN true;
    EXCEPTION WHEN OTHERS THEN
        RETURN false;
    END;
    $$ LANGUAGE plpgsql;
    
    -- 5. Simple function untuk move folder
    CREATE OR REPLACE FUNCTION rasn_mail.safe_move_to_folder(
        p_email_id VARCHAR,
        p_user_id VARCHAR,
        p_folder VARCHAR
    )
    RETURNS BOOLEAN AS $$
    DECLARE
        v_updated INTEGER := 0;
    BEGIN
        -- Validate folder
        IF p_folder NOT IN ('inbox', 'archive', 'spam', 'trash') THEN
            RETURN false;
        END IF;
        
        -- Update recipient folder
        UPDATE rasn_mail.recipients 
        SET 
            folder = p_folder,
            is_deleted = CASE WHEN p_folder = 'trash' THEN true ELSE false END,
            deleted_at = CASE WHEN p_folder = 'trash' THEN CURRENT_TIMESTAMP ELSE NULL END
        WHERE email_id = p_email_id 
        AND recipient_id = p_user_id;
        
        GET DIAGNOSTICS v_updated = ROW_COUNT;
        
        -- Update email archived flag jika perlu
        IF p_folder = 'archive' AND v_updated > 0 THEN
            UPDATE rasn_mail.emails 
            SET is_archived = true
            WHERE id = p_email_id;
        ELSIF p_folder != 'archive' AND v_updated > 0 THEN
            -- Check if any other recipients still in archive
            IF NOT EXISTS (
                SELECT 1 FROM rasn_mail.recipients 
                WHERE email_id = p_email_id 
                AND folder = 'archive' 
                AND is_deleted = false
            ) THEN
                UPDATE rasn_mail.emails 
                SET is_archived = false
                WHERE id = p_email_id;
            END IF;
        END IF;
        
        RETURN v_updated > 0;
    EXCEPTION WHEN OTHERS THEN
        RETURN false;
    END;
    $$ LANGUAGE plpgsql;
    
    -- 6. Function untuk get starred emails (simple version)
    CREATE OR REPLACE FUNCTION rasn_mail.get_starred_for_user(
        p_user_id VARCHAR,
        p_limit INTEGER DEFAULT 25,
        p_offset INTEGER DEFAULT 0,
        p_search TEXT DEFAULT NULL
    )
    RETURNS TABLE (
        id VARCHAR,
        sender_id VARCHAR,
        subject VARCHAR,
        content TEXT,
        priority VARCHAR,
        is_starred BOOLEAN,
        is_draft BOOLEAN,
        sent_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE,
        updated_at TIMESTAMP WITH TIME ZONE,
        sender_name VARCHAR,
        sender_email VARCHAR,
        sender_image VARCHAR,
        is_read BOOLEAN,
        user_role VARCHAR
    ) AS $$
    BEGIN
        RETURN QUERY
        SELECT DISTINCT
            e.id,
            e.sender_id,
            e.subject,
            e.content,
            e.priority,
            e.is_starred,
            e.is_draft,
            e.sent_at,
            e.created_at,
            e.updated_at,
            u.username as sender_name,
            u.email as sender_email,
            u.image as sender_image,
            COALESCE(r.is_read, true) as is_read,
            CASE 
                WHEN e.sender_id = p_user_id THEN 'sender'
                ELSE 'recipient'
            END as user_role
        FROM rasn_mail.emails e
        JOIN public.users u ON e.sender_id = u.custom_id
        LEFT JOIN rasn_mail.recipients r ON e.id = r.email_id AND r.recipient_id = p_user_id
        WHERE e.is_starred = true
        AND e.is_draft = false
        AND (
            e.sender_id = p_user_id
            OR (r.recipient_id = p_user_id AND COALESCE(r.is_deleted, false) = false)
        )
        AND (
            p_search IS NULL OR 
            e.subject ILIKE '%' || p_search || '%' OR
            e.content ILIKE '%' || p_search || '%' OR
            u.username ILIKE '%' || p_search || '%'
        )
        ORDER BY e.created_at DESC
        LIMIT p_limit
        OFFSET p_offset;
    EXCEPTION WHEN OTHERS THEN
        -- Return empty if function fails
        RETURN;
    END;
    $$ LANGUAGE plpgsql;
    
    -- 7. Function untuk count starred emails
    CREATE OR REPLACE FUNCTION rasn_mail.count_starred_for_user(
        p_user_id VARCHAR,
        p_search TEXT DEFAULT NULL
    )
    RETURNS INTEGER AS $$
    DECLARE
        v_count INTEGER := 0;
    BEGIN
        SELECT COUNT(DISTINCT e.id) INTO v_count
        FROM rasn_mail.emails e
        JOIN public.users u ON e.sender_id = u.custom_id
        LEFT JOIN rasn_mail.recipients r ON e.id = r.email_id AND r.recipient_id = p_user_id
        WHERE e.is_starred = true
        AND e.is_draft = false
        AND (
            e.sender_id = p_user_id
            OR (r.recipient_id = p_user_id AND COALESCE(r.is_deleted, false) = false)
        )
        AND (
            p_search IS NULL OR 
            e.subject ILIKE '%' || p_search || '%' OR
            e.content ILIKE '%' || p_search || '%' OR
            u.username ILIKE '%' || p_search || '%'
        );
        
        RETURN v_count;
    EXCEPTION WHEN OTHERS THEN
        RETURN 0;
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
    DROP FUNCTION IF EXISTS rasn_mail.count_starred_for_user(VARCHAR, TEXT);
    DROP FUNCTION IF EXISTS rasn_mail.get_starred_for_user(VARCHAR, INTEGER, INTEGER, TEXT);
    DROP FUNCTION IF EXISTS rasn_mail.safe_move_to_folder(VARCHAR, VARCHAR, VARCHAR);
    DROP FUNCTION IF EXISTS rasn_mail.safe_toggle_star(VARCHAR, VARCHAR);
    DROP INDEX IF EXISTS rasn_mail.idx_emails_archived_flag;
    DROP INDEX IF EXISTS rasn_mail.idx_emails_starred_active;
    DROP INDEX IF EXISTS rasn_mail.idx_recipients_folder_user_active;
    
    ALTER TABLE rasn_mail.recipients 
    DROP CONSTRAINT IF EXISTS recipients_folder_check;
    
    ALTER TABLE rasn_mail.emails 
    DROP COLUMN IF EXISTS is_archived;
  `);
};

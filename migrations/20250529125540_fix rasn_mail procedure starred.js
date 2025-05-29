/**
 * Migration untuk memperbaiki stored function get_starred_for_user
 * yang sebelumnya tidak return data dengan benar
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.raw(`
    -- 1. Drop function lama yang bermasalah
    DROP FUNCTION IF EXISTS rasn_mail.get_starred_for_user(VARCHAR, INTEGER, INTEGER, TEXT);
    DROP FUNCTION IF EXISTS rasn_mail.count_starred_for_user(VARCHAR, TEXT);
    
    -- 2. Buat function baru yang sudah diperbaiki
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
            COALESCE(e.priority, 'normal')::VARCHAR,
            e.is_starred,
            e.is_draft,
            e.sent_at,
            e.created_at,
            e.updated_at,
            u.username::VARCHAR,
            u.email::VARCHAR,
            u.image::VARCHAR,
            COALESCE(r.is_read, true),
            CASE 
                WHEN e.sender_id = p_user_id THEN 'sender'::VARCHAR
                ELSE 'recipient'::VARCHAR
            END
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
    END;
    $$ LANGUAGE plpgsql;
    
    -- 3. Buat function count yang diperbaiki
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
    END;
    $$ LANGUAGE plpgsql;
    
    -- 4. Test function untuk memastikan works
    -- (Comment ini hanya untuk dokumentasi, tidak dijalankan)
    -- SELECT * FROM rasn_mail.get_starred_for_user('master|56543', 5, 0, null);
    -- SELECT rasn_mail.count_starred_for_user('master|56543', null);
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.raw(`
    -- Hapus function yang diperbaiki
    DROP FUNCTION IF EXISTS rasn_mail.count_starred_for_user(VARCHAR, TEXT);
    DROP FUNCTION IF EXISTS rasn_mail.get_starred_for_user(VARCHAR, INTEGER, INTEGER, TEXT);
  `);
};

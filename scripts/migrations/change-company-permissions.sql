-- Script to replace one company ID with another in userPermission.permission JSONB column
-- Only processes userPermission for users associated with the old company
-- Other company IDs in the arrays will remain unchanged
-- Also updates userToCompany records to use the new company ID
-- Usage: Replace 'old_company_id_here' and 'new_company_id_here' with actual values

DO $$
DECLARE
    old_company_id TEXT := 'old_company_id_here'; -- Replace with actual old company ID
    new_company_id TEXT := 'new_company_id_here'; -- Replace with actual new company ID
    rec RECORD;
    updated_permission JSONB;
    key TEXT;
    value JSONB;
    array_element JSONB;
    new_array JSONB := '[]'::JSONB;
    changes_made BOOLEAN := FALSE;
    user_company_count INTEGER;
BEGIN
    -- Loop through userPermission for users associated with the old company
    FOR rec IN 
        SELECT up.id, up.permissions 
        FROM "userPermission" up
        INNER JOIN "user" u ON up."id" = u.id
        INNER JOIN "userToCompany" uc ON uc."userId" = u.id
        WHERE uc."companyId" = old_company_id 
        AND up.permissions IS NOT NULL
    LOOP
        updated_permission := rec.permissions;
        changes_made := FALSE;
        
        -- Loop through each key-value pair in the JSONB object
        FOR key, value IN SELECT * FROM jsonb_each(rec.permissions)
        LOOP
            -- Check if the value is an array
            IF jsonb_typeof(value) = 'array' THEN
                new_array := '[]'::JSONB;
                
                -- Loop through each element in the array
                FOR array_element IN SELECT * FROM jsonb_array_elements(value)
                LOOP
                    -- If the element matches old_company_id, replace with new_company_id
                    IF array_element #>> '{}' = old_company_id THEN
                        new_array := new_array || to_jsonb(new_company_id);
                        changes_made := TRUE;
                    ELSE
                        -- Keep all other company IDs unchanged
                        new_array := new_array || array_element;
                    END IF;
                END LOOP;
                
                -- Update the permission object with the new array
                updated_permission := jsonb_set(updated_permission, ARRAY[key], new_array);
            END IF;
        END LOOP;
        
        -- Update the row only if changes were made
        IF changes_made THEN
            UPDATE "userPermission" 
            SET permissions = updated_permission 
            WHERE id = rec.id;

            UPDATE "employee"
            SET "companyId" = new_company_id
            WHERE "companyId" = old_company_id;
            
            RAISE NOTICE 'Updated userPermission record ID: %', rec.id;
        END IF;
    END LOOP;
    
    -- Update userToCompany records to use the new company ID
    UPDATE "userToCompany" 
    SET "companyId" = new_company_id 
    WHERE "companyId" = old_company_id;

    
    
    GET DIAGNOSTICS user_company_count = ROW_COUNT;
    RAISE NOTICE 'Updated % userToCompany records from company % to %', user_company_count, old_company_id, new_company_id;
    
    RAISE NOTICE 'Company ID replacement completed. Replaced % with %', old_company_id, new_company_id;
END $$;

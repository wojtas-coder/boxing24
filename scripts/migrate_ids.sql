-- MIGRATION SCRIPT: Unify Coach Identity & Normalize Emails
-- Run this in Supabase Dashboard -> SQL Editor

-- 1. Update Booking Coach IDs (Text -> UUID)
update public.bookings
set coach_id = 'e1679220-0798-471b-912e-b1e861e3c30c'
where coach_id = 'wojciech-rewczuk';

-- 2. Normalize Client Emails (to lowercase)
update public.bookings
set client_email = lower(client_email);

-- 3. Verify
select count(*) as migrated_bookings from public.bookings where coach_id = 'e1679220-0798-471b-912e-b1e861e3c30c';

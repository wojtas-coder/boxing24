-- Grant Premium/VIP Access to User
-- Run this in Supabase SQL Editor

-- Update user profile to member status
UPDATE profiles 
SET 
    membership_status = 'member',
    role = 'member'
WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'wojtekrewczuk@gmail.com'
);

-- Verify the update
SELECT p.id, u.email, p.full_name, p.role, p.membership_status 
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'wojtekrewczuk@gmail.com';

-- Nadanie uprawnień ADMINA dla konkretnego użytkownika
-- Email: wojtekrewczuk@gmail.com

UPDATE profiles 
SET role = 'admin' 
WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'wojtekrewczuk@gmail.com'
);

-- Sprawdzenie wyniku (powinno zwrócić wiersz z rolą 'admin')
SELECT * FROM profiles 
WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'wojtekrewczuk@gmail.com'
);

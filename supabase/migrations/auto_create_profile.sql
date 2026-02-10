-- 1. Create a function that inserts a row into public.profiles
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, membership_status)
  values (
    new.id,
    new.email,
    -- Try to get name from metadata, fallback to email user part
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'client',
    'Free'
  );
  return new;
end;
$$;

-- 2. Create the trigger
-- Drop if exists to avoid errors on re-run
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Garantir que o auth admin pode acessar a tabela profiles via trigger
grant usage on schema public to supabase_auth_admin;
grant all on table public.profiles to supabase_auth_admin;

-- Recriar a função com search_path explícito
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nome, role)
  values (new.id, new.raw_user_meta_data->>'nome', 'membro');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Garantir execute para auth admin
grant execute on function public.handle_new_user() to supabase_auth_admin;

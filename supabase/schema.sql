-- Supabase SQL Editor-এ একবার Run করুন
create table public.admins(user_id uuid primary key references auth.users on delete cascade);
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as
$$ select exists(select 1 from public.admins where user_id=auth.uid()) $$;
create table public.content(
 id uuid primary key default gen_random_uuid(),
 kind text not null check (kind in ('service','education','notice')),
 category text not null, title text not null, title_en text,
 summary text, eligibility text, documents text, steps text,
 authority text, source_name text, official_url text,
 pub_date date, deadline date, fee text, processing_time text,
 status text not null default 'pending' check (status in ('verified','pending','rejected')),
 last_verified date, is_urgent boolean default false, is_published boolean default false, is_archived boolean default false,
 image_url text, pdf_url text, links jsonb default '[]'::jsonb,
 created_at timestamptz default now(), updated_at timestamptz default now());
create table public.messages(id uuid primary key default gen_random_uuid(), name text, email text, body text, created_at timestamptz default now());
create table public.activity_log(id bigserial primary key, user_id uuid default auth.uid(), action text, item_id uuid, at timestamptz default now());
alter table public.admins enable row level security; alter table public.content enable row level security;
alter table public.messages enable row level security; alter table public.activity_log enable row level security;
create policy "public read published" on public.content for select using (is_published and not is_archived);
create policy "admin all content" on public.content for all using (public.is_admin()) with check (public.is_admin());
create policy "anyone can send message" on public.messages for insert with check (length(body)<5000);
create policy "admin read messages" on public.messages for select using (public.is_admin());
create policy "admin log" on public.activity_log for all using (public.is_admin()) with check (public.is_admin());
create policy "self check" on public.admins for select using (user_id=auth.uid());
create or replace function public.touch() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
create trigger t_touch before update on public.content for each row execute function public.touch();
-- ছবি/PDF স্টোরেজ
insert into storage.buckets(id,name,public) values('uploads','uploads',true) on conflict do nothing;
create policy "public read uploads" on storage.objects for select using (bucket_id='uploads');
create policy "admin write uploads" on storage.objects for insert with check (bucket_id='uploads' and public.is_admin());
create policy "admin update uploads" on storage.objects for update using (bucket_id='uploads' and public.is_admin());
create policy "admin delete uploads" on storage.objects for delete using (bucket_id='uploads' and public.is_admin());
-- অ্যাডমিন বানাতে: Authentication > Users এ ইউজার তৈরির পর:
-- insert into public.admins(user_id) select id from auth.users where email='YOUR_EMAIL';

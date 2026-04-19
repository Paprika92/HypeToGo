-- ============================================
-- HYPETOGO — Script SQL Supabase complet
-- Colle ce script dans : Supabase > SQL Editor
-- ============================================

-- 1. TABLE PROFILES
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null check (role in ('user', 'orga')),
  name text,
  company_name text,
  siret text,
  created_at timestamptz default now()
);

-- 2. TABLE EVENTS
create table if not exists events (
  id uuid default gen_random_uuid() primary key,
  organizer_id uuid references profiles(id) on delete cascade,
  title text not null,
  category text not null check (category in ('concerts','standup','sport','expos','bars','esport','theatre')),
  description text,
  location_name text not null,
  lat float not null,
  lng float not null,
  date timestamptz not null,
  price float default 0,
  capacity int,
  ticket_url text,
  cover_url text,
  status text default 'published' check (status in ('published', 'draft')),
  created_at timestamptz default now()
);

-- 3. TABLE RESERVATIONS
create table if not exists reservations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  event_id uuid references events(id) on delete cascade,
  quantity int default 1,
  ref text unique default 'HTG-' || upper(substr(md5(random()::text), 1, 8)),
  created_at timestamptz default now()
);

-- 4. TABLE FAVORITES
create table if not exists favorites (
  user_id uuid references profiles(id) on delete cascade,
  event_id uuid references events(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, event_id)
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table profiles enable row level security;
alter table events enable row level security;
alter table reservations enable row level security;
alter table favorites enable row level security;

-- Profiles : chacun voit et modifie son propre profil
create policy "Voir son profil" on profiles for select using (auth.uid() = id);
create policy "Modifier son profil" on profiles for update using (auth.uid() = id);
create policy "Créer son profil" on profiles for insert with check (auth.uid() = id);

-- Events : tout le monde voit les events publiés, orga gère les siens
create policy "Voir events publiés" on events for select using (status = 'published');
create policy "Orga voit ses events" on events for select using (auth.uid() = organizer_id);
create policy "Orga crée events" on events for insert with check (auth.uid() = organizer_id);
create policy "Orga modifie ses events" on events for update using (auth.uid() = organizer_id);
create policy "Orga supprime ses events" on events for delete using (auth.uid() = organizer_id);

-- Reservations : user voit les siennes
create policy "Voir ses réservations" on reservations for select using (auth.uid() = user_id);
create policy "Créer réservation" on reservations for insert with check (auth.uid() = user_id);

-- Favorites
create policy "Voir ses favoris" on favorites for select using (auth.uid() = user_id);
create policy "Ajouter favori" on favorites for insert with check (auth.uid() = user_id);
create policy "Supprimer favori" on favorites for delete using (auth.uid() = user_id);

-- ============================================
-- FONCTION EVENTS GÉOLOCALISÉE (rayon)
-- ============================================

create or replace function events_near(
  user_lat float,
  user_lng float,
  radius_km float default 10,
  cat text default null
)
returns table (
  id uuid,
  title text,
  category text,
  location_name text,
  lat float,
  lng float,
  price float,
  date timestamptz,
  capacity int,
  ticket_url text,
  cover_url text,
  distance_km float
)
language sql
stable
as $$
  select
    id, title, category, location_name, lat, lng,
    price, date, capacity, ticket_url, cover_url,
    (6371 * acos(
      least(1.0, cos(radians(user_lat)) * cos(radians(lat)) *
      cos(radians(lng) - radians(user_lng)) +
      sin(radians(user_lat)) * sin(radians(lat)))
    )) as distance_km
  from events
  where status = 'published'
    and (cat is null or category = cat)
  having (6371 * acos(
    least(1.0, cos(radians(user_lat)) * cos(radians(lat)) *
    cos(radians(lng) - radians(user_lng)) +
    sin(radians(user_lat)) * sin(radians(lat)))
  )) < radius_km
  order by distance_km;
$$;

-- ============================================
-- DONNÉES DE TEST (events fictifs à Paris)
-- ============================================

-- D'abord crée un compte orga via l'app, récupère son UUID et remplace 'TON-UUID-ORGA-ICI'

-- insert into events (organizer_id, title, category, location_name, lat, lng, date, price, capacity, description)
-- values
--   ('TON-UUID-ORGA-ICI', 'Daft Punk Tribute Night', 'concerts', 'L''Olympia', 48.8713, 2.3283, now() + interval '2 hours', 45, 500, 'La nuit ultime d''hommage aux maîtres de la French Touch.'),
--   ('TON-UUID-ORGA-ICI', 'PSG vs Olympique de Marseille', 'sport', 'Parc des Princes', 48.8414, 2.2530, now() + interval '1 day', 89, 47000, 'Le classique du football français.'),
--   ('TON-UUID-ORGA-ICI', 'Stand''art Café', 'bars', 'Ménilmontant', 48.8660, 2.3840, now() + interval '3 hours', 0, null, 'Bar de quartier avec musique live.'),
--   ('TON-UUID-ORGA-ICI', 'Kyan Khojandi', 'standup', 'Bercy Arena', 48.8386, 2.3783, now() + interval '4 hours', 20, 1000, 'Le show incontournable.'),
--   ('TON-UUID-ORGA-ICI', 'Solary vs Gentlemate', 'esport', 'Bercy Arena', 48.8386, 2.3783, now() + interval '5 hours', 55, 800, 'Le duel esport de la saison.');

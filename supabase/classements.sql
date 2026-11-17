-- =====================================================================
--  SELECTA — classements en ligne des jeux « 320 » (Satine) et
--  « Paname rend fou » (Filiz).  À exécuter UNE FOIS dans Supabase :
--  Dashboard → SQL Editor → New query → coller tout ce fichier → Run.
--
--  Sécurité : les tables sont fermées (RLS sans aucune règle). Le site ne
--  peut ni lire ni écrire directement : il passe uniquement par les trois
--  fonctions ci-dessous, qui vérifient tout côté serveur.
--   • lb_start  : ouvre une partie et renvoie un jeton à usage unique.
--   • lb_submit : enregistre un score avec ce jeton. Le score est borné par le
--                 temps réellement écoulé côté serveur, recalculé à partir
--                 des statistiques de la partie (Paname) ou contrôlé (320).
--   • lb_top    : TOP 10 + record et position du joueur.
--  Limites anti-abus : 30 parties / 10 min par joueur, 120 / 10 min par
--  adresse IP, pseudos filtrés, jetons expirés au bout de 3 h.
-- =====================================================================

-- gen_random_uuid() est intégré à Postgres (13+) : aucune extension nécessaire.

create table if not exists public.lb_runs (
  token      uuid primary key default gen_random_uuid(),
  game       text not null check (game in ('320', 'paname')),
  player     uuid not null,
  level      smallint not null default 0,
  ip         text,
  started_at timestamptz not null default now(),
  used_at    timestamptz
);
create index if not exists lb_runs_player_idx on public.lb_runs (player, started_at);
create index if not exists lb_runs_ip_idx on public.lb_runs (ip, started_at);

create table if not exists public.lb_scores (
  id         bigint generated always as identity primary key,
  game       text not null check (game in ('320', 'paname')),
  player     uuid not null,
  name       text not null check (char_length(name) between 2 and 14),
  level      smallint not null default 0,
  score      integer not null check (score >= 0),
  stats      jsonb,
  updated_at timestamptz not null default now(),
  unique (game, player, level)
);
create index if not exists lb_scores_rank_idx on public.lb_scores (game, level, score desc);

alter table public.lb_runs enable row level security;
alter table public.lb_scores enable row level security;
revoke all on public.lb_runs, public.lb_scores from anon, authenticated;

-- adresse IP de l'appel (Supabase la transmet dans les en-têtes)
create or replace function public.lb_ip() returns text language sql stable set search_path = '' as $$
  select split_part(coalesce(nullif(current_setting('request.headers', true), '')::json ->> 'x-forwarded-for', ''), ',', 1)
$$;

-- ---------------------------------------------------------------------
create or replace function public.lb_start(p_game text, p_player uuid, p_level int default 0)
returns uuid language plpgsql security definer set search_path = public as $$
declare t uuid; v_ip text := public.lb_ip();
begin
  if p_game not in ('320', 'paname') or p_player is null then raise exception 'bad_request'; end if;
  if p_game = 'paname' and (p_level < 0 or p_level > 4) then raise exception 'bad_level'; end if;
  if (select count(*) from lb_runs where player = p_player and started_at > now() - interval '10 minutes') >= 30
     or (coalesce(v_ip, '') <> '' and (select count(*) from lb_runs where lb_runs.ip = v_ip and started_at > now() - interval '10 minutes') >= 120) then
    raise exception 'rate_limited';
  end if;
  delete from lb_runs where started_at < now() - interval '1 day';
  insert into lb_runs (game, player, level, ip) values (p_game, p_player, case when p_game = 'paname' then p_level else 0 end, v_ip)
  returning token into t;
  return t;
end $$;

-- ---------------------------------------------------------------------
create or replace function public.lb_clean_name(p text) returns text language plpgsql immutable set search_path = '' as $$
declare n text := btrim(regexp_replace(coalesce(p, ''), '\s+', ' ', 'g'));
begin
  n := regexp_replace(n, '[^A-Za-z0-9À-ÖØ-öø-ÿ _.\-♡★✿]', '', 'g');
  n := left(btrim(n), 14);
  if char_length(n) < 2 then raise exception 'bad_name'; end if;
  if lower(n) ~ '(connard|connasse|encul|salope|pute|nazi|hitler|nigg|negro|pd |fdp|ntm|bite|chatte|fuck|shit|cunt|whore|admin|moderat|selecta)' then
    raise exception 'bad_name';
  end if;
  return n;
end $$;

-- rang d'un joueur : 320 = meilleur score ; Paname = somme des meilleurs scores par station
create or replace function public.lb_board(p_game text)
returns table (player uuid, name text, score bigint, levels int) language sql stable security definer set search_path = public as $$
  select s.player,
         (array_agg(s.name order by s.updated_at desc))[1] as name,
         case when p_game = '320' then max(s.score)::bigint else sum(s.score)::bigint end as score,
         count(*)::int as levels
  from lb_scores s where s.game = p_game
  group by s.player
$$;

-- ---------------------------------------------------------------------
create or replace function public.lb_submit(p_token uuid, p_name text, p_score int, p_stats jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  r lb_runs; el numeric; nm text; sc int; prev int; st jsonb := coalesce(p_stats, '{}'::jsonb);
  climbed numeric; bonus numeric;
  lv int; tix int; nav int; tm numeric; stars int; fraud int;
  tot int[] := array[32, 27, 15, 19, 22];
  par int[] := array[75, 70, 80, 80, 85];
  mint int[] := array[20, 9, 15, 14, 15];
  board_before int; best bigint; rnk int; total int; was_top boolean;
begin
  select * into r from lb_runs where token = p_token for update;
  if not found or r.used_at is not null or r.started_at < now() - interval '3 hours' then raise exception 'bad_token'; end if;
  -- le pseudo d'abord : s'il est refusé, rien n'est consommé et le joueur peut en choisir un autre
  nm := lb_clean_name(p_name);
  -- à partir d'ici le jeton est brûlé, même si le score est refusé (pas de nouvel essai avec un autre chiffre)
  update lb_runs set used_at = now() where token = p_token;
  el := extract(epoch from now() - r.started_at);

  if r.game = '320' then
    climbed := greatest(0, coalesce((st ->> 'climbed')::numeric, 0));
    bonus := greatest(0, coalesce((st ->> 'bonus')::numeric, 0));
    sc := round(climbed * 5 + bonus)::int;
    if abs(sc - coalesce(p_score, -1)) > 10 then return jsonb_build_object('error', 'mismatch'); end if;
    -- vitesse de montée maximale ~700 px/s ; bonus maximal ~400 streams/s
    if el < 3 or climbed > el * 800 + 800 or bonus > el * 450 + 3000 or sc > 5000000 then return jsonb_build_object('error', 'implausible'); end if;
  else
    lv := r.level + 1;
    tix := coalesce((st ->> 'tickets')::int, -1); nav := coalesce((st ->> 'navigo')::int, -1);
    tm := coalesce((st ->> 'time')::numeric, -1); fraud := greatest(0, coalesce((st ->> 'fraud')::int, 0));
    if tix < 0 or tix > tot[lv] or nav < 0 or nav > 2 or tm < mint[lv] or tm > el + 3 then return jsonb_build_object('error', 'implausible'); end if;
    stars := 1 + (case when tix::numeric / tot[lv] >= 0.8 then 1 else 0 end) + (case when tm <= par[lv] then 1 else 0 end);
    -- même formule que le jeu : tickets, pass Navigo, étoiles, bonus de temps, malus de fraude
    sc := tix * 100 + nav * 500 + stars * 1000 + greatest(0, round((par[lv] * 1.5 - tm) * 20))::int - fraud * 200;
    sc := greatest(0, sc);
  end if;

  select score into prev from lb_scores where game = r.game and player = r.player and level = r.level;
  select b.score into best from lb_board(r.game) b where b.player = r.player;
  if best is null then was_top := false;
  else select count(*) into board_before from lb_board(r.game) b where b.score > best; was_top := board_before < 10; end if;

  insert into lb_scores (game, player, name, level, score, stats)
  values (r.game, r.player, nm, r.level, sc, st)
  on conflict (game, player, level) do update
    set score = greatest(lb_scores.score, excluded.score),
        stats = case when excluded.score > lb_scores.score then excluded.stats else lb_scores.stats end,
        name = excluded.name, updated_at = now();
  update lb_scores set name = nm where game = r.game and player = r.player;

  select b.score into best from lb_board(r.game) b where b.player = r.player;
  select count(*) + 1 into rnk from lb_board(r.game) b where b.score > best;
  select count(*) into total from lb_board(r.game);
  return jsonb_build_object('score', sc, 'previous', prev, 'record', prev is null or sc > prev,
    'best', best, 'rank', rnk, 'players', total, 'top10', rnk <= 10, 'newTop10', rnk <= 10 and not was_top);
end $$;

-- ---------------------------------------------------------------------
create or replace function public.lb_top(p_game text, p_player uuid default null)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare top jsonb; me jsonb; total int;
begin
  if p_game not in ('320', 'paname') then raise exception 'bad_request'; end if;
  select coalesce(jsonb_agg(x order by x.rank), '[]'::jsonb) into top from (
    select rank() over (order by b.score desc)::int as rank, b.name, b.score, b.levels, (b.player = p_player) as me
    from lb_board(p_game) b order by b.score desc limit 10) x;
  select count(*) into total from lb_board(p_game);
  if p_player is not null then
    select jsonb_build_object('best', b.score, 'levels', b.levels, 'name', b.name,
      'rank', (select count(*) + 1 from lb_board(p_game) o where o.score > b.score)) into me
    from lb_board(p_game) b where b.player = p_player;
  end if;
  return jsonb_build_object('top', top, 'me', me, 'players', total);
end $$;

revoke all on function public.lb_board(text) from public, anon, authenticated;
revoke all on function public.lb_ip() from public, anon, authenticated;
revoke all on function public.lb_clean_name(text) from public, anon, authenticated;
revoke all on function public.lb_start(text, uuid, int) from public;
revoke all on function public.lb_submit(uuid, text, int, jsonb) from public;
revoke all on function public.lb_top(text, uuid) from public;
grant execute on function public.lb_start(text, uuid, int) to anon, authenticated;
grant execute on function public.lb_submit(uuid, text, int, jsonb) to anon, authenticated;
grant execute on function public.lb_top(text, uuid) to anon, authenticated;

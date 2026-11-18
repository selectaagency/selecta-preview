-- =====================================================================
--  Paname rend fou v2 : 12 stations, chronomètre, classement SPEEDRUN, carte Navigo seule.
--  À exécuter APRÈS classements.sql (il le complète, sans rien effacer).
--  • stations 0 à 12 (les 5 premières gardent leurs règles d'origine)
--  • niveau 100 = speedrun de la ligne complète (une seule partie chronométrée)
--  • lb_top2 : TOP SCORES (points, puis temps) ou SPEEDRUN (temps le plus court)
-- =====================================================================

-- le classement des scores ignore les speedruns (niveau 100)
create or replace function public.lb_board(p_game text)
returns table (player uuid, name text, score bigint, levels int) language sql stable security definer set search_path = public as $$
  select s.player,
         (array_agg(s.name order by s.updated_at desc))[1] as name,
         case when p_game = '320' then max(s.score)::bigint else sum(s.score)::bigint end as score,
         count(*)::int as levels
  from lb_scores s where s.game = p_game and s.level < 100
  group by s.player
$$;

-- même tableau, avec le temps cumulé des meilleures stations (départage des égalités)
create or replace function public.lb_board2(p_game text)
returns table (player uuid, name text, score bigint, levels int, tsum numeric) language sql stable security definer set search_path = public as $$
  select s.player,
         (array_agg(s.name order by s.updated_at desc))[1] as name,
         case when p_game = '320' then max(s.score)::bigint else sum(s.score)::bigint end as score,
         count(*)::int as levels,
         round(sum(coalesce((s.stats ->> 'time')::numeric, 0)), 2) as tsum
  from lb_scores s where s.game = p_game and s.level < 100
  group by s.player
$$;

-- règles d'une station (tickets, temps objectif, temps minimal plausible)
create or replace function public.pr_rules(p_level int, out tot int, out par int, out mint int)
language sql immutable set search_path = '' as $$
  select 0,
         (array[75, 80, 70, 80, 85, 70, 72, 80, 78, 85, 88, 170])[p_level + 1],
         (array[20, 15, 9, 14, 15, 13, 14, 12, 14, 14, 15, 27])[p_level + 1]
$$;

-- score d'une station, même formule que le jeu (v3 : plus de tickets, une carte Navigo par station,
-- amendes des contrôleurs) ; null si les chiffres sont impossibles
create or replace function public.pr_station_score(p_level int, st jsonb)
returns int language plpgsql immutable set search_path = public as $$
declare r record; nav int; tm numeric; fraud int; fines int; stars int;
begin
  select * into r from pr_rules(p_level);
  if r.par is null then return null; end if;
  nav := coalesce((st ->> 'navigo')::int, -1); tm := coalesce((st ->> 'time')::numeric, -1);
  fraud := greatest(0, coalesce((st ->> 'fraud')::int, 0)); fines := greatest(0, coalesce((st ->> 'fines')::int, 0));
  if nav < 0 or nav > 1 or coalesce((st ->> 'tickets')::int, 0) <> 0 or tm < r.mint or tm > 3600 or fraud > 50 or fines > 50 then return null; end if;
  stars := 1 + nav + (case when tm <= r.par then 1 else 0 end);
  return greatest(0, nav * 1500 + stars * 1000 + greatest(0, round((r.par * 1.5 - tm) * 20))::int - fraud * 200 - fines * 300);
end $$;

-- ---------------------------------------------------------------------
create or replace function public.lb_start(p_game text, p_player uuid, p_level int default 0)
returns uuid language plpgsql security definer set search_path = public as $$
declare t uuid; v_ip text := public.lb_ip();
begin
  if p_game not in ('320', 'paname') or p_player is null then raise exception 'bad_request'; end if;
  if p_game = 'paname' and not ((p_level between 0 and 11) or p_level = 100) then raise exception 'bad_level'; end if;
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
create or replace function public.lb_submit(p_token uuid, p_name text, p_score int, p_stats jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  r lb_runs; el numeric; nm text; sc int; prev int; st jsonb := coalesce(p_stats, '{}'::jsonb);
  climbed numeric; bonus numeric; one int; tsum numeric; tm numeric; lost numeric; minsum int;
  prev_t numeric; best_t numeric;
  board_before int; best bigint; rnk int; total int; was_top boolean;
begin
  select * into r from lb_runs where token = p_token for update;
  if not found or r.used_at is not null or r.started_at < now() - interval '3 hours' then raise exception 'bad_token'; end if;
  nm := lb_clean_name(p_name);
  update lb_runs set used_at = now() where token = p_token;
  el := extract(epoch from now() - r.started_at);

  if r.game = '320' then
    climbed := greatest(0, coalesce((st ->> 'climbed')::numeric, 0));
    bonus := greatest(0, coalesce((st ->> 'bonus')::numeric, 0));
    sc := round(climbed * 5 + bonus)::int;
    if abs(sc - coalesce(p_score, -1)) > 10 then return jsonb_build_object('error', 'mismatch'); end if;
    if el < 3 or climbed > el * 800 + 800 or bonus > el * 450 + 3000 or sc > 5000000 then return jsonb_build_object('error', 'implausible'); end if;

  elsif r.level = 100 then
    -- SPEEDRUN : les 12 stations d'une traite, temps total borné par le temps réel du serveur
    if jsonb_typeof(st -> 'stations') is distinct from 'array' or jsonb_array_length(st -> 'stations') <> 12 then return jsonb_build_object('error', 'implausible'); end if;
    sc := 0; tsum := 0; minsum := 0;
    for i in 0..11 loop
      one := pr_station_score(i, st -> 'stations' -> i);
      if one is null then return jsonb_build_object('error', 'implausible'); end if;
      sc := sc + one; tsum := tsum + ((st -> 'stations' -> i) ->> 'time')::numeric; minsum := minsum + (select mint from pr_rules(i));
    end loop;
    lost := greatest(0, coalesce((st ->> 'lost')::numeric, 0));
    tm := coalesce((st ->> 'time')::numeric, -1);
    if tm < minsum or abs(tm - (tsum + lost)) > 0.6 or tm > el + 5 then return jsonb_build_object('error', 'implausible'); end if;
    st := jsonb_set(st, '{time}', to_jsonb(round(tm, 2)));
    select (stats ->> 'time')::numeric into prev_t from lb_scores where game = 'paname' and player = r.player and level = 100;
    insert into lb_scores (game, player, name, level, score, stats) values ('paname', r.player, nm, 100, sc, st)
    on conflict (game, player, level) do update
      set score = case when (excluded.stats ->> 'time')::numeric < (lb_scores.stats ->> 'time')::numeric then excluded.score else lb_scores.score end,
          stats = case when (excluded.stats ->> 'time')::numeric < (lb_scores.stats ->> 'time')::numeric then excluded.stats else lb_scores.stats end,
          name = excluded.name, updated_at = now();
    update lb_scores set name = nm where game = r.game and player = r.player;
    select (stats ->> 'time')::numeric into best_t from lb_scores where game = 'paname' and player = r.player and level = 100;
    select count(*) + 1 into rnk from lb_scores where game = 'paname' and level = 100 and (stats ->> 'time')::numeric < best_t;
    select count(*) into total from lb_scores where game = 'paname' and level = 100;
    return jsonb_build_object('mode', 'speed', 'score', sc, 'time', round(tm, 2), 'previous', prev_t, 'record', prev_t is null or tm < prev_t,
      'best', best_t, 'rank', rnk, 'players', total, 'top10', rnk <= 10, 'newTop10', rnk <= 10 and (prev_t is null or tm < prev_t));

  else
    sc := pr_station_score(r.level, st);
    if sc is null or (st ->> 'time')::numeric > el + 3 then return jsonb_build_object('error', 'implausible'); end if;
  end if;

  select score into prev from lb_scores where game = r.game and player = r.player and level = r.level;
  select b.score into best from lb_board(r.game) b where b.player = r.player;
  if best is null then was_top := false;
  else select count(*) into board_before from lb_board(r.game) b where b.score > best; was_top := board_before < 10; end if;

  insert into lb_scores (game, player, name, level, score, stats)
  values (r.game, r.player, nm, r.level, sc, st)
  on conflict (game, player, level) do update
    set score = greatest(lb_scores.score, excluded.score),
        stats = case when excluded.score > lb_scores.score
                       or (excluded.score = lb_scores.score and (excluded.stats ->> 'time')::numeric < coalesce((lb_scores.stats ->> 'time')::numeric, 1e9))
                     then excluded.stats else lb_scores.stats end,
        name = excluded.name, updated_at = now();
  update lb_scores set name = nm where game = r.game and player = r.player;

  select b.score into best from lb_board(r.game) b where b.player = r.player;
  select count(*) + 1 into rnk from lb_board(r.game) b where b.score > best;
  select count(*) into total from lb_board(r.game);
  return jsonb_build_object('score', sc, 'previous', prev, 'record', prev is null or sc > prev,
    'best', best, 'rank', rnk, 'players', total, 'top10', rnk <= 10, 'newTop10', rnk <= 10 and not was_top);
end $$;

-- ---------------------------------------------------------------------
-- p_mode : 'score' (TOP SCORES : points, puis temps) ou 'speed' (SPEEDRUN : temps le plus court)
create or replace function public.lb_top2(p_game text, p_player uuid default null, p_mode text default 'score')
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare top jsonb; me jsonb; total int;
begin
  if p_game not in ('320', 'paname') or p_mode not in ('score', 'speed') then raise exception 'bad_request'; end if;
  if p_mode = 'score' then
    with b as (select * from lb_board2(p_game)),
         rk as (select b.*, (select count(*) + 1 from b o where o.score > b.score or (o.score = b.score and o.tsum < b.tsum))::int as rank from b)
    select coalesce(jsonb_agg(jsonb_build_object('rank', rank, 'name', name, 'score', score, 'time', tsum, 'levels', levels, 'me', player = p_player) order by rank), '[]'::jsonb),
           (select count(*) from b),
           (select jsonb_build_object('rank', m.rank, 'best', m.score, 'time', m.tsum, 'levels', m.levels, 'name', m.name) from rk m where m.player = p_player)
      into top, total, me
    from (select * from rk order by rank limit 10) x;
  else
    with b as (select s.player, s.name, s.score, (s.stats ->> 'time')::numeric as t from lb_scores s where s.game = p_game and s.level = 100),
         rk as (select b.*, (select count(*) + 1 from b o where o.t < b.t or (o.t = b.t and o.score > b.score))::int as rank from b)
    select coalesce(jsonb_agg(jsonb_build_object('rank', rank, 'name', name, 'score', score, 'time', t, 'me', player = p_player) order by rank), '[]'::jsonb),
           (select count(*) from b),
           (select jsonb_build_object('rank', m.rank, 'best', m.score, 'time', m.t, 'name', m.name) from rk m where m.player = p_player)
      into top, total, me
    from (select * from rk order by rank limit 10) x;
  end if;
  return jsonb_build_object('mode', p_mode, 'top', top, 'me', me, 'players', total);
end $$;

revoke all on function public.lb_board2(text) from public, anon, authenticated;
revoke all on function public.pr_rules(int) from public, anon, authenticated;
revoke all on function public.pr_station_score(int, jsonb) from public, anon, authenticated;
revoke all on function public.lb_top2(text, uuid, text) from public;
grant execute on function public.lb_top2(text, uuid, text) to anon, authenticated;


-- Arts et Métiers devient la 2e station (niveau 1) et Abbesses la 3e (niveau 2) :
-- on échange une seule fois les scores déjà enregistrés pour ces deux stations.
create table if not exists public.lb_migrations (name text primary key, done_at timestamptz default now());
alter table public.lb_migrations enable row level security;
do $$
begin
  if not exists (select 1 from public.lb_migrations where name = 'paname_swap_1_2') then
    update public.lb_scores set level = 999 where game = 'paname' and level = 1;
    update public.lb_scores set level = 1 where game = 'paname' and level = 2;
    update public.lb_scores set level = 2 where game = 'paname' and level = 999;
    insert into public.lb_migrations(name) values ('paname_swap_1_2');
  end if;
end $$;

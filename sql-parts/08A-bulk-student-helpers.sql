-- 08A - helper functions for bulk student import
begin;

create or replace function public.bulk_normalize_pk_phone(p_value text)
returns text
language plpgsql
immutable
as $$
declare v text := regexp_replace(coalesce(p_value,''),'[^0-9]','','g');
begin
  if length(v)=10 and left(v,1)='3' then
    v:='0'||v;
  elsif length(v)=12 and left(v,2)='92' then
    v:='0'||substr(v,3);
  elsif length(v)=14 and left(v,4)='0092' then
    v:='0'||substr(v,5);
  end if;
  if v ~ '^0+$' or length(v)<>11 then return null; end if;
  return v;
end;
$$;

create or replace function public.bulk_next_student_username(p_name text)
returns text
language plpgsql
security definer
set search_path=public,pg_temp
as $$
declare
  b text;
  u text;
  n int:=1;
  x boolean;
begin
  b:=split_part(regexp_replace(btrim(coalesce(p_name,'')),'\s+',' ','g'),' ',1);
  b:=regexp_replace(b,'[[:space:][:punct:]]+','','g');
  if coalesce(b,'')='' then b:='student'; end if;

  loop
    u:=case when n=1 then b else b||n::text end;
    x:=false;

    begin
      execute 'select exists(select 1 from public.student_applications where lower(coalesce(requested_username,username,''''))=lower($1))'
      into x using u;
    exception when undefined_column then
      begin
        execute 'select exists(select 1 from public.student_applications where lower(coalesce(requested_username,''''))=lower($1))'
        into x using u;
      exception when undefined_column then x:=false;
      end;
    end;

    if not x and to_regclass('public.student_accounts') is not null then
      begin
        execute 'select exists(select 1 from public.student_accounts where lower(coalesce(username,''''))=lower($1))'
        into x using u;
      exception when undefined_column then x:=false;
      end;
    end if;

    if not x and to_regclass('public.accounts') is not null then
      begin
        execute 'select exists(select 1 from public.accounts where lower(coalesce(username,''''))=lower($1))'
        into x using u;
      exception when undefined_column then x:=false;
      end;
    end if;

    if not x then return u; end if;
    n:=n+1;
    if n>9999 then raise exception 'Could not generate a unique username'; end if;
  end loop;
end;
$$;

revoke all on function public.bulk_normalize_pk_phone(text) from public;
revoke all on function public.bulk_next_student_username(text) from public;
grant execute on function public.bulk_normalize_pk_phone(text) to anon,authenticated;
grant execute on function public.bulk_next_student_username(text) to anon,authenticated;

commit;

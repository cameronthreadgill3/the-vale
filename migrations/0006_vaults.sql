alter table subscribers add column if not exists voices_end timestamptz;
alter table subscribers add column if not exists anime_end timestamptz;
alter table kettle_keys add column if not exists vault text not null default 'kettle';

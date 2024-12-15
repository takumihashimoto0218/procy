create table profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLSポリシー
alter table profiles enable row level security;
create policy "プロフィールは本人のみが参照可能" on profiles
  for select using (auth.uid() = id);
create policy "プロフィールは本人のみが更新可能" on profiles
  for update using (auth.uid() = id);




create table universities (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  faculty text not null,
  department text not null,
  application_period_start timestamp with time zone not null,
  application_period_end timestamp with time zone not null,
  exam_date timestamp with time zone not null,
  result_date timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLSポリシー
alter table universities enable row level security;
create policy "大学情報は全ユーザーが参照可能" on universities
  for select using (true);




create type application_status as enum ('considering', 'applied', 'scheduled', 'completed');

create table user_universities (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  university_id uuid references universities(id) on delete cascade not null,
  status application_status not null default 'considering',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, university_id)
);

-- RLSポリシー
alter table user_universities enable row level security;
create policy "ユーザーは自分の登録情報のみ参照可能" on user_universities
  for select using (auth.uid() = user_id);
create policy "ユーザーは自分の登録情報のみ追加可能" on user_universities
  for insert with check (auth.uid() = user_id);
create policy "ユーザーは自分の登録情報のみ更新可能" on user_universities
  for update using (auth.uid() = user_id);
create policy "ユーザーは自分の登録情報のみ削除可能" on user_universities
  for delete using (auth.uid() = user_id);




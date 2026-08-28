create policy "pfe upload own" on storage.objects for insert to authenticated
  with check (bucket_id = 'pfe-reports' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "pfe read all" on storage.objects for select to authenticated
  using (bucket_id = 'pfe-reports');
create policy "pfe delete own" on storage.objects for delete to authenticated
  using (bucket_id = 'pfe-reports' and owner = auth.uid());
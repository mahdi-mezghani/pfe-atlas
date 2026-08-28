create policy "pfe update own" on storage.objects for update to authenticated
  using (bucket_id = 'pfe-reports' and owner = auth.uid())
  with check (bucket_id = 'pfe-reports' and owner = auth.uid());
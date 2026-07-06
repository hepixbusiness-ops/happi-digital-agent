// Même projet Supabase que dashboard.html (vuzjrsgobeevfqjmsgsm) — la clé
// anon n'est pas un secret (elle est déjà publique dans dashboard.html) :
// la sécurité vient de la Edge Function, qui seule détient la clé
// service_role et fait les écritures réelles.
export const SUPABASE_URL = "https://vuzjrsgobeevfqjmsgsm.supabase.co";
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1empyc2dvYmVldmZxam1zZ3NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0MjkzMDAsImV4cCI6MjA5NzAwNTMwMH0.fKRj-BiLjsNeHgs34CU4zsK54DqQ2VEIb-R-wj8KMD0";

export const SUBMIT_BRIEF_URL = `${SUPABASE_URL}/functions/v1/submit-brief`;

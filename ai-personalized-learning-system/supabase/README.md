# Supabase (bước tích hợp tiếp theo)

Supabase credentials are included as optional environment placeholders only. This MVP does not yet persist application data to Supabase.

Before enabling real accounts, create SQL migrations for profile, learning tasks, learning paths, quizzes, quiz attempts, resources and conversations; enable RLS; and add policies scoped to `auth.uid()`. Never expose the service role key in browser code.
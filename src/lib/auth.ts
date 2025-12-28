import { supabase } from "@/integrations/supabase/client";

export async function signUp(
  email: string,
  password: string,
  name: string
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;

  const user = data.user;
  if (!user) throw new Error("Signup failed");

  // Insert profile
  const { error: profileError } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      name,
    });

  if (profileError) throw profileError;

  return user;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data.user;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

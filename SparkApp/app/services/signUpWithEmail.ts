import { supabase } from './supabaseClient';

export const signUpWithEmail = async (fullName: string, email: string, password: string) => {
  try {
    // 🔍 Step 1: Sanitize inputs
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedName = fullName.trim();

    // ✅ Step 2: Sign up user with email/password
    const { data, error } = await supabase.auth.signUp({
      email: sanitizedEmail,
      password,
    });

    if (error) {
      console.error('Sign-up error:', error.message);
      return { error };
    }

    const userId = data.user?.id;

    // 🚫 If no user ID returned, stop
    if (!userId) {
      return { error: { message: 'No user ID returned from Supabase.' } };
    }

    // ✅ Step 3: Insert into your custom "users" table
    const { error: insertError } = await supabase.from('users').insert([
      {
        user_id: userId,
        full_name: sanitizedName,
        email: sanitizedEmail,
      },
    ]);

    if (insertError) {
      console.error('Error saving user to table:', insertError.message);
      return { error: insertError };
    }

    return { data };
  } catch (err) {
    console.error('Unexpected sign-up error:', err);
    return { error: { message: 'Unexpected error occurred during sign-up.' } };
  }
};

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Use service role to create admin user
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'admin12';

    console.log('Checking if admin user exists...');

    // Check if admin already exists in profiles
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('email', adminEmail)
      .single();

    if (existingProfile) {
      console.log('Admin user already exists');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Admin user already exists',
          email: adminEmail 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Creating admin user in auth...');

    // Create the admin user in auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    });

    if (authError) {
      // User might exist in auth but not in profiles
      if (authError.message.includes('already been registered')) {
        console.log('User exists in auth, checking profiles...');
        
        // Get user from auth
        const { data: users } = await supabase.auth.admin.listUsers();
        const existingUser = users?.users?.find(u => u.email === adminEmail);
        
        if (existingUser) {
          // Create profile for existing auth user
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: existingUser.id,
              email: adminEmail,
              full_name: 'System Admin',
              role: 'admin',
            });

          if (profileError) {
            console.error('Error creating profile:', profileError);
            throw profileError;
          }

          console.log('Created profile for existing auth user');
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Admin profile created for existing user',
              email: adminEmail 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
      
      console.error('Auth error:', authError);
      throw authError;
    }

    console.log('Admin user created in auth, creating profile...');

    // Create the admin profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: adminEmail,
        full_name: 'System Admin',
        role: 'admin',
      });

    if (profileError) {
      console.error('Profile error:', profileError);
      throw profileError;
    }

    console.log('Admin setup complete');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Admin user created successfully',
        email: adminEmail 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Setup error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

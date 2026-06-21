import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers':
        'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(
                JSON.stringify({ success: false, error: 'Authorization header is missing' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Initialize Supabase client to parse and verify the user's JWT
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            {
                global: {
                    headers: { Authorization: authHeader },
                },
            }
        );

        // Get and verify user information from Supabase auth
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

        if (authError || !user) {
            return new Response(
                JSON.stringify({ success: false, error: authError?.message || 'Invalid session' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Retrieve the project's private JWT_SECRET
        const jwtSecretStr = Deno.env.get('JWT_SECRET') || Deno.env.get('SUPABASE_JWT_SECRET');
        if (!jwtSecretStr) {
            throw new Error('JWT_SECRET is missing in server environment variables');
        }

        // Derive key deterministically: HMAC-SHA256(JWT_SECRET, user.id)
        const encoder = new TextEncoder();
        const hmacKey = await crypto.subtle.importKey(
            'raw',
            encoder.encode(jwtSecretStr),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        );

        const signatureBuffer = await crypto.subtle.sign(
            'HMAC',
            hmacKey,
            encoder.encode(user.id)
        );

        // Convert the signature buffer directly to a base64 string
        const bytes = new Uint8Array(signatureBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        const derivedKeyBase64 = btoa(binary);

        return new Response(
            JSON.stringify({ success: true, key: derivedKeyBase64 }),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    } catch (err: any) {
        console.error('Derivation error:', err);
        return new Response(
            JSON.stringify({ success: false, error: err.message || 'Server error' }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    }
});

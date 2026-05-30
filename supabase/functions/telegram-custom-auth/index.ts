import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import * as jose from 'https://deno.land/x/jose@v4.14.4/index.ts';
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
        const { code, redirect_uri } = await req.json();
        if (!code || !redirect_uri) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Missing code or redirect_uri parameters',
                }),
                {
                    status: 400,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json',
                    },
                },
            );
        }

        const clientId = Deno.env.get('TELEGRAM_CLIENT_ID');
        const clientSecret = Deno.env.get('TELEGRAM_CLIENT_SECRET');
        const jwtSecretStr =
            Deno.env.get('JWT_SECRET') || Deno.env.get('SUPABASE_JWT_SECRET');

        if (!clientId || !clientSecret || !jwtSecretStr) {
            throw new Error(
                'Missing environment secrets: TELEGRAM_CLIENT_ID, TELEGRAM_CLIENT_SECRET, or JWT_SECRET',
            );
        }

        // 1. Exchange the Authorization Code for an ID Token directly from Telegram
        const tokenResponse = await fetch('https://oauth.telegram.org/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri,
            }),
        });

        if (!tokenResponse.ok) {
            const errText = await tokenResponse.text();
            return new Response(
                JSON.stringify({
                    success: false,
                    error: `Telegram token exchange failed: ${errText}`,
                }),
                {
                    status: tokenResponse.status,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json',
                    },
                },
            );
        }

        const tokenData = await tokenResponse.json();
        const idToken = tokenData.id_token;

        if (!idToken) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'No id_token returned from Telegram',
                }),
                {
                    status: 400,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json',
                    },
                },
            );
        }

        // 2. Cryptographically verify the ID token using Telegram's JWKS
        // We fetch the JWKS manually using a standard Chrome User-Agent to bypass potential WAF/Cloudflare blocks
        const jwksRes = await fetch(
            'https://oauth.telegram.org/.well-known/jwks.json',
            {
                headers: {
                    'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                },
            },
        );

        if (!jwksRes.ok) {
            throw new Error(
                `Failed to fetch Telegram JWKS: ${jwksRes.status} ${jwksRes.statusText}`,
            );
        }

        const jwks = await jwksRes.json();

        // Decode protected header of ID Token to extract the Key ID (kid)
        const header = jose.decodeProtectedHeader(idToken);
        const kid = header.kid;

        // Match the correct JWK by key ID
        const jwk = jwks.keys.find((k: any) => k.kid === kid);
        if (!jwk) {
            throw new Error(
                `JWK with kid "${kid}" not found in Telegram's key set.`,
            );
        }

        // Import the public key (Deno's jose library natively supports secp256k1 curves!)
        const publicKey = await jose.importJWK(jwk, header.alg);

        // Verify ID Token payload signature against imported public key
        const { payload } = await jose.jwtVerify(idToken, publicKey, {
            issuer: 'https://oauth.telegram.org',
            audience: clientId,
        });

        const telegramId = payload.sub; // The user's unique Telegram ID
        const email = `telegram_${telegramId}@dua-journal.internal`;

        // 3. Connect to Supabase using the service_role key to manage users
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });

        // Fetch the list of users to find if they already exist
        const { data: userList, error: listError } =
            await supabaseAdmin.auth.admin.listUsers();
        if (listError) throw listError;

        let targetUser = userList.users.find((u: any) => u.email === email);

        const userMetadata = {
            telegram_id: telegramId,
            username: payload.nickname || '',
            first_name: payload.given_name || '',
            last_name: payload.family_name || '',
            photo_url: payload.picture || '',
        };

        if (!targetUser) {
            // Create the user in auth.users
            const { data: createData, error: createError } =
                await supabaseAdmin.auth.admin.createUser({
                    email,
                    email_confirm: true,
                    user_metadata: userMetadata,
                });
            if (createError) throw createError;
            targetUser = createData.user;
        } else {
            // Update the user's latest metadata
            const { error: updateError } =
                await supabaseAdmin.auth.admin.updateUserById(targetUser.id, {
                    user_metadata: userMetadata,
                });
            if (updateError) throw updateError;
        }

        const supabaseUserId = targetUser.id; // This is their real, valid UUID!

        // 4. Mint a custom Supabase-signed JWT using our private JWT_SECRET
        const jwtSecret = new TextEncoder().encode(jwtSecretStr);

        // Sign the JWT with claims required by Supabase RLS
        const customJwt = await new jose.SignJWT({
            role: 'authenticated',
            aud: 'authenticated',
            user_metadata: userMetadata,
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setSubject(supabaseUserId) // Set sub claim to their actual Supabase User UUID!
            .setIssuedAt()
            .setExpirationTime('7d') // Valid for 7 days
            .sign(jwtSecret);

        return new Response(
            JSON.stringify({
                success: true,
                token: customJwt,
                user: {
                    id: supabaseUserId,
                    email: email,
                    user_metadata: userMetadata,
                },
            }),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            },
        );
    } catch (err: any) {
        console.error(err);
        return new Response(
            JSON.stringify({
                success: false,
                error: err.message || 'An unexpected error occurred',
            }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            },
        );
    }
});

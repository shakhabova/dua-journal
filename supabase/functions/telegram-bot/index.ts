import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

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
        const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
        if (!botToken) {
            throw new Error(
                'Missing environment variable: TELEGRAM_BOT_TOKEN is not configured in Supabase secrets.',
            );
        }

        const frontendUrl =
            Deno.env.get('FRONTEND_URL') || 'https://dua-journal.fly.dev';

        // Parse incoming update from Telegram
        const update = await req.json();

        // We only care about messages, specifically text messages
        if (update.message?.text) {
            const chatId = update.message.chat.id;
            const text = update.message.text.trim();

            if (text.startsWith('/start')) {
                // Send the welcome message
                const messageText =
                    'Ассаляму алейкум 🌿\n\n' +
                    'Добро пожаловать в Dua Journal — пространство для дуа из Корана и Сунны, а также ваших личных обращений.\n\n' +
                    'Нажмите кнопку ниже, чтобы открыть приложение.';

                const replyMarkup = {
                    inline_keyboard: [
                        [
                            {
                                text: 'Открыть приложение',
                                web_app: {
                                    url: frontendUrl,
                                },
                            },
                        ],
                    ],
                };

                const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
                const response = await fetch(telegramUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: messageText,
                        reply_markup: replyMarkup,
                    }),
                });

                if (!response.ok) {
                    console.error(
                        'Failed to send Telegram message:',
                        await response.text(),
                    );
                }
            }
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (err: unknown) {
        const errorMessage =
            err instanceof Error ? err.message : 'An unexpected error occurred';
        console.error('Error handling Telegram webhook:', err);
        return new Response(
            JSON.stringify({
                success: false,
                error: errorMessage,
            }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            },
        );
    }
});

// functions/forms/contact.js
// Cloudflare Pages Function - replacement for forms/contact.php
// Returns plain text "OK" on success (what validate.js expects).

const RECEIVING_EMAIL = 'sajidreem@gmail.com';

const text = (body, status = 200) =>
    new Response(body, {
        status,
        headers: { 'Content-Type': 'text/plain; charset=UTF-8' },
    });

const stripTags = (v) => String(v ?? '').replace(/<[^>]*>/g, '');
const clean = (v) => stripTags(v).replace(/[\r\n]+/g, ' ').trim();

export async function onRequestPost({ request, env }) {
    let form;
    try {
        form = await request.formData();
    } catch (e) {
        return text('Invalid request.', 400);
    }

    // Honeypot: real users never fill this hidden field.
    if (form.get('website')) return text('OK');

    const name = clean(form.get('name'));
    const email = clean(form.get('email'));
    const subject = clean(form.get('subject'));
    const message = stripTags(form.get('message')).trim();

    if (!name || !email || !subject || !message) {
        return text('Please fill in all required fields.', 422);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return text('Please enter a valid email address.', 422);
    }

    if (!env.RESEND_API_KEY) {
        return text('Mail service is not configured.', 500);
    }

    const host = new URL(request.url).hostname.replace(/^www\./i, '');

    const body =
        'You have received a new message from the Royal Style Interiors website.\n\n' +
        `Name:    ${name}\n` +
        `Email:   ${email}\n` +
        `Subject: ${subject}\n\n` +
        `Message:\n${message}\n`;

    try {
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${env.RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: `Royal Style Interiors <no-reply@${host}>`,
                to: [RECEIVING_EMAIL],
                reply_to: email,
                subject: `New website enquiry: ${subject}`,
                text: body,
            }),
        });

        if (res.ok) return text('OK');

        console.error('Resend error', res.status, await res.text());
        return text(
            'Sorry, your message could not be sent right now. Please try again or contact us on WhatsApp.',
            500
        );
    } catch (e) {
        console.error('Resend fetch failed', e);
        return text(
            'Sorry, your message could not be sent right now. Please try again or contact us on WhatsApp.',
            500
        );
    }
}

// Anything other than POST
export async function onRequest() {
    return text('Invalid request method.', 405);
}
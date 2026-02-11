export async function onRequest(context) {
    const url = new URL(context.request.url);
    const pathname = url.pathname;

    // Redirect root to studio
    if (pathname === '/' || pathname === '/index.html') {
        return Response.redirect(new URL('/studio/', url.origin), 302);
    }

    // Handle SPA routing for studio
    if (pathname.startsWith('/studio/') && !pathname.includes('.')) {
        return context.env.ASSETS.fetch(new URL('/studio/index.html', url.origin));
    }

    // Handle SPA routing for reader
    if (pathname.startsWith('/reader/') && !pathname.includes('.')) {
        return context.env.ASSETS.fetch(new URL('/reader/index.html', url.origin));
    }

    // Handle SPA routing for admin
    if (pathname.startsWith('/admin/') && !pathname.includes('.')) {
        return context.env.ASSETS.fetch(new URL('/admin/index.html', url.origin));
    }

    // Mock API responses for auth endpoints
    if (pathname.startsWith('/api/auth/')) {
        return new Response(JSON.stringify({
            success: true,
            user: {
                id: 'demo-user-id',
                email: 'demo@ai-comic.studio',
                username: 'Demo User',
                joinDate: Date.now(),
                studioName: 'Demo Studio',
                avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=DemoUser',
                bio: 'Demo account for public access.'
            }
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }

    // Default: fetch from assets
    return context.env.ASSETS.fetch(context.request);
}

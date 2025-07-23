
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

export async function GET() {
  if (!SITE_URL) {
    return new Response('Sitemap disabled: NEXT_PUBLIC_SITE_URL is not set.', {
      status: 500,
    });
  }

  const content = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}

// Runs server-side (Node runtime), so it can fetch arbitrary pages without
// hitting the browser's CORS restrictions. Regex-based tag extraction — good
// enough for a starter; swap for a real HTML parser (e.g. cheerio) if this
// needs to be more robust against malformed markup.

function extractMeta(html, property) {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${property}["']`, "i"),
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+name=["']${property}["']`, "i"),
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m) return m[1];
  }
  return null;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get("url");

  if (!rawUrl) {
    return Response.json({ error: "missing url" }, { status: 400 });
  }

  let parsed;
  try {
    parsed = new URL(rawUrl);
    if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("bad protocol");
  } catch {
    return Response.json({ error: "invalid url" }, { status: 400 });
  }

  try {
    const res = await fetch(parsed.toString(), {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; CacheBot/1.0; +https://example.com)" },
      signal: AbortSignal.timeout(8000),
    });
    const html = await res.text();

    const title = extractMeta(html, "og:title") || (html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? parsed.hostname);
    const description = extractMeta(html, "og:description") || extractMeta(html, "description") || "";
    let image = extractMeta(html, "og:image");
    if (image && !/^https?:\/\//i.test(image)) {
      image = new URL(image, parsed.origin).toString();
    }

    return Response.json({
      title: title.trim().slice(0, 200),
      description: description.trim().slice(0, 300),
      image,
      domain: parsed.hostname.replace(/^www\./, ""),
    });
  } catch (err) {
    return Response.json(
      { title: parsed.hostname, description: "", image: null, domain: parsed.hostname.replace(/^www\./, ""), error: "fetch failed" },
      { status: 200 }
    );
  }
}

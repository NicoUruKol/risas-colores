const SITE_NAME = "Jardín Maternal Risas y Colores";
const DEFAULT_OG_IMAGE = "/og-jardin.jpg";

function absUrl(siteUrl, path) {
    const base = (siteUrl || "").replace(/\/$/, "");
    const p = (path || "").startsWith("/") ? path : `/${path || ""}`;
    return `${base}${p}`;
}

export default function SEO({
    title,
    description,
    path = "/",
    ogImage = DEFAULT_OG_IMAGE,
    noindex = false,
    }) {
    const siteUrl = import.meta.env.VITE_SITE_URL || "";
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

    const canonical = siteUrl ? absUrl(siteUrl, path) : "";
    const ogImg = siteUrl ? absUrl(siteUrl, ogImage) : ogImage;

    return (
        <>
        <title>{fullTitle}</title>

        {description ? <meta name="description" content={description} /> : null}
        <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow"} />

        {canonical ? <link rel="canonical" href={canonical} /> : null}

        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={fullTitle} />
        {description ? <meta property="og:description" content={description} /> : null}
        {canonical ? <meta property="og:url" content={canonical} /> : null}
        <meta property="og:image" content={ogImg} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={fullTitle} />
        {description ? <meta name="twitter:description" content={description} /> : null}
        <meta name="twitter:image" content={ogImg} />
        </>
    );
}

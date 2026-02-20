import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEOMetadata = ({
    title,
    description,
    image = 'https://boxing24.pl/og-image.png',
    url = 'https://boxing24.pl/',
    type = 'website'
}) => {
    // Determine the full title
    const siteName = 'Boxing24 - Elite Performance';
    const fullTitle = title ? `${title} | ${siteName}` : siteName;

    // Default description if none provided
    const fullDescription = description || 'Biomechanika spotyka technologię. Kompletny ekosystem dla Twojego rozwoju.';

    return (
        <Helmet>
            {/* Standard Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={fullDescription} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={fullDescription} />
            <meta property="og:image" content={image} />
            <meta property="og:site_name" content={siteName} />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={url} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={fullDescription} />
            <meta name="twitter:image" content={image} />
        </Helmet>
    );
};

export default SEOMetadata;

import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html lang="en-PK">
            <Head>
                <meta name="theme-color" content="#2F8F83" />
                <link rel="icon" href="/favicon.ico" />
                <link rel="canonical" href="https://riderofaisalabad.com" />
                <meta name="robots" content="index, follow" />
                <meta property="og:locale" content="en_PK" />
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="Rider of Faisalabad" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "LocalBusiness",
                            "name": "Rider of Faisalabad",
                            "description": "Professional private rider & parcel delivery service in Faisalabad, Punjab and all Pakistan",
                            "url": "https://riderofaisalabad.com",
                            "telephone": "+92-300-0000000",
                            "address": {
                                "@type": "PostalAddress",
                                "addressLocality": "Faisalabad",
                                "addressRegion": "Punjab",
                                "addressCountry": "PK"
                            },
                            "geo": {
                                "@type": "GeoCoordinates",
                                "latitude": "31.4504",
                                "longitude": "73.1350"
                            },
                            "openingHours": "Mo-Su 06:00-22:00",
                            "sameAs": [
                                "https://www.instagram.com/rider_of_faisalabad"
                            ],
                            "serviceArea": {
                                "@type": "GeoCircle",
                                "geoMidpoint": {
                                    "@type": "GeoCoordinates",
                                    "latitude": "31.4504",
                                    "longitude": "73.1350"
                                },
                                "geoRadius": "500000"
                            },
                            "priceRange": "$$"
                        })
                    }}
                />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}

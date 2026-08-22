import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  keywords?: string;
  robots?: string;
  type?: string;
}

const SEO = ({
  title = 'DK Exporting - Premium Spices & Nuts',
  description = 'At DK Exporting, we bring you the finest quality premium spices, nuts, and authentic Indian flavors directly from nature to your doorstep.',
  image = '/images/logo_footer.png',
  url = typeof window !== 'undefined' ? window.location.href : 'https://dk_exporting.com',
  keywords = 'premium spices, nuts, Indian flavors, global trade, culinary excellence, authentic spices, DK Exporting',
  robots = 'index, follow',
  type = 'website',
}: SEOProps) => {
  const fullTitle = title.includes('DK Exporting') ? title : `${title} | DK Exporting`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={robots} />
      <meta name="author" content="DK Exporting" />
      <link rel="canonical" href={url} />
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="DK Exporting" />
      <meta property="og:locale" content="en_IN" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@dk_exporting" />
      <meta name="twitter:creator" content="@dk_exporting" />
    </Helmet>
  );
};

export default SEO;

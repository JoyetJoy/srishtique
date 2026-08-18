import { useState, useEffect } from 'react';

import SEO from './SEO';

interface StaticSEOProps {
  pagePath: string;
  defaultTitle?: string;
  defaultDescription?: string;
  defaultKeywords?: string;
}

const StaticSEO = ({ pagePath, defaultTitle, defaultDescription, defaultKeywords }: StaticSEOProps) => {
  const [title, setTitle] = useState(defaultTitle || '');
  const [description, setDescription] = useState(defaultDescription || '');
  const [keywords, setKeywords] = useState(defaultKeywords || undefined);

  useEffect(() => {
    const fetchSeo = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/seo?path=${pagePath}`);
        if (res.ok) {
          const data = await res.json();
          if (data.metaTitle) setTitle(data.metaTitle);
          if (data.metaDescription) setDescription(data.metaDescription);
          if (data.metaKeywords) setKeywords(data.metaKeywords);
        }
      } catch (error) {
        console.error('Failed to fetch SEO for', pagePath, error);
      }
    };
    fetchSeo();
  }, [pagePath]);

  const pageUrl = typeof window !== 'undefined' ? `${window.location.origin}${pagePath}` : undefined;

  return <SEO title={title} description={description} keywords={keywords} url={pageUrl} />;
};

export default StaticSEO;

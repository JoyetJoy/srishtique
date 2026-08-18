import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { getImageUrl } from '../utils/imageUrl';

interface SiteSettings {
  brandLogoHeader: string;
  brandLogoFooter: string;
  brandLogoPdf: string;
  brandName: string;
  brandTagline: string;
  brandAddress: string;
  brandPhone: string;
  brandWebsite: string;
  brandInstagram: string;
  brandFacebook: string;
  brandWhatsapp: string;
  aboutHeroImage: string;
  aboutStoryImage: string;
}

const defaults: SiteSettings = {
  brandLogoHeader: '',
  brandLogoFooter: '',
  brandLogoPdf: '',
  brandName: 'DK Exporting',
  brandTagline: '',
  brandAddress: '',
  brandPhone: '',
  brandWebsite: '',
  brandInstagram: '',
  brandFacebook: '',
  brandWhatsapp: '',
  aboutHeroImage: '',
  aboutStoryImage: '',
};


const SiteSettingsContext = createContext<SiteSettings>(defaults);

export const useSiteSettings = () => useContext(SiteSettingsContext);

const SETTING_KEYS: Array<{ key: string; field: keyof SiteSettings; isImage?: boolean }> = [
  { key: 'BRAND_LOGO_HEADER', field: 'brandLogoHeader', isImage: true },
  { key: 'BRAND_LOGO_FOOTER', field: 'brandLogoFooter', isImage: true },
  { key: 'BRAND_LOGO_PDF', field: 'brandLogoPdf', isImage: true },
  { key: 'BRAND_NAME', field: 'brandName' },
  { key: 'BRAND_TAGLINE', field: 'brandTagline' },
  { key: 'BRAND_ADDRESS', field: 'brandAddress' },
  { key: 'BRAND_PHONE', field: 'brandPhone' },
  { key: 'BRAND_WEBSITE', field: 'brandWebsite' },
  { key: 'BRAND_INSTAGRAM', field: 'brandInstagram' },
  { key: 'BRAND_FACEBOOK', field: 'brandFacebook' },
  { key: 'BRAND_WHATSAPP', field: 'brandWhatsapp' },
  { key: 'ABOUT_HERO_IMAGE', field: 'aboutHeroImage', isImage: true },
  { key: 'ABOUT_STORY_IMAGE', field: 'aboutStoryImage', isImage: true },
];

export const SiteSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<SiteSettings>(defaults);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const fetches = SETTING_KEYS.map(({ key, field, isImage }) =>
      fetch(`${apiUrl}/api/settings/${key}`, { cache: 'no-store' })
        .then(res => {
          if (!res.ok) throw new Error('not found');
          return res.json();
        })
        .then(data => {
          if (data?.value) {
            const value = isImage ? getImageUrl(data.value) : data.value;
            setSettings(prev => ({ ...prev, [field]: value }));
          }
        })
        .catch(() => {}) // silently fall back to defaults
    );
    Promise.allSettled(fetches);
  }, []);

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export default SiteSettingsContext;

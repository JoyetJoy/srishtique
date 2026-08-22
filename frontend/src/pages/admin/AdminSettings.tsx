import { useState, useEffect } from 'react';
import { getImageUrl } from '../../utils/imageUrl';
import toast from 'react-hot-toast';

export interface HeroSlideData {
  id: string;
  imageUrl: string;
  subtitle: string;
  title: string;
  description: string;
  button1Text: string;
  button1Url: string;
  button2Text: string;
  button2Url: string;
}

export interface OccasionSlideData {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  linkText: string;
  linkUrl: string;
}

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('brand');
  const [heroSlides, setHeroSlides] = useState<HeroSlideData[]>([]);
  const [isSavingHeroSlides, setIsSavingHeroSlides] = useState(false);
  const [isHeroUploading, setIsHeroUploading] = useState<Record<string, boolean>>({});

  // Brand Identity Settings
  const [brandLogoHeaderUrl, setBrandLogoHeaderUrl] = useState('');
  const [brandLogoFooterUrl, setBrandLogoFooterUrl] = useState('');
  const [brandLogoPdfUrl, setBrandLogoPdfUrl] = useState('');
  const [brandName, setBrandName] = useState('DK Exporting');
  const [brandTagline, setBrandTagline] = useState('adorn your aura');
  const [brandAddress, setBrandAddress] = useState('C/o VISHNU TEXTILES AND GARMENTS,\nVANNAPURAM P.O.\nTHODUPUZHA-685607');
  const [brandPhone, setBrandPhone] = useState('9074309636');
  const [brandWebsite, setBrandWebsite] = useState('www.dk_exporting.com');
  const [brandInstagram, setBrandInstagram] = useState('atma_adorn.your.aura');
  const [brandFacebook, setBrandFacebook] = useState('');
  const [brandWhatsapp, setBrandWhatsapp] = useState('9074309636');
  const [aboutHeroImage, setAboutHeroImage] = useState('');
  const [aboutStoryImage, setAboutStoryImage] = useState('');
  const [isSavingBrand, setIsSavingBrand] = useState(false);
  const [isBrandLogoLoading, setIsBrandLogoLoading] = useState<Record<string, boolean>>({});

  // Occasion Banner Settings
  const [occasionSlides, setOccasionSlides] = useState<OccasionSlideData[]>([]);
  const [isSavingOccasionSlides, setIsSavingOccasionSlides] = useState(false);
  const [isOccasionUploading, setIsOccasionUploading] = useState<Record<string, boolean>>({});

  // SEO State
  const [selectedSeoPage, setSelectedSeoPage] = useState('SEO_PRODUCTS');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [isSavingSeo, setIsSavingSeo] = useState(false);

  // Moments (Instagram Section) Settings
  const [momentsImages, setMomentsImages] = useState<string[]>(Array(5).fill(''));
  const [isSavingMoments, setIsSavingMoments] = useState(false);
  const [isMomentsUploading, setIsMomentsUploading] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    fetchSeoSetting(selectedSeoPage);
  }, [selectedSeoPage]);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/settings/HERO_SLIDES`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.value) {
          try {
            setHeroSlides(JSON.parse(data.value));
          } catch (e) {
            console.error('Failed to parse HERO_SLIDES', e);
          }
        }
      }
      
      const resOccasion = await fetch(`${import.meta.env.VITE_API_URL}/api/settings/OCCASION_SLIDES`, { cache: 'no-store' });
      if (resOccasion.ok) {
        const data = await resOccasion.json();
        if (data.value) {
          try {
            setOccasionSlides(JSON.parse(data.value));
          } catch (e) {
            console.error('Failed to parse OCCASION_SLIDES', e);
          }
        }
      }

      // Fetch Moments settings
      const resMoments = await fetch(`${import.meta.env.VITE_API_URL}/api/settings/INSTAGRAM_MOMENTS`, { cache: 'no-store' });
      if (resMoments.ok) {
        const data = await resMoments.json();
        if (data.value) {
          try {
            const parsed = JSON.parse(data.value);
            if (Array.isArray(parsed)) {
              setMomentsImages(parsed);
            }
          } catch (e) {
            console.error('Failed to parse INSTAGRAM_MOMENTS', e);
          }
        }
      }

      // Fetch brand identity settings
      const brandKeys: [string, (v: string) => void][] = [
        ['BRAND_LOGO_HEADER', setBrandLogoHeaderUrl],
        ['BRAND_LOGO_FOOTER', setBrandLogoFooterUrl],
        ['BRAND_LOGO_PDF', setBrandLogoPdfUrl],
        ['BRAND_NAME', setBrandName],
        ['BRAND_TAGLINE', setBrandTagline],
        ['BRAND_ADDRESS', setBrandAddress],
        ['BRAND_PHONE', setBrandPhone],
        ['BRAND_WEBSITE', setBrandWebsite],
        ['BRAND_INSTAGRAM', setBrandInstagram],
        ['BRAND_FACEBOOK', setBrandFacebook],
        ['BRAND_WHATSAPP', setBrandWhatsapp],
        ['ABOUT_HERO_IMAGE', setAboutHeroImage],
        ['ABOUT_STORY_IMAGE', setAboutStoryImage],
      ];
      for (const [key, setter] of brandKeys) {
        const r = await fetch(`${import.meta.env.VITE_API_URL}/api/settings/${key}`, { cache: 'no-store' });
        if (r.ok) {
          const d = await r.json();
          if (d?.value) setter(d.value);
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const fetchSeoSetting = async (key: string) => {
    try {
      setSeoTitle('');
      setSeoDescription('');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/settings/${key}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.value) {
          const parsed = JSON.parse(data.value);
          setSeoTitle(parsed.title || '');
          setSeoDescription(parsed.description || '');
        }
      }
    } catch (error) {
      console.error('Failed to fetch SEO setting:', error);
    }
  };

  const handleSaveSeo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSeo(true);
    try {
      const value = JSON.stringify({ title: seoTitle, description: seoDescription });
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/settings/${selectedSeoPage}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}` 
        },
        body: JSON.stringify({ value })
      });

      if (res.ok) {
        toast.success('SEO settings saved successfully!');
      } else {
        toast.error('Failed to save SEO settings');
      }
    } catch (error) {
      console.error('Save SEO error:', error);
      toast.error('An error occurred while saving SEO settings');
    } finally {
      setIsSavingSeo(false);
    }
  };

  const handleAddOccasionSlide = () => {
    setOccasionSlides(prev => [
      ...prev,
      {
        id: `occ-slide-${Date.now()}`,
        imageUrl: '',
        title: 'Where Every Occasion Finds Its Perfect Look',
        description: 'Update this description.',
        linkText: 'KNOW OUR STORY',
        linkUrl: '/about',
      }
    ]);
  };

  const handleRemoveOccasionSlide = (id: string) => {
    setOccasionSlides(prev => prev.filter(slide => slide.id !== id));
  };

  const handleOccasionSlideChange = (id: string, field: keyof OccasionSlideData, value: string) => {
    setOccasionSlides(prev => prev.map(slide => slide.id === id ? { ...slide, [field]: value } : slide));
  };

  const handleOccasionSlideImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsOccasionUploading(prev => ({ ...prev, [id]: true }));
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', 'banners');

      const uploadRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}` },
        body: formData
      });

      if (!uploadRes.ok) throw new Error('Failed to upload image');
      const uploadData = await uploadRes.json();
      
      handleOccasionSlideChange(id, 'imageUrl', uploadData.url);
      toast.success('Occasion slide image uploaded!');
    } catch (error) {
      console.error(error);
      toast.error('Error uploading slide image');
    } finally {
      setIsOccasionUploading(prev => ({ ...prev, [id]: false }));
      e.target.value = '';
    }
  };

  const handleSaveOccasionSlides = async () => {
    setIsSavingOccasionSlides(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/settings/OCCASION_SLIDES`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}` },
        body: JSON.stringify({ value: JSON.stringify(occasionSlides) })
      });
      if (res.ok) toast.success('Occasion slides saved successfully!');
      else toast.error('Failed to save occasion slides');
    } catch (error) {
      console.error(error);
      toast.error('An error occurred');
    } finally {
      setIsSavingOccasionSlides(false);
    }
  };

  const handleMomentsImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsMomentsUploading(prev => ({ ...prev, [index]: true }));
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', 'banners');

      const uploadRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}` },
        body: formData
      });

      if (!uploadRes.ok) throw new Error('Failed to upload image');
      const uploadData = await uploadRes.json();
      
      setMomentsImages(prev => {
        const newImages = [...prev];
        newImages[index] = uploadData.url;
        return newImages;
      });
      toast.success(`Moment image ${index + 1} uploaded!`);
    } catch (error) {
      console.error(error);
      toast.error('Error uploading moment image');
    } finally {
      setIsMomentsUploading(prev => ({ ...prev, [index]: false }));
      e.target.value = '';
    }
  };

  const handleSaveMoments = async () => {
    setIsSavingMoments(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/settings/INSTAGRAM_MOMENTS`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}` },
        body: JSON.stringify({ value: JSON.stringify(momentsImages) })
      });
      if (res.ok) toast.success('Moments images saved successfully!');
      else toast.error('Failed to save moments images');
    } catch (error) {
      console.error(error);
      toast.error('An error occurred');
    } finally {
      setIsSavingMoments(false);
    }
  };

  const handleAddHeroSlide = () => {
    setHeroSlides(prev => [
      ...prev,
      {
        id: `slide-${Date.now()}`,
        imageUrl: '',
        subtitle: 'NEW SLIDE',
        title: 'Crafting Timeless Elegance',
        description: 'Update this description.',
        button1Text: 'EXPLORE COLLECTIONS',
        button1Url: '/collections',
        button2Text: 'OUR STORY',
        button2Url: '/about',
      }
    ]);
  };

  const handleRemoveHeroSlide = (id: string) => {
    setHeroSlides(prev => prev.filter(slide => slide.id !== id));
  };

  const handleHeroSlideChange = (id: string, field: keyof HeroSlideData, value: string) => {
    setHeroSlides(prev => prev.map(slide => slide.id === id ? { ...slide, [field]: value } : slide));
  };

  const handleHeroSlideImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsHeroUploading(prev => ({ ...prev, [id]: true }));
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', 'banners');

      const uploadRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}` },
        body: formData
      });

      if (!uploadRes.ok) throw new Error('Failed to upload image');
      const uploadData = await uploadRes.json();
      const imageUrl = uploadData.url;

      handleHeroSlideChange(id, 'imageUrl', imageUrl);
      toast.success('Slide image uploaded!');
    } catch (error) {
      console.error(error);
      toast.error('Error uploading slide image');
    } finally {
      setIsHeroUploading(prev => ({ ...prev, [id]: false }));
      e.target.value = ''; // Reset input
    }
  };

  const handleSaveHeroSlides = async () => {
    setIsSavingHeroSlides(true);
    try {
      const saveRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/settings/HERO_SLIDES`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}` },
        body: JSON.stringify({ value: JSON.stringify(heroSlides) })
      });

      if (saveRes.ok) {
        toast.success('Hero slides saved successfully!');
      } else {
        throw new Error('Failed to save slides');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error saving hero slides');
    } finally {
      setIsSavingHeroSlides(false);
    }
  };

  const handleBrandLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, settingKey: string, setter: (v: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsBrandLogoLoading(prev => ({ ...prev, [settingKey]: true }));
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', 'brand');
      const uploadRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}` },
        body: formData
      });
      if (!uploadRes.ok) throw new Error('Upload failed');
      const uploadData = await uploadRes.json();
      const imageUrl = uploadData.url;
      await fetch(`${import.meta.env.VITE_API_URL}/api/admin/settings/${settingKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}` },
        body: JSON.stringify({ value: imageUrl })
      });
      setter(imageUrl);
      toast.success('Logo updated! Reload to see changes.');
    } catch (error) {
      console.error(error);
      toast.error('Error uploading logo');
    } finally {
      setIsBrandLogoLoading(prev => ({ ...prev, [settingKey]: false }));
      e.target.value = '';
    }
  };

  const handleSaveBrandText = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBrand(true);
    try {
      const updates: [string, string][] = [
        ['BRAND_NAME', brandName],
        ['BRAND_TAGLINE', brandTagline],
        ['BRAND_ADDRESS', brandAddress],
        ['BRAND_PHONE', brandPhone],
        ['BRAND_WEBSITE', brandWebsite],
        ['BRAND_INSTAGRAM', brandInstagram],
        ['BRAND_FACEBOOK', brandFacebook],
        ['BRAND_WHATSAPP', brandWhatsapp],
      ];
      await Promise.all(updates.map(([key, value]) =>
        fetch(`${import.meta.env.VITE_API_URL}/api/admin/settings/${key}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}` },
          body: JSON.stringify({ value })
        })
      ));
      toast.success('Brand settings saved! Reload to see changes.');
    } catch (error) {
      console.error(error);
      toast.error('Error saving brand settings');
    } finally {
      setIsSavingBrand(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '24px', color: '#0f172a', marginBottom: '24px' }}>Site Settings</h2>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0' }}>
        <button 
          onClick={() => setActiveTab('brand')} 
          style={{ padding: '12px 24px', background: activeTab === 'brand' ? '#fff' : 'transparent', border: activeTab === 'brand' ? '1px solid #e2e8f0' : '1px solid transparent', borderBottom: activeTab === 'brand' ? '1px solid #fff' : 'none', marginBottom: '-1px', color: activeTab === 'brand' ? '#011C18' : '#64748b', fontWeight: activeTab === 'brand' ? 600 : 500, borderRadius: '8px 8px 0 0', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          Brand Identity
        </button>
        <button 
          onClick={() => setActiveTab('hero')} 
          style={{ padding: '12px 24px', background: activeTab === 'hero' ? '#fff' : 'transparent', border: activeTab === 'hero' ? '1px solid #e2e8f0' : '1px solid transparent', borderBottom: activeTab === 'hero' ? '1px solid #fff' : 'none', marginBottom: '-1px', color: activeTab === 'hero' ? '#011C18' : '#64748b', fontWeight: activeTab === 'hero' ? 600 : 500, borderRadius: '8px 8px 0 0', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          Hero Carousel
        </button>

        <button 
          onClick={() => setActiveTab('seo')} 
          style={{ padding: '12px 24px', background: activeTab === 'seo' ? '#fff' : 'transparent', border: activeTab === 'seo' ? '1px solid #e2e8f0' : '1px solid transparent', borderBottom: activeTab === 'seo' ? '1px solid #fff' : 'none', marginBottom: '-1px', color: activeTab === 'seo' ? '#011C18' : '#64748b', fontWeight: activeTab === 'seo' ? 600 : 500, borderRadius: '8px 8px 0 0', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          SEO Settings
        </button>
        <button 
          onClick={() => setActiveTab('about')} 
          style={{ padding: '12px 24px', background: activeTab === 'about' ? '#fff' : 'transparent', border: activeTab === 'about' ? '1px solid #e2e8f0' : '1px solid transparent', borderBottom: activeTab === 'about' ? '1px solid #fff' : 'none', marginBottom: '-1px', color: activeTab === 'about' ? '#011C18' : '#64748b', fontWeight: activeTab === 'about' ? 600 : 500, borderRadius: '8px 8px 0 0', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          About Page
        </button>
        <button 
          onClick={() => setActiveTab('moments')} 
          style={{ padding: '12px 24px', background: activeTab === 'moments' ? '#fff' : 'transparent', border: activeTab === 'moments' ? '1px solid #e2e8f0' : '1px solid transparent', borderBottom: activeTab === 'moments' ? '1px solid #fff' : 'none', marginBottom: '-1px', color: activeTab === 'moments' ? '#011C18' : '#64748b', fontWeight: activeTab === 'moments' ? 600 : 500, borderRadius: '8px 8px 0 0', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          Beautiful Moments
        </button>
      </div>

      {/* Brand Identity Settings */}
      {activeTab === 'brand' && (
      <div className="admin-card" style={{ maxWidth: '700px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '8px', color: '#1e293b' }}>Brand Identity</h3>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
          Manage your logos, brand name, and address information. These are used in the Header, Footer, and PDF Invoices.
        </p>

        {/* Logos Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #e2e8f0' }}>
          {/* Header Logo */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>Header Logo (Light)</label>
            <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '12px', textAlign: 'center', marginBottom: '12px', minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {brandLogoHeaderUrl ? (
                <img src={getImageUrl(brandLogoHeaderUrl)} alt="Header Logo" style={{ maxHeight: '60px', maxWidth: '100%', objectFit: 'contain' }} />
              ) : (
                <span style={{ color: '#94a3b8', fontSize: '13px' }}>Default Logo</span>
              )}
            </div>
            <label className="admin-btn-secondary" style={{ display: 'block', textAlign: 'center', cursor: 'pointer', padding: '6px 12px', fontSize: '13px' }}>
              {isBrandLogoLoading['BRAND_LOGO_HEADER'] ? 'Uploading...' : 'Upload Header Logo'}
              <input type="file" accept="image/*" onChange={e => handleBrandLogoUpload(e, 'BRAND_LOGO_HEADER', setBrandLogoHeaderUrl)} style={{ display: 'none' }} disabled={isBrandLogoLoading['BRAND_LOGO_HEADER']} />
            </label>
          </div>

          {/* Footer Logo */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>Footer Logo (Dark)</label>
            <div style={{ background: '#0f172a', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '12px', textAlign: 'center', marginBottom: '12px', minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {brandLogoFooterUrl ? (
                <img src={getImageUrl(brandLogoFooterUrl)} alt="Footer Logo" style={{ maxHeight: '60px', maxWidth: '100%', objectFit: 'contain' }} />
              ) : (
                <span style={{ color: '#94a3b8', fontSize: '13px' }}>Default Logo</span>
              )}
            </div>
            <label className="admin-btn-secondary" style={{ display: 'block', textAlign: 'center', cursor: 'pointer', padding: '6px 12px', fontSize: '13px' }}>
              {isBrandLogoLoading['BRAND_LOGO_FOOTER'] ? 'Uploading...' : 'Upload Footer Logo'}
              <input type="file" accept="image/*" onChange={e => handleBrandLogoUpload(e, 'BRAND_LOGO_FOOTER', setBrandLogoFooterUrl)} style={{ display: 'none' }} disabled={isBrandLogoLoading['BRAND_LOGO_FOOTER']} />
            </label>
          </div>

          {/* PDF Logo */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>PDF Invoice Logo</label>
            <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '12px', textAlign: 'center', marginBottom: '12px', minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {brandLogoPdfUrl ? (
                <img src={getImageUrl(brandLogoPdfUrl)} alt="PDF Logo" style={{ maxHeight: '60px', maxWidth: '100%', objectFit: 'contain' }} />
              ) : (
                <span style={{ color: '#94a3b8', fontSize: '13px' }}>Default Logo</span>
              )}
            </div>
            <label className="admin-btn-secondary" style={{ display: 'block', textAlign: 'center', cursor: 'pointer', padding: '6px 12px', fontSize: '13px' }}>
              {isBrandLogoLoading['BRAND_LOGO_PDF'] ? 'Uploading...' : 'Upload PDF Logo'}
              <input type="file" accept="image/*" onChange={e => handleBrandLogoUpload(e, 'BRAND_LOGO_PDF', setBrandLogoPdfUrl)} style={{ display: 'none' }} disabled={isBrandLogoLoading['BRAND_LOGO_PDF']} />
            </label>
          </div>
        </div>

        {/* Text Settings Form */}
        <form onSubmit={handleSaveBrandText}>
          <div className="admin-form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label>Brand Name</label>
              <input type="text" className="admin-input" value={brandName} onChange={e => setBrandName(e.target.value)} required />
            </div>
            <div>
              <label>Tagline</label>
              <input type="text" className="admin-input" value={brandTagline} onChange={e => setBrandTagline(e.target.value)} />
            </div>
          </div>
          
          <div className="admin-form-group">
            <label>Shipped By Address (PDF)</label>
            <textarea className="admin-input" rows={3} value={brandAddress} onChange={e => setBrandAddress(e.target.value)} />
          </div>

          <div className="admin-form-group" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div>
              <label>Phone Number</label>
              <input type="text" className="admin-input" value={brandPhone} onChange={e => setBrandPhone(e.target.value)} />
            </div>
            <div>
              <label>Website URL</label>
              <input type="text" className="admin-input" value={brandWebsite} onChange={e => setBrandWebsite(e.target.value)} />
            </div>
            <div>
              <label>Instagram Handle / Link</label>
              <input type="text" className="admin-input" value={brandInstagram} onChange={e => setBrandInstagram(e.target.value)} />
            </div>
            <div>
              <label>Facebook Link</label>
              <input type="text" className="admin-input" value={brandFacebook} onChange={e => setBrandFacebook(e.target.value)} />
            </div>
            <div>
              <label>WhatsApp Number</label>
              <input type="text" className="admin-input" value={brandWhatsapp} onChange={e => setBrandWhatsapp(e.target.value)} />
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <button type="submit" className="admin-btn" disabled={isSavingBrand}>
              {isSavingBrand ? 'Saving...' : 'Save Brand Details'}
            </button>
          </div>
        </form>
      </div>
      )}
      
      {/* Hero Settings */}
      {activeTab === 'hero' && (
      <div className="admin-card" style={{ maxWidth: '800px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px', color: '#1e293b' }}>Hero Carousel Slides</h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
              Manage multiple sliding banners for the homepage.
            </p>
          </div>
          <button onClick={handleAddHeroSlide} className="admin-btn-secondary" style={{ padding: '6px 12px' }}>
            + Add Slide
          </button>
        </div>

        {heroSlides.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
            <p style={{ color: '#64748b', fontSize: '14px' }}>No slides added yet. Add a slide to start.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {heroSlides.map((slide, index) => (
              <div key={slide.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', background: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                  <h4 style={{ fontWeight: 600, color: '#334155' }}>Slide {index + 1}</h4>
                  <button onClick={() => handleRemoveHeroSlide(slide.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>
                    Remove Slide
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                  {/* Left Col: Image Upload */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>Background Image</label>
                    <div style={{ width: '100%', aspectRatio: '16/9', background: '#e2e8f0', borderRadius: '6px', overflow: 'hidden', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {slide.imageUrl ? (
                        <img src={getImageUrl(slide.imageUrl)} alt={`Slide ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '12px', color: '#64748b' }}>No Image</span>
                      )}
                    </div>
                    <label className="admin-btn-secondary" style={{ display: 'block', textAlign: 'center', cursor: 'pointer', padding: '6px', fontSize: '12px' }}>
                      {isHeroUploading[slide.id] ? 'Uploading...' : 'Upload Image'}
                      <input type="file" accept="image/*" onChange={(e) => handleHeroSlideImageUpload(e, slide.id)} style={{ display: 'none' }} disabled={isHeroUploading[slide.id]} />
                    </label>
                  </div>

                  {/* Right Col: Text Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px' }}>Subtitle (Top)</label>
                      <input type="text" className="admin-input" style={{ padding: '6px', fontSize: '13px' }} value={slide.subtitle} onChange={e => handleHeroSlideChange(slide.id, 'subtitle', e.target.value)} placeholder="ROOTED IN TRADITION" />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px' }}>Main Title</label>
                      <input type="text" className="admin-input" style={{ padding: '6px', fontSize: '13px' }} value={slide.title} onChange={e => handleHeroSlideChange(slide.id, 'title', e.target.value)} placeholder="Crafting Timeless Elegance..." />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px' }}>Description</label>
                      <textarea className="admin-input" rows={2} style={{ padding: '6px', fontSize: '13px' }} value={slide.description} onChange={e => handleHeroSlideChange(slide.id, 'description', e.target.value)} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '12px' }}>Button 1 Text</label>
                        <input type="text" className="admin-input" style={{ padding: '6px', fontSize: '13px' }} value={slide.button1Text} onChange={e => handleHeroSlideChange(slide.id, 'button1Text', e.target.value)} />
                      </div>
                      <div>
                        <label style={{ fontSize: '12px' }}>Button 1 Link</label>
                        <input type="text" className="admin-input" style={{ padding: '6px', fontSize: '13px' }} value={slide.button1Url} onChange={e => handleHeroSlideChange(slide.id, 'button1Url', e.target.value)} />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '12px' }}>Button 2 Text</label>
                        <input type="text" className="admin-input" style={{ padding: '6px', fontSize: '13px' }} value={slide.button2Text} onChange={e => handleHeroSlideChange(slide.id, 'button2Text', e.target.value)} />
                      </div>
                      <div>
                        <label style={{ fontSize: '12px' }}>Button 2 Link</label>
                        <input type="text" className="admin-input" style={{ padding: '6px', fontSize: '13px' }} value={slide.button2Url} onChange={e => handleHeroSlideChange(slide.id, 'button2Url', e.target.value)} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
          <button onClick={handleSaveHeroSlides} className="admin-btn" disabled={isSavingHeroSlides || heroSlides.length === 0}>
            {isSavingHeroSlides ? 'Saving...' : 'Save All Slides'}
          </button>
        </div>
      </div>
      )}

      {/* Occasion Banner Settings */}
      {activeTab === 'occasion' && (
      <div className="admin-card" style={{ maxWidth: '800px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px', color: '#1e293b' }}>Shop By Occasion Carousel</h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
              Manage multiple sliding banners for the occasion section.
            </p>
          </div>
          <button onClick={handleAddOccasionSlide} className="admin-btn-secondary" style={{ padding: '6px 12px' }}>
            + Add Slide
          </button>
        </div>

        {occasionSlides.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
            <p style={{ color: '#64748b', fontSize: '14px' }}>No slides added yet. Add a slide to start.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {occasionSlides.map((slide, index) => (
              <div key={slide.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', background: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                  <h4 style={{ fontWeight: 600, color: '#334155' }}>Occasion Slide {index + 1}</h4>
                  <button onClick={() => handleRemoveOccasionSlide(slide.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>
                    Remove Slide
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                  {/* Left Col: Image Upload */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>Background Image</label>
                    <div style={{ width: '100%', aspectRatio: '16/9', background: '#e2e8f0', borderRadius: '6px', overflow: 'hidden', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {slide.imageUrl ? (
                        <img src={getImageUrl(slide.imageUrl)} alt={`Slide ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '12px', color: '#64748b' }}>No Image</span>
                      )}
                    </div>
                    <label className="admin-btn-secondary" style={{ display: 'block', textAlign: 'center', cursor: 'pointer', padding: '6px', fontSize: '12px' }}>
                      {isOccasionUploading[slide.id] ? 'Uploading...' : 'Upload Image'}
                      <input type="file" accept="image/*" onChange={(e) => handleOccasionSlideImageUpload(e, slide.id)} style={{ display: 'none' }} disabled={isOccasionUploading[slide.id]} />
                    </label>
                  </div>

                  {/* Right Col: Text Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px' }}>Main Title</label>
                      <input type="text" className="admin-input" style={{ padding: '6px', fontSize: '13px' }} value={slide.title} onChange={e => handleOccasionSlideChange(slide.id, 'title', e.target.value)} placeholder="Where Every Occasion..." />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px' }}>Description</label>
                      <textarea className="admin-input" rows={3} style={{ padding: '6px', fontSize: '13px' }} value={slide.description} onChange={e => handleOccasionSlideChange(slide.id, 'description', e.target.value)} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '12px' }}>Button Text</label>
                        <input type="text" className="admin-input" style={{ padding: '6px', fontSize: '13px' }} value={slide.linkText} onChange={e => handleOccasionSlideChange(slide.id, 'linkText', e.target.value)} />
                      </div>
                      <div>
                        <label style={{ fontSize: '12px' }}>Button URL</label>
                        <input type="text" className="admin-input" style={{ padding: '6px', fontSize: '13px' }} value={slide.linkUrl} onChange={e => handleOccasionSlideChange(slide.id, 'linkUrl', e.target.value)} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
          <button onClick={handleSaveOccasionSlides} className="admin-btn" disabled={isSavingOccasionSlides || occasionSlides.length === 0}>
            {isSavingOccasionSlides ? 'Saving...' : 'Save Occasion Slides'}
          </button>
        </div>
      </div>
      )}

      {/* SEO Settings */}
      {activeTab === 'seo' && (
      <div className="admin-card" style={{ maxWidth: '700px', marginTop: '24px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#1e293b' }}>SEO Settings (Static Pages)</h3>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>
          Manage Meta Title and Meta Description for key listing pages.
        </p>
        <form onSubmit={handleSaveSeo}>
          <div className="admin-form-group">
            <label>Select Page</label>
            <select 
              className="admin-input" 
              value={selectedSeoPage} 
              onChange={e => setSelectedSeoPage(e.target.value)}
            >
              <option value="SEO_PRODUCTS">Products</option>
              <option value="SEO_TRENDING">Trending</option>
              <option value="SEO_NEW_ARRIVALS">New Arrivals</option>
            </select>
          </div>
          <div className="admin-form-group">
            <label>Meta Title</label>
            <input 
              type="text" 
              className="admin-input" 
              value={seoTitle} 
              onChange={e => setSeoTitle(e.target.value)} 
              placeholder="e.g. Buy Trending Spices..." 
            />
          </div>
          <div className="admin-form-group">
            <label>Meta Description</label>
            <textarea 
              className="admin-input" 
              value={seoDescription} 
              onChange={e => setSeoDescription(e.target.value)} 
              rows={4} 
              placeholder="A short description for search engines..." 
            />
          </div>
          <button type="submit" className="admin-btn" disabled={isSavingSeo}>
            {isSavingSeo ? 'Saving...' : 'Save SEO Settings'}
          </button>
        </form>
      </div>
      )}

      {/* About Page Settings */}
      {activeTab === 'about' && (
      <div className="admin-card" style={{ maxWidth: '700px', marginTop: '24px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '8px', color: '#1e293b' }}>About Page Images</h3>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
          Manage the hero banner and the story image on the About Us page.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', paddingBottom: '24px' }}>
          {/* About Hero Banner */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>Hero Banner Background</label>
            <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '12px', textAlign: 'center', marginBottom: '12px', minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {aboutHeroImage ? (
                <img src={getImageUrl(aboutHeroImage)} alt="About Hero" style={{ maxHeight: '100px', maxWidth: '100%', objectFit: 'contain' }} />
              ) : (
                <span style={{ color: '#94a3b8', fontSize: '13px' }}>Default Banner</span>
              )}
            </div>
            <label className="admin-btn-secondary" style={{ display: 'block', textAlign: 'center', cursor: 'pointer', padding: '6px 12px', fontSize: '13px' }}>
              {isBrandLogoLoading['ABOUT_HERO_IMAGE'] ? 'Uploading...' : 'Upload Hero Banner'}
              <input type="file" accept="image/*" onChange={e => handleBrandLogoUpload(e, 'ABOUT_HERO_IMAGE', setAboutHeroImage)} style={{ display: 'none' }} disabled={isBrandLogoLoading['ABOUT_HERO_IMAGE']} />
            </label>
          </div>

          {/* About Story Image */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>Story Image</label>
            <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '12px', textAlign: 'center', marginBottom: '12px', minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {aboutStoryImage ? (
                <img src={getImageUrl(aboutStoryImage)} alt="About Story" style={{ maxHeight: '100px', maxWidth: '100%', objectFit: 'contain' }} />
              ) : (
                <span style={{ color: '#94a3b8', fontSize: '13px' }}>Default Story Image</span>
              )}
            </div>
            <label className="admin-btn-secondary" style={{ display: 'block', textAlign: 'center', cursor: 'pointer', padding: '6px 12px', fontSize: '13px' }}>
              {isBrandLogoLoading['ABOUT_STORY_IMAGE'] ? 'Uploading...' : 'Upload Story Image'}
              <input type="file" accept="image/*" onChange={e => handleBrandLogoUpload(e, 'ABOUT_STORY_IMAGE', setAboutStoryImage)} style={{ display: 'none' }} disabled={isBrandLogoLoading['ABOUT_STORY_IMAGE']} />
            </label>
          </div>
        </div>
      </div>
      )}

      {/* Beautiful Moments Settings */}
      {activeTab === 'moments' && (
      <div className="admin-card" style={{ maxWidth: '800px', marginTop: '24px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '8px', color: '#1e293b' }}>"In Their Most Beautiful Moments" Images</h3>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
          Manage the 5 images displayed in the Instagram-style grid on the homepage.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', paddingBottom: '24px' }}>
          {[0, 1, 2, 3, 4].map(index => (
            <div key={index}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>
                {index === 2 ? `Image ${index + 1} (Large Middle)` : `Image ${index + 1}`}
              </label>
              <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '12px', textAlign: 'center', marginBottom: '12px', minHeight: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {momentsImages[index] ? (
                  <img src={getImageUrl(momentsImages[index])} alt={`Moment ${index + 1}`} style={{ maxHeight: '130px', maxWidth: '100%', objectFit: 'contain' }} />
                ) : (
                  <span style={{ color: '#94a3b8', fontSize: '13px' }}>No Image</span>
                )}
              </div>
              <label className="admin-btn-secondary" style={{ display: 'block', textAlign: 'center', cursor: 'pointer', padding: '6px 12px', fontSize: '13px' }}>
                {isMomentsUploading[index] ? 'Uploading...' : 'Upload Image'}
                <input type="file" accept="image/*" onChange={e => handleMomentsImageUpload(e, index)} style={{ display: 'none' }} disabled={isMomentsUploading[index]} />
              </label>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
          <button onClick={handleSaveMoments} className="admin-btn" disabled={isSavingMoments}>
            {isSavingMoments ? 'Saving...' : 'Save Moments Images'}
          </button>
        </div>
      </div>
      )}
    </div>
  );
};

export default AdminSettings;

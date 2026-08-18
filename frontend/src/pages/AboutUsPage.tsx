import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import StaticSEO from '../components/StaticSEO';
import { useSiteSettings } from '../context/SiteSettingsContext';
import OrnamentDivider from '../components/OrnamentDivider';
import './AboutUsPage.css';

const AboutUsPage = () => {
  const { aboutHeroImage, aboutStoryImage } = useSiteSettings();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const defaultHeroImage = "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=2070&auto=format&fit=crop";

  return (
    <div className="about-page">
      <StaticSEO pagePath="/about-us" defaultTitle="About Us - DK Exporting" defaultDescription="Learn more about DK Exporting and our mission to provide premium spices and nuts." />
      {/* Hero Section */}
      <section className="about-hero" style={{ 
        backgroundImage: `linear-gradient(rgba(15, 10, 6, 0.6), rgba(15, 10, 6, 0.8)), url(${aboutHeroImage || defaultHeroImage})`
      }}>
        <div className="about-hero-content">
          <h1>Direct From Nature, Delivered Worldwide</h1>
          <OrnamentDivider />
          <p style={{ marginTop: '24px' }}>
            DK Exporting is more than just trade. It is a celebration of premium quality 
            spices and nuts, carefully selected to deliver authentic flavors globally.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="about-story-section">
        <div className="container">
          <div className="about-story-grid">
            <div className="about-story-image">
              <img 
                src={aboutStoryImage || "https://images.unsplash.com/photo-1599909618193-4a11fbd4f74d?q=80&w=1964&auto=format&fit=crop"} 
                alt="DK Exporting Story" 
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
              />
            </div>
            <div className="about-story-text">
              <h2>Our Story</h2>
              <p><strong>Founder: Devanand sunil</strong></p>
              <p>
                Founded with a passion for bringing the finest agricultural products to the global market, 
                DK Exporting was born from a simple idea: quality you can trust, partnership you can rely on.
              </p>
              <p>
                We noticed that the market was filled with compromised quality. DK Exporting changes that. 
                We meticulously select natural and healthy products, from bold aroma black pepper to creamy premium cashews, 
                ensuring export quality in every package.
              </p>
              <p>
                Whether it's small retail packs or large bulk orders, our commitment to hygienic packing 
                and 100% natural goods empowers businesses and individuals to experience true flavor.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="about-values-section">
        <div className="container">
          <h2>What We Stand For</h2>
          <div className="values-grid">
            <div className="value-card">
              <h3>100% Natural</h3>
              <p>
                No additives or preservatives. Our spices and nuts are sourced directly from nature.
              </p>
            </div>

            <div className="value-card">
              <h3>Premium Quality</h3>
              <p>
                Carefully selected, handpicked quality ensuring bold aromas and rich tastes.
              </p>
            </div>

            <div className="value-card">
              <h3>Global Export</h3>
              <p>
                Trusted worldwide. We meet your needs, small or large, with safe and hygienic packing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '80px 0', textAlign: 'center', backgroundColor: 'var(--bg-main)' }}>
        <div className="container">
          <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '32px', color: 'var(--primary)', marginBottom: '16px' }}>
            Ready to experience premium quality?
          </h2>
          <p style={{ color: 'var(--text-mid)', marginBottom: '32px' }}>
            Explore our spices and nuts catalog. Bulk orders available.
          </p>
          <Link to="/shop" className="btn-primary">
            EXPLORE CATALOG
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutUsPage;

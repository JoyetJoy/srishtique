import { Link } from 'react-router-dom';
import HeroBanner from '../components/HeroBanner';

import StaticSEO from '../components/StaticSEO';
import { useState, useEffect } from 'react';
import ProductSection from '../components/ProductSection';
import BulkOrderSection from '../components/BulkOrderSection';

import InstagramSection from '../components/InstagramSection';
import FadeIn from '../components/FadeIn';
import AboutUsSection from '../components/AboutUsSection';
import TestimonialsSection from '../components/TestimonialsSection';
import Loader from '../components/Loader';

const HomePage = () => {
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/public/products`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        if (!Array.isArray(data)) return;
        // Filter based on flags
        const newArrivalsData = data.filter((p: any) => p.isNewArrival);
        const trendingData = data.filter((p: any) => p.isTrending);

        const formatProduct = (p: any) => ({
          id: p.id,
          name: p.name,
          price: p.variants?.[0]?.price || 0,
          originalPrice: p.variants?.[0]?.originalPrice,
          image: p.images?.[0] || '',
          rating: 5,
          reviews: 12,
          variantId: p.variants?.[0]?.id,
          size: p.variants?.[0]?.size,
          color: p.variants?.[0]?.color,
          isOutOfStock: !p.variants || p.variants.length === 0 || p.variants.every((v: any) => v.stock <= 0)
        });

        setNewArrivals(newArrivalsData.map(formatProduct).slice(0, 5));
        setTrending(trendingData.map(formatProduct));
        setAllProducts(data.map(formatProduct));
      })
      .catch(err => console.error('Failed to fetch products', err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="home-page">
      <StaticSEO
        pagePath="/"
        defaultTitle="DK Exporting - Premium Cashews & Spices"
        defaultDescription="Discover premium cashew nuts, black pepper, and cardamom at DK Exporting."
      />
      <HeroBanner />
      <FadeIn delay={0.1} direction="right">
        <AboutUsSection />
      </FadeIn>

      {allProducts.length > 0 && (
        <FadeIn delay={0.1} direction="up">
          <section className="jewellery-section">
            <div className="jewellery-container">
              <h2 className="jewellery-title">Our Products</h2>
              <p className="jewellery-subtitle">Discover our full range of premium spices and nuts</p>
              <ProductSection
                title=""
                products={allProducts.slice(0, 4)}
                columns={4}
                mobileGrid={true}
              />
              <div style={{ textAlign: 'center', marginTop: '32px' }}>
                <Link to="/products" className="btn-outline explore-btn" style={{ background: '#4a3b32', color: '#fff', border: 'none', padding: '12px 32px' }}>
                  SEE MORE
                </Link>
              </div>
            </div>
          </section>
        </FadeIn>
      )}
      <BulkOrderSection products={allProducts} />

      {trending.length > 0 && (
        <FadeIn delay={0.1}>
          <section className="jewellery-section">
            <div className="jewellery-container">
              <h2 className="jewellery-title">Trending Spices & Nuts</h2>
              <p className="jewellery-subtitle">Authentic flavors for every culinary experience.</p>
              <ProductSection
                title=""
                products={trending}
                viewAllLink="/trending"
                columns={4}
              />
            </div>
          </section>
        </FadeIn>
      )}

      <FadeIn delay={0.1} direction="up">
        <TestimonialsSection />
      </FadeIn>

      <FadeIn delay={0.2} direction="left">
        <InstagramSection products={newArrivals} />
      </FadeIn>
    </div>
  );
};

export default HomePage;

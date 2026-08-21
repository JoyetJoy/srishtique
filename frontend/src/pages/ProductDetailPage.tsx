import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUrl';
import ProductGallery from '../components/ProductGallery';
import ProductInfo from '../components/ProductInfo';
import ProductSection from '../components/ProductSection';
import Loader from '../components/Loader';
import SEO from '../components/SEO';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [activeColorName, setActiveColorName] = useState<string | undefined>();

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch(`${import.meta.env.VITE_API_URL}/api/public/products`)
      .then(res => res.json())
      .then(data => {
        const formatProduct = (p: any) => {
          const prices = p.variants?.map((v: any) => v.price) || [];
          const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
          const minVariant = p.variants?.find((v: any) => v.price === minPrice);
          return {
            ...p,
            price: minPrice,
            originalPrice: minVariant?.originalPrice,
            image: p.images?.[0] || '',
            isOutOfStock: !p.variants || p.variants.length === 0 || p.variants.every((v: any) => v.stock <= 0)
          };
        };

        if (!Array.isArray(data)) {
          console.error("Data is not an array", data);
          return;
        }
        const formattedData = data.map(formatProduct);
        const found = formattedData.find((p: any) => p.id === Number(id)) || formattedData[0];
        setProduct(found);
        setRelatedProducts(formattedData.filter((p: any) => p.id !== found.id).slice(0, 4));
      })
      .catch(err => console.error(err));
  }, [id]);

  if (!product) return <Loader />;

  let allImages = [...(product.images || [])];
  
  if (product.variants) {
    product.variants.forEach((v: any) => {
      let parsedImages = v.images;
      if (typeof parsedImages === 'string') {
        try { parsedImages = JSON.parse(parsedImages); } catch(e){}
      }
      if (Array.isArray(parsedImages)) {
        parsedImages.forEach(img => {
          if (!allImages.includes(img)) {
            allImages.push(img);
          }
        });
      }
    });
  }

  let activeImageIndex = 0;
  if (activeColorName) {
    const variantsWithColor = product.variants?.filter((v: any) => v.color === activeColorName) || [];
    const variantWithImages = variantsWithColor.find((v: any) => {
      let parsed = v.images;
      if (typeof parsed === 'string') {
        try { parsed = JSON.parse(parsed); } catch(e){}
      }
      return Array.isArray(parsed) && parsed.length > 0;
    });
    
    if (variantWithImages) {
      let parsedImages = variantWithImages.images;
      if (typeof parsedImages === 'string') {
        try { parsedImages = JSON.parse(parsedImages); } catch(e){}
      }
      if (Array.isArray(parsedImages) && parsedImages.length > 0) {
        const firstVariantImage = parsedImages[0];
        const index = allImages.indexOf(firstVariantImage);
        if (index !== -1) {
          activeImageIndex = index;
        }
      }
    }
  }

  return (
    <div className="product-detail-page">
      <SEO 
        title={product.metaTitle || product.name} 
        description={product.metaDescription || product.description}
        image={product.images[0] ? getImageUrl(product.images[0]) : undefined}
      />
      <div className="container">
        <div className="product-detail-grid">
          <ProductGallery images={allImages} initialActiveIndex={activeImageIndex} />
          <ProductInfo product={product} onColorChange={setActiveColorName} />
        </div>
      </div>
      
      {/* Related Products Section */}
      <div className="related-products-section">
        <ProductSection
          title="RELATED PRODUCTS"
          products={relatedProducts}
          centered={true}
        />
      </div>
    </div>
  );
};

export default ProductDetailPage;

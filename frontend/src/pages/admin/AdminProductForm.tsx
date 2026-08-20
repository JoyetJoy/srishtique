import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getImageUrl } from '../../utils/imageUrl';
import toast from 'react-hot-toast';
import SearchableSelect from '../../components/SearchableSelect';

const AdminProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [categories, setCategories] = useState<any[]>([]);
  const [occasions, setOccasions] = useState<any[]>([]);

  // Basic Info
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [occasionIds, setOccasionIds] = useState<number[]>([]);
  
  // Flags
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  
  // SEO
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  
  // Image
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [sizeChart, setSizeChart] = useState('');
  const [sizeChartFile, setSizeChartFile] = useState<File | null>(null);
  const [sizeChartMasterId, setSizeChartMasterId] = useState('');
  const [sizeChartOptions, setSizeChartOptions] = useState<any[]>([]);
  
  // Rich Details
  const [productDetails, setProductDetails] = useState(''); // Comma separated
  const [materialAndCare, setMaterialAndCare] = useState(''); // Comma separated
  const [sizeAndFit, setSizeAndFit] = useState('');
  
  // Specifications
  const [specs, setSpecs] = useState([{ key: '', value: '' }]);

  // Variants
  const [variants, setVariants] = useState<any[]>([
    { size: '', color: '', price: '', originalPrice: '', stock: '', sku: '', existingImages: [], imageFiles: [] }
  ]);

  // Bulk Variant Generator
  const [showBulkGen, setShowBulkGen] = useState(false);
  const [bulkSizes, setBulkSizes] = useState<string[]>([]);
  const [bulkSizeInput, setBulkSizeInput] = useState('');
  const [bulkPrice, setBulkPrice] = useState('');
  const [bulkOriginalPrice, setBulkOriginalPrice] = useState('');
  const [bulkStock, setBulkStock] = useState('');

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchOccasions();
    fetchSizeCharts();
    if (isEditing) fetchProduct();
  }, [id]);

  const fetchSizeCharts = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/size-charts`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}` } });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setSizeChartOptions(data);
      }
    } catch (e) { console.error(e); }
  };

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/products/${id}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}` } });
      if (res.ok) {
        const prod = await res.json();
        setName(prod.name);
        setDescription(prod.description || '');
        setCategoryId(prod.categoryId?.toString() || '');
        if (prod.occasions && prod.occasions.length > 0) {
          setOccasionIds(prod.occasions.map((o: any) => o.id));
        }
        if (prod.images && prod.images.length > 0) setExistingImages(prod.images);
        if (prod.sizeChart) setSizeChart(prod.sizeChart);
        if (prod.sizeChartMasterId) setSizeChartMasterId(prod.sizeChartMasterId.toString());
        setProductDetails(prod.productDetails?.join(', ') || '');
        setMaterialAndCare(prod.materialAndCare?.join(', ') || '');
        setSizeAndFit(prod.sizeAndFit || '');
        setIsNewArrival(prod.isNewArrival || false);
        setIsTrending(prod.isTrending || false);
        setMetaTitle(prod.metaTitle || '');
        setMetaDescription(prod.metaDescription || '');
        setMetaKeywords(prod.metaKeywords || '');
        
        // Convert specs object to array
        if (prod.specifications) {
          const specKeys = Object.keys(prod.specifications);
          if (specKeys.length > 0) {
            setSpecs(specKeys.map(k => ({ key: k, value: prod.specifications[k] })));
          }
        }
        
        // Convert variants
        if (prod.variants && prod.variants.length > 0) {
          setVariants(prod.variants.map((v: any) => ({
            size: v.size,
            color: v.color,
            price: v.price.toString(),
            originalPrice: v.originalPrice ? v.originalPrice.toString() : '',
            stock: v.stock.toString(),
            sku: v.sku || '',
            existingImages: v.images || [],
            imageFiles: []
          })));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // Need limit=100 or something high so the dropdown has all categories, or a dedicated no-pagination endpoint.
      // Currently getCategories defaults to 10 if not provided, but wait! We changed it to default to 10.
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/categories?limit=1000`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}` } });
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || data);
      }
    } catch (e) { console.error(e); }
  };

  const fetchOccasions = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/occasions?limit=1000`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}` } });
      if (res.ok) {
        const data = await res.json();
        setOccasions(data.occasions || data);
      }
    } catch (e) { console.error(e); }
  };

  // Specs Handlers
  const handleSpecChange = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = value;
    setSpecs(newSpecs);
  };
  const addSpec = () => setSpecs([...specs, { key: '', value: '' }]);
  const removeSpec = (index: number) => setSpecs(specs.filter((_, i) => i !== index));

  // Variant Handlers
  const handleVariantChange = (index: number, field: string, value: any) => {
    const newVariants = [...variants] as any;
    newVariants[index][field] = value;
    setVariants(newVariants);
  };
  const addVariant = () => setVariants([...variants, { size: '', color: '', price: '', originalPrice: '', stock: '', sku: '', existingImages: [], imageFiles: [] }]);
  const removeVariant = (index: number) => setVariants(variants.filter((_, i) => i !== index));

  // Bulk Variant Generator Handlers
  const addBulkSize = () => {
    const trimmed = bulkSizeInput.trim();
    if (trimmed && !bulkSizes.includes(trimmed)) {
      setBulkSizes([...bulkSizes, trimmed]);
    }
    setBulkSizeInput('');
  };
  const removeBulkSize = (s: string) => setBulkSizes(bulkSizes.filter(x => x !== s));

  const generateBulkVariants = () => {
    if (!bulkPrice) { toast.error('Please enter a common price'); return; }
    if (!bulkStock) { toast.error('Please enter a common stock'); return; }
    if (bulkSizes.length === 0) { toast.error('Please add at least one size'); return; }

    const sizesToUse = bulkSizes.length > 0 ? bulkSizes : [''];

    const generated: any[] = [];
    for (const size of sizesToUse) {
      generated.push({
        size,
        color: '',
        price: bulkPrice,
        originalPrice: bulkOriginalPrice,
        stock: bulkStock,
        sku: '',
        existingImages: [],
        imageFiles: []
      });
    }

    // Replace the single empty default variant, or append to existing
    const hasOnlyEmptyDefault = variants.length === 1 && !variants[0].size && !variants[0].price;
    setVariants(hasOnlyEmptyDefault ? generated : [...variants, ...generated]);
    toast.success(`Generated ${generated.length} variant${generated.length > 1 ? 's' : ''}!`);
    setShowBulkGen(false);
  };

  const applyPriceToAll = () => {
    if (!bulkPrice) return;
    setVariants(variants.map(v => ({ ...v, price: bulkPrice, originalPrice: bulkOriginalPrice || v.originalPrice })));
    toast.success('Price applied to all variants');
  };

  const applyStockToAll = () => {
    if (!bulkStock) return;
    setVariants(variants.map(v => ({ ...v, stock: bulkStock })));
    toast.success('Stock applied to all variants');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageFiles.length === 0 && existingImages.length === 0) return toast.error('Please select at least one image');
    if (!categoryId) return toast.error('Please select a category');

    setUploading(true);
    try {
      let imageUrls = [...existingImages];
      let finalSizeChartUrl = sizeChart;

      if (sizeChartFile) {
        const formData = new FormData();
        formData.append('image', sizeChartFile);
        formData.append('folder', 'size-charts');
        const uploadRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}` },
          body: formData
        });
        const uploadData = await uploadRes.json();
        finalSizeChartUrl = uploadData.url;
      }

      // 1. Upload Images
      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const formData = new FormData();
          formData.append('image', file);
          formData.append('folder', 'products');

          const uploadRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}` },
            body: formData
          });
          const uploadData = await uploadRes.json();
          imageUrls.push(uploadData.url);
        }
      }

      // Prepare complex data
      const specsObject = specs.reduce((acc, curr) => {
        if (curr.key && curr.value) acc[curr.key] = curr.value;
        return acc;
      }, {} as any);

      const parsedVariants = [];
      for (const v of variants) {
        let vImages = [...(v.existingImages || [])];
        if (v.imageFiles && v.imageFiles.length > 0) {
          for (const file of v.imageFiles) {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('folder', 'variants');

            const uploadRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/upload`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}` },
              body: formData
            });
            const uploadData = await uploadRes.json();
            vImages.push(uploadData.url);
          }
        }
        
        parsedVariants.push({
          size: v.size,
          color: v.color,
          price: parseFloat(v.price) || 0,
          originalPrice: v.originalPrice ? parseFloat(v.originalPrice) : null,
          stock: parseInt(v.stock, 10) || 0,
          sku: v.sku || null,
          images: vImages
        });
      }

      // 2. Create or Update Product
      const url = isEditing 
        ? `${import.meta.env.VITE_API_URL}/api/admin/products/${id}`
        : `${import.meta.env.VITE_API_URL}/api/admin/products`;

      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}` },
        body: JSON.stringify({ 
          name, 
          description,
          categoryId: parseInt(categoryId, 10),
          occasionIds: occasionIds,
          type: categories.find((c: any) => c.id === parseInt(categoryId, 10))?.type || 'SPICE',
          images: imageUrls,
          sizeChart: finalSizeChartUrl,
          sizeChartMasterId: sizeChartMasterId ? parseInt(sizeChartMasterId, 10) : null,
          productDetails: productDetails.split(',').map(s => s.trim()).filter(Boolean),
          materialAndCare: materialAndCare.split(',').map(s => s.trim()).filter(Boolean),
          sizeAndFit,
          specifications: specsObject,
          isNewArrival,
          isTrending,
          metaTitle: metaTitle || undefined,
          metaDescription: metaDescription || undefined,
          metaKeywords: metaKeywords || undefined,
          variants: parsedVariants
        })
      });

      if (res.ok) {
        toast.success(isEditing ? 'Product updated successfully!' : 'Product created successfully!');
        navigate('/admin/products');
      } else {
        toast.error('Failed to save product');
      }
    } catch (e) {
      console.error(e);
      toast.error('Error saving product');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div>Loading product...</div>;

  return (
    <div style={{ paddingBottom: '100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>{isEditing ? 'Edit Product' : 'Create New Product'}</h2>
        <button className="admin-btn-secondary" onClick={() => navigate('/admin/products')}>Back to Products</button>
      </div>

      <div className="admin-card">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* BASIC INFO */}
          <div style={{ padding: '24px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#0f172a' }}>Basic Info</h5>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className="admin-form-group">
                <label>Name</label>
                <input type="text" className="admin-input" value={name} onChange={e => setName(e.target.value)} required />
              </div>

              <div className="admin-form-group">
                <label>Category</label>
                <SearchableSelect
                  options={categories.map((c: any) => ({ value: c.id, label: `${c.name} (${c.type})` }))}
                  value={categoryId}
                  onChange={setCategoryId}
                  placeholder="Select Category"
                  required
                />
              </div>

              <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Product Images - Recommended size: 800x1200 (Portrait)</label>
                <input 
                  type="file" 
                  className="admin-input" 
                  accept="image/*" 
                  multiple 
                  onChange={e => {
                    if (e.target.files && e.target.files.length > 0) {
                      const newFiles = Array.from(e.target.files);
                      setImageFiles(prev => [...prev, ...newFiles]);
                    }
                  }} 
                  required={!isEditing && existingImages.length === 0 && imageFiles.length === 0} 
                />
                
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '12px' }}>
                  {existingImages.map((img, idx) => (
                    <div key={`existing-${idx}`} style={{ position: 'relative' }}>
                      <img src={getImageUrl(img)} alt="Current" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }} />
                      <button 
                        type="button" 
                        onClick={() => setExistingImages(prev => prev.filter((_, i) => i !== idx))}
                        style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  
                  {imageFiles.map((file, idx) => (
                    <div key={`new-${idx}`} style={{ position: 'relative' }}>
                      <img src={URL.createObjectURL(file)} alt="New" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '2px dashed #3b82f6' }} />
                      <button 
                        type="button" 
                        onClick={() => setImageFiles(prev => prev.filter((_, i) => i !== idx))}
                        style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                {(existingImages.length > 0 || imageFiles.length > 0) && (
                  <p style={{fontSize: '12px', color: '#64748b', marginTop: '8px'}}>Total {existingImages.length + imageFiles.length} images selected.</p>
                )}
              </div>
            </div>
            <div className="admin-form-group" style={{ marginTop: '24px' }}>
              <label>Description</label>
              <textarea className="admin-input" value={description} onChange={e => setDescription(e.target.value)} rows={3}></textarea>
            </div>

          </div>

          {/* RICH DETAILS */}
          <div style={{ padding: '24px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#0f172a' }}>Rich Details</h5>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              <div className="admin-form-group">
                <label>Product Details (comma separated)</label>
                <textarea className="admin-input" placeholder="Colour: lime green, Round neck, Straight shape..." value={productDetails} onChange={e => setProductDetails(e.target.value)} rows={3}></textarea>
              </div>
              <div className="admin-form-group">
                <label>Material & Care (comma separated)</label>
                <textarea className="admin-input" placeholder="Cotton, Hand Wash" value={materialAndCare} onChange={e => setMaterialAndCare(e.target.value)} rows={3}></textarea>
              </div>
              <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Size & Fit</label>
                <input type="text" className="admin-input" placeholder="The model (height 5'8) is wearing a size S" value={sizeAndFit} onChange={e => setSizeAndFit(e.target.value)} />
              </div>
            </div>

            {/* Specifications Builder */}
            <div style={{ marginTop: '32px' }}>
              <label style={{ display: 'block', marginBottom: '12px', fontWeight: 600, color: '#334155' }}>Specifications</label>
              {specs.map((spec, index) => (
                <div key={index} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <input type="text" className="admin-input" placeholder="Key (e.g. Sleeve Length)" value={spec.key} onChange={e => handleSpecChange(index, 'key', e.target.value)} />
                  <input type="text" className="admin-input" placeholder="Value (e.g. Three-Quarter)" value={spec.value} onChange={e => handleSpecChange(index, 'value', e.target.value)} />
                  <button type="button" onClick={() => removeSpec(index)} style={{ padding: '0 16px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>X</button>
                </div>
              ))}
              <button type="button" onClick={addSpec} style={{ padding: '8px 16px', fontSize: '14px', background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: 500, marginTop: '8px' }}>+ Add Specification</button>
            </div>
          </div>

          {/* VARIANTS BUILDER */}
          <div style={{ padding: '24px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h5 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>Product Variants (SKUs)</h5>
              <button
                type="button"
                onClick={() => setShowBulkGen(!showBulkGen)}
                style={{ padding: '8px 16px', fontSize: '13px', background: showBulkGen ? '#f1f5f9' : '#80011F', color: showBulkGen ? '#334155' : '#fff', border: showBulkGen ? '1px solid #cbd5e1' : 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
              >
                {showBulkGen ? '✕ Close Generator' : 'Bulk Generate'}
              </button>
            </div>

            {/* Bulk Variant Generator Panel */}
            {showBulkGen && (
              <div style={{ background: '#fdf2f4', border: '1px solid #e2c4ca', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
                <h6 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#0f172a' }}>Bulk Variant Generator</h6>
                <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b' }}>Add sizes below, then generate all variants at once.</p>

                {/* Sizes */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px', color: '#334155' }}>Sizes</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="e.g. S, M, L, XL"
                      value={bulkSizeInput}
                      onChange={e => setBulkSizeInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addBulkSize(); } }}
                      style={{ maxWidth: '200px' }}
                    />
                    <button type="button" onClick={addBulkSize} style={{ padding: '8px 14px', background: '#80011F', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap' }}>+ Add</button>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {bulkSizes.map(s => (
                      <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: '#fff', border: '1px solid #e2c4ca', borderRadius: '20px', fontSize: '13px', fontWeight: 500, color: '#0f172a' }}>
                        {s}
                        <button type="button" onClick={() => removeBulkSize(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#94a3b8', padding: 0, lineHeight: 1 }}>✕</button>
                      </span>
                    ))}
                    {bulkSizes.length === 0 && <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>No sizes added (variants will have no size)</span>}
                  </div>
                </div>

                {/* Common Price & Stock */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '12px', color: '#334155' }}>Price *</label>
                    <input type="number" className="admin-input" placeholder="₹" min="0" value={bulkPrice} onChange={e => setBulkPrice(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '12px', color: '#334155' }}>Original Price</label>
                    <input type="number" className="admin-input" placeholder="₹ (MRP)" min="0" value={bulkOriginalPrice} onChange={e => setBulkOriginalPrice(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '12px', color: '#334155' }}>Stock *</label>
                    <input type="number" className="admin-input" placeholder="Qty per variant" min="0" value={bulkStock} onChange={e => setBulkStock(e.target.value)} />
                  </div>
                </div>

                {/* Preview & Generate */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                    Will generate: <strong style={{ color: '#0f172a' }}>{Math.max(1, bulkSizes.length)}</strong> variants
                  </span>
                  <div style={{ flex: 1 }} />
                  <button type="button" onClick={applyPriceToAll} style={{ padding: '8px 14px', background: '#fff', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, fontSize: '12px' }} title="Apply the price/original price above to all existing variants">Apply Price to All</button>
                  <button type="button" onClick={applyStockToAll} style={{ padding: '8px 14px', background: '#fff', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, fontSize: '12px' }} title="Apply the stock above to all existing variants">Apply Stock to All</button>
                  <button
                    type="button"
                    onClick={generateBulkVariants}
                    style={{ padding: '10px 24px', background: '#80011F', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '14px', boxShadow: '0 2px 4px rgba(128,1,31,0.2)' }}
                  >
                    Generate All Combinations
                  </button>
                </div>
              </div>
            )}

            {variants.map((variant, index) => (
              <div key={index} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginBottom: '16px', alignItems: 'center', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div>
                  <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px', color: '#64748b' }}>Size (Optional)</label>
                  <input type="text" className="admin-input" placeholder="e.g. M" value={variant.size} onChange={e => handleVariantChange(index, 'size', e.target.value)} />
                </div>

                <div>
                  <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px', color: '#64748b' }}>Price *</label>
                  <input type="number" className="admin-input" placeholder="₹" min="0" value={variant.price} onChange={e => handleVariantChange(index, 'price', e.target.value)} required />
                </div>
                <div>
                  <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px', color: '#64748b' }}>Orig. Price</label>
                  <input type="number" className="admin-input" placeholder="₹" min="0" value={variant.originalPrice} onChange={e => handleVariantChange(index, 'originalPrice', e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px', color: '#64748b' }}>Stock *</label>
                  <input type="number" className="admin-input" placeholder="Qty" min="0" value={variant.stock} onChange={e => handleVariantChange(index, 'stock', e.target.value)} required />
                </div>
                <div>
                  <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px', color: '#64748b' }}>SKU</label>
                  <input type="text" className="admin-input" placeholder="Optional" value={variant.sku} onChange={e => handleVariantChange(index, 'sku', e.target.value)} />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%' }}>
                  <button type="button" onClick={() => removeVariant(index)} style={{ padding: '10px 16px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, width: '100%' }}>Remove</button>
                </div>
                <div style={{ gridColumn: '1 / -1', marginTop: '4px' }}>
                  <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px', color: '#64748b' }}>Variant Images (Optional)</label>
                  <input 
                    type="file" 
                    className="admin-input" 
                    accept="image/*" 
                    multiple 
                    onChange={e => {
                      if (e.target.files && e.target.files.length > 0) {
                        const newFiles = Array.from(e.target.files);
                        handleVariantChange(index, 'imageFiles', [...(variant.imageFiles || []), ...newFiles]);
                      }
                    }} 
                  />
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {(variant.existingImages || []).map((img: string, idx: number) => (
                      <div key={`vexisting-${idx}`} style={{ position: 'relative' }}>
                        <img src={getImageUrl(img)} alt="Current" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }} />
                        <button 
                          type="button" 
                          onClick={() => {
                            const newExisting = [...variant.existingImages];
                            newExisting.splice(idx, 1);
                            handleVariantChange(index, 'existingImages', newExisting);
                          }}
                          style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >✕</button>
                      </div>
                    ))}
                    {(variant.imageFiles || []).map((file: File, idx: number) => (
                      <div key={`vnew-${idx}`} style={{ position: 'relative' }}>
                        <img src={URL.createObjectURL(file)} alt="New" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px dashed #3b82f6' }} />
                        <button 
                          type="button" 
                          onClick={() => {
                            const newFiles = [...variant.imageFiles];
                            newFiles.splice(idx, 1);
                            handleVariantChange(index, 'imageFiles', newFiles);
                          }}
                          style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <button type="button" onClick={addVariant} style={{ padding: '8px 16px', fontSize: '14px', background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}>+ Add Variant</button>
          </div>

          {/* ADVANCED SEO */}
          <div style={{ padding: '24px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#0f172a' }}>Advanced SEO</h5>
            <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#64748b' }}>Override the default product title and description for search engines.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="admin-form-group">
                <label>Meta Title</label>
                <input 
                  type="text" 
                  className="admin-input" 
                  placeholder="Leave blank to use the product name" 
                  value={metaTitle} 
                  onChange={e => setMetaTitle(e.target.value)} 
                />
              </div>
              <div className="admin-form-group">
                <label>Meta Description</label>
                <textarea 
                  className="admin-input" 
                  placeholder="Leave blank to use the product description" 
                  value={metaDescription} 
                  onChange={e => setMetaDescription(e.target.value)} 
                  rows={3}
                ></textarea>
              </div>
              <div className="admin-form-group">
                <label>Meta Keywords / Tags</label>
                <input 
                  type="text" 
                  className="admin-input" 
                  placeholder="e.g. ethnic wear, silk kurti, designer dress (comma separated)" 
                  value={metaKeywords} 
                  onChange={e => setMetaKeywords(e.target.value)} 
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px' }}>
            <button type="button" className="admin-btn-secondary" onClick={() => navigate('/admin/products')}>Cancel</button>
            <button type="submit" className="admin-btn" disabled={uploading} style={{ padding: '12px 32px', fontSize: '16px' }}>
              {uploading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Complete Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProductForm;

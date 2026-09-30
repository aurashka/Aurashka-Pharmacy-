import React, { useState, useEffect } from 'react';
import { 
  HerbalProduct, 
  ProductCategory, 
  ProductForm, 
  IngredientItem, 
  SiteSettings, 
  ContactNumberItem, 
  ContactWhatsAppItem, 
  ContactEmailItem 
} from '../types/pharmacy';
import { 
  X, 
  Plus, 
  Edit3, 
  Trash2, 
  Image as ImageIcon, 
  Save, 
  ShieldAlert, 
  Check, 
  Search, 
  Eye, 
  CloudUpload, 
  Link as LinkIcon, 
  Phone, 
  MessageSquare, 
  Mail, 
  Building2, 
  FileText,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { backupAllCatalogToFirebase, backupSiteSettingsToFirebase } from '../utils/firebaseSync';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: HerbalProduct[];
  onAddProduct: (product: HerbalProduct) => void;
  onUpdateProduct: (product: HerbalProduct) => void;
  onDeleteProduct: (productId: string) => void;
  onResetProductsToDefault: () => void;
  onPreviewProduct: (product: HerbalProduct) => void;
  initialProductToEdit?: HerbalProduct | null;
  siteSettings: SiteSettings;
  onUpdateSiteSettings: (settings: SiteSettings) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onResetProductsToDefault,
  onPreviewProduct,
  initialProductToEdit,
  siteSettings,
  onUpdateSiteSettings,
}) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'products' | 'contacts' | 'site_titles'>('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<HerbalProduct | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);

  // Multiple Product Images state
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Structured Ingredients state (Add / Edit / Delete items)
  const [ingredientsList, setIngredientsList] = useState<IngredientItem[]>([
    { herb: 'Amalaki', botanicalName: 'Emblica officinalis', potencyOrMg: '300mg', role: 'Antioxidant Rasayana' },
    { herb: 'Giloy', botanicalName: 'Tinospora cordifolia', potencyOrMg: '200mg', role: 'Immunity Modulator' },
  ]);

  // Product Form state
  const [productForm, setProductForm] = useState({
    name: '',
    sanskritName: '',
    category: 'immunity' as ProductCategory,
    categoryLabel: 'Immunity & Respiratory',
    form: 'Churna (Powder)' as ProductForm,
    tagline: '',
    description: '',
    price: 399,
    mrp: 499,
    volumeOrWeight: '100g Pure Powder',
    rating: 4.9,
    reviewsCount: 120,
    inStock: true,
    customLink: '',
    keyIndications: '',
    primaryBenefits: '',
    ailmentsTreated: '',
    actionMechanism: '',
    doshaEffect: 'Pacifies Vata and Kapha',
    standardDosage: '1 teaspoon twice daily',
    bestTiming: 'After meals with warm water',
    anupanaCarrier: 'Warm water or pure honey',
    duration: '4 to 8 weeks',
    precautions: 'Do not use during pregnancy without Vaidya consultation.\nKeep out of reach of children.',
    storageGuideline: 'Store in an airtight container below 25°C away from humidity.',
    ayushLicenseNo: 'AYUSH-DL-2026-HERB-9901',
    batchInfo: 'Batch #VK-2026-01 | Exp: 2028',
  });

  // Site Settings & Multiple Contacts Local Form State
  const [siteForm, setSiteForm] = useState<SiteSettings>(siteSettings);

  useEffect(() => {
    setSiteForm(siteSettings);
  }, [siteSettings]);

  useEffect(() => {
    if (initialProductToEdit) {
      setActiveTab('products');
      startEdit(initialProductToEdit);
    }
  }, [initialProductToEdit]);

  if (!isOpen) return null;

  const categoryOptions: { value: ProductCategory; label: string }[] = [
    { value: 'immunity', label: 'Immunity & Respiratory' },
    { value: 'digestion', label: 'Digestive & Gut Health' },
    { value: 'joint_pain', label: 'Joint & Pain Relief' },
    { value: 'mind_sleep', label: 'Mind, Stress & Sleep' },
    { value: 'skin_hair', label: 'Skin & Hair Wellness' },
    { value: 'vitality', label: 'Vitality & Stamina' },
  ];

  const formOptions: ProductForm[] = [
    'Churna (Powder)',
    'Vati / Tablet',
    'Taila (Oil)',
    'Swaras & Asava (Liquid)',
    'Resin & Lehyam',
    'Veg Capsule',
  ];

  const startCreate = () => {
    setIsCreatingNew(true);
    setEditingProduct(null);
    setImageUrls(['https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80']);
    setIngredientsList([
      { herb: 'Shuddha Herb', botanicalName: 'Botanical species', potencyOrMg: '500mg', role: 'Active Herbal Principle' },
    ]);
    setProductForm({
      name: '',
      sanskritName: '',
      category: 'immunity',
      categoryLabel: 'Immunity & Respiratory',
      form: 'Churna (Powder)',
      tagline: '',
      description: '',
      price: 399,
      mrp: 499,
      volumeOrWeight: '100g Pure Powder',
      rating: 4.9,
      reviewsCount: 15,
      inStock: true,
      customLink: '',
      keyIndications: 'Immunity, Vital Energy, Respiratory Tone',
      primaryBenefits: 'Strengthens innate biological vitality\nCleanses cellular ama toxins\nRestores healthy tissue tone',
      ailmentsTreated: 'Kasa (Cough)\nShwasa (Dyspnea)\nDaurbalya (Debility)',
      actionMechanism: 'Deeply bio-available phytocompounds nourish Rasa and Rakta dhatus.',
      doshaEffect: 'Tridosha balancing (Vata-Pitta-Kapha)',
      standardDosage: '1 teaspoon (3g to 5g) twice daily',
      bestTiming: 'Post-meals with lukewarm water or warm milk',
      anupanaCarrier: 'Warm water or raw organic honey',
      duration: '6 to 12 weeks',
      precautions: 'Use under medical supervision if pregnant.',
      storageGuideline: 'Reseal airtight after opening. Store away from moisture.',
      ayushLicenseNo: `AYUSH-NEW-${Math.floor(1000 + Math.random() * 9000)}`,
      batchInfo: `Batch #AUR-2026-${Math.floor(10 + Math.random() * 90)} | Exp: 2028`,
    });
  };

  const startEdit = (p: HerbalProduct) => {
    setIsCreatingNew(false);
    setEditingProduct(p);
    
    // Setup multiple images
    const allImgs = p.images && p.images.length > 0 ? [...p.images] : [p.image];
    setImageUrls(allImgs);

    // Setup structured ingredients
    setIngredientsList(
      p.keyIngredients && p.keyIngredients.length > 0
        ? [...p.keyIngredients]
        : [{ herb: 'Herb Extract', botanicalName: 'Herbal species', potencyOrMg: '500mg', role: 'Active' }]
    );

    setProductForm({
      name: p.name,
      sanskritName: p.sanskritName,
      category: p.category,
      categoryLabel: p.categoryLabel,
      form: p.form,
      tagline: p.tagline,
      description: p.description,
      price: p.price,
      mrp: p.mrp,
      volumeOrWeight: p.volumeOrWeight,
      rating: p.rating,
      reviewsCount: p.reviewsCount,
      inStock: p.inStock,
      customLink: p.customLink || '',
      keyIndications: p.keyIndications.join(', '),
      primaryBenefits: p.detailedUses.primaryBenefits.join('\n'),
      ailmentsTreated: p.detailedUses.ailmentsTreated.join('\n'),
      actionMechanism: p.detailedUses.actionMechanism,
      doshaEffect: p.detailedUses.doshaEffect,
      standardDosage: p.dosageAndAnupana.standardDosage,
      bestTiming: p.dosageAndAnupana.bestTiming,
      anupanaCarrier: p.dosageAndAnupana.anupanaCarrier,
      duration: p.dosageAndAnupana.duration,
      precautions: p.precautionsAndContraindications.join('\n'),
      storageGuideline: p.storageGuideline,
      ayushLicenseNo: p.ayushLicenseNo,
      batchInfo: p.batchInfo,
    });
  };

  // Image Array helpers
  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setImageUrls([...imageUrls, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  const handleSetPrimaryImage = (index: number) => {
    if (index <= 0 || index >= imageUrls.length) return;
    const copy = [...imageUrls];
    const [selected] = copy.splice(index, 1);
    copy.unshift(selected);
    setImageUrls(copy);
  };

  const handleRemoveImageUrl = (index: number) => {
    if (imageUrls.length <= 1) return;
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  // Ingredient Helpers
  const handleAddIngredient = () => {
    setIngredientsList([
      ...ingredientsList,
      { herb: '', botanicalName: '', potencyOrMg: '100mg', role: 'Active' },
    ]);
  };

  const handleUpdateIngredient = (index: number, field: keyof IngredientItem, value: string) => {
    const updated = [...ingredientsList];
    updated[index] = { ...updated[index], [field]: value };
    setIngredientsList(updated);
  };

  const handleRemoveIngredient = (index: number) => {
    if (ingredientsList.length <= 1) return;
    setIngredientsList(ingredientsList.filter((_, i) => i !== index));
  };

  // Contact Multiple Items Helpers
  const handleAddPhone = () => {
    setSiteForm({
      ...siteForm,
      contacts: {
        ...siteForm.contacts,
        phones: [
          ...siteForm.contacts.phones,
          { id: `p_${Date.now()}`, label: 'Helpline Desk', number: '+91 98765 43210' },
        ],
      },
    });
  };

  const handleUpdatePhone = (index: number, field: 'label' | 'number', val: string) => {
    const updated = [...siteForm.contacts.phones];
    updated[index] = { ...updated[index], [field]: val };
    setSiteForm({
      ...siteForm,
      contacts: { ...siteForm.contacts, phones: updated },
    });
  };

  const handleRemovePhone = (index: number) => {
    if (siteForm.contacts.phones.length <= 1) return;
    setSiteForm({
      ...siteForm,
      contacts: {
        ...siteForm.contacts,
        phones: siteForm.contacts.phones.filter((_, i) => i !== index),
      },
    });
  };

  const handleAddWhatsApp = () => {
    setSiteForm({
      ...siteForm,
      contacts: {
        ...siteForm.contacts,
        whatsapps: [
          ...siteForm.contacts.whatsapps,
          { id: `w_${Date.now()}`, label: 'WhatsApp Order', number: '919876543210', displayNumber: '+91 98765 43210' },
        ],
      },
    });
  };

  const handleUpdateWhatsApp = (index: number, field: 'label' | 'number' | 'displayNumber', val: string) => {
    const updated = [...siteForm.contacts.whatsapps];
    updated[index] = { ...updated[index], [field]: val };
    setSiteForm({
      ...siteForm,
      contacts: { ...siteForm.contacts, whatsapps: updated },
    });
  };

  const handleRemoveWhatsApp = (index: number) => {
    if (siteForm.contacts.whatsapps.length <= 1) return;
    setSiteForm({
      ...siteForm,
      contacts: {
        ...siteForm.contacts,
        whatsapps: siteForm.contacts.whatsapps.filter((_, i) => i !== index),
      },
    });
  };

  const handleAddEmail = () => {
    setSiteForm({
      ...siteForm,
      contacts: {
        ...siteForm.contacts,
        emails: [
          ...siteForm.contacts.emails,
          { id: `e_${Date.now()}`, label: 'Support Desk', email: 'care@aurashka.com' },
        ],
      },
    });
  };

  const handleUpdateEmail = (index: number, field: 'label' | 'email', val: string) => {
    const updated = [...siteForm.contacts.emails];
    updated[index] = { ...updated[index], [field]: val };
    setSiteForm({
      ...siteForm,
      contacts: { ...siteForm.contacts, emails: updated },
    });
  };

  const handleRemoveEmail = (index: number) => {
    if (siteForm.contacts.emails.length <= 1) return;
    setSiteForm({
      ...siteForm,
      contacts: {
        ...siteForm.contacts,
        emails: siteForm.contacts.emails.filter((_, i) => i !== index),
      },
    });
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanImgs = imageUrls.map((u) => u.trim()).filter(Boolean);
    const primaryImg = cleanImgs[0] || 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80';

    const parsedIndications = productForm.keyIndications
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const parsedBenefits = productForm.primaryBenefits
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const parsedAilments = productForm.ailmentsTreated
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const parsedPrecautions = productForm.precautions
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const selectedCatObj = categoryOptions.find((c) => c.value === productForm.category);
    const catLabel = selectedCatObj ? selectedCatObj.label : 'Herbal Formulation';

    if (isCreatingNew) {
      const newProd: HerbalProduct = {
        id: `prod_${Date.now()}`,
        name: productForm.name.trim() || 'New Herbal Medicine',
        sanskritName: productForm.sanskritName.trim() || 'दिव्य हर्बल रस',
        category: productForm.category,
        categoryLabel: catLabel,
        form: productForm.form,
        tagline: productForm.tagline.trim() || 'Standardized herbal preparation',
        description: productForm.description.trim() || 'Authentic herbal formulation.',
        price: Number(productForm.price) || 299,
        mrp: Number(productForm.mrp) || 399,
        volumeOrWeight: productForm.volumeOrWeight.trim() || '100g',
        rating: Number(productForm.rating) || 4.9,
        reviewsCount: Number(productForm.reviewsCount) || 1,
        inStock: productForm.inStock,
        image: primaryImg,
        images: cleanImgs,
        customLink: productForm.customLink.trim() || undefined,
        keyIndications: parsedIndications.length ? parsedIndications : ['General Wellness'],
        detailedUses: {
          primaryBenefits: parsedBenefits.length ? parsedBenefits : ['Nourishes vital biological tissues'],
          ailmentsTreated: parsedAilments.length ? parsedAilments : ['Daurbalya (Debility)'],
          actionMechanism: productForm.actionMechanism || 'Supports tissue homeostasis.',
          doshaEffect: productForm.doshaEffect || 'Tridosha balancing',
        },
        dosageAndAnupana: {
          standardDosage: productForm.standardDosage,
          bestTiming: productForm.bestTiming,
          anupanaCarrier: productForm.anupanaCarrier,
          duration: productForm.duration,
        },
        keyIngredients: ingredientsList.filter((i) => i.herb.trim()),
        precautionsAndContraindications: parsedPrecautions.length ? parsedPrecautions : ['Use under medical advice.'],
        storageGuideline: productForm.storageGuideline,
        ayushLicenseNo: productForm.ayushLicenseNo,
        batchInfo: productForm.batchInfo,
      };

      onAddProduct(newProd);
      setSaveSuccessMsg(`Product "${newProd.name}" added and synced to Firebase!`);
    } else if (editingProduct) {
      const updatedProd: HerbalProduct = {
        ...editingProduct,
        name: productForm.name.trim(),
        sanskritName: productForm.sanskritName.trim(),
        category: productForm.category,
        categoryLabel: catLabel,
        form: productForm.form,
        tagline: productForm.tagline.trim(),
        description: productForm.description.trim(),
        price: Number(productForm.price),
        mrp: Number(productForm.mrp),
        volumeOrWeight: productForm.volumeOrWeight.trim(),
        rating: Number(productForm.rating),
        reviewsCount: Number(productForm.reviewsCount),
        inStock: productForm.inStock,
        image: primaryImg,
        images: cleanImgs,
        customLink: productForm.customLink.trim() || undefined,
        keyIndications: parsedIndications,
        detailedUses: {
          primaryBenefits: parsedBenefits,
          ailmentsTreated: parsedAilments,
          actionMechanism: productForm.actionMechanism,
          doshaEffect: productForm.doshaEffect,
        },
        dosageAndAnupana: {
          standardDosage: productForm.standardDosage,
          bestTiming: productForm.bestTiming,
          anupanaCarrier: productForm.anupanaCarrier,
          duration: productForm.duration,
        },
        keyIngredients: ingredientsList.filter((i) => i.herb.trim()),
        precautionsAndContraindications: parsedPrecautions,
        storageGuideline: productForm.storageGuideline,
        ayushLicenseNo: productForm.ayushLicenseNo,
        batchInfo: productForm.batchInfo,
      };

      onUpdateProduct(updatedProd);
      setSaveSuccessMsg(`Product "${updatedProd.name}" updated & saved to Firebase!`);
    }

    setTimeout(() => setSaveSuccessMsg(null), 3000);
    setIsCreatingNew(false);
    setEditingProduct(null);
  };

  const handleSaveSiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSiteSettings(siteForm);
    await backupSiteSettingsToFirebase(siteForm);
    setSaveSuccessMsg('Website titles, multiple contacts & info updated and saved to Firebase!');
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  const handleBackupAll = async () => {
    setIsBackingUp(true);
    await backupAllCatalogToFirebase(products);
    await backupSiteSettingsToFirebase(siteForm);
    setIsBackingUp(false);
    setSaveSuccessMsg('Saved all products, multiple images, ingredients, contacts & titles to Firebase!');
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sanskritName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.categoryLabel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl max-h-[94vh] bg-[#FBF9F5] border border-[#DCD5C5] rounded-2xl shadow-2xl text-[#1E2922] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-[#14291D] text-white border-b border-[#21432E] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#B4741E] text-white flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-bold text-white">
                  Aurashka · Complete Admin App
                </h3>
                <span className="text-[11px] font-semibold bg-[#27533B] text-[#A5D6B6] px-2 py-0.5 rounded-full">
                  Admin: {currentUser?.email}
                </span>
              </div>
              <p className="text-xs text-[#BED4C7]">
                Edit titles, product images, ingredients, multiple contacts, numbers, emails, links & texts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBackupAll}
              disabled={isBackingUp}
              className="px-3 py-1.5 text-xs font-semibold text-[#183624] bg-[#E7EFEA] hover:bg-[#d8e8de] rounded-lg border border-[#A5D6B6] transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-60"
              title="Save all image links, texts & contacts to Firebase"
            >
              <CloudUpload className="w-4 h-4 text-[#2C5E43]" />
              <span>{isBackingUp ? 'Saving...' : 'Save All on Firebase'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              title="Close Admin Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#E7DFD1] bg-[#FAF8F5] px-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab('products');
              setIsCreatingNew(false);
              setEditingProduct(null);
            }}
            className={`py-2.5 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'products'
                ? 'border-[#14291D] text-[#14291D] bg-white'
                : 'border-transparent text-[#6D6353] hover:text-[#14291D]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#2C5E43]" />
            <span>Products, Multiple Images & Ingredients ({products.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('contacts');
              setIsCreatingNew(false);
              setEditingProduct(null);
            }}
            className={`py-2.5 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'contacts'
                ? 'border-[#14291D] text-[#14291D] bg-white'
                : 'border-transparent text-[#6D6353] hover:text-[#14291D]'
            }`}
          >
            <Phone className="w-4 h-4 text-[#2C5E43]" />
            <span>Multiple Contacts (Phones, WhatsApp, Emails)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('site_titles');
              setIsCreatingNew(false);
              setEditingProduct(null);
            }}
            className={`py-2.5 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'site_titles'
                ? 'border-[#14291D] text-[#14291D] bg-white'
                : 'border-transparent text-[#6D6353] hover:text-[#14291D]'
            }`}
          >
            <FileText className="w-4 h-4 text-[#2C5E43]" />
            <span>Website Titles, Headings & Banner Texts</span>
          </button>
        </div>

        {/* Success Banner */}
        {saveSuccessMsg && (
          <div className="bg-emerald-700 text-white text-xs px-6 py-2.5 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              {saveSuccessMsg}
            </span>
            <button onClick={() => setSaveSuccessMsg(null)} className="text-white/80 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab 1: Products */}
        {activeTab === 'products' && (
          <>
            {/* Products Sub-Bar */}
            {!isCreatingNew && !editingProduct && (
              <div className="p-4 sm:px-6 bg-[#FAF8F5] border-b border-[#E7DFD1] flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#887E6D]" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search formulation title, herb, or category..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#DDD5C5] rounded-lg focus:outline-hidden focus:border-[#2C5E43]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onResetProductsToDefault}
                    className="px-3 py-1.5 text-xs font-medium text-[#645A4B] hover:text-[#14291D] hover:bg-[#EFEAE0] rounded-lg border border-[#DDD5C5] transition-colors"
                  >
                    Reset Defaults
                  </button>
                  <button
                    onClick={startCreate}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-[#14291D] hover:bg-[#254F35] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Custom Product</span>
                  </button>
                </div>
              </div>
            )}

            {/* Products Content Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {(isCreatingNew || editingProduct) ? (
                /* Full Comprehensive Product Form */
                <div className="bg-white p-6 rounded-xl border border-[#D5CCBC] shadow-xs space-y-6">
                  <div className="flex items-center justify-between border-b border-[#EAE3D4] pb-4">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-[#2C5E43] font-semibold">
                        {isCreatingNew ? 'Create New Custom Formulation' : `Editing: ${editingProduct?.name}`}
                      </span>
                      <h4 className="font-serif text-xl font-bold text-[#14291D]">
                        Edit Product Titles, Multiple Images, Ingredients & Links
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingNew(false);
                        setEditingProduct(null);
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-[#645A4B] hover:bg-[#EFEAE0] rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleSaveProduct} className="space-y-6 text-xs">
                    {/* Titles & Custom Link */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-medium text-[#2B251D] mb-1">
                          Product Commercial Title <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={productForm.name}
                          onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg focus:outline-hidden focus:border-[#2C5E43]"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-[#2B251D] mb-1">
                          Sanskrit Name / Botanical Title <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={productForm.sanskritName}
                          onChange={(e) => setProductForm({ ...productForm, sanskritName: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg focus:outline-hidden focus:border-[#2C5E43]"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-[#2B251D] mb-1 flex items-center gap-1">
                          <LinkIcon className="w-3.5 h-3.5 text-[#2C5E43]" />
                          <span>Custom Direct Buy / Order Link</span>
                        </label>
                        <input
                          type="url"
                          placeholder="https://wa.me/919876543210 or custom link"
                          value={productForm.customLink}
                          onChange={(e) => setProductForm({ ...productForm, customLink: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg focus:outline-hidden focus:border-[#2C5E43] font-mono text-[11px]"
                        />
                      </div>
                    </div>

                    {/* MULTIPLE PRODUCT IMAGES SECTION */}
                    <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E0D7C6] space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-[#2C5E43]" />
                          <h5 className="font-serif text-sm font-bold text-[#14291D]">
                            Multiple Product Images (Direct Links)
                          </h5>
                        </div>
                        <span className="text-[11px] text-[#716858]">
                          {imageUrls.length} image(s) configured
                        </span>
                      </div>

                      <p className="text-[11px] text-[#695E4F] bg-white p-2.5 rounded-lg border border-[#E2D8C7] leading-relaxed">
                        <strong className="text-[#14291D]">Primary Rule:</strong> Only the <span className="font-semibold text-[#183624]">Primary Image (#1)</span> displays on the product list / catalog cards. All added images (#1, #2, etc.) appear inside the multi-angle gallery when a customer opens the product view.
                      </p>

                      <div className="space-y-2">
                        {imageUrls.map((url, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-[#E7E0D2]">
                            <span className="w-6 text-center font-mono text-[11px] text-[#807666]">
                              #{idx + 1}
                            </span>
                            <div className="w-10 h-10 rounded bg-[#EFEAE0] overflow-hidden border border-[#D5CCBC] shrink-0">
                              <img
                                src={url}
                                alt={`Thumb ${idx}`}
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                              />
                            </div>
                            <input
                              type="text"
                              value={url}
                              onChange={(e) => {
                                const copy = [...imageUrls];
                                copy[idx] = e.target.value;
                                setImageUrls(copy);
                              }}
                              placeholder="Direct image link (https://...)"
                              className="flex-1 px-3 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs font-mono"
                            />
                            {idx === 0 ? (
                              <span className="px-2.5 py-1 rounded bg-[#E7EFEA] text-[#183624] text-[10px] font-bold border border-[#A5D6B6] shrink-0">
                                ★ Primary (List View)
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(idx)}
                                className="px-2.5 py-1 rounded bg-white text-[#2C5E43] hover:bg-[#E7EFEA] border border-[#B5D6C4] text-[10px] font-semibold shrink-0 cursor-pointer transition-colors"
                                title="Set as primary thumbnail for product list view"
                              >
                                Set as Primary
                              </button>
                            )}
                            {imageUrls.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveImageUrl(idx)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded shrink-0 cursor-pointer"
                                title="Delete image"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}

                        <div className="flex gap-2 pt-1">
                          <input
                            type="text"
                            value={newImageUrl}
                            onChange={(e) => setNewImageUrl(e.target.value)}
                            placeholder="Add another image direct URL (https://...)"
                            className="flex-1 px-3 py-1.5 bg-white border border-[#DDD5C5] rounded-lg text-xs font-mono"
                          />
                          <button
                            type="button"
                            onClick={handleAddImageUrl}
                            className="px-3 py-1.5 bg-[#14291D] hover:bg-[#203E2D] text-white rounded-lg text-xs font-medium flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Image</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* STRUCTURED INGREDIENTS SECTION (ADD / EDIT / DELETE) */}
                    <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E0D7C6] space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="font-serif text-sm font-bold text-[#14291D] flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-[#2C5E43]" />
                          Active Herbal Ingredients (Add, Edit & Delete)
                        </h5>
                        <button
                          type="button"
                          onClick={handleAddIngredient}
                          className="px-3 py-1 bg-[#14291D] hover:bg-[#203E2D] text-white rounded-lg text-xs font-medium flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Ingredient</span>
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-[#DDD5C5] text-[#695F4F]">
                              <th className="py-1.5 px-2">Herb Name</th>
                              <th className="py-1.5 px-2">Botanical Species</th>
                              <th className="py-1.5 px-2">Potency / mg</th>
                              <th className="py-1.5 px-2">Therapeutic Role</th>
                              <th className="py-1.5 px-2 text-right">Delete</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#EAE3D4]">
                            {ingredientsList.map((ing, idx) => (
                              <tr key={idx}>
                                <td className="py-1.5 px-2">
                                  <input
                                    type="text"
                                    required
                                    value={ing.herb}
                                    placeholder="Herb (e.g. Ashwagandha)"
                                    onChange={(e) => handleUpdateIngredient(idx, 'herb', e.target.value)}
                                    className="w-full px-2 py-1 bg-white border border-[#DDD5C5] rounded text-xs"
                                  />
                                </td>
                                <td className="py-1.5 px-2">
                                  <input
                                    type="text"
                                    value={ing.botanicalName}
                                    placeholder="Botanical Name"
                                    onChange={(e) => handleUpdateIngredient(idx, 'botanicalName', e.target.value)}
                                    className="w-full px-2 py-1 bg-white border border-[#DDD5C5] rounded text-xs italic"
                                  />
                                </td>
                                <td className="py-1.5 px-2">
                                  <input
                                    type="text"
                                    value={ing.potencyOrMg}
                                    placeholder="500mg or 20%"
                                    onChange={(e) => handleUpdateIngredient(idx, 'potencyOrMg', e.target.value)}
                                    className="w-24 px-2 py-1 bg-white border border-[#DDD5C5] rounded text-xs font-mono"
                                  />
                                </td>
                                <td className="py-1.5 px-2">
                                  <input
                                    type="text"
                                    value={ing.role}
                                    placeholder="Adaptogen / Active"
                                    onChange={(e) => handleUpdateIngredient(idx, 'role', e.target.value)}
                                    className="w-full px-2 py-1 bg-white border border-[#DDD5C5] rounded text-xs"
                                  />
                                </td>
                                <td className="py-1.5 px-2 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveIngredient(idx)}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                    title="Delete Ingredient"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Category, Form & Pricing */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block font-medium text-[#2B251D] mb-1">Category</label>
                        <select
                          value={productForm.category}
                          onChange={(e) => {
                            const val = e.target.value as ProductCategory;
                            const obj = categoryOptions.find((c) => c.value === val);
                            setProductForm({
                              ...productForm,
                              category: val,
                              categoryLabel: obj ? obj.label : 'Herbal Medicine',
                            });
                          }}
                          className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                        >
                          {categoryOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-medium text-[#2B251D] mb-1">Form</label>
                        <select
                          value={productForm.form}
                          onChange={(e) => setProductForm({ ...productForm, form: e.target.value as ProductForm })}
                          className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                        >
                          {formOptions.map((f) => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-medium text-[#2B251D] mb-1">Selling Price (₹)</label>
                        <input
                          type="number"
                          required
                          value={productForm.price}
                          onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-[#2B251D] mb-1">MRP (₹)</label>
                        <input
                          type="number"
                          required
                          value={productForm.mrp}
                          onChange={(e) => setProductForm({ ...productForm, mrp: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-mono"
                        />
                      </div>
                    </div>

                    {/* Tagline, Description & Dosage */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-medium text-[#2B251D] mb-1">Tagline</label>
                        <input
                          type="text"
                          value={productForm.tagline}
                          onChange={(e) => setProductForm({ ...productForm, tagline: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-[#2B251D] mb-1">Net Volume/Weight</label>
                        <input
                          type="text"
                          value={productForm.volumeOrWeight}
                          onChange={(e) => setProductForm({ ...productForm, volumeOrWeight: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-medium text-[#2B251D] mb-1">Full Description Text</label>
                      <textarea
                        rows={2}
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-medium text-[#2B251D] mb-1">Standard Dosage</label>
                        <input
                          type="text"
                          value={productForm.standardDosage}
                          onChange={(e) => setProductForm({ ...productForm, standardDosage: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-[#2B251D] mb-1">Best Timing</label>
                        <input
                          type="text"
                          value={productForm.bestTiming}
                          onChange={(e) => setProductForm({ ...productForm, bestTiming: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-[#2B251D] mb-1">Anupana (Carrier)</label>
                        <input
                          type="text"
                          value={productForm.anupanaCarrier}
                          onChange={(e) => setProductForm({ ...productForm, anupanaCarrier: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs text-[#2C5E43] font-semibold"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EAE3D4]">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreatingNew(false);
                          setEditingProduct(null);
                        }}
                        className="px-4 py-2 text-xs font-medium text-[#645A4B]"
                      >
                        Discard
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 text-xs font-semibold text-white bg-[#14291D] hover:bg-[#254F35] rounded-lg flex items-center gap-1.5 shadow-sm"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Product to Firebase</span>
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* Products Table */
                <div className="bg-white rounded-xl border border-[#D5CCBC] overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-[#FAF8F5] border-b border-[#E3DBD0] text-[#554D3F]">
                          <th className="py-3 px-4 font-semibold">Image</th>
                          <th className="py-3 px-4 font-semibold">Product Title & Sanskrit</th>
                          <th className="py-3 px-4 font-semibold">Category</th>
                          <th className="py-3 px-4 font-semibold">Price</th>
                          <th className="py-3 px-4 font-semibold">Ingredients</th>
                          <th className="py-3 px-4 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EFEAE0]">
                        {filteredProducts.map((prod) => (
                          <tr key={prod.id} className="hover:bg-[#FAF8F5]/80">
                            <td className="py-3 px-4">
                              <div className="relative w-12 h-12 rounded-lg bg-[#EFEAE0] overflow-hidden border border-[#DDD5C5]">
                                <img
                                  src={prod.image}
                                  alt={prod.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                                />
                                {prod.images && prod.images.length > 1 && (
                                  <span 
                                    className="absolute bottom-0 right-0 bg-[#14291D]/80 text-[#A5D6B6] text-[8px] font-bold px-1 py-0.5 rounded-tl"
                                    title={`${prod.images.length} images configured`}
                                  >
                                    +{prod.images.length - 1}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-serif font-bold text-sm text-[#14291D]">{prod.name}</div>
                              <div className="text-[11px] italic text-[#6E6454]">{prod.sanskritName}</div>
                              <div className="text-[10px] text-[#7A705E]">{prod.volumeOrWeight}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-medium text-[#183624]">{prod.categoryLabel}</div>
                              <div className="text-[11px] text-[#766C5A]">{prod.form}</div>
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-[#14291D]">
                              ₹{prod.price} <span className="text-[11px] font-normal text-[#8A8070] line-through">₹{prod.mrp}</span>
                            </td>
                            <td className="py-3 px-4 text-[#554C3E]">
                              {prod.keyIngredients?.length || 0} herbs
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => onPreviewProduct(prod)}
                                  className="p-1.5 text-[#5C5242] hover:bg-[#F2ECE1] rounded"
                                  title="Preview"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => startEdit(prod)}
                                  className="p-1.5 text-[#183624] hover:bg-[#E7EFEA] rounded"
                                  title="Edit Every Single Detail"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                {deleteConfirmId === prod.id ? (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => {
                                        onDeleteProduct(prod.id);
                                        setDeleteConfirmId(null);
                                      }}
                                      className="px-2 py-0.5 bg-red-600 text-white rounded text-[10px] font-bold"
                                    >
                                      Confirm
                                    </button>
                                    <button
                                      onClick={() => setDeleteConfirmId(null)}
                                      className="px-1 py-0.5 text-[10px]"
                                    >
                                      X
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setDeleteConfirmId(prod.id)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Tab 2: Multiple Contacts (Add, Edit, Delete Phones, WhatsApp, Emails) */}
        {activeTab === 'contacts' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            <form onSubmit={handleSaveSiteSettings} className="space-y-6 text-xs">
              {/* 1. Multiple Phone Numbers */}
              <div className="bg-white p-5 rounded-xl border border-[#D5CCBC] shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#EAE3D4] pb-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#2C5E43]" />
                    <h4 className="font-serif text-base font-bold text-[#14291D]">
                      Multiple Phone & Helpline Numbers (Add, Edit, Delete)
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddPhone}
                    className="px-3 py-1 bg-[#14291D] hover:bg-[#203E2D] text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Phone Number</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {siteForm.contacts.phones.map((phone, idx) => (
                    <div key={phone.id || idx} className="flex items-center gap-3">
                      <input
                        type="text"
                        required
                        value={phone.label}
                        placeholder="Label (e.g. Primary Helpline, Emergency Dispatch)"
                        onChange={(e) => handleUpdatePhone(idx, 'label', e.target.value)}
                        className="w-1/3 px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-medium"
                      />
                      <input
                        type="tel"
                        required
                        value={phone.number}
                        placeholder="+91 98765 43210"
                        onChange={(e) => handleUpdatePhone(idx, 'number', e.target.value)}
                        className="flex-1 px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-mono"
                      />
                      {siteForm.contacts.phones.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePhone(idx)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete contact number"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Multiple WhatsApp Numbers */}
              <div className="bg-white p-5 rounded-xl border border-[#D5CCBC] shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#EAE3D4] pb-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#25D366]" />
                    <h4 className="font-serif text-base font-bold text-[#14291D]">
                      Multiple WhatsApp Numbers & Links (Add, Edit, Delete)
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddWhatsApp}
                    className="px-3 py-1 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add WhatsApp</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {siteForm.contacts.whatsapps.map((wa, idx) => (
                    <div key={wa.id || idx} className="flex items-center gap-3">
                      <input
                        type="text"
                        required
                        value={wa.label}
                        placeholder="Label (e.g. Order Desk, Vaidya Chat)"
                        onChange={(e) => handleUpdateWhatsApp(idx, 'label', e.target.value)}
                        className="w-1/3 px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-medium"
                      />
                      <input
                        type="text"
                        required
                        value={wa.number}
                        placeholder="919876543210 (Digits only for WhatsApp URL)"
                        onChange={(e) => handleUpdateWhatsApp(idx, 'number', e.target.value)}
                        className="w-1/3 px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-mono"
                      />
                      <input
                        type="text"
                        required
                        value={wa.displayNumber}
                        placeholder="+91 98765 43210 (Display text)"
                        onChange={(e) => handleUpdateWhatsApp(idx, 'displayNumber', e.target.value)}
                        className="flex-1 px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-mono"
                      />
                      {siteForm.contacts.whatsapps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveWhatsApp(idx)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete WhatsApp"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Multiple Support Email Addresses */}
              <div className="bg-white p-5 rounded-xl border border-[#D5CCBC] shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#EAE3D4] pb-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#2C5E43]" />
                    <h4 className="font-serif text-base font-bold text-[#14291D]">
                      Multiple Support & Doctor Emails (Add, Edit, Delete)
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddEmail}
                    className="px-3 py-1 bg-[#14291D] hover:bg-[#203E2D] text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Email</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {siteForm.contacts.emails.map((em, idx) => (
                    <div key={em.id || idx} className="flex items-center gap-3">
                      <input
                        type="text"
                        required
                        value={em.label}
                        placeholder="Label (e.g. Care Desk, Consultation Desk)"
                        onChange={(e) => handleUpdateEmail(idx, 'label', e.target.value)}
                        className="w-1/3 px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-medium"
                      />
                      <input
                        type="email"
                        required
                        value={em.email}
                        placeholder="care@aurashka.com"
                        onChange={(e) => handleUpdateEmail(idx, 'email', e.target.value)}
                        className="flex-1 px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-mono"
                      />
                      {siteForm.contacts.emails.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveEmail(idx)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete Email"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Physical Store Address & Timings */}
              <div className="bg-white p-5 rounded-xl border border-[#D5CCBC] shadow-xs space-y-3">
                <h4 className="font-serif text-base font-bold text-[#14291D] flex items-center gap-2 border-b border-[#EAE3D4] pb-2">
                  <Building2 className="w-4 h-4 text-[#2C5E43]" />
                  Dispensary Store Address & Timings
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-[#2B251D] mb-1">Dispensary Physical Address</label>
                    <textarea
                      rows={2}
                      value={siteForm.storeAddress}
                      onChange={(e) => setSiteForm({ ...siteForm, storeAddress: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-[#2B251D] mb-1">Store Timings & Working Hours</label>
                    <textarea
                      rows={2}
                      value={siteForm.storeTimings}
                      onChange={(e) => setSiteForm({ ...siteForm, storeTimings: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-semibold text-white bg-[#14291D] hover:bg-[#254F35] rounded-lg flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Save All Contacts to Firebase</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Website Titles & Headings */}
        {activeTab === 'site_titles' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            <form onSubmit={handleSaveSiteSettings} className="bg-white p-6 rounded-xl border border-[#D5CCBC] shadow-xs space-y-4 text-xs">
              <h4 className="font-serif text-base font-bold text-[#14291D] border-b border-[#EAE3D4] pb-2">
                Website Branding, Main Page Titles & Banners
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#2B251D] mb-1">Brand Name Title</label>
                  <input
                    type="text"
                    required
                    value={siteForm.brandName}
                    onChange={(e) => setSiteForm({ ...siteForm, brandName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-serif font-bold"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#2B251D] mb-1">Hindi Subtitle Brand Name</label>
                  <input
                    type="text"
                    value={siteForm.hindiName}
                    onChange={(e) => setSiteForm({ ...siteForm, hindiName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-serif"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#2B251D] mb-1">Hero Main Title (Front Page Headline)</label>
                <input
                  type="text"
                  required
                  value={siteForm.heroTitle}
                  onChange={(e) => setSiteForm({ ...siteForm, heroTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-serif text-sm font-bold"
                />
              </div>

              <div>
                <label className="block font-medium text-[#2B251D] mb-1">Hero Subtitle / Description Text</label>
                <textarea
                  rows={2}
                  value={siteForm.heroSubtitle}
                  onChange={(e) => setSiteForm({ ...siteForm, heroSubtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-[#2B251D] mb-1">Shipping & Announcement Notice Banner</label>
                <input
                  type="text"
                  value={siteForm.shippingNotice}
                  onChange={(e) => setSiteForm({ ...siteForm, shippingNotice: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#2B251D] mb-1">Head Pharmacist / Vaidya Name</label>
                  <input
                    type="text"
                    value={siteForm.headPharmacist}
                    onChange={(e) => setSiteForm({ ...siteForm, headPharmacist: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#2B251D] mb-1">AYUSH Registration Number</label>
                  <input
                    type="text"
                    value={siteForm.regNumber}
                    onChange={(e) => setSiteForm({ ...siteForm, regNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-[#EAE3D4]">
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-semibold text-white bg-[#14291D] hover:bg-[#254F35] rounded-lg flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Titles to Firebase</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 bg-[#FAF8F5] border-t border-[#E7DFD1] flex items-center justify-between text-xs text-[#635A4B] shrink-0">
          <span>All updates sync with Firebase Realtime Database.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#14291D] text-white hover:bg-[#254F35]"
          >
            Return to Store
          </button>
        </div>
      </div>
    </div>
  );
};

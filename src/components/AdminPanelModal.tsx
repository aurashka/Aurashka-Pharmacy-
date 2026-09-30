import React, { useState, useEffect } from 'react';
import { 
  HerbalProduct, 
  ProductCategory, 
  ProductForm, 
  IngredientItem, 
  SiteSettings, 
  CategoryItem,
  SortBadgeType,
  ProductCustomField
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
  Sparkles,
  Layers,
  Star,
  Flame,
  Trophy,
  Tag,
  DollarSign,
  RotateCcw,
  Rocket,
  Sliders,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { backupAllCatalogToFirebase, backupSiteSettingsToFirebase, backupCatalogMetaToFirebase } from '../utils/firebaseSync';
import { DEFAULT_CATEGORIES, DEFAULT_FORMS, SORT_BADGE_OPTIONS } from '../data/herbalProducts';

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
  categories: CategoryItem[];
  onUpdateCategories: (categories: CategoryItem[]) => void;
  forms: string[];
  onUpdateForms: (forms: string[]) => void;
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
  categories,
  onUpdateCategories,
  forms,
  onUpdateForms,
}) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'products' | 'categories_forms' | 'contacts' | 'site_titles'>('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<HerbalProduct | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);

  // Quick inline add custom category / form state inside product editor
  const [showInlineAddCat, setShowInlineAddCat] = useState(false);
  const [inlineCatLabel, setInlineCatLabel] = useState('');
  const [showInlineAddForm, setShowInlineAddForm] = useState(false);
  const [inlineFormName, setInlineFormName] = useState('');

  // Category & Forms Tab Management states
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatLabel, setEditingCatLabel] = useState('');
  const [newCatId, setNewCatId] = useState('');
  const [newCatLabel, setNewCatLabel] = useState('');

  const [editingFormIdx, setEditingFormIdx] = useState<number | null>(null);
  const [editingFormName, setEditingFormName] = useState('');
  const [newFormName, setNewFormName] = useState('');

  // Multiple Product Images state
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Structured Ingredients state (Add / Edit / Delete items)
  const [ingredientsList, setIngredientsList] = useState<IngredientItem[]>([
    { herb: 'Amalaki', botanicalName: 'Emblica officinalis', potencyOrMg: '300mg', role: 'Antioxidant Rasayana' },
    { herb: 'Giloy', botanicalName: 'Tinospora cordifolia', potencyOrMg: '200mg', role: 'Immunity Modulator' },
  ]);

  // Product Custom Fields state (Name, Value & Position)
  const [customFieldsList, setCustomFieldsList] = useState<ProductCustomField[]>([]);

  // Product Form state including Reseller Price, Rating Star, Sort Badge
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
    resellerPrice: 280,
    rating: 4.9,
    reviewsCount: 120,
    sortBadge: 'none' as SortBadgeType,
    volumeOrWeight: '100g Pure Powder',
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

  const startCreate = () => {
    setIsCreatingNew(true);
    setEditingProduct(null);
    setImageUrls(['https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80']);
    setIngredientsList([
      { herb: 'Shuddha Herb', botanicalName: 'Botanical species', potencyOrMg: '500mg', role: 'Active Herbal Principle' },
    ]);
    // Default initial custom fields
    setCustomFieldsList([
      { id: `cf_${Date.now()}_1`, name: 'Shelf Life', value: '24 Months from Mfd', position: 1 },
      { id: `cf_${Date.now()}_2`, name: 'Extraction Ratio', value: '10:1 Full-Spectrum Decoction', position: 2 },
    ]);
    const firstCat = categories.find((c) => c.id !== 'all') || { id: 'immunity', label: 'Immunity & Respiratory' };
    const firstForm = forms[0] || 'Churna (Powder)';

    setProductForm({
      name: '',
      sanskritName: '',
      category: firstCat.id,
      categoryLabel: firstCat.label,
      form: firstForm,
      tagline: '',
      description: '',
      price: 399,
      mrp: 499,
      resellerPrice: 280,
      rating: 4.9,
      reviewsCount: 15,
      sortBadge: 'none',
      volumeOrWeight: '100g Pure Powder',
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

    // Setup custom fields
    setCustomFieldsList(
      p.customFields && p.customFields.length > 0
        ? [...p.customFields].sort((a, b) => a.position - b.position)
        : []
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
      resellerPrice: p.resellerPrice !== undefined ? p.resellerPrice : Math.round(p.price * 0.75),
      rating: p.rating || 4.9,
      reviewsCount: p.reviewsCount || 1,
      sortBadge: p.sortBadge || 'none',
      volumeOrWeight: p.volumeOrWeight,
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

  // Custom Fields Helpers (Name, Value & Position Order)
  const handleAddCustomField = () => {
    const nextPos = customFieldsList.length > 0
      ? Math.max(...customFieldsList.map((f) => f.position)) + 1
      : 1;
    setCustomFieldsList([
      ...customFieldsList,
      { id: `cf_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, name: '', value: '', position: nextPos },
    ]);
  };

  const handleUpdateCustomField = (index: number, key: 'name' | 'value' | 'position', val: any) => {
    const updated = [...customFieldsList];
    updated[index] = { ...updated[index], [key]: val };
    setCustomFieldsList(updated);
  };

  const handleRemoveCustomField = (index: number) => {
    setCustomFieldsList(customFieldsList.filter((_, i) => i !== index));
  };

  const handleMoveCustomField = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === customFieldsList.length - 1)) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const copy = [...customFieldsList];
    const currentPos = copy[index].position;
    const targetPos = copy[targetIndex].position;
    copy[index].position = targetPos;
    copy[targetIndex].position = currentPos;
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    setCustomFieldsList(copy);
  };

  // Quick inline add Category
  const handleInlineAddCategory = () => {
    if (!inlineCatLabel.trim()) return;
    const generatedId = inlineCatLabel.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').slice(0, 24);
    const existing = categories.find((c) => c.id === generatedId || c.label.toLowerCase() === inlineCatLabel.trim().toLowerCase());
    if (!existing) {
      const newCat: CategoryItem = { id: generatedId, label: inlineCatLabel.trim() };
      const updated = [...categories, newCat];
      onUpdateCategories(updated);
      setProductForm({
        ...productForm,
        category: newCat.id,
        categoryLabel: newCat.label,
      });
    } else {
      setProductForm({
        ...productForm,
        category: existing.id,
        categoryLabel: existing.label,
      });
    }
    setInlineCatLabel('');
    setShowInlineAddCat(false);
  };

  // Quick inline add Form
  const handleInlineAddForm = () => {
    if (!inlineFormName.trim()) return;
    const trimmed = inlineFormName.trim();
    if (!forms.includes(trimmed)) {
      const updated = [...forms, trimmed];
      onUpdateForms(updated);
    }
    setProductForm({
      ...productForm,
      form: trimmed,
    });
    setInlineFormName('');
    setShowInlineAddForm(false);
  };

  // Category Manager Tab Actions
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatLabel.trim()) return;
    const id = newCatId.trim() || newCatLabel.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
    if (categories.some((c) => c.id === id)) {
      alert(`Category with ID "${id}" already exists. Please choose another.`);
      return;
    }
    const updated = [...categories, { id, label: newCatLabel.trim() }];
    onUpdateCategories(updated);
    setNewCatId('');
    setNewCatLabel('');
    setSaveSuccessMsg(`Category "${newCatLabel.trim()}" created successfully!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleSaveEditCategory = (id: string) => {
    if (!editingCatLabel.trim()) return;
    const updated = categories.map((c) => c.id === id ? { ...c, label: editingCatLabel.trim() } : c);
    onUpdateCategories(updated);
    setEditingCatId(null);
    setEditingCatLabel('');
    setSaveSuccessMsg(`Category updated!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleDeleteCategory = (id: string) => {
    if (id === 'all') {
      alert('Cannot delete "All Products" root category.');
      return;
    }
    if (categories.length <= 2) {
      alert('Must keep at least one category.');
      return;
    }
    const updated = categories.filter((c) => c.id !== id);
    onUpdateCategories(updated);
    setSaveSuccessMsg(`Category deleted!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Form Manager Tab Actions
  const handleCreateForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFormName.trim()) return;
    if (forms.includes(newFormName.trim())) {
      alert('This formulation form already exists.');
      return;
    }
    const updated = [...forms, newFormName.trim()];
    onUpdateForms(updated);
    setNewFormName('');
    setSaveSuccessMsg(`Formulation Form "${newFormName.trim()}" added!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleSaveEditForm = (idx: number) => {
    if (!editingFormName.trim()) return;
    const updated = [...forms];
    updated[idx] = editingFormName.trim();
    onUpdateForms(updated);
    setEditingFormIdx(null);
    setEditingFormName('');
    setSaveSuccessMsg(`Formulation form updated!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleDeleteForm = (idx: number) => {
    if (forms.length <= 1) {
      alert('Must keep at least one formulation form.');
      return;
    }
    const updated = forms.filter((_, i) => i !== idx);
    onUpdateForms(updated);
    setSaveSuccessMsg(`Formulation form deleted!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
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

    const selectedCatObj = categories.find((c) => c.id === productForm.category);
    const catLabel = selectedCatObj ? selectedCatObj.label : 'Herbal Formulation';

    // Cleaned & sorted custom fields
    const validCustomFields = customFieldsList
      .filter((cf) => cf.name.trim() && cf.value.trim())
      .sort((a, b) => a.position - b.position);

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
        resellerPrice: Number(productForm.resellerPrice) || 200,
        rating: Math.min(5, Math.max(1, Number(productForm.rating) || 4.9)),
        reviewsCount: Number(productForm.reviewsCount) || 1,
        sortBadge: productForm.sortBadge || 'none',
        volumeOrWeight: productForm.volumeOrWeight.trim() || '100g',
        inStock: productForm.inStock,
        image: primaryImg,
        images: cleanImgs,
        customLink: productForm.customLink.trim() || undefined,
        customFields: validCustomFields,
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
        resellerPrice: Number(productForm.resellerPrice),
        rating: Math.min(5, Math.max(1, Number(productForm.rating) || 4.9)),
        reviewsCount: Number(productForm.reviewsCount),
        sortBadge: productForm.sortBadge || 'none',
        volumeOrWeight: productForm.volumeOrWeight.trim(),
        inStock: productForm.inStock,
        image: primaryImg,
        images: cleanImgs,
        customLink: productForm.customLink.trim() || undefined,
        customFields: validCustomFields,
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
    await backupCatalogMetaToFirebase({ categories, forms });
    setIsBackingUp(false);
    setSaveSuccessMsg('Saved all products, multiple images, categories, forms, contacts & titles to Firebase!');
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
                Manage Products, Reseller Rates, Rating Stars, Custom Fields, Categories & Forms, and Contacts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBackupAll}
              disabled={isBackingUp}
              className="px-3 py-1.5 text-xs font-semibold text-[#183624] bg-[#E7EFEA] hover:bg-[#d8e8de] rounded-lg border border-[#A5D6B6] transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-60 cursor-pointer"
              title="Save all image links, texts & contacts to Firebase"
            >
              <CloudUpload className="w-4 h-4 text-[#2C5E43]" />
              <span>{isBackingUp ? 'Saving...' : 'Save All on Firebase'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="Close Admin Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#E7DFD1] bg-[#FAF8F5] px-6 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => {
              setActiveTab('products');
              setIsCreatingNew(false);
              setEditingProduct(null);
            }}
            className={`py-2.5 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'products'
                ? 'border-[#14291D] text-[#14291D] bg-white'
                : 'border-transparent text-[#6D6353] hover:text-[#14291D]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#2C5E43]" />
            <span>Products & Reseller Rates ({products.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('categories_forms');
              setIsCreatingNew(false);
              setEditingProduct(null);
            }}
            className={`py-2.5 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'categories_forms'
                ? 'border-[#14291D] text-[#14291D] bg-white'
                : 'border-transparent text-[#6D6353] hover:text-[#14291D]'
            }`}
          >
            <Layers className="w-4 h-4 text-[#B4741E]" />
            <span>Categories & Forms Manager</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('contacts');
              setIsCreatingNew(false);
              setEditingProduct(null);
            }}
            className={`py-2.5 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
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
            className={`py-2.5 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'site_titles'
                ? 'border-[#14291D] text-[#14291D] bg-white'
                : 'border-transparent text-[#6D6353] hover:text-[#14291D]'
            }`}
          >
            <FileText className="w-4 h-4 text-[#2C5E43]" />
            <span>Website Titles & Banner Texts</span>
          </button>
        </div>

        {/* Success Banner */}
        {saveSuccessMsg && (
          <div className="bg-emerald-700 text-white text-xs px-6 py-2.5 flex items-center justify-between">
            <span className="flex items-center gap-2 font-medium">
              <Check className="w-4 h-4 text-emerald-200" />
              {saveSuccessMsg}
            </span>
            <button onClick={() => setSaveSuccessMsg(null)} className="text-white/80 hover:text-white cursor-pointer">
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
                    className="px-3 py-1.5 text-xs font-medium text-[#645A4B] hover:text-[#14291D] hover:bg-[#EFEAE0] rounded-lg border border-[#DDD5C5] transition-colors cursor-pointer"
                  >
                    Reset Default Catalog
                  </button>

                  <button
                    onClick={startCreate}
                    className="px-4 py-1.5 bg-[#14291D] hover:bg-[#203E2D] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-300" />
                    <span>+ Add New Product</span>
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
                        Edit Product Titles, Images, Reseller Price, Custom Fields & Badges
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingNew(false);
                        setEditingProduct(null);
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-[#645A4B] hover:bg-[#EFEAE0] rounded-lg cursor-pointer"
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

                    {/* CATEGORY & FORM SELECTION (WITH INLINE CUSTOM ADD BUTTONS) */}
                    <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E0D7C6] grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Category Selection */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="block font-semibold text-[#2B251D]">
                            Product Category <span className="text-red-600">*</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowInlineAddCat(!showInlineAddCat)}
                            className="text-[#2C5E43] hover:underline font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Custom Category</span>
                          </button>
                        </div>

                        {showInlineAddCat ? (
                          <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-[#BBDDC7]">
                            <input
                              type="text"
                              value={inlineCatLabel}
                              onChange={(e) => setInlineCatLabel(e.target.value)}
                              placeholder="New Category (e.g. Renal & Kidney Health)"
                              className="flex-1 px-2.5 py-1 text-xs border border-[#DDD5C5] rounded"
                            />
                            <button
                              type="button"
                              onClick={handleInlineAddCategory}
                              className="px-2.5 py-1 bg-[#14291D] text-white rounded text-xs font-semibold cursor-pointer"
                            >
                              Add
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowInlineAddCat(false)}
                              className="px-2 py-1 text-[#645A4B] text-xs hover:bg-gray-100 rounded cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <select
                            value={productForm.category}
                            onChange={(e) => {
                              const val = e.target.value;
                              const obj = categories.find((c) => c.id === val);
                              setProductForm({
                                ...productForm,
                                category: val,
                                categoryLabel: obj ? obj.label : 'Herbal Medicine',
                              });
                            }}
                            className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                          >
                            {categories.filter((c) => c.id !== 'all').map((cat) => (
                              <option key={cat.id} value={cat.id}>{cat.label}</option>
                            ))}
                          </select>
                        )}
                        <span className="text-[10px] text-[#786D5C] block">
                          Tip: You can also manage/edit/delete all preset categories from the "Categories & Forms Manager" tab above.
                        </span>
                      </div>

                      {/* Formulation Form Selection */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="block font-semibold text-[#2B251D]">
                            Formulation Form <span className="text-red-600">*</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowInlineAddForm(!showInlineAddForm)}
                            className="text-[#2C5E43] hover:underline font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Custom Form</span>
                          </button>
                        </div>

                        {showInlineAddForm ? (
                          <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-[#BBDDC7]">
                            <input
                              type="text"
                              value={inlineFormName}
                              onChange={(e) => setInlineFormName(e.target.value)}
                              placeholder="New Form (e.g. Granules, Syrup)"
                              className="flex-1 px-2.5 py-1 text-xs border border-[#DDD5C5] rounded"
                            />
                            <button
                              type="button"
                              onClick={handleInlineAddForm}
                              className="px-2.5 py-1 bg-[#14291D] text-white rounded text-xs font-semibold cursor-pointer"
                            >
                              Add
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowInlineAddForm(false)}
                              className="px-2 py-1 text-[#645A4B] text-xs hover:bg-gray-100 rounded cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <select
                            value={productForm.form}
                            onChange={(e) => setProductForm({ ...productForm, form: e.target.value as ProductForm })}
                            className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                          >
                            {forms.map((f) => (
                              <option key={f} value={f}>{f}</option>
                            ))}
                          </select>
                        )}
                        <span className="text-[10px] text-[#786D5C] block">
                          E.g. Churna, Tablet, Taila, Liquid, Resin, Veg Capsule, or custom.
                        </span>
                      </div>
                    </div>

                    {/* PRICING, RESELLER PRICE, RATING STARS & SORT BADGES (NO EMOJIS, BRANDED ICONS) */}
                    <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E0D7C6] space-y-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-[#B4741E]" />
                        <h5 className="font-serif text-sm font-bold text-[#14291D]">
                          Pricing, Reseller Rate, Rating Stars & Sorting Focus
                        </h5>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                        {/* Selling Price */}
                        <div>
                          <label className="block font-medium text-[#2B251D] mb-1">Retail Selling Price (₹)</label>
                          <input
                            type="number"
                            required
                            value={productForm.price}
                            onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                            className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-mono font-bold"
                          />
                        </div>

                        {/* MRP */}
                        <div>
                          <label className="block font-medium text-[#2B251D] mb-1">MRP Price (₹)</label>
                          <input
                            type="number"
                            required
                            value={productForm.mrp}
                            onChange={(e) => setProductForm({ ...productForm, mrp: Number(e.target.value) })}
                            className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-mono"
                          />
                        </div>

                        {/* RESELLER PRICE */}
                        <div className="bg-[#EBF5EF] p-2 rounded-lg border border-[#BBDDC7]">
                          <label className="block font-bold text-[#183624] mb-1 flex items-center justify-between">
                            <span>Reseller Price (₹)</span>
                            <span className="text-[10px] text-emerald-700 font-normal">B2B Wholesale</span>
                          </label>
                          <input
                            type="number"
                            value={productForm.resellerPrice}
                            onChange={(e) => setProductForm({ ...productForm, resellerPrice: Number(e.target.value) })}
                            placeholder="e.g. 250"
                            className="w-full px-2.5 py-1.5 bg-white border border-[#A5D6B6] rounded text-xs font-mono font-bold text-[#183624]"
                          />
                          <div className="text-[10px] text-[#2C5E43] font-semibold mt-1">
                            Reseller Margin: ₹{productForm.price - (productForm.resellerPrice || productForm.price)}
                          </div>
                        </div>

                        {/* RATING STARS (BRANDED SVG ICONS) */}
                        <div>
                          <label className="block font-medium text-[#2B251D] mb-1 flex items-center justify-between">
                            <span>Rating Star (1 to 5)</span>
                            <span className="text-amber-600 font-bold flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                              <span>{productForm.rating}</span>
                            </span>
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="1.0"
                            max="5.0"
                            required
                            value={productForm.rating}
                            onChange={(e) => setProductForm({ ...productForm, rating: parseFloat(e.target.value) || 5 })}
                            className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-mono"
                          />
                          <div className="flex text-amber-500 text-xs mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < Math.round(productForm.rating || 5)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'fill-gray-200 text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* REVIEWS COUNT */}
                        <div>
                          <label className="block font-medium text-[#2B251D] mb-1">Reviews Count</label>
                          <input
                            type="number"
                            min="0"
                            value={productForm.reviewsCount}
                            onChange={(e) => setProductForm({ ...productForm, reviewsCount: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-mono"
                          />
                          <span className="text-[10px] text-[#786D5C] mt-1 block">Customer reviews</span>
                        </div>
                      </div>

                      {/* SORT BADGE SELECTOR (BRANDED LUCIDE ICONS, NO EMOJIS) */}
                      <div className="pt-2 border-t border-[#EAE3D4]">
                        <label className="block font-semibold text-[#2B251D] mb-1.5">
                          Product Sort Badge & Status
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                          {SORT_BADGE_OPTIONS.map((opt) => {
                            const isSelected = productForm.sortBadge === opt.id;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => setProductForm({ ...productForm, sortBadge: opt.id })}
                                className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium text-left transition-all cursor-pointer flex items-center gap-1.5 ${
                                  isSelected
                                    ? 'bg-[#14291D] text-white border-[#14291D] shadow-xs'
                                    : 'bg-white text-[#4A3F2F] border-[#DDD5C5] hover:bg-[#F2ECE1]'
                                }`}
                              >
                                {opt.id === 'trending' && <Flame className="w-3.5 h-3.5 text-red-500" />}
                                {opt.id === 'top_seller' && <Trophy className="w-3.5 h-3.5 text-amber-500" />}
                                {opt.id === 'best_deal' && <Tag className="w-3.5 h-3.5 text-emerald-600" />}
                                {opt.id === 'featured' && <Sparkles className="w-3.5 h-3.5 text-indigo-500" />}
                                {opt.id === 'new_launch' && <Rocket className="w-3.5 h-3.5 text-blue-500" />}
                                {opt.id === 'none' && <Check className="w-3.5 h-3.5 text-gray-400" />}
                                <span>{opt.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* CUSTOM FIELDS SECTION (NAME, VALUE & DISPLAY POSITION SETTING) */}
                    <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E0D7C6] space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Sliders className="w-4 h-4 text-[#2C5E43]" />
                          <h5 className="font-serif text-sm font-bold text-[#14291D]">
                            Custom Product Fields (Name, Value & Display Position)
                          </h5>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddCustomField}
                          className="px-3 py-1 bg-[#14291D] hover:bg-[#203E2D] text-white rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5 text-amber-300" />
                          <span>Add Custom Field</span>
                        </button>
                      </div>

                      <p className="text-[11px] text-[#695E4F] bg-white p-2.5 rounded-lg border border-[#E2D8C7] leading-relaxed">
                        Add custom attributes (e.g. <em>Shelf Life</em>, <em>Extraction Ratio</em>, <em>Storage Temp</em>, <em>Origin</em>, <em>Preservative Free</em>). Set the <strong>Display Position</strong> number (1, 2, 3...) to control the exact sorting order on the product page.
                      </p>

                      {customFieldsList.length === 0 ? (
                        <div className="p-4 text-center border border-dashed border-[#DDD5C5] rounded-lg bg-white text-xs text-[#7A705E]">
                          No custom fields added yet. Click <strong>"+ Add Custom Field"</strong> to add specifications with custom name, value and position.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {customFieldsList.map((field, idx) => (
                            <div key={field.id || idx} className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-white p-2 rounded-lg border border-[#E7E0D2]">
                              {/* Position Setting Control */}
                              <div className="flex items-center gap-1 shrink-0 bg-[#FAF8F5] px-2 py-1 rounded border border-[#DDD5C5]">
                                <span className="text-[10px] font-semibold text-[#7A705E]">Pos:</span>
                                <input
                                  type="number"
                                  min="1"
                                  value={field.position}
                                  onChange={(e) => handleUpdateCustomField(idx, 'position', parseInt(e.target.value) || 1)}
                                  className="w-12 text-center text-xs font-mono font-bold bg-white border border-[#DDD5C5] rounded py-0.5"
                                  title="Display position order (1 = first)"
                                />
                                <div className="flex flex-col">
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => handleMoveCustomField(idx, 'up')}
                                    className="p-0.5 text-[#433A2D] hover:text-black disabled:opacity-20 cursor-pointer"
                                    title="Move Up"
                                  >
                                    <ArrowUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={idx === customFieldsList.length - 1}
                                    onClick={() => handleMoveCustomField(idx, 'down')}
                                    className="p-0.5 text-[#433A2D] hover:text-black disabled:opacity-20 cursor-pointer"
                                    title="Move Down"
                                  >
                                    <ArrowDown className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              {/* Field Name */}
                              <div className="flex-1 min-w-[140px]">
                                <input
                                  type="text"
                                  required
                                  value={field.name}
                                  placeholder="Field Name (e.g. Shelf Life, Extraction Ratio)"
                                  onChange={(e) => handleUpdateCustomField(idx, 'name', e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded text-xs font-semibold text-[#14291D]"
                                />
                              </div>

                              {/* Field Value */}
                              <div className="flex-1 min-w-[160px]">
                                <input
                                  type="text"
                                  required
                                  value={field.value}
                                  placeholder="Field Value (e.g. 24 Months, 10:1 Extract)"
                                  onChange={(e) => handleUpdateCustomField(idx, 'value', e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-white border border-[#DDD5C5] rounded text-xs"
                                />
                              </div>

                              {/* Delete Action */}
                              <button
                                type="button"
                                onClick={() => handleRemoveCustomField(idx)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded shrink-0 cursor-pointer"
                                title="Delete this custom field"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* MULTIPLE PRODUCT IMAGES SECTION */}
                    <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E0D7C6] space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-[#2C5E43]" />
                          <h5 className="font-serif text-sm font-bold text-[#14291D]">
                            Multiple Product Images (Direct Image Links)
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
                                Primary (List View)
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
                            className="px-3 py-1.5 bg-[#14291D] hover:bg-[#203E2D] text-white rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer"
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
                          className="px-3 py-1 bg-[#14291D] hover:bg-[#203E2D] text-white rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer"
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
                                    placeholder="500mg"
                                    onChange={(e) => handleUpdateIngredient(idx, 'potencyOrMg', e.target.value)}
                                    className="w-full px-2 py-1 bg-white border border-[#DDD5C5] rounded text-xs"
                                  />
                                </td>
                                <td className="py-1.5 px-2">
                                  <input
                                    type="text"
                                    value={ing.role}
                                    placeholder="Adaptogen / Bio-enhancer"
                                    onChange={(e) => handleUpdateIngredient(idx, 'role', e.target.value)}
                                    className="w-full px-2 py-1 bg-white border border-[#DDD5C5] rounded text-xs"
                                  />
                                </td>
                                <td className="py-1.5 px-2 text-right">
                                  {ingredientsList.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveIngredient(idx)}
                                      className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Tagline, Net Volume & Full Description */}
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

                    {/* Key Indications */}
                    <div>
                      <label className="block font-medium text-[#2B251D] mb-1">
                        Key Indications (Comma separated)
                      </label>
                      <input
                        type="text"
                        value={productForm.keyIndications}
                        onChange={(e) => setProductForm({ ...productForm, keyIndications: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                      />
                    </div>

                    {/* Detailed Benefits & Ailments */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-medium text-[#2B251D] mb-1">
                          Primary Clinical Benefits (1 per line)
                        </label>
                        <textarea
                          rows={3}
                          value={productForm.primaryBenefits}
                          onChange={(e) => setProductForm({ ...productForm, primaryBenefits: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-[#2B251D] mb-1">
                          Ailments Treated (1 per line)
                        </label>
                        <textarea
                          rows={3}
                          value={productForm.ailmentsTreated}
                          onChange={(e) => setProductForm({ ...productForm, ailmentsTreated: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-mono"
                        />
                      </div>
                    </div>

                    {/* Dosage Guidelines */}
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
                          className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    {/* Form Submit & Cancel Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EAE3D4]">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreatingNew(false);
                          setEditingProduct(null);
                        }}
                        className="px-4 py-2 border border-[#DDD5C5] hover:bg-[#EFEAE0] rounded-lg font-medium cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-[#14291D] hover:bg-[#203E2D] text-white rounded-lg font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                      >
                        <Save className="w-4 h-4 text-amber-300" />
                        <span>{isCreatingNew ? 'Save & Sync to Firebase' : 'Update & Save to Firebase'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* Products Table with Reseller Price, Ratings & Sort Badges */
                <div className="bg-white rounded-xl border border-[#D5CCBC] shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAF8F5] border-b border-[#E7DFD1] text-[#695F4F]">
                        <tr>
                          <th className="py-2.5 px-3">Product</th>
                          <th className="py-2.5 px-3">Category & Form</th>
                          <th className="py-2.5 px-3">Retail Price</th>
                          <th className="py-2.5 px-3">Reseller Rate</th>
                          <th className="py-2.5 px-3">Rating Star</th>
                          <th className="py-2.5 px-3">Sort Focus</th>
                          <th className="py-2.5 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EAE3D4]">
                        {filteredProducts.map((prod) => (
                          <tr key={prod.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                            {/* Product Info */}
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-lg bg-[#FAF8F5] border border-[#DDD5C5] overflow-hidden shrink-0">
                                  <img
                                    src={prod.image || (prod.images && prod.images[0])}
                                    alt={prod.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                                  />
                                </div>
                                <div>
                                  <div className="font-bold text-[#14291D] line-clamp-1">{prod.name}</div>
                                  <div className="text-[11px] text-[#7A705E] italic line-clamp-1">{prod.sanskritName}</div>
                                  {prod.customFields && prod.customFields.length > 0 && (
                                    <div className="text-[10px] text-[#2C5E43] font-medium">
                                      {prod.customFields.length} custom field(s)
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Category & Form */}
                            <td className="py-2 px-3">
                              <div className="font-medium text-[#2C5E43]">{prod.categoryLabel}</div>
                              <div className="text-[11px] text-[#786D5C]">{prod.form}</div>
                            </td>

                            {/* Retail Price */}
                            <td className="py-2 px-3">
                              <div className="font-mono font-bold text-[#14291D]">₹{prod.price}</div>
                              <div className="text-[10px] text-[#887E6D] line-through">₹{prod.mrp}</div>
                            </td>

                            {/* Reseller Rate */}
                            <td className="py-2 px-3">
                              {prod.resellerPrice !== undefined && prod.resellerPrice > 0 ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#EBF5EF] text-[#183624] font-mono font-bold border border-[#BBDDC7] text-[11px]">
                                  ₹{prod.resellerPrice}
                                </span>
                              ) : (
                                <span className="text-[#998F80] italic text-[11px]">— Not Set —</span>
                              )}
                            </td>

                            {/* Rating Star */}
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-1 text-amber-600 font-bold">
                                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                <span>{prod.rating}</span>
                                <span className="text-[10px] text-[#786D5C]">({prod.reviewsCount})</span>
                              </div>
                            </td>

                            {/* Sort Focus Badge (Branded Icons, No Emojis) */}
                            <td className="py-2 px-3">
                              {prod.sortBadge && prod.sortBadge !== 'none' ? (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white flex items-center gap-1 w-fit ${
                                  prod.sortBadge === 'trending' ? 'bg-red-600' :
                                  prod.sortBadge === 'top_seller' ? 'bg-amber-600' :
                                  prod.sortBadge === 'best_deal' ? 'bg-emerald-700' :
                                  prod.sortBadge === 'new_launch' ? 'bg-blue-600' :
                                  prod.sortBadge === 'featured' ? 'bg-indigo-700' :
                                  'bg-[#B4741E]'
                                }`}>
                                  {prod.sortBadge === 'trending' && <Flame className="w-3 h-3 text-amber-200" />}
                                  {prod.sortBadge === 'top_seller' && <Trophy className="w-3 h-3 text-amber-100" />}
                                  {prod.sortBadge === 'best_deal' && <Tag className="w-3 h-3 text-emerald-200" />}
                                  {prod.sortBadge === 'new_launch' && <Rocket className="w-3 h-3 text-blue-100" />}
                                  {prod.sortBadge === 'featured' && <Sparkles className="w-3 h-3 text-indigo-200" />}
                                  <span>
                                    {prod.sortBadge === 'trending' ? 'Trending' :
                                     prod.sortBadge === 'top_seller' ? 'Top Seller' :
                                     prod.sortBadge === 'best_deal' ? 'Best Deal' :
                                     prod.sortBadge === 'new_launch' ? 'New Launch' :
                                     prod.sortBadge === 'featured' ? 'Featured' :
                                     prod.sortBadge}
                                  </span>
                                </span>
                              ) : (
                                <span className="text-[11px] text-[#887E6D]">Standard</span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="py-2 px-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => onPreviewProduct(prod)}
                                  className="p-1.5 text-[#2C5E43] hover:bg-[#E7EFEA] rounded cursor-pointer"
                                  title="Preview product view"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => startEdit(prod)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                                  title="Edit product, images, custom fields & reseller price"
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
                                      className="px-2 py-0.5 bg-red-600 text-white rounded text-[10px] font-bold cursor-pointer"
                                    >
                                      Confirm
                                    </button>
                                    <button
                                      onClick={() => setDeleteConfirmId(null)}
                                      className="px-1 py-0.5 text-[10px] cursor-pointer"
                                    >
                                      X
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setDeleteConfirmId(prod.id)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                    title="Delete product"
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

        {/* Tab 2: Categories & Forms Manager (Preset & Custom Edit / Add / Delete) */}
        {activeTab === 'categories_forms' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* CATEGORIES SECTION */}
            <div className="bg-white p-5 rounded-xl border border-[#D5CCBC] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#EAE3D4] pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#B4741E]" />
                  <div>
                    <h4 className="font-serif text-base font-bold text-[#14291D]">
                      Categories Manager (Preset & Custom)
                    </h4>
                    <p className="text-xs text-[#695F4F]">
                      Add new custom categories, edit labels, or delete categories. Updates sync immediately to the store & Firebase.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onUpdateCategories(DEFAULT_CATEGORIES)}
                  className="px-2.5 py-1 text-xs text-[#6D6352] hover:bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg flex items-center gap-1 cursor-pointer"
                  title="Reset to default herbal categories"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Defaults</span>
                </button>
              </div>

              {/* Add New Category Form */}
              <form onSubmit={handleCreateCategory} className="bg-[#FAF8F5] p-3 rounded-lg border border-[#E4DDD0] flex flex-wrap items-center gap-2.5 text-xs">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-[11px] font-semibold text-[#2F2920] mb-0.5">Category Name / Label</label>
                  <input
                    type="text"
                    required
                    value={newCatLabel}
                    onChange={(e) => setNewCatLabel(e.target.value)}
                    placeholder="e.g. Renal & Kidney Care, Liver Detox"
                    className="w-full px-2.5 py-1.5 bg-white border border-[#DDD5C5] rounded"
                  />
                </div>
                <div className="w-48">
                  <label className="block text-[11px] font-semibold text-[#2F2920] mb-0.5">Category ID (Optional)</label>
                  <input
                    type="text"
                    value={newCatId}
                    onChange={(e) => setNewCatId(e.target.value)}
                    placeholder="auto-generated if empty"
                    className="w-full px-2.5 py-1.5 bg-white border border-[#DDD5C5] rounded font-mono text-[11px]"
                  />
                </div>
                <button
                  type="submit"
                  className="mt-4 px-4 py-1.5 bg-[#14291D] hover:bg-[#203E2D] text-white rounded font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-300" />
                  <span>+ Add Category</span>
                </button>
              </form>

              {/* Existing Categories List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2">
                {categories.map((cat) => {
                  const isEditing = editingCatId === cat.id;
                  const isRoot = cat.id === 'all';
                  return (
                    <div
                      key={cat.id}
                      className="p-3 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg flex items-center justify-between gap-2 text-xs"
                    >
                      {isEditing ? (
                        <div className="flex-1 flex items-center gap-1">
                          <input
                            type="text"
                            value={editingCatLabel}
                            onChange={(e) => setEditingCatLabel(e.target.value)}
                            className="flex-1 px-2 py-1 bg-white border border-[#A5D6B6] rounded text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEditCategory(cat.id)}
                            className="p-1 bg-[#2C5E43] text-white rounded cursor-pointer"
                            title="Save"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCatId(null)}
                            className="p-1 text-[#645A4B] cursor-pointer"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div>
                            <span className="font-bold text-[#14291D] block">{cat.label}</span>
                            <span className="font-mono text-[10px] text-[#7A705E]">id: {cat.id}</span>
                          </div>

                          {!isRoot && (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCatId(cat.id);
                                  setEditingCatLabel(cat.label);
                                }}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                                title="Edit category name"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCategory(cat.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                title="Delete category"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* FORMULATION FORMS SECTION */}
            <div className="bg-white p-5 rounded-xl border border-[#D5CCBC] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#EAE3D4] pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#2C5E43]" />
                  <div>
                    <h4 className="font-serif text-base font-bold text-[#14291D]">
                      Formulation Forms Manager (Preset & Custom)
                    </h4>
                    <p className="text-xs text-[#695F4F]">
                      Manage traditional pharmaceutical forms (Churna, Vati, Taila, Capsule, Swaras, etc.).
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onUpdateForms(DEFAULT_FORMS)}
                  className="px-2.5 py-1 text-xs text-[#6D6352] hover:bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg flex items-center gap-1 cursor-pointer"
                  title="Reset to default forms"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Defaults</span>
                </button>
              </div>

              {/* Add New Form */}
              <form onSubmit={handleCreateForm} className="bg-[#FAF8F5] p-3 rounded-lg border border-[#E4DDD0] flex items-center gap-2.5 text-xs">
                <input
                  type="text"
                  required
                  value={newFormName}
                  onChange={(e) => setNewFormName(e.target.value)}
                  placeholder="New Formulation Form (e.g. Granules, Herbal Jelly, Lepa)"
                  className="flex-1 px-3 py-1.5 bg-white border border-[#DDD5C5] rounded text-xs"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#14291D] hover:bg-[#203E2D] text-white rounded font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-300" />
                  <span>+ Add Form</span>
                </button>
              </form>

              {/* Existing Forms List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2">
                {forms.map((formName, idx) => {
                  const isEditing = editingFormIdx === idx;
                  return (
                    <div
                      key={idx}
                      className="p-3 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg flex items-center justify-between gap-2 text-xs"
                    >
                      {isEditing ? (
                        <div className="flex-1 flex items-center gap-1">
                          <input
                            type="text"
                            value={editingFormName}
                            onChange={(e) => setEditingFormName(e.target.value)}
                            className="flex-1 px-2 py-1 bg-white border border-[#A5D6B6] rounded text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEditForm(idx)}
                            className="p-1 bg-[#2C5E43] text-white rounded cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingFormIdx(null)}
                            className="p-1 text-[#645A4B] cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="font-semibold text-[#14291D]">{formName}</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingFormIdx(idx);
                                setEditingFormName(formName);
                              }}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                              title="Edit form name"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteForm(idx)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                              title="Delete form"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Multiple Contacts (Add, Edit, Delete Phones, WhatsApp, Emails) */}
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
                    className="px-3 py-1 bg-[#14291D] hover:bg-[#203E2D] text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
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
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
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
                    className="px-3 py-1 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
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
                        placeholder="Raw Number e.g. 919876543210"
                        onChange={(e) => handleUpdateWhatsApp(idx, 'number', e.target.value)}
                        className="flex-1 px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-mono"
                      />
                      <input
                        type="text"
                        value={wa.displayNumber}
                        placeholder="Display Text e.g. +91 98765 43210"
                        onChange={(e) => handleUpdateWhatsApp(idx, 'displayNumber', e.target.value)}
                        className="w-1/4 px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                      />
                      {siteForm.contacts.whatsapps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveWhatsApp(idx)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                          title="Delete WhatsApp contact"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Multiple Support Emails */}
              <div className="bg-white p-5 rounded-xl border border-[#D5CCBC] shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#EAE3D4] pb-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#2C5E43]" />
                    <h4 className="font-serif text-base font-bold text-[#14291D]">
                      Multiple Support & Inquiry Emails (Add, Edit, Delete)
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddEmail}
                    className="px-3 py-1 bg-[#14291D] hover:bg-[#203E2D] text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
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
                        placeholder="Label (e.g. Care Team, Prescriptions)"
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
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                          title="Delete email"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Physical Dispensary Address & Timings */}
              <div className="bg-white p-5 rounded-xl border border-[#D5CCBC] shadow-xs space-y-3">
                <div className="flex items-center gap-2 border-b border-[#EAE3D4] pb-2">
                  <Building2 className="w-4 h-4 text-[#2C5E43]" />
                  <h4 className="font-serif text-base font-bold text-[#14291D]">
                    Dispensary Physical Address & Timings
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-[#2B251D] mb-1">Store / Clinic Address</label>
                    <textarea
                      rows={2}
                      value={siteForm.storeAddress}
                      onChange={(e) => setSiteForm({ ...siteForm, storeAddress: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-[#2B251D] mb-1">Consultation & Store Timings</label>
                    <textarea
                      rows={2}
                      value={siteForm.storeTimings}
                      onChange={(e) => setSiteForm({ ...siteForm, storeTimings: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#14291D] hover:bg-[#203E2D] text-white rounded-lg font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>Save All Contacts to Firebase</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 4: Site Titles & Headings */}
        {activeTab === 'site_titles' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            <form onSubmit={handleSaveSiteSettings} className="space-y-6 text-xs">
              <div className="bg-white p-5 rounded-xl border border-[#D5CCBC] shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-[#EAE3D4] pb-2">
                  <FileText className="w-4 h-4 text-[#2C5E43]" />
                  <h4 className="font-serif text-base font-bold text-[#14291D]">
                    Store Branding & Hero Presentation
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-[#2B251D] mb-1">Brand Name (English)</label>
                    <input
                      type="text"
                      value={siteForm.brandName}
                      onChange={(e) => setSiteForm({ ...siteForm, brandName: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-[#2B251D] mb-1">Hindi Brand Name</label>
                    <input
                      type="text"
                      value={siteForm.hindiName}
                      onChange={(e) => setSiteForm({ ...siteForm, hindiName: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs font-serif"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-[#2B251D] mb-1">Hero Main Title (H1)</label>
                  <input
                    type="text"
                    value={siteForm.heroTitle}
                    onChange={(e) => setSiteForm({ ...siteForm, heroTitle: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#2B251D] mb-1">Hero Subtitle / Description</label>
                  <textarea
                    rows={2}
                    value={siteForm.heroSubtitle}
                    onChange={(e) => setSiteForm({ ...siteForm, heroSubtitle: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#2B251D] mb-1">Top Shipping & Announcement Bar Notice</label>
                  <input
                    type="text"
                    value={siteForm.shippingNotice}
                    onChange={(e) => setSiteForm({ ...siteForm, shippingNotice: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#DDD5C5] rounded-lg text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-[#2B251D] mb-1">Chief Pharmacist / Vaidya</label>
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
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#14291D] hover:bg-[#203E2D] text-white rounded-lg font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>Save Titles to Firebase</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

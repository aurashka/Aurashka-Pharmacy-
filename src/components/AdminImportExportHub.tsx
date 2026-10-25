import React, { useState, useRef } from 'react';
import { 
  Download, 
  Upload, 
  FileSpreadsheet, 
  FileCode, 
  CheckCircle2, 
  AlertTriangle, 
  Check, 
  RotateCcw, 
  Eye, 
  Layers, 
  Package, 
  Sliders, 
  Sparkles, 
  ShieldCheck, 
  Info, 
  Copy, 
  ArrowRight, 
  FileText,
  Database,
  ExternalLink,
  RefreshCw,
  FolderDown,
  Trash2,
  X
} from 'lucide-react';
import { 
  HerbalProduct, 
  CategoryItem, 
  SiteSettings 
} from '../types/pharmacy';
import { 
  exportProductsToCsv, 
  exportProductsToJson, 
  exportFullWebsiteBackup, 
  parseUploadedDataFile, 
  generateSampleProductCsv, 
  downloadFile,
  ParsedImportResult 
} from '../utils/importExportHelper';
import { formatPrice } from '../utils/numberFormatter';

interface AdminImportExportHubProps {
  products: HerbalProduct[];
  categories: CategoryItem[];
  forms: string[];
  siteSettings: SiteSettings;
  onImportProducts: (newProducts: HerbalProduct[], mode: 'merge' | 'replace' | 'append') => Promise<void> | void;
  onImportCategories?: (newCategories: CategoryItem[], mode: 'merge' | 'replace') => Promise<void> | void;
  onImportForms?: (newForms: string[], mode: 'merge' | 'replace') => Promise<void> | void;
  onImportSiteSettings?: (newSettings: SiteSettings) => Promise<void> | void;
  onBatchImportFullSite?: (data: {
    products?: HerbalProduct[];
    categories?: CategoryItem[];
    forms?: string[];
    siteSettings?: SiteSettings;
    mode: 'merge' | 'replace';
  }) => Promise<void> | void;
  onClose?: () => void;
}

export const AdminImportExportHub: React.FC<AdminImportExportHubProps> = ({
  products,
  categories,
  forms,
  siteSettings,
  onImportProducts,
  onImportCategories,
  onImportForms,
  onImportSiteSettings,
  onBatchImportFullSite,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'export' | 'import' | 'templates'>('export');

  // Export State
  const [exportScope, setExportScope] = useState<{
    products: boolean;
    categories: boolean;
    forms: boolean;
    siteSettings: boolean;
  }>({
    products: true,
    categories: true,
    forms: true,
    siteSettings: true,
  });
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  const [exportStockOnly, setExportStockOnly] = useState<boolean>(false);
  const [exportSuccessNotice, setExportSuccessNotice] = useState<string | null>(null);

  // Import State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedResult, setParsedResult] = useState<ParsedImportResult | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace' | 'append'>('merge');
  const [importScopesToApply, setImportScopesToApply] = useState<{
    products: boolean;
    categories: boolean;
    forms: boolean;
    siteSettings: boolean;
  }>({
    products: true,
    categories: true,
    forms: true,
    siteSettings: true,
  });
  const [isApplyingImport, setIsApplyingImport] = useState(false);
  const [importStatusMessage, setImportStatusMessage] = useState<{
    text: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  // Paste JSON Raw mode
  const [isPasteJsonOpen, setIsPasteJsonOpen] = useState(false);
  const [pastedJsonText, setPastedJsonText] = useState('');

  // Filtered products for export
  const filteredProductsForExport = products.filter((p) => {
    if (productCategoryFilter !== 'all' && p.category !== productCategoryFilter) return false;
    if (exportStockOnly && !p.inStock) return false;
    return true;
  });

  const handleSelectAllExport = () => {
    setExportScope({
      products: true,
      categories: true,
      forms: true,
      siteSettings: true,
    });
  };

  const handleDeselectAllExport = () => {
    setExportScope({
      products: false,
      categories: false,
      forms: false,
      siteSettings: false,
    });
  };

  // Trigger Product CSV Export
  const handleExportProductCsv = () => {
    exportProductsToCsv(filteredProductsForExport);
    showExportNotice(`Exported ${filteredProductsForExport.length} products to CSV with all image links and full details.`);
  };

  // Trigger Product JSON Export
  const handleExportProductJson = () => {
    exportProductsToJson(filteredProductsForExport);
    showExportNotice(`Exported ${filteredProductsForExport.length} products to JSON format.`);
  };

  // Trigger Full Website Backup
  const handleExportFullBackup = () => {
    const selectedScopesList: ('products' | 'categories' | 'forms' | 'siteSettings')[] = [];
    if (exportScope.products) selectedScopesList.push('products');
    if (exportScope.categories) selectedScopesList.push('categories');
    if (exportScope.forms) selectedScopesList.push('forms');
    if (exportScope.siteSettings) selectedScopesList.push('siteSettings');

    if (selectedScopesList.length === 0) {
      alert('Please select at least one component to export.');
      return;
    }

    exportFullWebsiteBackup({
      products: exportScope.products ? products : undefined,
      categories: exportScope.categories ? categories : undefined,
      forms: exportScope.forms ? forms : undefined,
      siteSettings: exportScope.siteSettings ? siteSettings : undefined,
      selectedScopes: selectedScopesList,
      appName: siteSettings.brandName,
    });

    showExportNotice(`Website backup created for selected components (${selectedScopesList.join(', ')}).`);
  };

  const showExportNotice = (msg: string) => {
    setExportSuccessNotice(msg);
    setTimeout(() => setExportSuccessNotice(null), 5000);
  };

  // File Upload Handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setUploadedFile(file);
    setImportStatusMessage(null);

    try {
      const result = await parseUploadedDataFile(file);
      setParsedResult(result);
      if (result.isValid) {
        setImportScopesToApply({
          products: result.detectedScopes.products,
          categories: result.detectedScopes.categories,
          forms: result.detectedScopes.forms,
          siteSettings: result.detectedScopes.siteSettings,
        });
      }
    } catch (err: any) {
      setParsedResult({
        isValid: false,
        fileType: 'unknown',
        error: err?.message || 'Error parsing file',
        detectedScopes: { products: false, categories: false, forms: false, siteSettings: false },
        counts: { products: 0, categories: 0, forms: 0 },
      });
    } finally {
      setIsParsing(false);
    }
  };

  // Handle Pasted JSON
  const handleProcessPastedJson = async () => {
    if (!pastedJsonText.trim()) return;

    setIsParsing(true);
    setImportStatusMessage(null);

    try {
      const blob = new Blob([pastedJsonText], { type: 'application/json' });
      const fakeFile = new File([blob], 'pasted-data.json', { type: 'application/json' });
      const result = await parseUploadedDataFile(fakeFile);
      setParsedResult(result);
      if (result.isValid) {
        setUploadedFile(fakeFile);
        setIsPasteJsonOpen(false);
        setImportScopesToApply({
          products: result.detectedScopes.products,
          categories: result.detectedScopes.categories,
          forms: result.detectedScopes.forms,
          siteSettings: result.detectedScopes.siteSettings,
        });
      }
    } catch (err: any) {
      setParsedResult({
        isValid: false,
        fileType: 'json',
        error: `Invalid JSON syntax: ${err?.message || 'Check braces and quotes'}`,
        detectedScopes: { products: false, categories: false, forms: false, siteSettings: false },
        counts: { products: 0, categories: 0, forms: 0 },
      });
    } finally {
      setIsParsing(false);
    }
  };

  // Commit Import
  const handleApplyImport = async () => {
    if (!parsedResult || !parsedResult.isValid) return;

    setIsApplyingImport(true);
    setImportStatusMessage({
      text: 'Applying imported data and syncing to catalog database...',
      type: 'info',
    });

    try {
      const { products: importedProducts, categories: importedCategories, forms: importedForms, siteSettings: importedSettings } = parsedResult;

      // If batch import function is available
      if (onBatchImportFullSite) {
        await onBatchImportFullSite({
          products: importScopesToApply.products && importedProducts ? importedProducts : undefined,
          categories: importScopesToApply.categories && importedCategories ? importedCategories : undefined,
          forms: importScopesToApply.forms && importedForms ? importedForms : undefined,
          siteSettings: importScopesToApply.siteSettings && importedSettings ? importedSettings : undefined,
          mode: importMode === 'replace' ? 'replace' : 'merge',
        });
      } else {
        // Individual fallback handlers
        if (importScopesToApply.products && importedProducts && importedProducts.length > 0) {
          await onImportProducts(importedProducts, importMode);
        }
        if (importScopesToApply.categories && importedCategories && onImportCategories) {
          await onImportCategories(importedCategories, importMode === 'replace' ? 'replace' : 'merge');
        }
        if (importScopesToApply.forms && importedForms && onImportForms) {
          await onImportForms(importedForms, importMode === 'replace' ? 'replace' : 'merge');
        }
        if (importScopesToApply.siteSettings && importedSettings && onImportSiteSettings) {
          await onImportSiteSettings(importedSettings);
        }
      }

      setImportStatusMessage({
        text: `Successfully imported ${parsedResult.counts.products || 0} products, ${parsedResult.counts.categories || 0} categories, ${parsedResult.counts.forms || 0} forms into the live pharmacy!`,
        type: 'success',
      });

      // Clear uploaded file after successful import
      setTimeout(() => {
        setUploadedFile(null);
        setParsedResult(null);
      }, 3500);
    } catch (err: any) {
      setImportStatusMessage({
        text: `Import failed: ${err?.message || 'Unknown error occurred'}`,
        type: 'error',
      });
    } finally {
      setIsApplyingImport(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Tabs */}
      <div className="bg-gradient-to-r from-[#143B25] to-[#1E6B47] text-white p-5 rounded-2xl shadow-sm border border-[#143B25] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300 mb-1">
            <Database className="w-4 h-4" />
            <span>Pharmacy Data & Inventory Management</span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold">
            Import & Export Hub (Products & Full Site)
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-2xl leading-relaxed">
            Easily export full detailed product spreadsheets (with all image links, formulations, and dosages) or download full website backups. Restore products or individual site components anytime.
          </p>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex items-center bg-black/25 p-1 rounded-xl backdrop-blur-sm shrink-0 border border-white/10">
          <button
            type="button"
            onClick={() => setActiveSubTab('export')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'export'
                ? 'bg-white text-[#143B25] shadow-xs'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Data</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('import')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'import'
                ? 'bg-white text-[#143B25] shadow-xs'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Data</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('templates')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'templates'
                ? 'bg-white text-[#143B25] shadow-xs'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Templates</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {exportSuccessNotice && (
        <div className="bg-[#EAF7EE] border border-[#BDE8D1] text-[#12452B] px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#1E6B47] shrink-0" />
          <span>{exportSuccessNotice}</span>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* 1. EXPORT SUBTAB                                                         */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'export' && (
        <div className="space-y-6">
          {/* Card A: Detailed Product Export (CSV & JSON) */}
          <div className="bg-white rounded-2xl border border-[#DCEFE3] p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EDF5F0] pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#1E6B47] flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" />
                  Option 1: Product Catalog Export (All Image Links & Details)
                </span>
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#142B1F] mt-0.5">
                  Export Detailed Products (Excel CSV / JSON)
                </h3>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#526B5C]">
                <span className="font-semibold">{filteredProductsForExport.length}</span> of {products.length} products ready
              </div>
            </div>

            {/* Filters for Product Export */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-[#F6FAF7] p-3 rounded-xl border border-[#DCEFE3]/80">
              {/* Category Filter */}
              <div>
                <label className="block text-[11px] font-bold text-[#143B25] mb-1">
                  Filter by Category:
                </label>
                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="w-full text-xs bg-white border border-[#DCEFE3] rounded-lg px-2.5 py-1.5 text-[#142B1F] focus:outline-none focus:ring-1 focus:ring-[#1E6B47]"
                >
                  <option value="all">All Categories ({products.length} products)</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label} ({products.filter((p) => p.category === c.id).length})
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock Filter */}
              <div className="flex items-center gap-2 pt-5">
                <label className="flex items-center gap-2 text-xs font-medium text-[#142B1F] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportStockOnly}
                    onChange={(e) => setExportStockOnly(e.target.checked)}
                    className="rounded text-[#1E6B47] focus:ring-[#1E6B47] cursor-pointer"
                  />
                  <span>Only Export In-Stock Formulations</span>
                </label>
              </div>
            </div>

            {/* Field Inclusions Highlight */}
            <div className="text-[11px] text-[#526B5C] bg-[#FEF9EE] border border-[#FDE68A] p-3 rounded-xl space-y-1">
              <div className="font-bold text-[#92400E] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>Included in Detailed Product Export:</span>
              </div>
              <p className="leading-relaxed">
                Primary Image Link, All Gallery Photos, Retail Price, MRP, Reseller Rates, Sanskrit / Botanical names, Dosha effects, Key Indications, Classical Ingredients, Dosages & Anupana carriers, AYUSH License, and Monograph specifications.
              </p>
            </div>

            {/* Export Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleExportProductCsv}
                className="px-4 py-2.5 bg-[#1E6B47] hover:bg-[#143B25] text-white rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
                <span>Download Products as CSV (Excel / Sheets)</span>
              </button>

              <button
                type="button"
                onClick={handleExportProductJson}
                className="px-4 py-2.5 bg-white hover:bg-[#F0FAF4] text-[#143B25] border border-[#D0E5D9] rounded-xl text-xs font-bold transition-all shadow-2xs hover:shadow-xs flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <FileCode className="w-4 h-4 text-[#1E6B47]" />
                <span>Download Products as JSON</span>
              </button>
            </div>
          </div>

          {/* Card B: Granular Full Website Backup */}
          <div className="bg-white rounded-2xl border border-[#DCEFE3] p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EDF5F0] pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#1E6B47] flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" />
                  Option 2: Full Website Backup (Choose All or Specific Items)
                </span>
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#142B1F] mt-0.5">
                  Custom Granular Website Backup
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllExport}
                  className="text-xs text-[#1E6B47] hover:underline font-semibold cursor-pointer"
                >
                  Select All
                </button>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={handleDeselectAllExport}
                  className="text-xs text-[#6B8576] hover:underline font-medium cursor-pointer"
                >
                  Deselect All
                </button>
              </div>
            </div>

            {/* Scope selection grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Scope 1: Products */}
              <label className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                exportScope.products ? 'bg-[#F0FAF4] border-[#1E6B47]/50 shadow-2xs' : 'bg-white border-[#E0EBE4] hover:bg-[#F9FCFA]'
              }`}>
                <input
                  type="checkbox"
                  checked={exportScope.products}
                  onChange={(e) => setExportScope({ ...exportScope, products: e.target.checked })}
                  className="mt-0.5 rounded text-[#1E6B47] focus:ring-[#1E6B47] cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-[#142B1F] block">Products Catalog</span>
                  <span className="text-[11px] text-[#6B8576] block mt-0.5">
                    {products.length} formulations with full images & monographs
                  </span>
                </div>
              </label>

              {/* Scope 2: Categories */}
              <label className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                exportScope.categories ? 'bg-[#F0FAF4] border-[#1E6B47]/50 shadow-2xs' : 'bg-white border-[#E0EBE4] hover:bg-[#F9FCFA]'
              }`}>
                <input
                  type="checkbox"
                  checked={exportScope.categories}
                  onChange={(e) => setExportScope({ ...exportScope, categories: e.target.checked })}
                  className="mt-0.5 rounded text-[#1E6B47] focus:ring-[#1E6B47] cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-[#142B1F] block">Categories & Images</span>
                  <span className="text-[11px] text-[#6B8576] block mt-0.5">
                    {categories.length} categories with uploaded photos & appearance
                  </span>
                </div>
              </label>

              {/* Scope 3: Forms */}
              <label className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                exportScope.forms ? 'bg-[#F0FAF4] border-[#1E6B47]/50 shadow-2xs' : 'bg-white border-[#E0EBE4] hover:bg-[#F9FCFA]'
              }`}>
                <input
                  type="checkbox"
                  checked={exportScope.forms}
                  onChange={(e) => setExportScope({ ...exportScope, forms: e.target.checked })}
                  className="mt-0.5 rounded text-[#1E6B47] focus:ring-[#1E6B47] cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-[#142B1F] block">Ayurvedic Forms</span>
                  <span className="text-[11px] text-[#6B8576] block mt-0.5">
                    {forms.length} classical physical forms with thumbnails
                  </span>
                </div>
              </label>

              {/* Scope 4: Site Settings */}
              <label className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                exportScope.siteSettings ? 'bg-[#F0FAF4] border-[#1E6B47]/50 shadow-2xs' : 'bg-white border-[#E0EBE4] hover:bg-[#F9FCFA]'
              }`}>
                <input
                  type="checkbox"
                  checked={exportScope.siteSettings}
                  onChange={(e) => setExportScope({ ...exportScope, siteSettings: e.target.checked })}
                  className="mt-0.5 rounded text-[#1E6B47] focus:ring-[#1E6B47] cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-[#142B1F] block">Site Settings & Brand</span>
                  <span className="text-[11px] text-[#6B8576] block mt-0.5">
                    Titles, contacts, dispensary hours, logos & banners
                  </span>
                </div>
              </label>
            </div>

            {/* Action */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleExportFullBackup}
                className="px-5 py-2.5 bg-gradient-to-r from-[#143B25] to-[#1E6B47] hover:from-[#112F1E] hover:to-[#175337] text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <FolderDown className="w-4 h-4 text-amber-300" />
                <span>Export Selected Components Backup (.json)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* 2. IMPORT SUBTAB                                                         */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'import' && (
        <div className="space-y-6">
          {/* File Upload Box */}
          <div className="bg-white rounded-2xl border-2 border-dashed border-[#BDE8D1] hover:border-[#1E6B47] p-6 text-center transition-colors relative">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json,text/csv,application/json"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              title="Click or drag a CSV or JSON file to upload"
            />

            <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
              <div className="w-12 h-12 rounded-full bg-[#EAF7EE] text-[#1E6B47] flex items-center justify-center mb-1">
                <Upload className="w-6 h-6" />
              </div>
              <h4 className="font-serif text-base font-bold text-[#142B1F]">
                Drag and Drop your Product Catalog or Backup File Here
              </h4>
              <p className="text-xs text-[#526B5C] max-w-md">
                Supports <span className="font-semibold text-[#142B1F]">.CSV</span> (Spreadsheets with image links) and <span className="font-semibold text-[#142B1F]">.JSON</span> (Single product, product arrays, or complete site backup).
              </p>
              <div className="pt-2 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#142B1F] text-white pointer-events-auto">
                  Browse Files
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPasteJsonOpen(!isPasteJsonOpen);
                  }}
                  className="px-3 py-1 rounded-full text-[11px] font-bold bg-white text-[#142B1F] border border-[#DCEFE3] hover:bg-[#F0FAF4] pointer-events-auto cursor-pointer"
                >
                  {isPasteJsonOpen ? 'Hide JSON Input' : 'Or Paste Raw JSON'}
                </button>
              </div>
            </div>
          </div>

          {/* Paste Raw JSON collapsible box */}
          {isPasteJsonOpen && (
            <div className="bg-[#FAFDFB] border border-[#DCEFE3] p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#143B25] flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-[#1E6B47]" />
                  Paste JSON Array or Full Backup Object
                </span>
                <button
                  type="button"
                  onClick={() => setIsPasteJsonOpen(false)}
                  className="text-xs text-[#6B8576] hover:text-[#142B1F] cursor-pointer"
                >
                  Close
                </button>
              </div>

              <textarea
                value={pastedJsonText}
                onChange={(e) => setPastedJsonText(e.target.value)}
                placeholder='[ { "name": "Brahmi Vati", "price": 250, "image": "https://..." } ]'
                rows={6}
                className="w-full text-xs font-mono p-3 bg-white border border-[#DCEFE3] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1E6B47] text-[#142B1F]"
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleProcessPastedJson}
                  disabled={!pastedJsonText.trim() || isParsing}
                  className="px-4 py-2 bg-[#1E6B47] hover:bg-[#143B25] text-white rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  {isParsing ? 'Analyzing JSON...' : 'Inspect & Preview Pasted Data'}
                </button>
              </div>
            </div>
          )}

          {/* Parsing Spinner */}
          {isParsing && (
            <div className="bg-white p-6 rounded-2xl border border-[#DCEFE3] text-center space-y-2">
              <RefreshCw className="w-6 h-6 text-[#1E6B47] animate-spin mx-auto" />
              <p className="text-xs font-semibold text-[#142B1F]">
                Inspecting file columns, validating image URLs, and checking compatibility...
              </p>
            </div>
          )}

          {/* Parsed Result & Inspector Preview */}
          {parsedResult && !isParsing && (
            <div className="bg-white rounded-2xl border border-[#DCEFE3] p-5 shadow-xs space-y-5">
              {/* File Status Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EDF5F0] pb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    parsedResult.isValid ? 'bg-[#EAF7EE] text-[#1E6B47]' : 'bg-red-50 text-red-600'
                  }`}>
                    {parsedResult.isValid ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-bold text-[#142B1F] flex items-center gap-2">
                      <span>{uploadedFile?.name || 'Uploaded File'}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EAF7EE] text-[#1E6B47] border border-[#BDE8D1]">
                        {parsedResult.fileType.toUpperCase()}
                      </span>
                      {parsedResult.isFullBackup && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          Full Site Backup
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-[#526B5C]">
                      {parsedResult.isValid
                        ? `Found ${parsedResult.counts.products} products, ${parsedResult.counts.categories} categories, ${parsedResult.counts.forms} forms.`
                        : parsedResult.error || 'Invalid file format.'}
                    </p>
                  </div>
                </div>

                {parsedResult.isValid && (
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedFile(null);
                      setParsedResult(null);
                    }}
                    className="text-xs text-[#6B8576] hover:text-red-600 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Clear File</span>
                  </button>
                )}
              </div>

              {/* Error Box if invalid */}
              {!parsedResult.isValid && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>Could not process file</span>
                  </div>
                  <p>{parsedResult.error || 'Please upload a valid CSV or JSON file structured according to the templates.'}</p>
                </div>
              )}

              {/* Successful breakdown options */}
              {parsedResult.isValid && (
                <div className="space-y-4">
                  {/* Scope Selection Checkboxes */}
                  <div>
                    <label className="block text-xs font-bold text-[#143B25] mb-2">
                      Select which data components to restore / import:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                      {/* Products */}
                      <label className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer text-xs ${
                        parsedResult.detectedScopes.products 
                          ? (importScopesToApply.products ? 'bg-[#F0FAF4] border-[#1E6B47]/50 font-bold text-[#142B1F]' : 'bg-white border-[#DCEFE3] text-[#526B5C]')
                          : 'opacity-40 bg-gray-50 border-gray-200 cursor-not-allowed'
                      }`}>
                        <input
                          type="checkbox"
                          disabled={!parsedResult.detectedScopes.products}
                          checked={importScopesToApply.products && parsedResult.detectedScopes.products}
                          onChange={(e) => setImportScopesToApply({ ...importScopesToApply, products: e.target.checked })}
                          className="rounded text-[#1E6B47] focus:ring-[#1E6B47]"
                        />
                        <span>Products ({parsedResult.counts.products})</span>
                      </label>

                      {/* Categories */}
                      <label className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer text-xs ${
                        parsedResult.detectedScopes.categories 
                          ? (importScopesToApply.categories ? 'bg-[#F0FAF4] border-[#1E6B47]/50 font-bold text-[#142B1F]' : 'bg-white border-[#DCEFE3] text-[#526B5C]')
                          : 'opacity-40 bg-gray-50 border-gray-200 cursor-not-allowed'
                      }`}>
                        <input
                          type="checkbox"
                          disabled={!parsedResult.detectedScopes.categories}
                          checked={importScopesToApply.categories && parsedResult.detectedScopes.categories}
                          onChange={(e) => setImportScopesToApply({ ...importScopesToApply, categories: e.target.checked })}
                          className="rounded text-[#1E6B47] focus:ring-[#1E6B47]"
                        />
                        <span>Categories ({parsedResult.counts.categories})</span>
                      </label>

                      {/* Forms */}
                      <label className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer text-xs ${
                        parsedResult.detectedScopes.forms 
                          ? (importScopesToApply.forms ? 'bg-[#F0FAF4] border-[#1E6B47]/50 font-bold text-[#142B1F]' : 'bg-white border-[#DCEFE3] text-[#526B5C]')
                          : 'opacity-40 bg-gray-50 border-gray-200 cursor-not-allowed'
                      }`}>
                        <input
                          type="checkbox"
                          disabled={!parsedResult.detectedScopes.forms}
                          checked={importScopesToApply.forms && parsedResult.detectedScopes.forms}
                          onChange={(e) => setImportScopesToApply({ ...importScopesToApply, forms: e.target.checked })}
                          className="rounded text-[#1E6B47] focus:ring-[#1E6B47]"
                        />
                        <span>Ayurvedic Forms ({parsedResult.counts.forms})</span>
                      </label>

                      {/* Site Settings */}
                      <label className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer text-xs ${
                        parsedResult.detectedScopes.siteSettings 
                          ? (importScopesToApply.siteSettings ? 'bg-[#F0FAF4] border-[#1E6B47]/50 font-bold text-[#142B1F]' : 'bg-white border-[#DCEFE3] text-[#526B5C]')
                          : 'opacity-40 bg-gray-50 border-gray-200 cursor-not-allowed'
                      }`}>
                        <input
                          type="checkbox"
                          disabled={!parsedResult.detectedScopes.siteSettings}
                          checked={importScopesToApply.siteSettings && parsedResult.detectedScopes.siteSettings}
                          onChange={(e) => setImportScopesToApply({ ...importScopesToApply, siteSettings: e.target.checked })}
                          className="rounded text-[#1E6B47] focus:ring-[#1E6B47]"
                        />
                        <span>Site Settings & Brand</span>
                      </label>
                    </div>
                  </div>

                  {/* Mode / Strategy Selection */}
                  <div className="bg-[#FAFDFB] p-4 rounded-xl border border-[#DCEFE3] space-y-2">
                    <label className="block text-xs font-bold text-[#143B25]">
                      Choose Import Strategy:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {/* 1. Merge & Update */}
                      <label className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        importMode === 'merge' ? 'bg-white border-[#1E6B47] shadow-xs' : 'bg-transparent border-[#DCEFE3] hover:bg-white'
                      }`}>
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="import_mode"
                            value="merge"
                            checked={importMode === 'merge'}
                            onChange={() => setImportMode('merge')}
                            className="text-[#1E6B47] focus:ring-[#1E6B47]"
                          />
                          <span className="text-xs font-bold text-[#142B1F]">Merge / Update</span>
                        </div>
                        <p className="text-[10.5px] text-[#526B5C] mt-1 pl-5">
                          Updates products with matching IDs and appends new ones. Preserves untouched products.
                        </p>
                      </label>

                      {/* 2. Append Only */}
                      <label className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        importMode === 'append' ? 'bg-white border-[#1E6B47] shadow-xs' : 'bg-transparent border-[#DCEFE3] hover:bg-white'
                      }`}>
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="import_mode"
                            value="append"
                            checked={importMode === 'append'}
                            onChange={() => setImportMode('append')}
                            className="text-[#1E6B47] focus:ring-[#1E6B47]"
                          />
                          <span className="text-xs font-bold text-[#142B1F]">Append Only New</span>
                        </div>
                        <p className="text-[10.5px] text-[#526B5C] mt-1 pl-5">
                          Only inserts newly discovered items, leaving existing products untouched.
                        </p>
                      </label>

                      {/* 3. Replace All */}
                      <label className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        importMode === 'replace' ? 'bg-white border-red-500 shadow-xs' : 'bg-transparent border-[#DCEFE3] hover:bg-white'
                      }`}>
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="import_mode"
                            value="replace"
                            checked={importMode === 'replace'}
                            onChange={() => setImportMode('replace')}
                            className="text-red-600 focus:ring-red-500"
                          />
                          <span className="text-xs font-bold text-red-700">Clean Replace All</span>
                        </div>
                        <p className="text-[10.5px] text-red-600/80 mt-1 pl-5">
                          Replaces your current catalog with the uploaded data.
                        </p>
                      </label>
                    </div>
                  </div>

                  {/* Sample Preview Table (First 4 items) */}
                  {parsedResult.products && parsedResult.products.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#143B25]">
                          Sample Preview (First {Math.min(parsedResult.products.length, 4)} of {parsedResult.products.length} Products):
                        </span>
                        <span className="text-[11px] text-[#526B5C]">
                          Verify images & rates
                        </span>
                      </div>

                      <div className="overflow-x-auto border border-[#DCEFE3] rounded-xl">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#F0FAF4] text-[#143B25] font-bold border-b border-[#DCEFE3]">
                            <tr>
                              <th className="py-2 px-3">Image</th>
                              <th className="py-2 px-3">Product Name</th>
                              <th className="py-2 px-3">Category</th>
                              <th className="py-2 px-3">Form</th>
                              <th className="py-2 px-3">Price / MRP</th>
                              <th className="py-2 px-3">Reseller</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#EDF5F0]">
                            {parsedResult.products.slice(0, 4).map((p, idx) => (
                              <tr key={idx} className="hover:bg-[#FAFDFB]">
                                <td className="py-2 px-3">
                                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                                    <img
                                      src={p.image}
                                      alt=""
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.currentTarget as HTMLElement).style.display = 'none';
                                      }}
                                    />
                                  </div>
                                </td>
                                <td className="py-2 px-3 font-semibold text-[#142B1F]">
                                  <div>{p.name}</div>
                                  {p.sanskritName && (
                                    <div className="text-[10px] text-[#6B8576] italic">{p.sanskritName}</div>
                                  )}
                                </td>
                                <td className="py-2 px-3 text-[#526B5C]">
                                  {p.categoryLabel || p.category}
                                </td>
                                <td className="py-2 px-3 text-[#526B5C]">
                                  {p.form}
                                </td>
                                <td className="py-2 px-3 font-mono font-bold text-[#1E6B47]">
                                  {formatPrice(p.price)}
                                  {p.mrp > p.price && (
                                    <span className="text-[10px] text-gray-400 line-through ml-1">
                                      {formatPrice(p.mrp)}
                                    </span>
                                  )}
                                </td>
                                <td className="py-2 px-3 font-mono text-[11px] text-[#143B25]">
                                  {p.resellerPrice ? formatPrice(p.resellerPrice) : '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Commit Action */}
                  <div className="pt-2 flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={handleApplyImport}
                      disabled={isApplyingImport}
                      className="px-6 py-3 bg-gradient-to-r from-[#143B25] to-[#1E6B47] hover:from-[#112F1E] hover:to-[#175337] text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      {isApplyingImport ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                          <span>Importing Data to Live Pharmacy...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 text-emerald-300" />
                          <span>
                            Confirm & Import Data Now ({importMode.toUpperCase()})
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Status Message */}
          {importStatusMessage && (
            <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
              importStatusMessage.type === 'success'
                ? 'bg-[#EAF7EE] border border-[#BDE8D1] text-[#12452B]'
                : importStatusMessage.type === 'error'
                ? 'bg-red-50 border border-red-200 text-red-800'
                : 'bg-blue-50 border border-blue-200 text-blue-800'
            }`}>
              {importStatusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#1E6B47] shrink-0" />}
              {importStatusMessage.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />}
              {importStatusMessage.type === 'info' && <RefreshCw className="w-4 h-4 animate-spin text-blue-600 shrink-0" />}
              <span>{importStatusMessage.text}</span>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* 3. TEMPLATES & GUIDE SUBTAB                                              */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'templates' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#DCEFE3] p-5 shadow-xs space-y-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#1E6B47] flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Sample Templates & Column Formatting Guide
              </span>
              <h3 className="font-serif text-base sm:text-lg font-bold text-[#142B1F] mt-0.5">
                Download Ready-to-Use Import Templates
              </h3>
              <p className="text-xs text-[#526B5C] mt-1">
                Use these pre-formatted files to fill in your formulations, product image URLs, wholesale prices, and classical recipes.
              </p>
            </div>

            {/* Template Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-4 rounded-xl border border-[#DCEFE3] bg-[#FAFDFB] space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#EAF7EE] text-[#1E6B47] flex items-center justify-center">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#142B1F]">Products Catalog CSV Template</h4>
                    <span className="text-[10.5px] text-[#6B8576]">Contains all columns, image links, and sample items</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const csv = generateSampleProductCsv();
                    downloadFile('herbal-products-sample-template.csv', csv, 'text/csv;charset=utf-8;');
                  }}
                  className="w-full py-2 bg-[#1E6B47] hover:bg-[#143B25] text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample CSV Template</span>
                </button>
              </div>

              <div className="p-4 rounded-xl border border-[#DCEFE3] bg-[#FAFDFB] space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#EAF7EE] text-[#1E6B47] flex items-center justify-center">
                    <FileCode className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#142B1F]">Complete Site Backup JSON Template</h4>
                    <span className="text-[10.5px] text-[#6B8576]">Demonstrates full backup structure with categories & settings</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    exportFullWebsiteBackup({
                      products: products.slice(0, 2),
                      categories: categories.slice(0, 3),
                      forms: forms.slice(0, 4),
                      siteSettings,
                      selectedScopes: ['products', 'categories', 'forms', 'siteSettings'],
                      filename: 'ayur-full-backup-sample-template.json',
                    });
                  }}
                  className="w-full py-2 bg-white hover:bg-[#F0FAF4] text-[#143B25] border border-[#DCEFE3] rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample JSON Template</span>
                </button>
              </div>
            </div>

            {/* Column Reference Table */}
            <div className="pt-2 space-y-2">
              <h4 className="text-xs font-bold text-[#143B25]">
                Key CSV Columns Reference:
              </h4>

              <div className="overflow-x-auto border border-[#DCEFE3] rounded-xl text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#F0FAF4] text-[#143B25] font-bold border-b border-[#DCEFE3]">
                    <tr>
                      <th className="py-2 px-3">Column Name</th>
                      <th className="py-2 px-3">Required</th>
                      <th className="py-2 px-3">Description & Example</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDF5F0] text-[#526B5C]">
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-[#142B1F]">name</td>
                      <td className="py-2 px-3 font-bold text-red-600">Yes</td>
                      <td className="py-2 px-3">Product Title (e.g. "Ashwagandha Lehyam Gold")</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-[#142B1F]">price</td>
                      <td className="py-2 px-3 font-bold text-red-600">Yes</td>
                      <td className="py-2 px-3">Retail Selling Price in ₹ (e.g. 349)</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-[#142B1F]">mrp</td>
                      <td className="py-2 px-3 font-medium">Optional</td>
                      <td className="py-2 px-3">Maximum Retail Price for discount calculations (e.g. 449)</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-[#142B1F]">resellerPrice</td>
                      <td className="py-2 px-3 font-medium">Optional</td>
                      <td className="py-2 px-3">B2B wholesale / practitioner rate in ₹ (e.g. 240)</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-[#142B1F]">image</td>
                      <td className="py-2 px-3 font-medium">Optional</td>
                      <td className="py-2 px-3">Direct URL for primary front image (https://...)</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-[#142B1F]">images</td>
                      <td className="py-2 px-3 font-medium">Optional</td>
                      <td className="py-2 px-3">Multiple gallery photo URLs separated by pipe: <code className="bg-gray-100 px-1 py-0.5 rounded text-[10px]">url1 | url2 | url3</code></td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-[#142B1F]">category</td>
                      <td className="py-2 px-3 font-medium">Optional</td>
                      <td className="py-2 px-3">Category identifier (e.g. "classical_churna", "herbal_avaleha")</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-[#142B1F]">form</td>
                      <td className="py-2 px-3 font-medium">Optional</td>
                      <td className="py-2 px-3">Physical form (e.g. "Churna", "Vati", "Syrup", "Avaleha / Paste")</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-[#142B1F]">keyIndications</td>
                      <td className="py-2 px-3 font-medium">Optional</td>
                      <td className="py-2 px-3">Pipe separated benefits (e.g. "Deep Sleep | Stress Relief | Ojas")</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-[#142B1F]">standardDosage</td>
                      <td className="py-2 px-3 font-medium">Optional</td>
                      <td className="py-2 px-3">Dosage guidelines (e.g. "1-2 tablets twice daily after meals")</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

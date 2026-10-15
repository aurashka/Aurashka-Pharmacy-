/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ProductCustomDetailItem,
  CustomDetailElementType,
} from '../types/pharmacy';
import { CustomDetailsRenderer } from './CustomDetailsRenderer';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Copy,
  ChevronDown,
  ChevronUp,
  Type,
  ImageIcon,
  Layout,
  List,
  Table as TableIcon,
  Sparkles,
  Eye,
  Settings2,
  Palette,
} from 'lucide-react';

interface CustomDetailsBuilderProps {
  items: ProductCustomDetailItem[];
  onChange: (items: ProductCustomDetailItem[]) => void;
}

export const CustomDetailsBuilder: React.FC<CustomDetailsBuilderProps> = ({
  items,
  onChange,
}) => {
  const [collapsedMap, setCollapsedMap] = useState<Record<string, boolean>>({});
  const [previewMode, setPreviewMode] = useState<'both' | 'editor' | 'preview'>('both');

  const toggleCollapse = (id: string) => {
    setCollapsedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Add a new element by type
  const handleAddElement = (type: CustomDetailElementType) => {
    const newId = `cde_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    let newItem: ProductCustomDetailItem;

    if (type === 'image_text') {
      newItem = {
        id: newId,
        type: 'image_text',
        title: 'Herbal Purity & Extraction',
        text: 'Standardized hydro-ethanolic extraction protocol preserving full-spectrum phytocompounds.',
        image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=400&q=80',
        imagePosition: 'left',
        imageSize: 'medium',
        imageRounded: 'xl',
        imageTextInline: true, // Single horizontal line: (Image text)
        textSize: '13px',
        textColor: '#14291D',
        bgColor: '#FAF6F0',
        bgOpacity: 100,
      };
    } else if (type === 'text') {
      newItem = {
        id: newId,
        type: 'text',
        title: 'Clinical Administration Notes',
        text: 'Best administered under qualified Ayurvedic medical supervision for optimal therapeutic efficacy and safety.',
        textSize: '14px',
        textColor: '#14291D',
        textAlignment: 'left',
        textBold: false,
        textItalic: false,
        bgColor: '#FAF7F2',
        bgOpacity: 100,
      };
    } else if (type === 'image') {
      newItem = {
        id: newId,
        type: 'image',
        image: 'https://images.unsplash.com/photo-1546842931-886c185b4c8c?auto=format&fit=crop&w=800&q=80',
        imageSize: 'medium',
        imageAlignment: 'center',
        imageCaption: 'Certified organic wildcrafted botanicals sustainably harvested.',
        imageRounded: 'xl',
      };
    } else if (type === 'rich_text_list') {
      newItem = {
        id: newId,
        type: 'rich_text_list',
        listTitle: 'Purity & Processing Standards',
        listType: 'check',
        listItems: [
          '100% Free from synthetic binders, preservatives and parabens',
          'Heavy metal testing verified below Ayurvedic Pharmacopoeia thresholds',
          'Traditional Bhavana processing in copper and brass vessels',
        ],
        listFontSize: '13.5px',
        listTextColor: '#1E2922',
        listIconColor: '#2C5E43',
        listSpacing: 'normal',
        bgColor: '#FAF7F2',
        bgOpacity: 100,
      };
    } else if (type === 'table') {
      newItem = {
        id: newId,
        type: 'table',
        tableTitle: 'Phytochemical Specifications & Assay',
        tableHeaders: ['Marker / Parameter', 'Standard Specification', 'Test Method'],
        tableRows: [
          ['Total Withanolides', '≥ 2.5% w/w', 'HPLC Assay'],
          ['Loss on Drying', 'NMT 6.0%', 'Gravimetric'],
          ['Total Ash Content', 'NMT 5.0%', 'Pharmacopoeial'],
        ],
        tableHeaderBgColor: '#14291D',
        tableHeaderTextColor: '#FFFFFF',
        tableCellTextColor: '#2A2318',
        tableBorderColor: '#DDD5C5',
        tableFontSize: '12.5px',
        tableStyle: 'striped',
        bgColor: '#FFFFFF',
      };
    } else {
      newItem = {
        id: newId,
        type: 'card',
        title: 'Apothecary Guarantee',
        text: 'Authentic classical formulation prepared as per Charaka Samhita.',
        image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=400&q=80',
        size: 'medium',
        bgColor: '#FAF5EE',
        textColor: '#14291D',
        bgOpacity: 100,
      };
    }

    onChange([...items, newItem]);
  };

  // Update field of an item
  const handleUpdateItem = (index: number, field: keyof ProductCustomDetailItem, val: any) => {
    const copy = [...items];
    copy[index] = { ...copy[index], [field]: val };
    onChange(copy);
  };

  // Move item up or down
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const copy = [...items];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    onChange(copy);
  };

  // Duplicate item
  const handleDuplicate = (index: number) => {
    const source = items[index];
    const cloned: ProductCustomDetailItem = JSON.parse(JSON.stringify(source));
    cloned.id = `cde_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    if (cloned.title) cloned.title = `${cloned.title} (Copy)`;
    const copy = [...items];
    copy.splice(index + 1, 0, cloned);
    onChange(copy);
  };

  // Remove item
  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  // Rich list item helpers
  const handleAddListItem = (index: number) => {
    const item = items[index];
    const currentList = Array.isArray(item.listItems) ? [...item.listItems] : [];
    currentList.push('New bullet point or item');
    handleUpdateItem(index, 'listItems', currentList);
  };

  const handleUpdateListItem = (itemIndex: number, liIndex: number, text: string) => {
    const item = items[itemIndex];
    const currentList = Array.isArray(item.listItems) ? [...item.listItems] : [];
    currentList[liIndex] = text;
    handleUpdateItem(itemIndex, 'listItems', currentList);
  };

  const handleRemoveListItem = (itemIndex: number, liIndex: number) => {
    const item = items[itemIndex];
    const currentList = Array.isArray(item.listItems) ? [...item.listItems] : [];
    if (currentList.length <= 1) return;
    currentList.splice(liIndex, 1);
    handleUpdateItem(itemIndex, 'listItems', currentList);
  };

  // Table helpers
  const handleAddTableColumn = (index: number) => {
    const item = items[index];
    const headers = Array.isArray(item.tableHeaders) ? [...item.tableHeaders] : ['Col 1'];
    headers.push(`Column ${headers.length + 1}`);
    const rows = Array.isArray(item.tableRows) ? item.tableRows.map((r) => [...r, '—']) : [];
    const copy = [...items];
    copy[index] = { ...copy[index], tableHeaders: headers, tableRows: rows };
    onChange(copy);
  };

  const handleRemoveTableColumn = (index: number, colIndex: number) => {
    const item = items[index];
    const headers = Array.isArray(item.tableHeaders) ? [...item.tableHeaders] : [];
    if (headers.length <= 1) return;
    headers.splice(colIndex, 1);
    const rows = Array.isArray(item.tableRows)
      ? item.tableRows.map((r) => {
          const rowCopy = [...r];
          rowCopy.splice(colIndex, 1);
          return rowCopy;
        })
      : [];
    const copy = [...items];
    copy[index] = { ...copy[index], tableHeaders: headers, tableRows: rows };
    onChange(copy);
  };

  const handleAddTableRow = (index: number) => {
    const item = items[index];
    const headers = Array.isArray(item.tableHeaders) ? item.tableHeaders : ['Col 1'];
    const rows = Array.isArray(item.tableRows) ? [...item.tableRows] : [];
    rows.push(headers.map(() => ''));
    handleUpdateItem(index, 'tableRows', rows);
  };

  const handleRemoveTableRow = (itemIndex: number, rowIndex: number) => {
    const item = items[itemIndex];
    const rows = Array.isArray(item.tableRows) ? [...item.tableRows] : [];
    if (rows.length <= 1) return;
    rows.splice(rowIndex, 1);
    handleUpdateItem(itemIndex, 'tableRows', rows);
  };

  const handleUpdateTableCell = (
    itemIndex: number,
    rowIndex: number,
    colIndex: number,
    val: string
  ) => {
    const item = items[itemIndex];
    const rows = Array.isArray(item.tableRows) ? item.tableRows.map((r) => [...r]) : [];
    if (!rows[rowIndex]) rows[rowIndex] = [];
    rows[rowIndex][colIndex] = val;
    handleUpdateItem(itemIndex, 'tableRows', rows);
  };

  const handleUpdateTableHeader = (itemIndex: number, colIndex: number, val: string) => {
    const item = items[itemIndex];
    const headers = Array.isArray(item.tableHeaders) ? [...item.tableHeaders] : [];
    headers[colIndex] = val;
    handleUpdateItem(itemIndex, 'tableHeaders', headers);
  };

  return (
    <div className="space-y-4">
      {/* 1. Header & Quick Element Palette */}
      <div className="p-4 bg-white rounded-xl border border-[#D5CCBC] shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAE3D4] pb-3">
          <div>
            <h5 className="font-serif text-sm sm:text-base font-bold text-[#14291D] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C2933C]" />
              <span>Step 6: Custom Detail Elements (Optional)</span>
            </h5>
            <p className="text-xs text-[#716858] mt-0.5">
              Product view me Monograph Tabs ke theek upar custom sections banayein: Image + Text, Pure Text, Image, Rich List, aur Table. Arrow buttons se sequence reorder karein aur live preview dekhein.
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-lg border border-[#DDD5C5] shrink-0 self-start sm:self-auto text-xs">
            <button
              type="button"
              onClick={() => setPreviewMode('both')}
              className={`px-2.5 py-1 rounded font-semibold transition-all cursor-pointer ${
                previewMode === 'both' ? 'bg-[#14291D] text-white shadow-2xs' : 'text-[#645A4B] hover:text-[#14291D]'
              }`}
            >
              Split View
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('editor')}
              className={`px-2.5 py-1 rounded font-semibold transition-all cursor-pointer ${
                previewMode === 'editor' ? 'bg-[#14291D] text-white shadow-2xs' : 'text-[#645A4B] hover:text-[#14291D]'
              }`}
            >
              Editor Only
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('preview')}
              className={`px-2.5 py-1 rounded font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                previewMode === 'preview' ? 'bg-[#14291D] text-white shadow-2xs' : 'text-[#645A4B] hover:text-[#14291D]'
              }`}
            >
              <Eye className="w-3 h-3 text-amber-300" />
              <span>Live Preview</span>
            </button>
          </div>
        </div>

        {/* 5 Element Add Buttons */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A705E] block mb-1.5">
            + Add New Element (Multiple can be added in any order):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {/* 1. Image + Text */}
            <button
              type="button"
              onClick={() => handleAddElement('image_text')}
              className="px-3 py-2 bg-[#FAF8F5] hover:bg-[#F0EAE0] active:bg-[#EAE2D2] border border-[#DDD5C5] hover:border-[#2C5E43] rounded-xl text-xs font-bold text-[#14291D] flex items-center gap-2 cursor-pointer transition-all shadow-2xs group text-left"
            >
              <div className="w-6 h-6 rounded-lg bg-[#EBF5EF] text-[#2C5E43] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Layout className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="block leading-tight">Image + Text</span>
                <span className="text-[9px] text-[#7A705E] font-normal leading-tight">Horizontal (Image text)</span>
              </div>
            </button>

            {/* 2. Text */}
            <button
              type="button"
              onClick={() => handleAddElement('text')}
              className="px-3 py-2 bg-[#FAF8F5] hover:bg-[#F0EAE0] active:bg-[#EAE2D2] border border-[#DDD5C5] hover:border-[#2C5E43] rounded-xl text-xs font-bold text-[#14291D] flex items-center gap-2 cursor-pointer transition-all shadow-2xs group text-left"
            >
              <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Type className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="block leading-tight">Text Block</span>
                <span className="text-[9px] text-[#7A705E] font-normal leading-tight">Color & font size</span>
              </div>
            </button>

            {/* 3. Image */}
            <button
              type="button"
              onClick={() => handleAddElement('image')}
              className="px-3 py-2 bg-[#FAF8F5] hover:bg-[#F0EAE0] active:bg-[#EAE2D2] border border-[#DDD5C5] hover:border-[#2C5E43] rounded-xl text-xs font-bold text-[#14291D] flex items-center gap-2 cursor-pointer transition-all shadow-2xs group text-left"
            >
              <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ImageIcon className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="block leading-tight">Image</span>
                <span className="text-[9px] text-[#7A705E] font-normal leading-tight">URL, size & curve</span>
              </div>
            </button>

            {/* 4. Rich text List */}
            <button
              type="button"
              onClick={() => handleAddElement('rich_text_list')}
              className="px-3 py-2 bg-[#FAF8F5] hover:bg-[#F0EAE0] active:bg-[#EAE2D2] border border-[#DDD5C5] hover:border-[#2C5E43] rounded-xl text-xs font-bold text-[#14291D] flex items-center gap-2 cursor-pointer transition-all shadow-2xs group text-left"
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <List className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="block leading-tight">Rich List</span>
                <span className="text-[9px] text-[#7A705E] font-normal leading-tight">Type, size & color</span>
              </div>
            </button>

            {/* 5. Table */}
            <button
              type="button"
              onClick={() => handleAddElement('table')}
              className="px-3 py-2 bg-[#FAF8F5] hover:bg-[#F0EAE0] active:bg-[#EAE2D2] border border-[#DDD5C5] hover:border-[#2C5E43] rounded-xl text-xs font-bold text-[#14291D] flex items-center gap-2 cursor-pointer transition-all shadow-2xs group text-left"
            >
              <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <TableIcon className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="block leading-tight">Table</span>
                <span className="text-[9px] text-[#7A705E] font-normal leading-tight">Style, cols & rows</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Workspace: Elements List & Live Preview */}
      <div className={`grid gap-4 ${previewMode === 'both' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
        {/* Left Column: Element Cards Editor */}
        {(previewMode === 'both' || previewMode === 'editor') && (
          <div className={`${previewMode === 'both' ? 'lg:col-span-7' : 'w-full'} space-y-3`}>
            {items.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-[#DDD5C5] rounded-xl bg-white space-y-2">
                <Sparkles className="w-8 h-8 text-[#8C806D] mx-auto opacity-70" />
                <h6 className="font-serif text-sm font-bold text-[#14291D]">
                  No Custom Detail Elements Added Yet
                </h6>
                <p className="text-xs text-[#6B6150] max-w-md mx-auto">
                  Upar diye gaye buttons par click karke koi bhi element (Image+Text, Text, Image, List, Table) add karein. Yeh product page par Monograph Tabs ke upar display honge.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleAddElement('image_text')}
                    className="px-3 py-1.5 bg-[#14291D] hover:bg-[#203E2D] text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-300" />
                    <span>+ Add Image + Text</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddElement('rich_text_list')}
                    className="px-3 py-1.5 bg-[#2C5E43] hover:bg-[#1f4330] text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-300" />
                    <span>+ Add Rich List</span>
                  </button>
                </div>
              </div>
            ) : (
              items.map((item, idx) => {
                const type = item.type || (item.image && item.text ? 'image_text' : 'card');
                const isCollapsed = Boolean(collapsedMap[item.id]);

                return (
                  <div
                    key={item.id}
                    className="p-4 bg-white rounded-xl border border-[#DDD5C5] shadow-2xs space-y-3 transition-all hover:border-[#2C5E43]"
                  >
                    {/* Item Top Bar with Drag/Arrow controls */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EFEAE0] pb-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-[#14291D] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>

                        <span className="px-2 py-0.5 rounded text-[10.5px] font-bold uppercase tracking-wider bg-[#F2EDE1] text-[#3E3426] shrink-0">
                          {type === 'image_text' && '🖼️ Image + Text'}
                          {type === 'text' && '✍️ Pure Text'}
                          {type === 'image' && '📷 Photo/Image'}
                          {type === 'rich_text_list' && '📋 Rich List'}
                          {type === 'table' && '📊 Table'}
                          {type === 'card' && '🏷️ Highlight Card'}
                        </span>

                        <span className="font-serif font-bold text-xs text-[#14291D] truncate max-w-[200px] sm:max-w-[260px]">
                          {item.title || item.listTitle || item.tableTitle || item.text?.slice(0, 30) || 'Untitled Element'}
                        </span>
                      </div>

                      {/* Controls: Up/Down arrow, Duplicate, Delete, Collapse */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMove(idx, 'up')}
                          className="p-1 rounded bg-[#FAF8F5] border border-[#DDD5C5] text-[#554B3B] hover:text-[#14291D] disabled:opacity-30 cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === items.length - 1}
                          onClick={() => handleMove(idx, 'down')}
                          className="p-1 rounded bg-[#FAF8F5] border border-[#DDD5C5] text-[#554B3B] hover:text-[#14291D] disabled:opacity-30 cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicate(idx)}
                          className="p-1 rounded bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100 cursor-pointer"
                          title="Duplicate Element"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemove(idx)}
                          className="p-1 rounded bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 cursor-pointer"
                          title="Delete Element"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleCollapse(item.id)}
                          className="p-1 rounded bg-stone-100 text-stone-600 hover:text-stone-900 cursor-pointer"
                          title={isCollapsed ? 'Expand' : 'Collapse'}
                        >
                          {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Element Configuration Form Body (Collapsible) */}
                    {!isCollapsed && (
                      <div className="space-y-3.5 pt-1 text-xs">
                        {/* ========================================= */}
                        {/* 1. IMAGE + TEXT FORM (Horizontal Line)    */}
                        {/* ========================================= */}
                        {type === 'image_text' && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                              {/* Title */}
                              <div className="sm:col-span-2">
                                <label className="block font-semibold text-[#14291D] mb-1">
                                  Title / Heading (Optional)
                                </label>
                                <input
                                  type="text"
                                  value={item.title || ''}
                                  onChange={(e) => handleUpdateItem(idx, 'title', e.target.value)}
                                  placeholder="e.g. Standardized Extraction Protocol"
                                  className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg font-bold"
                                />
                              </div>

                              {/* Horizontal Position */}
                              <div>
                                <label className="block font-semibold text-[#14291D] mb-1">
                                  Horizontal Position
                                </label>
                                <select
                                  value={item.imagePosition === 'right' ? 'right' : 'left'}
                                  onChange={(e) => handleUpdateItem(idx, 'imagePosition', e.target.value as any)}
                                  className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg font-medium cursor-pointer"
                                >
                                  <option value="left">Left: (Image Text)</option>
                                  <option value="right">Right: (Text Image)</option>
                                </select>
                              </div>

                              {/* Line Flow Mode */}
                              <div>
                                <label className="block font-semibold text-[#14291D] mb-1">
                                  Text Flow
                                </label>
                                <select
                                  value={item.imageTextInline !== false ? 'inline' : 'stacked'}
                                  onChange={(e) => handleUpdateItem(idx, 'imageTextInline', e.target.value === 'inline')}
                                  className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg font-medium cursor-pointer"
                                >
                                  <option value="inline">Single Line (Image + Title: Text)</option>
                                  <option value="stacked">Two-Line Compact (Title & Text)</option>
                                </select>
                              </div>

                              {/* Image URL */}
                              <div className="sm:col-span-2">
                                <label className="block font-semibold text-[#14291D] mb-1">
                                  Image URL
                                </label>
                                <input
                                  type="url"
                                  value={item.image || ''}
                                  onChange={(e) => handleUpdateItem(idx, 'image', e.target.value)}
                                  placeholder="https://images.unsplash.com/..."
                                  className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg"
                                />
                              </div>

                              {/* Image Size */}
                              <div>
                                <label className="block font-semibold text-[#14291D] mb-1">
                                  Image Size
                                </label>
                                <select
                                  value={item.imageSize || 'medium'}
                                  onChange={(e) => handleUpdateItem(idx, 'imageSize', e.target.value as any)}
                                  className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg font-medium cursor-pointer"
                                >
                                  <option value="tiny">Tiny (28px)</option>
                                  <option value="small">Small (36px)</option>
                                  <option value="medium">Medium (48px - Standard)</option>
                                  <option value="large">Large (60px)</option>
                                </select>
                              </div>

                              {/* Image Shape */}
                              <div>
                                <label className="block font-semibold text-[#14291D] mb-1">
                                  Image Shape
                                </label>
                                <select
                                  value={item.imageRounded || 'xl'}
                                  onChange={(e) => handleUpdateItem(idx, 'imageRounded', e.target.value as any)}
                                  className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg font-medium cursor-pointer"
                                >
                                  <option value="xl">Rounded Card</option>
                                  <option value="full">Circle Badge</option>
                                  <option value="none">Square</option>
                                </select>
                              </div>

                              {/* Text size */}
                              <div>
                                <label className="block font-semibold text-[#14291D] mb-1">
                                  Text Font Size
                                </label>
                                <select
                                  value={item.textSize || '13px'}
                                  onChange={(e) => handleUpdateItem(idx, 'textSize', e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg font-medium cursor-pointer"
                                >
                                  <option value="11px">11px (Tiny)</option>
                                  <option value="12px">12px (Compact)</option>
                                  <option value="13px">13px (Default)</option>
                                  <option value="14px">14px (Medium)</option>
                                  <option value="16px">16px (Large)</option>
                                </select>
                              </div>

                              {/* Text Color */}
                              <div>
                                <label className="block font-semibold text-[#14291D] mb-1">
                                  Text Color
                                </label>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="color"
                                    value={item.textColor || '#14291D'}
                                    onChange={(e) => handleUpdateItem(idx, 'textColor', e.target.value)}
                                    className="w-8 h-8 rounded border border-[#DDD5C5] cursor-pointer p-0.5 bg-white shrink-0"
                                  />
                                  <input
                                    type="text"
                                    value={item.textColor || '#14291D'}
                                    onChange={(e) => handleUpdateItem(idx, 'textColor', e.target.value)}
                                    className="w-full px-2 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg font-mono text-xs"
                                  />
                                </div>
                              </div>

                              {/* Background Color */}
                              <div>
                                <label className="block font-semibold text-[#14291D] mb-1">
                                  Box Background
                                </label>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="color"
                                    value={item.bgColor || '#FAF6F0'}
                                    onChange={(e) => handleUpdateItem(idx, 'bgColor', e.target.value)}
                                    className="w-8 h-8 rounded border border-[#DDD5C5] cursor-pointer p-0.5 bg-white shrink-0"
                                  />
                                  <input
                                    type="text"
                                    value={item.bgColor || '#FAF6F0'}
                                    onChange={(e) => handleUpdateItem(idx, 'bgColor', e.target.value)}
                                    className="w-full px-2 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg font-mono text-xs"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Text Description */}
                            <div>
                              <label className="block font-semibold text-[#14291D] mb-1">
                                Detailed Text Content
                              </label>
                              <textarea
                                rows={2}
                                value={item.text || ''}
                                onChange={(e) => handleUpdateItem(idx, 'text', e.target.value)}
                                placeholder="Explain extraction protocol, quality certifications, or usage instructions..."
                                className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg"
                              />
                            </div>
                          </div>
                        )}

                        {/* ========================================= */}
                        {/* 2. PURE TEXT FORM                         */}
                        {/* ========================================= */}
                        {type === 'text' && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                              {/* Title */}
                              <div className="sm:col-span-2">
                                <label className="block font-semibold text-[#14291D] mb-1">
                                  Section Title (Optional)
                                </label>
                                <input
                                  type="text"
                                  value={item.title || ''}
                                  onChange={(e) => handleUpdateItem(idx, 'title', e.target.value)}
                                  placeholder="e.g. Clinical Administration Notes"
                                  className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg font-bold"
                                />
                              </div>

                              {/* Font Size */}
                              <div>
                                <label className="block font-semibold text-[#14291D] mb-1">
                                  Font Size
                                </label>
                                <select
                                  value={item.textSize || '14px'}
                                  onChange={(e) => handleUpdateItem(idx, 'textSize', e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg font-medium cursor-pointer"
                                >
                                  <option value="12px">12px (Small)</option>
                                  <option value="13px">13px (Compact)</option>
                                  <option value="14px">14px (Standard)</option>
                                  <option value="16px">16px (Medium)</option>
                                  <option value="18px">18px (Headline)</option>
                                  <option value="20px">20px (Lead)</option>
                                </select>
                              </div>

                              {/* Text Alignment */}
                              <div>
                                <label className="block font-semibold text-[#14291D] mb-1">
                                  Alignment
                                </label>
                                <select
                                  value={item.textAlignment || 'left'}
                                  onChange={(e) => handleUpdateItem(idx, 'textAlignment', e.target.value as any)}
                                  className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg font-medium cursor-pointer"
                                >
                                  <option value="left">Left</option>
                                  <option value="center">Center</option>
                                  <option value="right">Right</option>
                                  <option value="justify">Justify</option>
                                </select>
                              </div>

                              {/* Text Color */}
                              <div>
                                <label className="block font-semibold text-[#14291D] mb-1">
                                  Text Color
                                </label>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="color"
                                    value={item.textColor || '#14291D'}
                                    onChange={(e) => handleUpdateItem(idx, 'textColor', e.target.value)}
                                    className="w-8 h-8 rounded border border-[#DDD5C5] cursor-pointer p-0.5 bg-white shrink-0"
                                  />
                                  <input
                                    type="text"
                                    value={item.textColor || '#14291D'}
                                    onChange={(e) => handleUpdateItem(idx, 'textColor', e.target.value)}
                                    className="w-full px-2 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg font-mono text-xs"
                                  />
                                </div>
                              </div>

                              {/* Background Color */}
                              <div>
                                <label className="block font-semibold text-[#14291D] mb-1">
                                  Box Background (Optional)
                                </label>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="color"
                                    value={item.bgColor || '#FAF7F2'}
                                    onChange={(e) => handleUpdateItem(idx, 'bgColor', e.target.value)}
                                    className="w-8 h-8 rounded border border-[#DDD5C5] cursor-pointer p-0.5 bg-white shrink-0"
                                  />
                                  <input
                                    type="text"
                                    value={item.bgColor || '#FAF7F2'}
                                    onChange={(e) => handleUpdateItem(idx, 'bgColor', e.target.value)}
                                    className="w-full px-2 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg font-mono text-xs"
                                  />
                                </div>
                              </div>

                              {/* Text Style toggles (Bold / Italic) */}
                              <div className="flex items-center gap-3 pt-4 sm:col-span-2">
                                <label className="flex items-center gap-1.5 font-semibold text-[#14291D] cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(item.textBold)}
                                    onChange={(e) => handleUpdateItem(idx, 'textBold', e.target.checked)}
                                    className="accent-[#14291D] w-4 h-4 cursor-pointer"
                                  />
                                  <span>Bold Text</span>
                                </label>

                                <label className="flex items-center gap-1.5 font-semibold text-[#14291D] cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(item.textItalic)}
                                    onChange={(e) => handleUpdateItem(idx, 'textItalic', e.target.checked)}
                                    className="accent-[#14291D] w-4 h-4 cursor-pointer"
                                  />
                                  <span>Italic Text</span>
                                </label>
                              </div>
                            </div>

                            {/* Textarea */}
                            <div>
                              <label className="block font-semibold text-[#14291D] mb-1">
                                Text Paragraph
                              </label>
                              <textarea
                                rows={3}
                                value={item.text || ''}
                                onChange={(e) => handleUpdateItem(idx, 'text', e.target.value)}
                                placeholder="Type or paste your detailed clinical text here..."
                                className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg"
                              />
                            </div>
                          </div>
                        )}

                        {/* ========================================= */}
                        {/* 3. IMAGE ONLY FORM                        */}
                        {/* ========================================= */}
                        {type === 'image' && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                              {/* Image URL */}
                              <div className="sm:col-span-2">
                                <label className="block font-semibold text-[#14291D] mb-1">
                                  Image URL <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="url"
                                  value={item.image || ''}
                                  onChange={(e) => handleUpdateItem(idx, 'image', e.target.value)}
                                  placeholder="https://..."
                                  className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg"
                                />
                              </div>

                              {/* Size */}
                              <div>
                                <label className="block font-semibold text-[#14291D] mb-1">
                                  Image Size
                                </label>
                                <select
                                  value={item.imageSize || 'medium'}
                                  onChange={(e) => handleUpdateItem(idx, 'imageSize', e.target.value as any)}
                                  className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg font-medium cursor-pointer"
                                >
                                  <option value="compact">Compact (120px)</option>
                                  <option value="small">Small (200px)</option>
                                  <option value="medium">Medium (Standard)</option>
                                  <option value="large">Large (Wide)</option>
                                  <option value="full">Full Width (100%)</option>
                                </select>
                              </div>

                              {/* Alignment */}
                              <div>
                                <label className="block font-semibold text-[#14291D] mb-1">
                                  Image Alignment
                                </label>
                                <select
                                  value={item.imageAlignment || 'center'}
                                  onChange={(e) => handleUpdateItem(idx, 'imageAlignment', e.target.value as any)}
                                  className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg font-medium cursor-pointer"
                                >
                                  <option value="left">Left Aligned</option>
                                  <option value="center">Centered</option>
                                  <option value="right">Right Aligned</option>
                                </select>
                              </div>

                              {/* Caption */}
                              <div className="sm:col-span-2">
                                <label className="block font-semibold text-[#14291D] mb-1">
                                  Caption / Subtitle (Optional)
                                </label>
                                <input
                                  type="text"
                                  value={item.imageCaption || ''}
                                  onChange={(e) => handleUpdateItem(idx, 'imageCaption', e.target.value)}
                                  placeholder="e.g. Lab tested pure extract"
                                  className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ========================================= */}
                        {/* 4. RICH TEXT LIST FORM                    */}
                        {/* ========================================= */}
                        {type === 'rich_text_list' && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                              {/* List Title */}
                              <div className="sm:col-span-2">
                                <label className="block font-semibold text-[#14291D] mb-1">
                                  List Heading (Optional)
                                </label>
                                <input
                                  type="text"
                                  value={item.listTitle || ''}
                                  onChange={(e) => handleUpdateItem(idx, 'listTitle', e.target.value)}
                                  placeholder="e.g. Key Quality Standards"
                                  className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg font-bold"
                                />
                              </div>

                              {/* List Type */}
                              <div>
                                <label className="block font-semibold text-[#14291D] mb-1">
                                  List Type / Style
                                </label>
                                <select
                                  value={item.listType || 'check'}
                                  onChange={(e) => handleUpdateItem(idx, 'listType', e.target.value as any)}
                                  className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg font-medium cursor-pointer"
                                >
                                  <option value="check">Checkmark Icons (✓)</option>
                                  <option value="numbered">Numbered Badges (1, 2, 3)</option>
                                  <option value="bullet">Bullet Dots (•)</option>
                                  <option value="dash">Dashes (—)</option>
                                </select>
                              </div>

                              {/* Font Size */}
                              <div>
                                <label className="block font-semibold text-[#14291D] mb-1">
                                  Font Size
                                </label>
                                <select
                                  value={item.listFontSize || '13.5px'}
                                  onChange={(e) => handleUpdateItem(idx, 'listFontSize', e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg font-medium cursor-pointer"
                                >
                                  <option value="12px">12px (Small)</option>
                                  <option value="13.5px">13.5px (Standard)</option>
                                  <option value="15px">15px (Medium)</option>
                                  <option value="16px">16px (Large)</option>
                                </select>
                              </div>

                              {/* Text Color */}
                              <div>
                                <label className="block font-semibold text-[#14291D] mb-1">
                                  Text Color
                                </label>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="color"
                                    value={item.listTextColor || '#1E2922'}
                                    onChange={(e) => handleUpdateItem(idx, 'listTextColor', e.target.value)}
                                    className="w-8 h-8 rounded border border-[#DDD5C5] cursor-pointer p-0.5 bg-white shrink-0"
                                  />
                                  <input
                                    type="text"
                                    value={item.listTextColor || '#1E2922'}
                                    onChange={(e) => handleUpdateItem(idx, 'listTextColor', e.target.value)}
                                    className="w-full px-2 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg font-mono text-xs"
                                  />
                                </div>
                              </div>

                              {/* Bullet / Icon Color */}
                              <div>
                                <label className="block font-semibold text-[#14291D] mb-1">
                                  Icon / Bullet Color
                                </label>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="color"
                                    value={item.listIconColor || '#2C5E43'}
                                    onChange={(e) => handleUpdateItem(idx, 'listIconColor', e.target.value)}
                                    className="w-8 h-8 rounded border border-[#DDD5C5] cursor-pointer p-0.5 bg-white shrink-0"
                                  />
                                  <input
                                    type="text"
                                    value={item.listIconColor || '#2C5E43'}
                                    onChange={(e) => handleUpdateItem(idx, 'listIconColor', e.target.value)}
                                    className="w-full px-2 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg font-mono text-xs"
                                  />
                                </div>
                              </div>

                              {/* Box Background */}
                              <div className="sm:col-span-2">
                                <label className="block font-semibold text-[#14291D] mb-1">
                                  Box Background
                                </label>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="color"
                                    value={item.bgColor || '#FAF7F2'}
                                    onChange={(e) => handleUpdateItem(idx, 'bgColor', e.target.value)}
                                    className="w-8 h-8 rounded border border-[#DDD5C5] cursor-pointer p-0.5 bg-white shrink-0"
                                  />
                                  <input
                                    type="text"
                                    value={item.bgColor || '#FAF7F2'}
                                    onChange={(e) => handleUpdateItem(idx, 'bgColor', e.target.value)}
                                    className="w-full px-2 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg font-mono text-xs"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* List items editor */}
                            <div className="space-y-1.5 pt-1">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-[#14291D]">List Items ({item.listItems?.length || 0}):</span>
                                <button
                                  type="button"
                                  onClick={() => handleAddListItem(idx)}
                                  className="px-2 py-1 bg-[#14291D] hover:bg-[#203E2D] text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                                >
                                  <Plus className="w-3 h-3 text-amber-300" />
                                  <span>Add Item</span>
                                </button>
                              </div>

                              {(item.listItems || []).map((li, liIdx) => (
                                <div key={liIdx} className="flex items-center gap-1.5">
                                  <span className="w-5 text-center font-bold text-[#716858] font-mono text-[11px]">
                                    {liIdx + 1}.
                                  </span>
                                  <input
                                    type="text"
                                    value={li}
                                    onChange={(e) => handleUpdateListItem(idx, liIdx, e.target.value)}
                                    placeholder="List item point..."
                                    className="flex-1 px-2.5 py-1 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveListItem(idx, liIdx)}
                                    className="p-1 rounded text-rose-600 hover:bg-rose-50 cursor-pointer"
                                    title="Delete item"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* ========================================= */}
                        {/* 5. TABLE FORM                             */}
                        {/* ========================================= */}
                        {type === 'table' && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                              {/* Title */}
                              <div className="sm:col-span-2">
                                <label className="block font-semibold text-[#14291D] mb-1">
                                  Table Title (Optional)
                                </label>
                                <input
                                  type="text"
                                  value={item.tableTitle || ''}
                                  onChange={(e) => handleUpdateItem(idx, 'tableTitle', e.target.value)}
                                  placeholder="e.g. Phytochemical Assay & Specifications"
                                  className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg font-bold"
                                />
                              </div>

                              {/* Font Size */}
                              <div>
                                <label className="block font-semibold text-[#14291D] mb-1">
                                  Font Size
                                </label>
                                <select
                                  value={item.tableFontSize || '12.5px'}
                                  onChange={(e) => handleUpdateItem(idx, 'tableFontSize', e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg font-medium cursor-pointer"
                                >
                                  <option value="11px">11px (Compact)</option>
                                  <option value="12.5px">12.5px (Standard)</option>
                                  <option value="14px">14px (Large)</option>
                                </select>
                              </div>

                              {/* Style */}
                              <div>
                                <label className="block font-semibold text-[#14291D] mb-1">
                                  Row Style
                                </label>
                                <select
                                  value={item.tableStyle || 'striped'}
                                  onChange={(e) => handleUpdateItem(idx, 'tableStyle', e.target.value as any)}
                                  className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg font-medium cursor-pointer"
                                >
                                  <option value="striped">Zebra Striped Rows</option>
                                  <option value="minimal">Clean Minimal Border</option>
                                </select>
                              </div>

                              {/* Header Bg Color */}
                              <div>
                                <label className="block font-semibold text-[#14291D] mb-1">
                                  Header Background
                                </label>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="color"
                                    value={item.tableHeaderBgColor || '#14291D'}
                                    onChange={(e) => handleUpdateItem(idx, 'tableHeaderBgColor', e.target.value)}
                                    className="w-8 h-8 rounded border border-[#DDD5C5] cursor-pointer p-0.5 bg-white shrink-0"
                                  />
                                  <input
                                    type="text"
                                    value={item.tableHeaderBgColor || '#14291D'}
                                    onChange={(e) => handleUpdateItem(idx, 'tableHeaderBgColor', e.target.value)}
                                    className="w-full px-2 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg font-mono text-xs"
                                  />
                                </div>
                              </div>

                              {/* Header Text Color */}
                              <div>
                                <label className="block font-semibold text-[#14291D] mb-1">
                                  Header Text Color
                                </label>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="color"
                                    value={item.tableHeaderTextColor || '#FFFFFF'}
                                    onChange={(e) => handleUpdateItem(idx, 'tableHeaderTextColor', e.target.value)}
                                    className="w-8 h-8 rounded border border-[#DDD5C5] cursor-pointer p-0.5 bg-white shrink-0"
                                  />
                                  <input
                                    type="text"
                                    value={item.tableHeaderTextColor || '#FFFFFF'}
                                    onChange={(e) => handleUpdateItem(idx, 'tableHeaderTextColor', e.target.value)}
                                    className="w-full px-2 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg font-mono text-xs"
                                  />
                                </div>
                              </div>

                              {/* Cell Text Color */}
                              <div>
                                <label className="block font-semibold text-[#14291D] mb-1">
                                  Cell Text Color
                                </label>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="color"
                                    value={item.tableCellTextColor || '#2A2318'}
                                    onChange={(e) => handleUpdateItem(idx, 'tableCellTextColor', e.target.value)}
                                    className="w-8 h-8 rounded border border-[#DDD5C5] cursor-pointer p-0.5 bg-white shrink-0"
                                  />
                                  <input
                                    type="text"
                                    value={item.tableCellTextColor || '#2A2318'}
                                    onChange={(e) => handleUpdateItem(idx, 'tableCellTextColor', e.target.value)}
                                    className="w-full px-2 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg font-mono text-xs"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Table Column & Row Builder */}
                            <div className="space-y-2 pt-2 border-t border-[#EAE3D4]">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="font-semibold text-[#14291D]">
                                  Table Columns & Rows:
                                </span>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleAddTableColumn(idx)}
                                    className="px-2.5 py-1 bg-white hover:bg-stone-50 border border-[#DDD5C5] rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3 text-[#2C5E43]" />
                                    <span>+ Add Column</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleAddTableRow(idx)}
                                    className="px-2.5 py-1 bg-[#14291D] hover:bg-[#203E2D] text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3 text-amber-300" />
                                    <span>+ Add Row</span>
                                  </button>
                                </div>
                              </div>

                              <div className="overflow-x-auto border border-[#DDD5C5] rounded-xl bg-white p-2">
                                <table className="w-full border-collapse">
                                  <thead>
                                    <tr>
                                      {(item.tableHeaders || []).map((th, cIdx) => (
                                        <th key={cIdx} className="p-1 min-w-[130px]">
                                          <div className="flex items-center gap-1 bg-[#F2EDE1] p-1 rounded-md">
                                            <input
                                              type="text"
                                              value={th}
                                              onChange={(e) => handleUpdateTableHeader(idx, cIdx, e.target.value)}
                                              className="w-full bg-white px-1.5 py-0.5 rounded text-xs font-bold border border-[#DDD5C5]"
                                              placeholder={`Col ${cIdx + 1}`}
                                            />
                                            {(item.tableHeaders?.length || 0) > 1 && (
                                              <button
                                                type="button"
                                                onClick={() => handleRemoveTableColumn(idx, cIdx)}
                                                className="text-rose-600 hover:text-rose-800 p-0.5"
                                                title="Remove column"
                                              >
                                                <Trash2 className="w-3 h-3" />
                                              </button>
                                            )}
                                          </div>
                                        </th>
                                      ))}
                                      <th className="w-8" />
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(item.tableRows || []).map((row, rIdx) => (
                                      <tr key={rIdx}>
                                        {(item.tableHeaders || []).map((_, cIdx) => (
                                          <td key={cIdx} className="p-1 min-w-[130px]">
                                            <input
                                              type="text"
                                              value={row[cIdx] || ''}
                                              onChange={(e) =>
                                                handleUpdateTableCell(idx, rIdx, cIdx, e.target.value)
                                              }
                                              placeholder="Cell value..."
                                              className="w-full px-2 py-1 bg-[#FAF8F5] border border-[#DDD5C5] rounded text-xs"
                                            />
                                          </td>
                                        ))}
                                        <td className="p-1 text-center">
                                          {(item.tableRows?.length || 0) > 1 && (
                                            <button
                                              type="button"
                                              onClick={() => handleRemoveTableRow(idx, rIdx)}
                                              className="text-rose-600 hover:text-rose-800 p-0.5"
                                              title="Delete row"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ========================================= */}
                        {/* 6. LEGACY CARD FORM                       */}
                        {/* ========================================= */}
                        {type === 'card' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                            <div className="sm:col-span-2">
                              <label className="block font-semibold text-[#14291D] mb-1">Title</label>
                              <input
                                type="text"
                                value={item.title || ''}
                                onChange={(e) => handleUpdateItem(idx, 'title', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg font-bold"
                              />
                            </div>
                            <div>
                              <label className="block font-semibold text-[#14291D] mb-1">Size</label>
                              <select
                                value={item.size || 'medium'}
                                onChange={(e) => handleUpdateItem(idx, 'size', e.target.value as any)}
                                className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg"
                              >
                                <option value="small">Small</option>
                                <option value="medium">Medium</option>
                                <option value="large">Large</option>
                              </select>
                            </div>
                            <div>
                              <label className="block font-semibold text-[#14291D] mb-1">Image URL</label>
                              <input
                                type="url"
                                value={item.image || ''}
                                onChange={(e) => handleUpdateItem(idx, 'image', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg"
                              />
                            </div>
                            <div className="sm:col-span-2 md:col-span-4">
                              <label className="block font-semibold text-[#14291D] mb-1">Description</label>
                              <textarea
                                rows={2}
                                value={item.text || ''}
                                onChange={(e) => handleUpdateItem(idx, 'text', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Right Column: Live Interactive Storefront Preview */}
        {(previewMode === 'both' || previewMode === 'preview') && (
          <div className={`${previewMode === 'both' ? 'lg:col-span-5' : 'w-full'} space-y-2.5`}>
            <div className="sticky top-4 bg-[#F5F2EB] p-3.5 sm:p-4 rounded-xl border border-[#DDD5C5] shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[#E0D7C6] pb-2">
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-[#2C5E43]" />
                  <span className="font-serif font-bold text-xs sm:text-sm text-[#14291D]">
                    Live Storefront Preview
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#14291D] text-amber-300">
                  {items.length} {items.length === 1 ? 'element' : 'elements'}
                </span>
              </div>

              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E7DFD1] max-h-[600px] overflow-y-auto overscroll-contain scrollbar-thin">
                {items.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#8A7F6E]">
                    Elements add karne par live preview yahan real-time render hoga.
                  </div>
                ) : (
                  <CustomDetailsRenderer items={items} isPreview={true} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

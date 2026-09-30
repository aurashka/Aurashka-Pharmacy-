import React from 'react';
import { ProductCategory } from '../types/pharmacy';
import { COMMON_AILMENT_TAGS } from '../data/herbalProducts';
import { Activity, Sparkles } from 'lucide-react';

interface AilmentQuickFinderProps {
  selectedCategory: ProductCategory;
  onSelectCategory: (category: ProductCategory) => void;
  searchQuery: string;
  onSelectAilmentQuery: (query: string) => void;
}

export const AilmentQuickFinder: React.FC<AilmentQuickFinderProps> = ({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSelectAilmentQuery,
}) => {
  const quickAilments = [
    { label: 'Arthritis & Knee Pain', category: 'joint_pain' as ProductCategory, query: 'arthritis' },
    { label: 'Acid Reflux & GERD', category: 'digestion' as ProductCategory, query: 'acidity' },
    { label: 'Gas & Severe Bloating', category: 'digestion' as ProductCategory, query: 'bloating' },
    { label: 'Restless Sleep & Anxiety', category: 'mind_sleep' as ProductCategory, query: 'sleep' },
    { label: 'Persistent Cough & Phlegm', category: 'immunity' as ProductCategory, query: 'cough' },
    { label: 'Dark Spots & Skin Radiance', category: 'skin_hair' as ProductCategory, query: 'pigmentation' },
    { label: 'Hair Thinning & Scalp Fall', category: 'skin_hair' as ProductCategory, query: 'hair' },
    { label: 'Mitochondrial Energy & Stamina', category: 'vitality' as ProductCategory, query: 'stamina' },
  ];

  return (
    <section id="ailment-guide" className="py-6 px-4 sm:px-6 bg-[#FBF9F5] border-b border-[#E7DFD1]">
      <div className="max-w-7xl mx-auto space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#2C5E43]" />
            <h3 className="font-serif text-base font-bold text-[#14291D]">
              Filter by Health Concern
            </h3>
          </div>
          <span className="text-xs text-[#736856]">
            Select a condition to display relevant herbal preparations
          </span>
        </div>

        {/* Quick symptom interactive buttons */}
        <div className="flex flex-wrap gap-2 pt-1">
          {quickAilments.map((ail, idx) => {
            const isActive = searchQuery.toLowerCase() === ail.query.toLowerCase();
            return (
              <button
                key={idx}
                onClick={() => {
                  if (isActive) {
                    onSelectAilmentQuery('');
                    onSelectCategory('all');
                  } else {
                    onSelectCategory(ail.category);
                    onSelectAilmentQuery(ail.query);
                  }
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all border ${
                  isActive
                    ? 'bg-[#183624] text-white border-[#183624] shadow-xs'
                    : 'bg-white text-[#393126] border-[#DDD5C5] hover:border-[#2C5E43] hover:text-[#183624]'
                }`}
              >
                {ail.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

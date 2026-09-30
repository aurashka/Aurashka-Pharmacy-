import React, { useState } from 'react';
import { BookOpen, Droplets, Clock, ShieldCheck, HeartHandshake, ArrowRight } from 'lucide-react';
import { HERBAL_PRODUCTS, PHARMACY_CONTACT_INFO } from '../data/herbalProducts';
import { HerbalProduct } from '../types/pharmacy';

interface DosageGuideSectionProps {
  onOpenProductDetail: (product: HerbalProduct) => void;
  onOpenConsultationModal: () => void;
}

export const DosageGuideSection: React.FC<DosageGuideSectionProps> = ({
  onOpenProductDetail,
  onOpenConsultationModal,
}) => {
  const [activeTab, setActiveTab] = useState<'anupana' | 'timings' | 'formulations'>('anupana');

  return (
    <section id="dosage-uses" className="py-12 px-4 sm:px-6 bg-[#F5F1E8] border-b border-[#E3DCce]">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#14291D]">
              Dosage & Anupana Science
            </h2>
            <p className="text-xs sm:text-sm text-[#615748] max-w-xl">
              Herbal bio-assimilation is maximized when paired with the right carrier liquid (Anupana) and timing.
            </p>
          </div>

          <button
            onClick={onOpenConsultationModal}
            className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-[#14291D] text-white hover:bg-[#234A32] transition-colors self-start md:self-auto shrink-0"
          >
            Custom Dosage Consultation
          </button>
        </div>

        {/* Segmented Guide Tabs */}
        <div className="flex items-center gap-1.5 bg-[#EAE3D4] p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('anupana')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'anupana'
                ? 'bg-white text-[#14291D] shadow-xs'
                : 'text-[#5B5242] hover:text-[#14291D]'
            }`}
          >
            Anupana (Carrier Vehicles)
          </button>
          <button
            onClick={() => setActiveTab('timings')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'timings'
                ? 'bg-white text-[#14291D] shadow-xs'
                : 'text-[#5B5242] hover:text-[#14291D]'
            }`}
          >
            Bheshaja Kaala (Ideal Timings)
          </button>
          <button
            onClick={() => setActiveTab('formulations')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'formulations'
                ? 'bg-white text-[#14291D] shadow-xs'
                : 'text-[#5B5242] hover:text-[#14291D]'
            }`}
          >
            Formulation Quick Reference
          </button>
        </div>

        {/* Tab 1: Anupana Guide */}
        {activeTab === 'anupana' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-xl border border-[#DFD6C6] space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#FAF7F0] text-[#2C5E43] flex items-center justify-center font-serif font-bold text-lg">
                १
              </div>
              <h3 className="font-serif text-lg font-bold text-[#14291D]">
                Warm Cow Milk & Ghee
              </h3>
              <p className="text-xs text-[#524B3F] leading-relaxed">
                Acts as a Medhya & Rasayana carrier. Lipids dissolve fat-soluble alkaloids (like Withanolides in Ashwagandha) and guide herbs into deeper bone marrow and nervous tissues.
              </p>
              <div className="pt-2 border-t border-[#F0EAE0] text-[11px] text-[#2C5E43] font-medium">
                Best For: Ashwagandha, Shilajit, Medicated Tailas, Nerve tonics.
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#DFD6C6] space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#FAF7F0] text-[#2C5E43] flex items-center justify-center font-serif font-bold text-lg">
                २
              </div>
              <h3 className="font-serif text-lg font-bold text-[#14291D]">
                Lukewarm Boiled Water
              </h3>
              <p className="text-xs text-[#524B3F] leading-relaxed">
                Ushnodaka (warm water) ignites gastric Agni and speeds intestinal absorption. It prevents Ama formation and helps cleanse intestinal villi without chilling metabolic fire.
              </p>
              <div className="pt-2 border-t border-[#F0EAE0] text-[11px] text-[#2C5E43] font-medium">
                Best For: Triphala Churna, Hingwashtak, Shallaki Boswellia.
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#DFD6C6] space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#FAF7F0] text-[#2C5E43] flex items-center justify-center font-serif font-bold text-lg">
                ३
              </div>
              <h3 className="font-serif text-lg font-bold text-[#14291D]">
                Pure Raw Honey (Madhu)
              </h3>
              <p className="text-xs text-[#524B3F] leading-relaxed">
                Known as Yogavahi (subtle penetrator). It carries delicate botanical compounds into bronchial mucosal membranes and scrapes accumulated Kapha and phlegm.
              </p>
              <div className="pt-2 border-t border-[#F0EAE0] text-[11px] text-[#2C5E43] font-medium">
                Best For: Sitopaladi Churna, Giloy Swaras, respiratory remedies.
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Timings */}
        {activeTab === 'timings' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-xl border border-[#DFD6C6] space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#8C5D14]">
                <Clock className="w-4 h-4" />
                <span>Pratahkaal (Empty Stomach)</span>
              </div>
              <h3 className="font-serif text-base font-bold text-[#14291D]">
                Morning Wake-Up Phase
              </h3>
              <p className="text-xs text-[#524B3F] leading-relaxed">
                Ideal for cellular detoxifiers and metabolic regulators. The empty digestive tract directly absorbs therapeutic antioxidants and bitter juices.
              </p>
              <span className="text-[11px] text-[#696050] block pt-1 font-medium">
                Formulations: Giloy Swaras, Shilajit, Triphala with warm honey water.
              </span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#DFD6C6] space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#2C5E43]">
                <Clock className="w-4 h-4" />
                <span>Samana (With First Morsel)</span>
              </div>
              <h3 className="font-serif text-base font-bold text-[#14291D]">
                Meal-Time Synchronization
              </h3>
              <p className="text-xs text-[#524B3F] leading-relaxed">
                Taken with the very first bite of lunch or dinner. Blends directly with bolus to ignite sluggish pancreatic enzymes and stop gas formation instantly.
              </p>
              <span className="text-[11px] text-[#696050] block pt-1 font-medium">
                Formulations: Hingwashtak Churna, Avipattikar Churna, Digestive Agni deepana.
              </span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#DFD6C6] space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#183624]">
                <Clock className="w-4 h-4" />
                <span>Nishi (Pre-Bedtime)</span>
              </div>
              <h3 className="font-serif text-base font-bold text-[#14291D]">
                Night Sleep Window
              </h3>
              <p className="text-xs text-[#524B3F] leading-relaxed">
                Consumed 30 to 45 minutes before sleep. Supports natural circadian melatonin modulation, neurological repair, and nocturnal colon evacuation preparation.
              </p>
              <span className="text-[11px] text-[#696050] block pt-1 font-medium">
                Formulations: Ashwagandha KSM-66, Triphala Churna, Kumkumadi topical oil.
              </span>
            </div>
          </div>
        )}

        {/* Tab 3: Formulation Quick Reference */}
        {activeTab === 'formulations' && (
          <div className="bg-white rounded-xl border border-[#DFD6C6] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF7F0] border-b border-[#E3DBD0] text-[#554D3F]">
                    <th className="py-3 px-4 font-semibold">Formulation</th>
                    <th className="py-3 px-4 font-semibold">Primary Uses</th>
                    <th className="py-3 px-4 font-semibold">Standard Dosage</th>
                    <th className="py-3 px-4 font-semibold">Prescribed Anupana</th>
                    <th className="py-3 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFEAE0]">
                  {HERBAL_PRODUCTS.slice(0, 6).map((prod) => (
                    <tr key={prod.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="py-3 px-4 font-semibold text-[#14291D]">
                        {prod.name}
                        <span className="block text-[11px] font-normal italic text-[#6F6656]">
                          {prod.sanskritName}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#473F32] max-w-xs truncate">
                        {prod.keyIndications.join(', ')}
                      </td>
                      <td className="py-3 px-4 font-medium text-[#1E2922]">
                        {prod.dosageAndAnupana.standardDosage}
                      </td>
                      <td className="py-3 px-4 text-[#2C5E43] font-medium">
                        {prod.dosageAndAnupana.anupanaCarrier}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onOpenProductDetail(prod)}
                          className="text-xs font-semibold text-[#183624] hover:underline whitespace-nowrap"
                        >
                          View Monograph →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

import React, { useRef } from 'react';
import { Sparkles, Settings, ShieldCheck, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { SiteSettings, PeopleProfile } from '../types/pharmacy';
import { DEFAULT_SITE_SETTINGS } from '../data/herbalProducts';

interface PeopleSectionProps {
  siteSettings: SiteSettings;
  onOpenConsultationModal?: (doctorName?: string) => void;
  isAdmin?: boolean;
  onOpenAdminPanel?: () => void;
}

export const PeopleSection: React.FC<PeopleSectionProps> = ({
  siteSettings,
  isAdmin = false,
  onOpenAdminPanel,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const rawPeople = siteSettings?.peopleList;
  const people: PeopleProfile[] = Array.isArray(rawPeople) && rawPeople.length > 0
    ? rawPeople
    : (rawPeople && typeof rawPeople === 'object' && Object.values(rawPeople).length > 0
      ? (Object.values(rawPeople) as PeopleProfile[])
      : (DEFAULT_SITE_SETTINGS.peopleList || []));

  if (!people || people.length === 0) return null;

  const badgeText = siteSettings?.peopleBadgeText || 'Certified Ayurvedic Doctors & Formulators';
  const sectionTitle = siteSettings?.peopleSectionTitle || 'Our Ayurvedic Doctors & Formulation Specialists';
  const sectionSubtitle =
    siteSettings?.peopleSectionSubtitle ||
    'Experienced Ayurvedic Doctors & Botanical Formulators guiding your wellness and personalized dosages.';

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section id="people-section" className="bg-linear-to-b from-[#F5EFE6] to-[#FAF8F5] py-8 sm:py-10 px-4 sm:px-6 border-t border-[#DDD5C5] relative overflow-hidden scroll-mt-20">
      <div className="max-w-7xl mx-auto space-y-6 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/10 border border-emerald-900/20 text-[#14291D] text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2C5E43]" />
            <span>{badgeText}</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#14291D] tracking-tight">
            {sectionTitle}
          </h2>

          <p className="text-xs sm:text-sm text-[#5B5141] leading-relaxed">
            {sectionSubtitle}
          </p>

          {isAdmin && onOpenAdminPanel && (
            <div className="pt-1">
              <button
                type="button"
                onClick={onOpenAdminPanel}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-900 text-xs font-semibold hover:bg-amber-500/25 transition-colors cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-amber-700" />
                <span>Manage Doctors / People in Admin Panel</span>
              </button>
            </div>
          )}
        </div>

        {/* Horizontal Swipeable & Scrollable Team Container */}
        <div className="space-y-3">
          <div className="relative group/scroll">
          {/* Scroll Left Button */}
          {people.length > 2 && (
            <button
              type="button"
              onClick={() => handleScroll('left')}
              className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/95 hover:bg-white text-[#14291D] border border-[#DDD5C5] shadow-md items-center justify-center transition-all opacity-80 hover:opacity-100 cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5 text-[#2C5E43]" />
            </button>
          )}

          {/* Horizontal Scroll / Swipe Container */}
          <div
            ref={scrollContainerRef}
            className="flex items-stretch overflow-x-auto gap-4 sm:gap-6 pb-4 pt-1 px-1 scroll-smooth snap-x snap-mandatory touch-pan-x cursor-grab active:cursor-grabbing no-scrollbar"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {people.map((person) => (
              <div
                key={person.id}
                className="w-[280px] sm:w-[320px] md:w-[340px] shrink-0 snap-center bg-white rounded-2xl p-6 border border-[#DDD5C5] shadow-xs hover:shadow-md hover:border-[#2C5E43] transition-all flex flex-col items-center text-center space-y-4 group select-none"
              >
                {/* Round Photo / Avatar */}
                <div className="relative">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-[#2C5E43]/20 group-hover:border-[#2C5E43] transition-colors shadow-md bg-[#FAF8F5] flex items-center justify-center">
                    {person.image ? (
                      <img
                        src={person.image}
                        alt={person.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <User className="w-12 h-12 text-[#2C5E43]" />
                    )}
                  </div>

                  <div className="absolute -bottom-1 -right-1 bg-[#14291D] text-white p-1.5 rounded-full border-2 border-white shadow-xs">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                  </div>
                </div>

                {/* Name and Designation Texts */}
                <div className="space-y-1.5 w-full flex-1 flex flex-col justify-center">
                  <h3 className="font-serif text-lg font-bold text-[#14291D] group-hover:text-[#2C5E43] transition-colors">
                    {person.name}
                  </h3>

                  {/* Role / Designation down to the name */}
                  <p className="text-xs font-semibold text-[#2C5E43] leading-snug">
                    {person.roleOrDesignation}
                  </p>

                  {/* Additional qualification or subtitle down to the name */}
                  {person.qualificationOrExperience && (
                    <p className="text-[11px] text-[#6E6352] leading-relaxed pt-1">
                      {person.qualificationOrExperience}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Scroll Right Button */}
          {people.length > 2 && (
            <button
              type="button"
              onClick={() => handleScroll('right')}
              className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/95 hover:bg-white text-[#14291D] border border-[#DDD5C5] shadow-md items-center justify-center transition-all opacity-80 hover:opacity-100 cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5 text-[#2C5E43]" />
            </button>
          )}
        </div>
      </div>
      </div>
    </section>
  );
};

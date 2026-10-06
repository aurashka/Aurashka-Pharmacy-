import { HerbalProduct, SiteSettings, BannerSliderConfig, ProductHorizontalList } from '../types/pharmacy';

export const HERBAL_PRODUCTS: HerbalProduct[] = [
  {
    id: 'ashwagandha-ksm66',
    name: 'Ashwagandha KSM-66 Gold Extract',
    sanskritName: 'अश्वगंधा चूर्ण / घन सत्व (Withania Somnifera)',
    category: 'mind_sleep',
    categoryLabel: 'Mind, Stress & Sleep',
    form: 'Veg Capsule',
    tagline: 'Standardized 5% Withanolides for deep restorative sleep & stress resilience',
    description: 'A clinical full-spectrum root extract crafted using ancient water-based decoction. Rebalances elevated cortisol, strengthens adrenal reserves, and restores tranquil sleep cycles without grogginess.',
    price: 649,
    mrp: 899,
    resellerPrice: 480,
    sortBadge: 'trending',
    volumeOrWeight: '60 Veg Capsules (500mg each)',
    rating: 4.9,
    reviewsCount: 312,
    inStock: true,
    image: '/src/assets/images/herbal_ashwagandha_1790596671337.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    videoType: 'youtube',
    variants: [
      {
        id: 'ashwa-var-60',
        size: '60',
        unit: 'Capsules',
        price: 649,
        mrp: 899,
        resellerPrice: 480,
        image: '/src/assets/images/herbal_ashwagandha_1790596671337.jpg',
        images: ['/src/assets/images/herbal_ashwagandha_1790596671337.jpg'],
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        videoType: 'youtube',
        inStock: true,
      },
      {
        id: 'ashwa-var-120',
        size: '120',
        unit: 'Capsules',
        price: 1149,
        mrp: 1599,
        resellerPrice: 850,
        image: '/src/assets/images/herbal_ashwagandha_1790596671337.jpg',
        images: ['/src/assets/images/herbal_ashwagandha_1790596671337.jpg'],
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        videoType: 'youtube',
        inStock: true,
      }
    ],
    keyIndications: ['Chronic Mental Fatigue', 'High Cortisol & Anxiety', 'Restless Insomnia', 'Low Stamina & Weakness'],
    detailedUses: {
      primaryBenefits: [
        'Reduces serum cortisol and calms overstimulated sympathetic nervous system',
        'Enhances non-REM deep restorative sleep without morning lethargy',
        'Promotes muscular strength recovery and endurance in active individuals',
        'Improves cognitive clarity, memory retention, and mental focus under pressure'
      ],
      ailmentsTreated: [
        'Anidra (Insomnia & Sleeplessness)',
        'Manodaurbalya (Mental exhaustion & anxiety neurosis)',
        'Kshaya & Dhatukshaya (Debility & tissue depletion)',
        'Vata Vyadhi (Nervous system disorders)'
      ],
      actionMechanism: 'Acts as an adaptogen by modulating the Hypothalamic-Pituitary-Adrenal (HPA) axis and stimulating GABAergic neurotransmission for systemic relaxation.',
      doshaEffect: 'Pacifies Vata and Kapha doshas; mildly nourishes Pitta when taken with cow milk.'
    },
    dosageAndAnupana: {
      standardDosage: '1 to 2 capsules twice daily',
      bestTiming: 'Post breakfast and 45 minutes prior to sleep at night',
      anupanaCarrier: 'Warm whole cow milk with a pinch of nutmeg or lukewarm water',
      duration: 'Recommended continuous course: 8 to 12 weeks for cellular rejuvenation'
    },
    keyIngredients: [
      { herb: 'Ashwagandha Root Extract', botanicalName: 'Withania somnifera (KSM-66)', potencyOrMg: '450 mg', role: 'Full-spectrum adaptogen with >= 5% Withanolides' },
      { herb: 'Pippali Fruit Extract', botanicalName: 'Piper longum', potencyOrMg: '25 mg', role: 'Bio-enhancer (Yogavahi) for cellular bioavailability' },
      { herb: 'Brahmi Leaf Powder', botanicalName: 'Bacopa monnieri', potencyOrMg: '25 mg', role: 'Synergistic Medhya Rasayana for neural tranquility' }
    ],
    precautionsAndContraindications: [
      'Not recommended during active pregnancy without direct obstetrician guidance.',
      'Individuals with severe autoimmune thyroid disorders should monitor levels as Withania mildly stimulates thyroid hormones.',
      'Avoid taking simultaneously with strong pharmaceutical sedatives without medical supervision.'
    ],
    storageGuideline: 'Store in an airtight container below 25°C away from direct sunlight and humidity.',
    ayushLicenseNo: 'AYUSH-DL-2024-HERB-4081',
    batchInfo: 'Batch #ASH-2603 | Mfd: FEB 2026 | Exp: JAN 2028'
  },
  {
    id: 'shilajit-himalayan-resin',
    name: 'Pure Himalayan Shilajit Gold Resin',
    sanskritName: 'शुद्ध शिलाजीत रस (Asphaltum Punjabianum)',
    category: 'vitality',
    categoryLabel: 'Vitality & Stamina',
    form: 'Resin & Lehyam',
    tagline: 'Sun-dried raw resin from 16,000+ ft peaks with >75% Fulvic Acid & 84 minerals',
    description: 'Authentic grade-A semi-solid resin hand-harvested from high Himalayan altitudes. Traditional Surya Tapi method purification with Triphala decoction ensures supreme purity and cellular bio-assimilation.',
    price: 1199,
    mrp: 1599,
    resellerPrice: 890,
    sortBadge: 'top_seller',
    volumeOrWeight: '20g Concentrated Purified Resin',
    rating: 4.95,
    reviewsCount: 540,
    inStock: true,
    image: '/src/assets/images/herbal_shilajit_gold_1790596690367.jpg',
    keyIndications: ['Physical Exhaustion', 'Mitochondrial Energy Depletion', 'Immune Decline', 'Joint & Bone Mineralization'],
    detailedUses: {
      primaryBenefits: [
        'Supplies 84+ essential ionic micro-minerals directly into intracellular pathways',
        'Fulvic acid accelerates mitochondrial ATP production for sustained daily stamina',
        'Accelerates muscle tissue recovery and protects against physical degeneration',
        'Enhances nutrient and oxygen absorption across cell membranes'
      ],
      ailmentsTreated: [
        'Daurbalya (General and chronic debility)',
        'Prameha (Metabolic and urinary imbalances)',
        'Asthi-Kshaya (Bone density and joint cartilage fatigue)',
        'Klaibya (Vitality & reproductive system sluggishness)'
      ],
      actionMechanism: 'Fulvic acid binds deep minerals and transports them directly through lipid bilayers while scavenging harmful intracellular free radicals.',
      doshaEffect: 'Tridosha balancing; specifically neutralizes aggravated Kapha and Vata.'
    },
    dosageAndAnupana: {
      standardDosage: 'Pea-sized portion (300mg to 500mg) once or twice daily',
      bestTiming: 'First thing in the morning on an empty stomach or 1 hr post dinner',
      anupanaCarrier: 'Dissolved in warm milk, green tea, or warm water with a teaspoon of pure honey',
      duration: 'Course of 6 to 8 weeks followed by a 2-week rest window'
    },
    keyIngredients: [
      { herb: 'Shuddha Shilajit Resin', botanicalName: 'Purified Asphaltum', potencyOrMg: '980 mg/g', role: 'Pure fulvic mineral pitch containing humic acids' },
      { herb: 'Swarna Bhasma (Gold Calcined)', botanicalName: 'Aurum Calx', potencyOrMg: '20 mcg/g', role: 'Traditional Rasayana amplifier for deep tissue rejuvenation' }
    ],
    precautionsAndContraindications: [
      'Do not consume with raw horse gram (Kulathi) or citrus foods immediately before or after.',
      'Contraindicated in patients with active hyperuricemia (excessive uric acid or gout flare-up).',
      'Always use the provided brass spoon; do not use wet utensils in the jar.'
    ],
    storageGuideline: 'Keep jar tightly sealed in a cool, dry place. Resin naturally softens in warmth and hardens in cold.',
    ayushLicenseNo: 'AYUSH-UK-2023-AYUR-8921',
    batchInfo: 'Batch #SHL-2601 | Mfd: JAN 2026 | Exp: DEC 2028'
  },
  {
    id: 'triphala-churna-organic',
    name: 'Triphala Organic Digestive & Colon Churna',
    sanskritName: 'त्रिफला दिव्य चूर्ण (Haritaki, Bibhitaki, Amalaki)',
    category: 'digestion',
    categoryLabel: 'Digestive & Gut Health',
    form: 'Churna (Powder)',
    tagline: 'Classical equal-ratio Rasayana for gentle bowel cleansing and ocular health',
    description: 'Traditional Ayurvedic digestive triad prepared from organically wild-crafted Amla, Haritaki, and Bibhitaki. Gently detoxifies the gastrointestinal tract, supports healthy gut flora, and prevents chronic sluggish digestion without creating laxative dependence.',
    price: 299,
    mrp: 399,
    resellerPrice: 210,
    sortBadge: 'best_deal',
    volumeOrWeight: '250g Micro-Pulverized Powder',
    rating: 4.85,
    reviewsCount: 428,
    inStock: true,
    image: '/src/assets/images/herbal_triphala_powder_1790596702077.jpg',
    keyIndications: ['Chronic Constipation', 'Acidity & Bloating', 'Toxin Accumulation (Ama)', 'Eye Strain & Vision Fatigue'],
    detailedUses: {
      primaryBenefits: [
        'Regulates normal peristaltic bowel movement without causing cramping',
        'Rich natural Vitamin C content strengthens gut microbiome lining',
        'Eliminates metabolic toxins (Ama) from intestinal villi and colon walls',
        'Classical Netra-prasadana (supports optical clarity and relieves digital eye fatigue)'
      ],
      ailmentsTreated: [
        'Vibandha (Constipation and irregular bowel motions)',
        'Ajeerna & Agnimandya (Indigestion and sluggish metabolic fire)',
        'Netra Roga (Ocular tiredness and inflammatory irritation)',
        'Twak Vikara (Skin impurities triggered by systemic gut toxemia)'
      ],
      actionMechanism: 'Combines five of the six Ayurvedic tastes (Rasa). Mild anthraquinones stimulate bowel tone while tannins tone mucous membranes.',
      doshaEffect: 'Supreme Tridosha balance (Amalaki calms Pitta, Haritaki calms Vata, Bibhitaki calms Kapha).'
    },
    dosageAndAnupana: {
      standardDosage: '1 full teaspoon (3g to 5g) once daily',
      bestTiming: 'At bedtime with warm water, or morning on empty stomach with honey',
      anupanaCarrier: 'Warm water (for digestion) or Pure raw honey (for metabolic tonification)',
      duration: 'Safe for daily use or periodic 90-day seasonal rejuvenation'
    },
    keyIngredients: [
      { herb: 'Amalaki (Indian Gooseberry)', botanicalName: 'Emblica officinalis', potencyOrMg: '33.33%', role: 'Rich antioxidant, Pitta cooler and tissue nourisher' },
      { herb: 'Haritaki (Chebulic Myrobalan)', botanicalName: 'Terminalia chebula', potencyOrMg: '33.33%', role: 'Regulates Vata, cleanses gastrointestinal tract' },
      { herb: 'Bibhitaki (Belliric Myrobalan)', botanicalName: 'Terminalia bellirica', potencyOrMg: '33.33%', role: 'Purges accumulated Kapha and mucus from bowel' }
    ],
    precautionsAndContraindications: [
      'Not indicated for individuals suffering from acute dehydrating watery diarrhea.',
      'Pregnant women should avoid high cleansing doses without Doctor consultation.',
      'Take with warm water, never iced or refrigerated beverages.'
    ],
    storageGuideline: 'Reseal moisture-lock pouch tightly after each use. Store away from steam.',
    ayushLicenseNo: 'AYUSH-HP-2022-POWD-1984',
    batchInfo: 'Batch #TPH-2604 | Mfd: MAR 2026 | Exp: FEB 2028'
  },
  {
    id: 'kumkumadi-tailam-kashmiri',
    name: 'Kashmiri Kumkumadi Tailam Saffron Elixir',
    sanskritName: 'कुंकुमादि तैलम् (Classical Astanga Hridaya Formula)',
    category: 'skin_hair',
    categoryLabel: 'Skin & Hair Wellness',
    form: 'Taila (Oil)',
    tagline: 'Infused with authentic Grade-1 Kashmiri Mongra Saffron, Red Sandalwood & Lotus',
    description: 'An iconic 26-herb micro-emulsified Ayurvedic beauty nectar slow-cooked in pure goat milk and sesame oil. Visibly fades dark spots, restores natural epidermal glow, repairs UV photo-damage, and refines skin texture.',
    price: 849,
    mrp: 1199,
    resellerPrice: 620,
    sortBadge: 'featured',
    volumeOrWeight: '30ml Dropper Bottle',
    rating: 4.9,
    reviewsCount: 285,
    inStock: true,
    image: '/src/assets/images/herbal_kumkumadi_oil_1790596715634.jpg',
    keyIndications: ['Hyperpigmentation & Blemishes', 'Dull & Fatigued Complexion', 'Fine Lines & Dryness', 'Acne Scars & Sun Tan'],
    detailedUses: {
      primaryBenefits: [
        'Crocetin in saffron stimulates micro-capillary circulation for radiant skin tone',
        'Significantly fades melanin clusters, post-inflammatory acne marks and age spots',
        'Deeply penetrates the lipid barrier to prevent transepidermal water loss',
        'Soothes skin redness and calms sub-clinical facial inflammation'
      ],
      ailmentsTreated: [
        'Vyanga (Facial pigmentation, melasma and dark patches)',
        'Nilika (Dark shadows and under-eye discoloration)',
        'Mukhadushika (Residual marks from acne pimples)',
        'Vali & Palita (Premature skin aging and loss of luster)'
      ],
      actionMechanism: 'Slow Ayurvedic decoction (Sneha Kalpana) preserves lipid-soluble antioxidants, allowing deep dermis penetration rather than sitting on surface.',
      doshaEffect: 'Pacifies aggravated Pitta and Vata on the dermal surface.'
    },
    dosageAndAnupana: {
      standardDosage: '3 to 5 drops on cleansed, slightly damp face and neck',
      bestTiming: 'Nightly application before sleeping; allow absorption for 30 minutes',
      anupanaCarrier: 'Topical application; for very oily skin mix with pure Rose Water',
      duration: 'Noticeable brightening within 14 to 21 days of disciplined application'
    },
    keyIngredients: [
      { herb: 'Kashmiri Mongra Saffron', botanicalName: 'Crocus sativus', potencyOrMg: '1.25%', role: 'Varnya (Complexion enhancer) and cellular brightener' },
      { herb: 'Rakta Chandana (Red Sandal)', botanicalName: 'Pterocarpus santalinus', potencyOrMg: '2.50%', role: 'Cools Pitta, clears epidermal heat and blemishes' },
      { herb: 'Manjistha Root', botanicalName: 'Rubia cordifolia', potencyOrMg: '2.50%', role: 'Renowned Ayurvedic blood purifier and lymph cleanser' },
      { herb: 'Lotus Stamen & Licorice', botanicalName: 'Nelumbo nucifera & Glycyrrhiza glabra', potencyOrMg: '2.00%', role: 'Inhibits tyrosinase, evens overall dermal tone' }
    ],
    precautionsAndContraindications: [
      'For external dermal application only. Avoid direct contact with ocular eyes.',
      'Those with active cystic acne and excessive sebum should limit to 2 drops mixed with aloe gel.',
      'Perform a 24-hr patch test on inner wrist before initial facial application.'
    ],
    storageGuideline: 'Keep in the amber glass bottle away from direct sunlight to protect saffron compounds.',
    ayushLicenseNo: 'AYUSH-JK-2023-TAIL-3320',
    batchInfo: 'Batch #KMK-2602 | Mfd: FEB 2026 | Exp: JAN 2028'
  },
  {
    id: 'sitopaladi-churna-herbal',
    name: 'Sitopaladi Churna Respiratory & Throat Shield',
    sanskritName: 'सितोपलादि दिव्य चूर्ण (Sharangadhara Samhita Formula)',
    category: 'immunity',
    categoryLabel: 'Immunity & Respiratory',
    form: 'Churna (Powder)',
    tagline: 'Classical soothing formulation for dry & productive cough, chest congestion & sore throat',
    description: 'An ancient, universally trusted Ayurvedic remedy featuring pure Rock Sugar (Mishri), Bamboo silica (Vanshlochan), Pippali, Cardamom, and Ceylon Cinnamon. Liquefies hardened phlegm, soothes inflamed bronchial passages, and relieves tickling throat irritation.',
    price: 249,
    mrp: 320,
    resellerPrice: 175,
    sortBadge: 'trending',
    volumeOrWeight: '100g Fine Botanical Churna',
    rating: 4.88,
    reviewsCount: 390,
    inStock: true,
    image: '/src/assets/images/herbal_triphala_powder_1790596702077.jpg',
    keyIndications: ['Allergic & Seasonal Cough', 'Throat Rawness & Hoarseness', 'Chest Congestion', 'Post-Flu Respiratory Weakness'],
    detailedUses: {
      primaryBenefits: [
        'Acts as an effective expectorant to ease productive and dry bronchial coughs',
        'Vanshlochan provides natural bio-silica that fortifies lung epithelial tissue',
        'Cardamom and cinnamon provide antimicrobial volatile oils that relieve throat tickle',
        'Supports natural immune response during seasonal weather shifts and pollen spikes'
      ],
      ailmentsTreated: [
        'Kasa (Acute and chronic coughs)',
        'Shwasa (Bronchial constriction and breathlessness)',
        'Kanthashosha (Extreme dry throat and burning sensation)',
        'Mandagni with Kapha (Chest heaviness accompanied by loss of appetite)'
      ],
      actionMechanism: 'Synergistic bronchodilatory action combined with demulcent natural sugars creates a mucosal coating on sensitized pharyngeal walls.',
      doshaEffect: 'Balances Kapha and Vata in the thoracic cavity (Uras).'
    },
    dosageAndAnupana: {
      standardDosage: 'Half to one teaspoon (2g to 3g) 2 to 3 times a day',
      bestTiming: 'Slowly licked after meals or whenever throat coughing spasm strikes',
      anupanaCarrier: 'Thoroughly mixed with 1 teaspoon of raw honey and 1/2 tsp of pure cow ghee',
      duration: '3 to 7 days during acute symptoms, or 3 weeks for recurrent respiratory allergies'
    },
    keyIngredients: [
      { herb: 'Sitopala (Crystal Rock Sugar)', botanicalName: 'Saccharum officinarum', potencyOrMg: '51.6%', role: 'Demulcent base that pacifies burning sensation and cough' },
      { herb: 'Vanshlochan (Bamboo Manna)', botanicalName: 'Bambusa arundinacea', potencyOrMg: '25.8%', role: 'Rich bio-silica that tones weak lung parenchyma' },
      { herb: 'Pippali (Long Pepper)', botanicalName: 'Piper longum', potencyOrMg: '12.9%', role: 'Clears accumulated mucous and restores respiratory fire' },
      { herb: 'Ela (Cardamom) & Twak (Cinnamon)', botanicalName: 'Elettaria cardamomum & Cinnamomum', potencyOrMg: '9.7%', role: 'Carminative antimicrobials that open airways' }
    ],
    precautionsAndContraindications: [
      'Contains natural unrefined rock candy; diabetic patients should consult their Doctor.',
      'Do not drink chilled water immediately after consuming this herbal paste.',
      'Safe for children above 3 years in half the adult dosage.'
    ],
    storageGuideline: 'Keep in an airtight jar. Protect from airborne humidity to prevent caking.',
    ayushLicenseNo: 'AYUSH-UK-2022-CHUR-5510',
    batchInfo: 'Batch #STP-2603 | Mfd: MAR 2026 | Exp: FEB 2028'
  },
  {
    id: 'mahanarayan-taila-joint-oil',
    name: 'Mahanarayan Taila Joint & Muscle Liniment',
    sanskritName: 'महानारायण तैलम् (Bhaishajya Ratnavali)',
    category: 'joint_pain',
    categoryLabel: 'Joint & Pain Relief',
    form: 'Taila (Oil)',
    tagline: '54-herb potent classical liniment for arthritis, knee stiffness, sciatica & backache',
    description: 'A legendary neuromuscular formulation processed with Dashamoola roots, Ashwagandha, Bala, Shatavari, and camphor in cold-pressed sesame oil. Deeply lubricates dehydrated synovial joints, relieves morning stiffness, and eases chronic sciatic nerve tension.',
    price: 389,
    mrp: 499,
    resellerPrice: 285,
    sortBadge: 'top_seller',
    volumeOrWeight: '200ml Amber Glass Dispenser',
    rating: 4.92,
    reviewsCount: 367,
    inStock: true,
    image: '/src/assets/images/herbal_kumkumadi_oil_1790596715634.jpg',
    keyIndications: ['Knee Osteoarthritis', 'Lower Back Stiffness (Lumbago)', 'Sciatic Nerve Pain', 'Frozen Shoulder & Muscular Cramps'],
    detailedUses: {
      primaryBenefits: [
        'Improves synovial fluid nourishment and reduces joint friction during movement',
        'Eases chronic muscle spasms and tightness after physical exertion',
        'Penetrates deep connective tissue to reduce local prostaglandins and inflammation',
        'Restores mobility and flexion in aging joints affected by Vata dryness'
      ],
      ailmentsTreated: [
        'Sandhigata Vata (Osteoarthritis and degenerative joint disease)',
        'Amavata (Rheumatoid joint stiffness and inflammation)',
        'Gridhrasi (Sciatica and radiating nerve discomfort)',
        'Katishoola (Chronic lumbar lower back strain)'
      ],
      actionMechanism: 'Sesamol carriers in til oil transport anti-inflammatory triterpenes directly into peri-articular capsules and tendons.',
      doshaEffect: 'Supreme pacifier of aggravated Vata dosha in bones, joints and nervous tissues.'
    },
    dosageAndAnupana: {
      standardDosage: '10ml to 15ml warmed oil massaged gently over affected area',
      bestTiming: 'Morning before warm bath or evening before sleeping',
      anupanaCarrier: 'External abhyanga massage followed by gentle warm water fermentation (Fomentation/Swedana)',
      duration: 'Regular application for 4 to 8 weeks for sustained joint comfort'
    },
    keyIngredients: [
      { herb: 'Dashamoola (10 Sacred Roots)', botanicalName: 'Classical Ayurvedic Compound', potencyOrMg: '30%', role: 'Supreme natural anti-inflammatory and nerve toner' },
      { herb: 'Bala & Ashwagandha', botanicalName: 'Sida cordifolia & Withania somnifera', potencyOrMg: '25%', role: 'Strengthens peri-articular ligaments and muscles' },
      { herb: 'Rasna & Castor Root', botanicalName: 'Pluchea lanceolata & Ricinus communis', potencyOrMg: '15%', role: 'Disperses deep trapped Vata gas and joint stiffness' },
      { herb: 'Karpoora (Camphor) & Sesame Oil', botanicalName: 'Cinnamomum camphora in Sesamum indicum', potencyOrMg: '30%', role: 'Stimulates vascular warmth and aids absorption' }
    ],
    precautionsAndContraindications: [
      'Strictly for external dermal massage. Do not ingest.',
      'Do not apply on open bleeding wounds, active burns, or infected skin rashes.',
      'For best results, warm the oil bottle in a bowl of warm water before massage.'
    ],
    storageGuideline: 'Keep bottle capped tightly at room temperature away from drafts.',
    ayushLicenseNo: 'AYUSH-RJ-2023-TAIL-7744',
    batchInfo: 'Batch #MNT-2601 | Mfd: JAN 2026 | Exp: DEC 2028'
  },
  {
    id: 'brahmi-shankhpushpi-syrup',
    name: 'Brahmi & Shankhpushpi Medhya Rasayan',
    sanskritName: 'ब्राह्मी शंखपुष्पी मेध्य रसायन (Charaka Samhita)',
    category: 'mind_sleep',
    categoryLabel: 'Mind, Stress & Sleep',
    form: 'Swaras & Asava (Liquid)',
    tagline: 'Classical botanical brain tonic for memory, exam focus, ADHD & nervous exhaustion',
    description: 'A pure botanical nootropic elixir blending fresh Brahmi swaras with whole Shankhpushpi, Jyotishmati, and Gotu Kola. Supports neurotransmitter synthesis, mental stamina for students and professionals, and calms racing thoughts without sedation.',
    price: 320,
    mrp: 420,
    resellerPrice: 230,
    sortBadge: 'featured',
    volumeOrWeight: '300ml Glass Bottle',
    rating: 4.82,
    reviewsCount: 198,
    inStock: true,
    image: '/src/assets/images/herbal_ashwagandha_1790596671337.jpg',
    keyIndications: ['Mental Burnout & Brain Fog', 'Attention Span & Focus Struggles', 'Exam Stress in Students', 'Age-Associated Memory Sluggishness'],
    detailedUses: {
      primaryBenefits: [
        'Bacosides in Brahmi stimulate synaptogenesis and neuronal communication',
        'Reduces mental fatigue during prolonged cognitive work or studying',
        'Calms obsessive overthinking and somatic anxiety manifestations',
        'Promotes neurological stability and serene daytime alertness'
      ],
      ailmentsTreated: [
        'Smriti-bhramsha (Memory impairment and forgetfulness)',
        'Chittodvega (Restless anxiety and agitation)',
        'Shiroroga (Tension headaches related to mental overexertion)',
        'Medha Kshaya (Loss of intellectual stamina)'
      ],
      actionMechanism: 'Protects cholinergic neurons against oxidative stress and optimizes cerebral blood micro-perfusion.',
      doshaEffect: 'Cools excess Pitta in the brain (Sadhaka Pitta) and steadies Prana Vata.'
    },
    dosageAndAnupana: {
      standardDosage: '10ml to 15ml (2 to 3 teaspoons) twice daily',
      bestTiming: 'Morning after breakfast and late afternoon around 4 PM',
      anupanaCarrier: 'Mixed with equal quantity of normal drinking water or lukewarm milk',
      duration: 'Continuous usage for 60 to 90 days recommended for optimal brain plastic adaptation'
    },
    keyIngredients: [
      { herb: 'Brahmi Fresh Extract', botanicalName: 'Bacopa monnieri', potencyOrMg: '35%', role: 'Medhya herb that supports synaptic plasticity' },
      { herb: 'Shankhpushpi Whole Plant', botanicalName: 'Convolvulus pluricaulis', potencyOrMg: '30%', role: 'Nervine calmative that balances nervous tension' },
      { herb: 'Jyotishmati (Malkangani)', botanicalName: 'Celastrus paniculatus', potencyOrMg: '10%', role: 'Sharpens intellect and cognitive recall speed' },
      { herb: 'Jatamansi & Ashwagandha', botanicalName: 'Nardostachys jatamansi & Withania', potencyOrMg: '25%', role: 'Stabilizes emotional balance and reduces mental friction' }
    ],
    precautionsAndContraindications: [
      'Contains organic raw sugar base; diabetics should opt for our Brahmi Vati tablets instead.',
      'Safe for children 7 years and older at half the adult dose.',
      'Shake well before each use as natural herbal sediments settle at the bottom.'
    ],
    storageGuideline: 'Store in a cool dry cabinet. Refrigerate after opening during summer months.',
    ayushLicenseNo: 'AYUSH-PB-2023-SYR-6629',
    batchInfo: 'Batch #BRH-2602 | Mfd: FEB 2026 | Exp: JAN 2028'
  },
  {
    id: 'shallaki-boswellia-curcumin',
    name: 'Shallaki Boswellia & Curcumin Joint Vati',
    sanskritName: 'शल्लकी गुग्गुलु एवं हरिद्रा घनवटी',
    category: 'joint_pain',
    categoryLabel: 'Joint & Pain Relief',
    form: 'Vati / Tablet',
    tagline: 'Standardized 65% Boswellic acids with 95% Curcumin for bone & cartilage flexibility',
    description: 'Synergistic herbal anti-inflammatory tablets combining high-potency Frankincense (Shallaki) gum with bio-optimized Curcumin. Blocks 5-LOX inflammatory cascades, protects articular cartilage from breakdown, and alleviates morning stiffness.',
    price: 520,
    mrp: 699,
    resellerPrice: 380,
    sortBadge: 'best_deal',
    volumeOrWeight: '60 Coated Herbal Tablets',
    rating: 4.87,
    reviewsCount: 245,
    inStock: true,
    image: '/src/assets/images/herbal_triphala_powder_1790596702077.jpg',
    keyIndications: ['Joint Inflammation & Swelling', 'Morning Joint Rigidity', 'Cartilage Wear and Tear', 'Neck & Spinal Stiffness'],
    detailedUses: {
      primaryBenefits: [
        'Specifically inhibits 5-lipoxygenase (5-LOX) to curtail joint inflammatory cycles',
        'Preserves glycosaminoglycan synthesis to sustain healthy cartilage matrix',
        'Reduces swelling and synovial effusion in weight-bearing knees and hips',
        'Enhances pain-free walking distance and climbing comfort in elders'
      ],
      ailmentsTreated: [
        'Sandhivata (Joint degradation and osteo-structural pain)',
        'Mamsagata Vata (Deep muscular pain and myofascial triggers)',
        'Asthigata Vata (Deep bone ache and cartilage depletion)'
      ],
      actionMechanism: 'AKBA (acetyl-11-keto-beta-boswellic acid) directly halts leukotriene biosynthesis without the gastric ulceration associated with synthetic NSAIDs.',
      doshaEffect: 'Pacifies Vata and Kapha while preventing Pitta accumulation in joints.'
    },
    dosageAndAnupana: {
      standardDosage: '1 tablet twice daily with food',
      bestTiming: 'Directly after breakfast and dinner',
      anupanaCarrier: 'Lukewarm water with a tiny pinch of dry ginger or warm milk',
      duration: 'Recommended 8 to 16 week regimen for restorative joint comfort'
    },
    keyIngredients: [
      { herb: 'Shallaki Gum Resin Extract', botanicalName: 'Boswellia serrata (65% Acids)', potencyOrMg: '400 mg', role: 'Cartilage protector and natural leukotriene inhibitor' },
      { herb: 'Haridra (Curcumin Extract)', botanicalName: 'Curcuma longa (95% Curcuminoids)', potencyOrMg: '100 mg', role: 'Potent systemic antioxidant and swelling alleviator' },
      { herb: 'Maricha (Black Pepper)', botanicalName: 'Piper nigrum', potencyOrMg: '10 mg', role: 'Increases curcumin bioavailability by up to 2000%' }
    ],
    precautionsAndContraindications: [
      'Consult physician if taking blood-thinning anticoagulant medications simultaneously.',
      'Take strictly after meals to ensure optimal gastrointestinal comfort.',
      'Not recommended during pregnancy without prior medical evaluation.'
    ],
    storageGuideline: 'Keep bottle tightly sealed in a dry area below 30°C.',
    ayushLicenseNo: 'AYUSH-GJ-2024-TAB-1192',
    batchInfo: 'Batch #SHK-2603 | Mfd: MAR 2026 | Exp: FEB 2028'
  },
  {
    id: 'avipattikar-churna-hyperacidity',
    name: 'Avipattikar Churna Hyperacidity & Heartburn Relief',
    sanskritName: 'अविपत्तिकर चूर्ण (Bhaishajya Ratnavali Amla-Pitta Chikitsa)',
    category: 'digestion',
    categoryLabel: 'Digestive & Gut Health',
    form: 'Churna (Powder)',
    tagline: 'Classical botanical antacid for severe acid reflux, burning chest & sour eructation',
    description: 'An authoritative classical preparation featuring Nishoth, Clove, Cardamom, and Triphala specifically formulated for aggravated Pitta in the stomach. Neutralizes excessive gastric hydrochloric acid, clears bile reflux, and soothes eroded stomach mucosa without causing rebound acidity.',
    price: 260,
    mrp: 340,
    resellerPrice: 180,
    sortBadge: 'trending',
    volumeOrWeight: '120g Herbal Powder',
    rating: 4.86,
    reviewsCount: 310,
    inStock: true,
    image: '/src/assets/images/herbal_triphala_powder_1790596702077.jpg',
    keyIndications: ['Acid Reflux & GERD', 'Heartburn & Sour Burps', 'Burning Epigastric Pain', 'Nausea Triggered by Excess Pitta'],
    detailedUses: {
      primaryBenefits: [
        'Neutralizes excessive hyperchlorhydria and soothes esophageal lining',
        'Clears bitter-sour regurgitation after heavy or spicy meals',
        'Promotes gentle downward movement of Pitta through the intestines',
        'Relieves headache and irritability caused by suppressed stomach bile'
      ],
      ailmentsTreated: [
        'Amlapitta (Hyperacidity, gastritis and acid reflux)',
        'Daha (Burning sensation in chest, throat and stomach)',
        'Vibandha with Pitta (Constipation complicated by dry heat in intestines)',
        'Chhardi (Nausea and bile-vomiting tendencies)'
      ],
      actionMechanism: 'Mild downward laxative action of Nishoth expels stagnant acidic toxins (Vidagdha Pitta) out through the lower bowel.',
      doshaEffect: 'Strong pacifier of aggressive Pitta dosha; harmonizes Samana Vata.'
    },
    dosageAndAnupana: {
      standardDosage: '1 flat teaspoon (3g to 5g) twice daily',
      bestTiming: 'Right before main meals or at bedtime if nighttime reflux occurs',
      anupanaCarrier: 'Cool water or fresh tender coconut water; avoid hot water with this formula',
      duration: 'Take for 2 to 4 weeks during acute flare-ups; maintain healthy diet'
    },
    keyIngredients: [
      { herb: 'Trivrit (Nishoth)', botanicalName: 'Operculina turpethum', potencyOrMg: '44%', role: 'Gentle virechana herb that clears trapped acidic bile' },
      { herb: 'Lavanga (Clove)', botanicalName: 'Syzygium aromaticum', potencyOrMg: '8%', role: 'Calms spasmodic gastric cramps and settles nausea' },
      { herb: 'Triphala & Trikatu', botanicalName: 'Classical Herbal Triads', potencyOrMg: '28%', role: 'Balances digestive enzymes without overheating stomach' },
      { herb: 'Sharkara (Unrefined Sugar)', botanicalName: 'Saccharum base', potencyOrMg: '20%', role: 'Cools gastric heat and shields vulnerable epithelial lining' }
    ],
    precautionsAndContraindications: [
      'Not suitable during episodes of loose bowels or infectious diarrhea.',
      'Those with diabetes should check with their doctor due to herbal cane sugar content.',
      'Avoid consuming spicy, deeply fried, or stale fermented foods while taking this medicine.'
    ],
    storageGuideline: 'Keep pouch hermetically sealed in a dry pantry.',
    ayushLicenseNo: 'AYUSH-MP-2023-CHUR-4819',
    batchInfo: 'Batch #AVP-2601 | Mfd: JAN 2026 | Exp: DEC 2027'
  },
  {
    id: 'giloy-tulsi-neem-swaras',
    name: 'Giloy, Tulsi & Neem Immune Elixir (Amrita Swaras)',
    sanskritName: 'अमृता तुलसी निम्ब शुद्ध स्वरस (Pramathi Rasayana)',
    category: 'immunity',
    categoryLabel: 'Immunity & Respiratory',
    form: 'Swaras & Asava (Liquid)',
    tagline: 'Fresh cold-pressed botanical juice for platelet boost, seasonal fever & blood purification',
    description: 'Cold-extracted pure therapeutic juice of freshly harvested Neem Giloy (Tinospora cordifolia grown on Neem trees for maximum bitter alkaloid potency), Rama Tulsi, and Neem leaves. Eliminates deep cellular toxins, balances recurrent pyrexia, and boosts natural killer cell activity.',
    price: 280,
    mrp: 360,
    resellerPrice: 200,
    sortBadge: 'new_launch',
    volumeOrWeight: '500ml Fresh Botanical Extract',
    rating: 4.89,
    reviewsCount: 374,
    inStock: true,
    image: '/src/assets/images/herbal_ashwagandha_1790596671337.jpg',
    keyIndications: ['Recurrent Seasonal Viral Fevers', 'Low Platelet Count Recovery', 'Skin Boils & Blood Impurities', 'Immune Sluggishness'],
    detailedUses: {
      primaryBenefits: [
        'Naturally boosts white blood cells and supports platelet count regeneration',
        'Reduces chronic low-grade fatigue and post-viral physical weakness',
        'Cleanses lymphatic circulation and clears recurring skin breakouts',
        'Potent immunomodulator that trains adaptive immune defenses'
      ],
      ailmentsTreated: [
        'Jwara (Recurrent viral, seasonal or intermittent fevers)',
        'Rakta-dushti (Impure blood manifested as boils, acne and rashes)',
        'Yakrit-pleeha vriddhi (Sluggish liver and spleen metabolic stress)',
        'Ama-jwara (Fever stemming from metabolic indigestion)'
      ],
      actionMechanism: 'Alkaloids like berberine and tinosporin stimulate macrophage phagocytosis and downregulate pro-inflammatory cytokines.',
      doshaEffect: 'Tridosha shamaka; especially reduces fiery Pitta and toxic Kapha.'
    },
    dosageAndAnupana: {
      standardDosage: '20ml to 30ml diluted in half a glass of water',
      bestTiming: 'First thing in the morning on an empty stomach',
      anupanaCarrier: 'Normal room-temperature water or mixed with 1 tsp raw honey if taste is too bitter',
      duration: '15 to 30 days for immune defense cycle or fever convalescence'
    },
    keyIngredients: [
      { herb: 'Neem-Grown Giloy (Guduchi)', botanicalName: 'Tinospora cordifolia', potencyOrMg: '60%', role: 'Supreme Jwarahara (fever alleviator) and immune tonic' },
      { herb: 'Rama & Krishna Tulsi', botanicalName: 'Ocimum sanctum', potencyOrMg: '25%', role: 'Respiratory antiseptic and cellular adaptogen' },
      { herb: 'Fresh Neem Leaves', botanicalName: 'Azadirachta indica', potencyOrMg: '15%', role: 'Deep bitter detoxifier and antimicrobial blood cleanser' }
    ],
    precautionsAndContraindications: [
      'Naturally very bitter in taste; dilution in water is strongly recommended.',
      'Diabetic individuals taking prescription insulin should monitor blood sugars as Giloy has mild hypoglycemic properties.',
      'Safe for seniors and adults; not recommended for infants under 5 years.'
    ],
    storageGuideline: 'Keep bottle refrigerated once opened and consume within 30 days.',
    ayushLicenseNo: 'AYUSH-HR-2023-SWR-8812',
    batchInfo: 'Batch #GLY-2603 | Mfd: MAR 2026 | Exp: FEB 2028'
  },
  {
    id: 'bhringraj-kesh-tailam',
    name: 'Bhringraj & Brahmi Scalp & Kesh Vitalizer',
    sanskritName: 'भृंगराज महाकेश तैलम् (Keshya Rasayana Formula)',
    category: 'skin_hair',
    categoryLabel: 'Skin & Hair Wellness',
    form: 'Taila (Oil)',
    tagline: 'Kshirapaka processed organic oil for severe hair fall, premature graying & deep scalp calm',
    description: 'Authentic 18-herb traditional hair elixir prepared by slow-simmering wild False Daisy (Bhringraj - "King of Hair") in pure sesame and coconut oils infused with goat milk. Strengthens hair roots at follicular level, delays premature greying, and relaxes mental stress during bedtime head massage.',
    price: 490,
    mrp: 650,
    resellerPrice: 350,
    sortBadge: 'top_seller',
    volumeOrWeight: '200ml Glass Bottle with Comb Applicator',
    rating: 4.88,
    reviewsCount: 226,
    inStock: true,
    image: '/src/assets/images/herbal_kumkumadi_oil_1790596715634.jpg',
    keyIndications: ['Excessive Hair Fall & Thinning', 'Premature Greying (Akala Palitya)', 'Scalp Flakes & Dry Itch', 'Night Head Heat & Insomnia'],
    detailedUses: {
      primaryBenefits: [
        'Prolongs the anagen (growth) phase of hair follicles to reduce active shedding',
        'Nourishes dormant hair roots and stimulates fresh new growth along hairline',
        'Melanin-supporting herbs protect natural dark pigment against oxidation',
        'Massaged on scalp, it induces deep soothing relaxation and clears head heaviness'
      ],
      ailmentsTreated: [
        'Khalitya (Premature hair fall and diffuse alopecia)',
        'Palitya (Early greying caused by excess scalp Pitta heat)',
        'Darunaka (Dandruff and scalp fungal irritation)',
        'Shiroruk (Headaches arising from ocular tension or lack of sleep)'
      ],
      actionMechanism: 'Ecliptine and wedelolactone stimulate dermal papilla cells and enhance local blood flow to follicular roots.',
      doshaEffect: 'Cools scalp Pitta and grounds restless Prana Vata.'
    },
    dosageAndAnupana: {
      standardDosage: '10ml to 15ml gently massaged with fingertips or comb applicator',
      bestTiming: '2 to 3 times weekly; leave on overnight or minimum 2 hours prior to herbal shampoo',
      anupanaCarrier: 'Direct scalp massage (Shiroabhyanga); best paired with gentle circular motions',
      duration: 'Visible reduction in hair fall in 4 to 6 weeks of consistent use'
    },
    keyIngredients: [
      { herb: 'Bhringraj (False Daisy)', botanicalName: 'Eclipta alba', potencyOrMg: '40%', role: 'Classical Keshya Rasayana for follicle strength' },
      { herb: 'Amla & Brahmi', botanicalName: 'Emblica officinalis & Bacopa monnieri', potencyOrMg: '25%', role: 'High Vitamin C and mental coolant for scalp' },
      { herb: 'Gunja & Mulethi', botanicalName: 'Abrus precatorius & Glycyrrhiza glabra', potencyOrMg: '15%', role: 'Stimulates micro-circulation in thinning patches' },
      { herb: 'Cold Pressed Sesame & Coconut Oil', botanicalName: 'Til & Narikela base', potencyOrMg: '20%', role: 'Deeply conditioning herbal carrier base' }
    ],
    precautionsAndContraindications: [
      'For external scalp and hair use only.',
      'In winter, oil may naturally solidify due to pure coconut oil base; place bottle in warm water to liquefy.',
      'Wash hair using chemical-free herbal shikakai/reetha for best sustained results.'
    ],
    storageGuideline: 'Store in a cool dry area away from direct heat.',
    ayushLicenseNo: 'AYUSH-MH-2023-TAIL-9021',
    batchInfo: 'Batch #BHR-2601 | Mfd: JAN 2026 | Exp: DEC 2027'
  },
  {
    id: 'hingwashtak-churna-gas-bloat',
    name: 'Hingwashtak Churna Carminative & Agni Deepan',
    sanskritName: 'हिंग्वाष्टक दिव्य चूर्ण (Ashtangahridayam Agni Dipana)',
    category: 'digestion',
    categoryLabel: 'Digestive & Gut Health',
    form: 'Churna (Powder)',
    tagline: 'Pure roasted Asafoetida (Hing) & 7 digestive spices for severe gas, bloating & colic',
    description: 'The definitive classical remedy for sluggish metabolism (Mandaagni), heavy post-meal bloating, intestinal flatulence, and abdominal distension. Processed with pure roasted Hing (Asafoetida) that breaks up stubborn trapped gas and restores healthy digestive fire.',
    price: 210,
    mrp: 280,
    resellerPrice: 145,
    sortBadge: 'best_deal',
    volumeOrWeight: '100g Airtight Tin',
    rating: 4.84,
    reviewsCount: 180,
    inStock: true,
    image: '/src/assets/images/herbal_triphala_powder_1790596702077.jpg',
    keyIndications: ['Intestinal Gas & Flatulence', 'Heavy Post-Meal Bloating', 'Loss of Appetite (Aruchi)', 'Spasmodic Abdominal Cramps'],
    detailedUses: {
      primaryBenefits: [
        'Rapidly expels painful trapped gas from stomach and intestines',
        'Ignites sluggish digestive fire (Deepana) to eliminate food heaviness',
        'Stops abdominal rumbling and post-prandial distension within 20 minutes',
        'Relieves sharp spasmodic colicky pain triggered by cold or dry food'
      ],
      ailmentsTreated: [
        'Adhmana (Abdominal gas distension and bloating)',
        'Anaha (Hard fullness in abdomen without bowel movement)',
        'Udarashoola (Gas cramps and colic)',
        'Aruchi (Lack of taste and appetite)'
      ],
      actionMechanism: 'Volatile sulfur compounds in ferula asafoetida relax smooth intestinal muscles and stimulate gastric secretagogues.',
      doshaEffect: 'Instantly destroys aggravated Samana Vata and cleanses cold Kapha in the gut.'
    },
    dosageAndAnupana: {
      standardDosage: 'Half to one teaspoon (2g to 3g) with meals',
      bestTiming: 'With the very first mouthful of food at lunch and dinner',
      anupanaCarrier: 'Mixed with 1 teaspoon of warm melted cow ghee and warm rice or warm water',
      duration: 'As needed for acute gas or 2 to 3 weeks for chronically weak digestive fire'
    },
    keyIngredients: [
      { herb: 'Shuddha Hingu (Roasted Asafoetida)', botanicalName: 'Ferula foetida', potencyOrMg: '12.5%', role: 'Supreme carminative that breaks gas bubbles' },
      { herb: 'Trikatu (Dry Ginger, Black Pepper, Pippali)', botanicalName: 'Zingiber, Piper spp.', potencyOrMg: '37.5%', role: 'Reignites digestive fire and burns Ama' },
      { herb: 'Ajwain, Cumin & Black Cumin', botanicalName: 'Trachyspermum & Cuminum', potencyOrMg: '37.5%', role: 'Relieves spasms and smooth muscle cramping' },
      { herb: 'Saindhava Lavana (Rock Salt)', botanicalName: 'Mineral Halite', potencyOrMg: '12.5%', role: 'Enhances digestive secretions and natural mineral balance' }
    ],
    precautionsAndContraindications: [
      'Not recommended for people suffering from bleeding ulcers or active burning gastritis (use Avipattikar instead).',
      'Contains natural Himalayan rock salt; monitor if on a strict sodium-restricted diet.',
      'Always keep the tin tightly closed as asafoetida aroma is volatile.'
    ],
    storageGuideline: 'Store in the supplied airtight metal tin in a dry spice rack.',
    ayushLicenseNo: 'AYUSH-UP-2022-CHUR-3109',
    batchInfo: 'Batch #HNG-2602 | Mfd: FEB 2026 | Exp: JAN 2028'
  }
];

export const PHARMACY_CONTACT_INFO = {
  pharmacyName: 'Aurashka Herbal Apothecary',
  hindiName: 'औराश्का हर्बल औषधि भंडार',
  headPharmacist: 'Dr. Harshit Maan (BAMS, MD Ayu.)',
  regNumber: 'AYUR-REG-2018-9941 / Central Ayush Board',
  helplinePhone: '+91 98765 43210',
  whatsappNumber: '919876543210',
  displayWhatsApp: '+91 98765 43210',
  supportEmail: 'care@aurashka.com',
  storeAddress: 'Shop #14-16, Ayur Mandir Road, Near Central Botanical Garden, New Delhi - 110001, India',
  storeTimings: 'Mon – Sat: 9:00 AM – 8:00 PM | Sun: 10:00 AM – 2:00 PM',
  shippingNotice: 'Complimentary shipping across India with sealed cold-pressed freshness guarantee.',
  licenseBadges: [
    '100% Certified Ayush & GMP Compliant',
    'Lab-Tested For Heavy Metals & Pesticides',
    'Registered Ayurvedic Pharmacist On Call',
    'Free Tele-Consultation With Every Prescription'
  ]
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  brandName: 'Aurashka',
  hindiName: 'औराश्का हर्बल औषधि भंडार',
  brandLogoImage: 'https://i.ibb.co/cKMZvJyJ/IMG-9291.jpg',
  showBrandLogo: true,
  headPharmacist: 'Dr. Harshit Maan (BAMS, MD Ayu.)',
  regNumber: 'AYUR-REG-2018-9941 / Central Ayush Board',
  storeAddress: 'Shop #14-16, Ayur Mandir Road, Near Central Botanical Garden, New Delhi - 110001, India',
  storeTimings: 'Mon – Sat: 9:00 AM – 8:00 PM | Sun: 10:00 AM – 2:00 PM',
  shippingNotice: 'Complimentary shipping across India with sealed cold-pressed freshness guarantee.',
  showHeroBadge: true,
  heroBadgeText: 'Registered Ayurvedic Formulations & Classical Rasayanas',
  heroTitle: 'Essential Herbal Formulations & Apothecary Deals',
  heroSubtitle: 'Clinically standardized Rasayanas and pure plant extracts. Explore detailed therapeutic uses, prescribed dosages, and direct apothecary pricing.',
  catalogSectionTitle: 'Products, Formulations & Apothecary Deals',
  catalogSectionSubtitle: 'Authentic herbal remedies with retail discounts, verified reseller rates & dosage charts.',
  contacts: {
    phones: [
      { id: 'p1', label: 'Primary Helpline', number: '+91 98765 43210' },
      { id: 'p2', label: 'Emergency Dispatch', number: '+91 98765 43211' }
    ],
    whatsapps: [
      { id: 'w1', label: 'WhatsApp Consultation', number: '919876543210', displayNumber: '+91 98765 43210' },
      { id: 'w2', label: 'Order Support', number: '919876543211', displayNumber: '+91 98765 43211' }
    ],
    emails: [
      { id: 'e1', label: 'Support Desk', email: 'care@aurashka.com' },
      { id: 'e2', label: 'Doctor Consultation Desk', email: 'consult@aurashka.com' }
    ]
  },
  licenseBadges: [
    '100% Certified Ayush & GMP Compliant',
    'Lab-Tested For Heavy Metals & Pesticides',
    'Registered Ayurvedic Pharmacist On Call',
    'Free Tele-Consultation With Every Prescription'
  ],
  messageTemplates: {
    headerWhatsApp: 'Namaste, I want to inquire about {brandName} herbal formulations and clinical consultation.',
    floatingWhatsApp: 'Namaste Doctor ji, I am on the {brandName} website and need immediate herbal advice or dosage guidance.',
    frontContactBarWhatsApp: 'Namaste, I would like to contact {brandName} for medicine inquiries and order details.',
    heroWhatsApp: 'Namaste, I am browsing {brandName} Herbal Apothecary and would like to inquire about formulations and current deals.',
    productInquiryWhatsApp: 'Namaste, I want to inquire about "{productName}" (Deal price ₹{productPrice}{resellerInfo}). Please share availability and dosage advice.',
    cartOrderWhatsApp: '*HERBAL PHARMACY ORDER & DOSAGE CONSULTATION*\n------------------------------------\nNamaste Doctor ji, I would like to order and consult on the following herbal formulations:\n\n{cartSummary}\n\n*Total Estimated Value:* ₹{cartTotal}\n------------------------------------\nPlease verify dosage suitability for me and confirm delivery address details.',
    consultationWhatsApp: 'Namaste Doctor ji, I need dosage & clinical consultation for "{ailment}". Please guide me on medicines and authentic routine.',
    contactFormEmailSubject: '{brandName} Inquiry: {subject}',
    contactFormEmailBody: 'Hello {brandName} Apothecary Team,\n\nI have an inquiry regarding: {subject}\n\nMessage Details:\n{message}',
    includeUserInfo: true,
  },
  weeklyDeals: {
    enabled: true,
    title: 'Deal of the Week',
    subtitle: 'Handpicked classical formulations and pure Rasayanas at exclusive apothecary rates.',
    badgeText: 'Handpicked Specials',
    bannerTag: 'Save up to 35% this week',
    dealEndNotice: 'Offers refresh every Sunday midnight · Authentic botanical guarantee',
    items: [
      {
        id: 'deal-1',
        productId: 'p1',
        customTitle: 'Ashwagandha Gold Rasayana',
        customSubtitle: 'Full Spectrum Root Extract for Vata Balancing & Vitality',
        dealPrice: 380,
        dealBadge: 'Deal of the Week · 31% Off',
        highlightPoints: ['Direct Apothecary Rate', 'Lab Certified Withanolides', 'Free Anupana Chart']
      },
      {
        id: 'deal-2',
        productId: 'p2',
        customTitle: 'Brahmi Ghrita & Medhya Rasayana',
        customSubtitle: 'Classical Cognitive & Memory Calming Formulation',
        dealPrice: 320,
        dealBadge: 'Bestseller Deal · 29% Off',
        highlightPoints: ['Pure A2 Desi Cow Ghee Base', 'Ayush GMP Certified', 'Deep Mental Rejuvenation']
      },
      {
        id: 'deal-3',
        productId: 'p4',
        customTitle: 'Amalaki Special Chyawanprash',
        customSubtitle: '48 Botanical Ingredients with Raw Forest Honey & Fresh Amla',
        dealPrice: 420,
        dealBadge: 'Immunity Booster · Save ₹130',
        highlightPoints: ['Wild Forest Honey Base', 'Immunity & Ojas Enhancer', 'Zero Refined Sugar']
      }
    ]
  },
  footerCopyrightText: '© {year} {brandName}. All rights reserved.',
  footerBotanicalBadgeText: '100% Verified Botanical Formulations & Deals',
  peopleBadgeText: 'Certified Ayurvedic Doctors & Formulators',
  peopleSectionTitle: 'Our Ayurvedic Doctors & Formulation Specialists',
  peopleSectionSubtitle: 'Experienced Ayurvedic Doctors & Botanical Formulators guiding your wellness and personalized dosages.',
  peopleSwipeNotice: '',
  peopleList: [
    {
      id: 'person-1',
      name: 'Dr. Harshit Maan (BAMS, MD Ayu.)',
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
      roleOrDesignation: 'Chief Ayurvedic Physician & Senior Formulator',
      qualificationOrExperience: '15+ Years Clinical Practice · Central Ayush Board Verified',
    },
    {
      id: 'person-2',
      name: 'Dr. Ananya Sharma (BAMS, PhD Dravyaguna)',
      image: 'https://images.unsplash.com/photo-1594824813628-989635b71946?auto=format&fit=crop&w=400&q=80',
      roleOrDesignation: 'Head of Pharmacognosy & Botanical Standardization',
      qualificationOrExperience: 'Ayurvedic Herbology Specialist · Heavy Metal Detox Analyst',
    },
    {
      id: 'person-3',
      name: 'Dr. Rajesh V. Shastri (BAMS, Rasashastra Gold Medalist)',
      image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80',
      roleOrDesignation: 'Senior Rasayana & Classical Anupana Consultant',
      qualificationOrExperience: 'Classical Formulations Expert · 20+ Years Patient Care',
    },
  ],
  productAssuranceBadges: {
    showBadges: true,
    showBadge1: true,
    showBadge2: true,
    badge1Title: 'Ayush & GMP Certified',
    badge1Subtitle: 'Heavy-metal lab verified',
    badge2Title: '100% Pure Botanical',
    badge2Subtitle: 'Zero synthetic fillers',
  },
  bannerSlider: {
    enabled: true,
    autoScrollSeconds: 4,
    aspectRatio: 'auto',
    overlayStyle: 'none', // No bottom dark gradient by default
    items: [
      {
        id: 'banner-slide-1',
        imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=1200&q=80',
        title: 'Authentic Classical Formulations',
        subtitle: '100% Pure Botanicals · Lab Tested for Heavy Metals & Safety',
        linkType: 'category',
        category: 'immunity',
        altText: 'Classical Formulations Banner'
      },
      {
        id: 'banner-slide-2',
        imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80',
        title: 'Rasayana & Vitality Specials',
        subtitle: 'Traditional apothecary herbs with direct verified reseller discounts',
        linkType: 'category',
        category: 'rasayana',
        altText: 'Rasayana Special Banner'
      },
      {
        id: 'banner-slide-3',
        imageUrl: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=1200&q=80',
        title: 'Direct Wholesale & Reseller Rates',
        subtitle: 'High-margin apothecary remedies for clinics, doctors & patients',
        linkType: 'custom',
        customUrl: '#deals-catalog',
        altText: 'Wholesale Apothecary Banner'
      }
    ]
  },
  productHorizontalLists: [
    {
      id: 'hlist-1',
      enabled: true,
      title: 'Doctor Recommended Classical Rasayanas',
      subtitle: 'Handpicked authentic herbal preparations to restore vitality, immunity & stamina.',
      badgeText: 'Curated Collection',
      displayOrder: 1,
      sourceType: 'category',
      category: 'rasayana',
      maxProducts: 8,
      cardFields: {
        showImage: true,
        showName: true,
        showSanskritName: true,
        showPrice: true,
        showResellerPrice: true,
        showMrpAndOffer: true,
        showTag: true,
        showRating: true,
        showAddToCart: true,
        showQuickView: true,
      }
    },
    {
      id: 'hlist-2',
      enabled: true,
      title: 'Top Rated Immunity & Respiratory Formulations',
      subtitle: 'Standardized classical extracts and decoctions for strong seasonal immunity.',
      badgeText: 'Featured Formulations',
      displayOrder: 2,
      sourceType: 'category',
      category: 'immunity',
      maxProducts: 8,
      cardFields: {
        showImage: true,
        showName: true,
        showSanskritName: true,
        showPrice: true,
        showResellerPrice: true,
        showMrpAndOffer: true,
        showTag: true,
        showRating: true,
        showAddToCart: true,
        showQuickView: true,
      }
    }
  ],
  productImageGradient: 'none',
};

export const DEFAULT_BANNER_SLIDER: BannerSliderConfig = DEFAULT_SITE_SETTINGS.bannerSlider!;
export const DEFAULT_PRODUCT_HORIZONTAL_LISTS: ProductHorizontalList[] = DEFAULT_SITE_SETTINGS.productHorizontalLists!;

export const COMMON_AILMENT_TAGS = [
  { label: 'All Ailments', value: 'all' },
  { label: 'Joint Pain & Arthritis', value: 'joint_pain' },
  { label: 'Acidity, Gas & Bloating', value: 'digestion' },
  { label: 'Stress, Anxiety & Insomnia', value: 'mind_sleep' },
  { label: 'Immunity & Cough / Cold', value: 'immunity' },
  { label: 'Skin Glow, Dark Spots & Hair Fall', value: 'skin_hair' },
  { label: 'Stamina, Fatigue & Vitality', value: 'vitality' }
];

export const DEFAULT_CATEGORIES = [
  { id: 'all', label: 'All Products' },
  { id: 'immunity', label: 'Immunity & Respiratory' },
  { id: 'digestion', label: 'Digestive & Gut Health' },
  { id: 'joint_pain', label: 'Joint & Pain Relief' },
  { id: 'mind_sleep', label: 'Mind, Stress & Sleep' },
  { id: 'skin_hair', label: 'Skin & Hair Wellness' },
  { id: 'vitality', label: 'Vitality & Stamina' },
];

export const DEFAULT_FORMS = [
  'Churna (Powder)',
  'Vati / Tablet',
  'Taila (Oil)',
  'Swaras & Asava (Liquid)',
  'Resin & Lehyam',
  'Veg Capsule',
  'Kashayam (Decoction)',
  'Avaleha (Paste)',
  'Ghrita (Herbal Ghee)'
];

export const SORT_BADGE_OPTIONS: { id: string; label: string; badge: string; color: string; iconName: string }[] = [
  { id: 'none', label: 'Standard (No Badge)', badge: '', color: '', iconName: '' },
  { id: 'trending', label: 'Trending Now', badge: 'Trending', color: 'bg-red-600 text-white', iconName: 'Flame' },
  { id: 'top_seller', label: 'Top Seller', badge: 'Top Seller', color: 'bg-amber-600 text-white', iconName: 'Trophy' },
  { id: 'best_deal', label: 'Best Deal', badge: 'Best Deal', color: 'bg-emerald-700 text-white', iconName: 'Tag' },
  { id: 'featured', label: 'Featured Choice', badge: 'Featured', color: 'bg-indigo-700 text-white', iconName: 'Sparkles' },
  { id: 'new_launch', label: 'New Launch', badge: 'New Launch', color: 'bg-blue-600 text-white', iconName: 'Rocket' },
];

/**
 * Seeds the CMS with EL DAMARANY's verified content.
 *
 * Rules followed throughout this file:
 *  - Only information supplied by the company is written. Anything unknown
 *    (phone numbers, project values, dates, clients, certifications) is left
 *    NULL so the public site hides it rather than showing invented text.
 *  - Every record is upserted, so the seed is safe to re-run.
 */
import { PrismaPg } from '@prisma/adapter-pg';
import path from 'node:path';
import { PrismaClient } from '../src/generated/prisma/client';
import { hashPassword, validatePasswordStrength } from '../src/lib/auth/password';

for (const file of ['.env.local', '.env']) {
  try {
    process.loadEnvFile(path.join(process.cwd(), file));
  } catch {
    /* environment may be injected directly */
  }
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' }),
});

const FOUNDED = 1978;

// ---------------------------------------------------------------------------
// Reference data
// ---------------------------------------------------------------------------

/** The 27 governorates of Egypt — public administrative fact, not a claim. */
const GOVERNORATES: Array<[slug: string, ar: string, en: string]> = [
  ['alexandria', 'الإسكندرية', 'Alexandria'],
  ['cairo', 'القاهرة', 'Cairo'],
  ['giza', 'الجيزة', 'Giza'],
  ['beheira', 'البحيرة', 'Beheira'],
  ['matrouh', 'مطروح', 'Matrouh'],
  ['kafr-el-sheikh', 'كفر الشيخ', 'Kafr El Sheikh'],
  ['gharbia', 'الغربية', 'Gharbia'],
  ['monufia', 'المنوفية', 'Monufia'],
  ['dakahlia', 'الدقهلية', 'Dakahlia'],
  ['damietta', 'دمياط', 'Damietta'],
  ['sharqia', 'الشرقية', 'Sharqia'],
  ['qalyubia', 'القليوبية', 'Qalyubia'],
  ['port-said', 'بورسعيد', 'Port Said'],
  ['ismailia', 'الإسماعيلية', 'Ismailia'],
  ['suez', 'السويس', 'Suez'],
  ['north-sinai', 'شمال سيناء', 'North Sinai'],
  ['south-sinai', 'جنوب سيناء', 'South Sinai'],
  ['red-sea', 'البحر الأحمر', 'Red Sea'],
  ['fayoum', 'الفيوم', 'Fayoum'],
  ['beni-suef', 'بني سويف', 'Beni Suef'],
  ['minya', 'المنيا', 'Minya'],
  ['asyut', 'أسيوط', 'Asyut'],
  ['sohag', 'سوهاج', 'Sohag'],
  ['qena', 'قنا', 'Qena'],
  ['luxor', 'الأقصر', 'Luxor'],
  ['aswan', 'أسوان', 'Aswan'],
  ['new-valley', 'الوادي الجديد', 'New Valley'],
];

const SECTORS: Array<[slug: string, ar: string, en: string]> = [
  ['roads-paving', 'الطرق والرصف', 'Roads & Paving'],
  ['asphalt', 'الأسفلت', 'Asphalt'],
  ['infrastructure', 'البنية التحتية', 'Infrastructure'],
  ['concrete', 'الأعمال الخرسانية', 'Concrete'],
  ['bridges', 'الكباري', 'Bridges'],
  ['tunnels', 'الأنفاق', 'Tunnels'],
  ['industrial', 'الصناعي', 'Industrial'],
  ['oil-gas', 'البترول والغاز', 'Oil & Gas'],
  ['educational', 'التعليمي', 'Educational'],
  ['facilities', 'المنشآت والمرافق', 'Facilities'],
];

/**
 * Service descriptions restate the company's own approved statement of what it
 * does; they make no claims about scale, clients or outcomes.
 */
const SERVICES: Array<{
  slug: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
}> = [
  {
    slug: 'roads-paving',
    titleAr: 'الطرق والرصف',
    titleEn: 'Roads & Paving',
    descriptionAr: 'تنفيذ أعمال الطرق والرصف بمراحلها المختلفة، مع الالتزام بالمواصفات الفنية ومتطلبات المشروع.',
    descriptionEn:
      'Execution of road and paving works across their different stages, in line with the technical specifications and project requirements.',
  },
  {
    slug: 'asphalt-works',
    titleAr: 'أعمال الأسفلت',
    titleEn: 'Asphalt Works',
    descriptionAr: 'أعمال توريد وفرد طبقات الأسفلت وفق المواصفات المعتمدة للمشروع.',
    descriptionEn: 'Supply and laying of asphalt layers according to the approved project specifications.',
  },
  {
    slug: 'infrastructure',
    titleAr: 'البنية التحتية',
    titleEn: 'Infrastructure',
    descriptionAr: 'تنفيذ أعمال البنية التحتية المرتبطة بالمشروعات والمرافق.',
    descriptionEn: 'Delivery of infrastructure works associated with projects and utilities.',
  },
  {
    slug: 'concrete-works',
    titleAr: 'الأعمال الخرسانية',
    titleEn: 'Concrete Works',
    descriptionAr: 'تنفيذ الأعمال الخرسانية بمراحلها، مع المتابعة الفنية ومراقبة الجودة.',
    descriptionEn: 'Execution of concrete works through their stages, with technical supervision and quality control.',
  },
  {
    slug: 'contracting',
    titleAr: 'المقاولات وتنفيذ المشروعات',
    titleEn: 'Contracting & Project Execution',
    descriptionAr: 'أعمال المقاولات وتنفيذ المشروعات، اعتمادًا على الكوادر الفنية والإمكانات التشغيلية.',
    descriptionEn:
      'General contracting and project execution, drawing on technical personnel and operational capabilities.',
  },
];

/** Capability names as supplied. Descriptions are intentionally left empty. */
const CAPABILITIES: Array<[slug: string, ar: string, en: string]> = [
  ['technical-expertise', 'الخبرة الفنية', 'Technical Expertise'],
  ['specialized-teams', 'الكوادر المتخصصة', 'Specialized Teams'],
  ['operational-capabilities', 'الإمكانات التشغيلية', 'Operational Capabilities'],
  ['roads', 'الطرق', 'Roads'],
  ['paving', 'الرصف', 'Paving'],
  ['asphalt', 'الأسفلت', 'Asphalt'],
  ['infrastructure', 'البنية التحتية', 'Infrastructure'],
  ['concrete', 'الخرسانة', 'Concrete'],
  ['project-execution', 'تنفيذ المشروعات', 'Project Execution'],
];

const QUALITY_SECTIONS: Array<[slug: string, category: 'QUALITY' | 'SAFETY', ar: string, en: string]> = [
  ['quality', 'QUALITY', 'الجودة', 'Quality'],
  ['materials', 'QUALITY', 'المواد', 'Materials'],
  ['accuracy', 'QUALITY', 'دقة التنفيذ', 'Accuracy'],
  ['supervision', 'QUALITY', 'الإشراف والمتابعة', 'Supervision'],
  ['technical-specifications', 'QUALITY', 'المواصفات الفنية', 'Technical Specifications'],
  ['safety', 'SAFETY', 'السلامة', 'Safety'],
  ['occupational-health', 'SAFETY', 'الصحة المهنية', 'Occupational Health'],
  ['ppe', 'SAFETY', 'مهمات الوقاية الشخصية', 'Personal Protective Equipment'],
  ['site-safety', 'SAFETY', 'سلامة مواقع العمل', 'Site Safety'],
  ['equipment-movement', 'SAFETY', 'حركة المعدات', 'Equipment Movement'],
  ['vehicle-movement', 'SAFETY', 'حركة المركبات', 'Vehicle Movement'],
];

const RISK_STEPS: Array<[step: number, ar: string, en: string]> = [
  [1, 'تحديد المخاطر', 'Identify Risks'],
  [2, 'تقييم وتحليل المخاطر', 'Assess & Analyze'],
  [3, 'وضع إجراءات الاستجابة', 'Response Planning'],
  [4, 'المتابعة المستمرة', 'Continuous Monitoring'],
  [5, 'الحد من التأثير', 'Mitigation'],
];

// ---------------------------------------------------------------------------
// Seed steps
// ---------------------------------------------------------------------------

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || 'Site Administrator';

  if (!email || !password) {
    console.log(
      '• Admin user: skipped (set ADMIN_EMAIL and ADMIN_PASSWORD, or run `npm run admin:create`)',
    );
    return;
  }

  const weakness = validatePasswordStrength(password);
  if (weakness) {
    console.warn(`• Admin user: skipped — ${weakness}`);
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`• Admin user: ${email} already exists (password left unchanged)`);
    return;
  }

  await prisma.user.create({
    data: { email, name, role: 'ADMIN', passwordHash: await hashPassword(password) },
  });
  console.log(`• Admin user: created ${email}`);
}

async function seedSettings() {
  const data = {
    companyNameAr: 'شركة الضمراني للمقاولات ورصف الطرق',
    companyNameEn: 'EL DAMARANY for Contracting & Road Paving',
    taglineAr: 'خبرة تتجدد، وقدرات تتطور.',
    taglineEn: 'Experience That Evolves. Capabilities That Grow.',
    headOfficeAr: '51 شارع فيكتور عمانويل، أمام زهران، سموحة، الإسكندرية، مصر.',
    headOfficeEn: '51 Victor Emmanuel Street, in front of Zahran, Smouha, Alexandria, Egypt.',
    branchAr: '6 شارع النصر، خلف شركة الملاحة البحرية، الإسكندرية، مصر.',
    branchEn: '6 El Nasr Street, behind Maritime Navigation Company, Alexandria, Egypt.',
    defaultSeoTitleAr: 'شركة الضمراني للمقاولات ورصف الطرق',
    defaultSeoTitleEn: 'EL DAMARANY for Contracting & Road Paving',
    defaultSeoDescriptionAr:
      'خبرة متراكمة منذ 1978 في تنفيذ مشروعات الطرق والرصف والبنية التحتية والأعمال الخرسانية داخل جمهورية مصر العربية.',
    defaultSeoDescriptionEn:
      'Accumulated experience since 1978 in roads, paving, infrastructure and concrete works across Egypt.',
    // Contact channels are intentionally empty until the company supplies them.
  };

  await prisma.siteSetting.upsert({
    where: { id: 'default' },
    update: data,
    create: { id: 'default', ...data },
  });
  console.log('• Site settings: ready (contact details left empty for the owner to fill)');
}

async function seedSocialLinks() {
  const platforms = ['FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'YOUTUBE', 'TIKTOK', 'X'] as const;
  for (const [index, platform] of platforms.entries()) {
    // url stays null — nothing is rendered until the owner pastes a real link.
    await prisma.socialLink.upsert({
      where: { platform },
      update: {},
      create: { platform, sortOrder: index },
    });
  }
  console.log('• Social links: 6 empty slots created');
}

async function seedNavigation() {
  const header: Array<[ar: string, en: string, href: string]> = [
    ['من نحن', 'About', '/about'],
    ['مجالاتنا', 'Services', '/services'],
    ['المشروعات', 'Projects', '/projects'],
    ['قدراتنا', 'Capabilities', '/capabilities'],
    ['الجودة والسلامة', 'Quality & Safety', '/quality-safety'],
    ['إدارة المخاطر', 'Risk Management', '/risk-management'],
    ['تواصل معنا', 'Contact', '/contact'],
  ];
  const footer: Array<[ar: string, en: string, href: string]> = [
    ['من نحن', 'About', '/about'],
    ['مجالاتنا', 'Services', '/services'],
    ['المشروعات', 'Projects', '/projects'],
    ['القطاعات', 'Sectors', '/sectors'],
    ['قدراتنا', 'Capabilities', '/capabilities'],
    ['الجودة والسلامة', 'Quality & Safety', '/quality-safety'],
    ['إدارة المخاطر', 'Risk Management', '/risk-management'],
    ['تواصل معنا', 'Contact', '/contact'],
  ];

  const existing = await prisma.navigationItem.count();
  if (existing > 0) {
    console.log('• Navigation: already configured, left untouched');
    return;
  }

  await prisma.navigationItem.createMany({
    data: [
      ...header.map(([labelAr, labelEn, href], index) => ({
        location: 'HEADER' as const,
        labelAr,
        labelEn,
        href,
        sortOrder: index,
      })),
      ...footer.map(([labelAr, labelEn, href], index) => ({
        location: 'FOOTER' as const,
        labelAr,
        labelEn,
        href,
        sortOrder: index,
      })),
    ],
  });
  console.log(`• Navigation: ${header.length} header + ${footer.length} footer items`);
}

async function seedGovernorates() {
  for (const [index, [slug, nameAr, nameEn]] of GOVERNORATES.entries()) {
    await prisma.governorate.upsert({
      where: { slug },
      update: { nameAr, nameEn, sortOrder: index },
      create: { slug, nameAr, nameEn, sortOrder: index },
    });
  }
  console.log(`• Governorates: ${GOVERNORATES.length}`);
}

async function seedSectors() {
  for (const [index, [slug, nameAr, nameEn]] of SECTORS.entries()) {
    await prisma.sector.upsert({
      where: { slug },
      update: { nameAr, nameEn, sortOrder: index },
      create: { slug, nameAr, nameEn, sortOrder: index },
    });
  }
  console.log(`• Sectors: ${SECTORS.length}`);
}

async function seedServices() {
  for (const [index, service] of SERVICES.entries()) {
    const { slug, ...rest } = service;
    await prisma.service.upsert({
      where: { slug },
      update: { ...rest, sortOrder: index },
      create: { slug, ...rest, sortOrder: index, featured: true },
    });
  }
  console.log(`• Services: ${SERVICES.length}`);
}

async function seedCapabilities() {
  for (const [index, [slug, titleAr, titleEn]] of CAPABILITIES.entries()) {
    await prisma.capability.upsert({
      where: { slug },
      update: { titleAr, titleEn, sortOrder: index },
      create: { slug, titleAr, titleEn, sortOrder: index },
    });
  }
  console.log(`• Capabilities: ${CAPABILITIES.length} (descriptions left empty)`);
}

async function seedQuality() {
  for (const [index, [slug, category, titleAr, titleEn]] of QUALITY_SECTIONS.entries()) {
    await prisma.qualitySection.upsert({
      where: { slug },
      update: { category, titleAr, titleEn, sortOrder: index },
      create: { slug, category, titleAr, titleEn, sortOrder: index },
    });
  }
  console.log(`• Quality & Safety themes: ${QUALITY_SECTIONS.length}`);
}

async function seedRisk() {
  for (const [stepNumber, titleAr, titleEn] of RISK_STEPS) {
    const existing = await prisma.riskItem.findFirst({ where: { stepNumber } });
    if (existing) {
      await prisma.riskItem.update({
        where: { id: existing.id },
        data: { titleAr, titleEn, sortOrder: stepNumber },
      });
    } else {
      await prisma.riskItem.create({
        data: { stepNumber, titleAr, titleEn, sortOrder: stepNumber },
      });
    }
  }
  console.log(`• Risk management steps: ${RISK_STEPS.length}`);
}

async function seedTimeline() {
  const existing = await prisma.timelineItem.findFirst({ where: { year: FOUNDED } });
  const data = {
    year: FOUNDED,
    titleAr: 'بداية المسيرة',
    titleEn: 'The Beginning',
    descriptionAr: 'انطلقت خبرة الشركة في مجال المقاولات وتنفيذ الأعمال.',
    descriptionEn: "EL DAMARANY's experience in contracting and project execution began in 1978.",
    sortOrder: 0,
  };

  if (existing) {
    await prisma.timelineItem.update({ where: { id: existing.id }, data });
  } else {
    await prisma.timelineItem.create({ data });
  }
  console.log('• Timeline: 1978 milestone only (no further history invented)');
}

async function seedStatistics() {
  const yearsOfExperience = new Date().getFullYear() - FOUNDED;

  const stats: Array<{
    key: string;
    labelAr: string;
    labelEn: string;
    value: string | null;
    suffix?: string | null;
  }> = [
    { key: 'founded', labelAr: 'سنة التأسيس', labelEn: 'Founded', value: String(FOUNDED) },
    {
      key: 'years-of-experience',
      labelAr: 'سنة من الخبرة',
      labelEn: 'Years of Experience',
      value: String(yearsOfExperience),
      suffix: '+',
    },
    // Left empty on purpose: the real figures have not been supplied.
    { key: 'projects', labelAr: 'مشروع', labelEn: 'Projects', value: null },
    { key: 'governorates', labelAr: 'محافظة', labelEn: 'Governorates', value: null },
    { key: 'capabilities', labelAr: 'مجالات العمل', labelEn: 'Capabilities', value: null },
  ];

  for (const [index, stat] of stats.entries()) {
    const { key, ...rest } = stat;
    await prisma.statistic.upsert({
      where: { key },
      update: { labelAr: rest.labelAr, labelEn: rest.labelEn, sortOrder: index },
      create: { key, ...rest, sortOrder: index },
    });
  }
  console.log('• Statistics: 1978 + years of experience populated, the rest left empty');
}

async function seedHomepage() {
  const sections = [
    {
      key: 'HERO',
      eyebrowAr: 'منذ 1978',
      eyebrowEn: 'Since 1978',
      titleAr: 'خبرة تتجدد، وقدرات تتطور.',
      titleEn: 'Experience That Evolves. Capabilities That Grow.',
      bodyAr:
        'خبرة متراكمة في تنفيذ مشروعات الطرق والرصف والبنية التحتية والأعمال الخرسانية، مع التزام مستمر بالجودة والسلامة ودقة التنفيذ.',
      bodyEn:
        'Decades of accumulated experience in roads, paving, infrastructure and concrete works, driven by quality, safety and precision.',
      primaryCtaLabelAr: 'استكشف أعمالنا',
      primaryCtaLabelEn: 'Explore Our Work',
      primaryCtaHref: '/projects',
      secondaryCtaLabelAr: 'تعرف علينا',
      secondaryCtaLabelEn: 'Discover EL DAMARANY',
      secondaryCtaHref: '/about',
    },
    {
      key: 'ABOUT',
      eyebrowAr: 'من نحن',
      eyebrowEn: 'Who We Are',
      titleAr: 'خبرة راسخة، قدرات متكاملة، وتنفيذ يصنع الفارق.',
      titleEn: 'Established Experience. Integrated Capabilities. Execution That Makes a Difference.',
      bodyAr:
        'منذ عام 1978، تعمل شركة الضمراني للمقاولات ورصف الطرق في مجال المقاولات وتنفيذ مشروعات الطرق والرصف والبنية التحتية والأعمال الخرسانية، مستندة إلى خبرة متراكمة وقدرات فنية وتشغيلية متطورة.',
      bodyEn:
        'Since 1978, EL DAMARANY has built experience in contracting, roads, paving, infrastructure and concrete works, supported by accumulated expertise and continuously developing technical and operational capabilities.',
      primaryCtaLabelAr: 'المزيد عن الشركة',
      primaryCtaLabelEn: 'More About the Company',
      primaryCtaHref: '/about',
    },
    { key: 'STATS', eyebrowAr: 'بالأرقام', eyebrowEn: 'At a Glance' },
    {
      key: 'SERVICES',
      eyebrowAr: 'مجالاتنا',
      eyebrowEn: 'What We Do',
      titleAr: 'مجالات عمل متكاملة',
      titleEn: 'Integrated Fields of Work',
      primaryCtaLabelAr: 'كل المجالات',
      primaryCtaLabelEn: 'All Services',
      primaryCtaHref: '/services',
    },
    {
      key: 'PROJECTS',
      eyebrowAr: 'أعمالنا',
      eyebrowEn: 'Our Work',
      titleAr: 'من الفكرة إلى الواقع',
      titleEn: 'From Vision to Reality',
      primaryCtaLabelAr: 'كل المشروعات',
      primaryCtaLabelEn: 'All Projects',
      primaryCtaHref: '/projects',
    },
    {
      key: 'QUALITY',
      eyebrowAr: 'الجودة والسلامة',
      eyebrowEn: 'Quality & Safety',
      titleAr: 'الجودة في كل مرحلة... وسلامة في كل خطوة.',
      titleEn: 'Quality at Every Stage. Safety in Every Step.',
      bodyAr:
        'نضع الجودة والسلامة في مقدمة أولوياتنا، ونعتمد في تنفيذ مشروعاتنا على التخطيط الدقيق والمتابعة المستمرة والالتزام بالمواصفات الفنية ومتطلبات المشروع.',
      bodyEn:
        'Quality and safety come first. Our projects rely on careful planning, continuous monitoring and adherence to technical specifications and project requirements.',
      primaryCtaLabelAr: 'اقرأ المزيد',
      primaryCtaLabelEn: 'Read More',
      primaryCtaHref: '/quality-safety',
    },
    {
      key: 'RISK',
      eyebrowAr: 'إدارة المخاطر',
      eyebrowEn: 'Risk Management',
      titleAr: 'إدارة المخاطر جزء أساسي من نجاح المشروع.',
      titleEn: 'Risk Management Is Part of Project Success.',
      primaryCtaLabelAr: 'اقرأ المزيد',
      primaryCtaLabelEn: 'Read More',
      primaryCtaHref: '/risk-management',
    },
    {
      key: 'CTA',
      titleAr: 'لديك مشروع؟ دعنا نبدأ من هنا.',
      titleEn: "Have a Project? Let's Start Here.",
      primaryCtaLabelAr: 'تواصل معنا',
      primaryCtaLabelEn: 'Contact Us',
      primaryCtaHref: '/contact',
    },
  ];

  for (const [index, section] of sections.entries()) {
    const { key, ...rest } = section;
    await prisma.homepageSection.upsert({
      where: { key },
      update: { ...rest, sortOrder: index },
      create: { key, ...rest, sortOrder: index },
    });
  }
  console.log(`• Homepage sections: ${sections.length}`);
}

async function seedPages() {
  const pages = [
    {
      key: 'home',
      titleAr: 'الرئيسية',
      titleEn: 'Home',
      seoTitleAr: 'شركة الضمراني للمقاولات ورصف الطرق',
      seoTitleEn: 'EL DAMARANY for Contracting & Road Paving',
    },
    {
      key: 'about',
      eyebrowAr: 'من نحن',
      eyebrowEn: 'Who We Are',
      titleAr: 'خبرة راسخة، قدرات متكاملة، وتنفيذ يصنع الفارق.',
      titleEn: 'Established Experience. Integrated Capabilities. Execution That Makes a Difference.',
      introAr:
        'منذ عام 1978، تعمل شركة الضمراني للمقاولات ورصف الطرق في مجال المقاولات وتنفيذ مشروعات الطرق والرصف والبنية التحتية والأعمال الخرسانية، مستندة إلى خبرة متراكمة وقدرات فنية وتشغيلية متطورة.',
      introEn:
        'Since 1978, EL DAMARANY has built experience in contracting, roads, paving, infrastructure and concrete works, supported by accumulated expertise and continuously developing technical and operational capabilities.',
    },
    {
      key: 'services',
      eyebrowAr: 'مجالاتنا',
      eyebrowEn: 'What We Do',
      titleAr: 'مجالات عمل متكاملة',
      titleEn: 'Integrated Fields of Work',
    },
    {
      key: 'projects',
      eyebrowAr: 'أعمالنا',
      eyebrowEn: 'Our Work',
      titleAr: 'من الفكرة إلى الواقع',
      titleEn: 'From Vision to Reality',
    },
    {
      key: 'capabilities',
      eyebrowAr: 'قدراتنا',
      eyebrowEn: 'Capabilities',
      titleAr: 'قدرات فنية وتشغيلية متكاملة',
      titleEn: 'Integrated Technical and Operational Capabilities',
    },
    {
      key: 'quality-safety',
      eyebrowAr: 'الجودة والسلامة',
      eyebrowEn: 'Quality & Safety',
      titleAr: 'الجودة في كل مرحلة... وسلامة في كل خطوة.',
      titleEn: 'Quality at Every Stage. Safety in Every Step.',
      introAr:
        'في شركة الضمراني للمقاولات ورصف الطرق – EL DAMARANY، نضع الجودة والسلامة في مقدمة أولوياتنا، ونعتمد في تنفيذ مشروعاتنا على التخطيط الدقيق والمتابعة المستمرة والالتزام بالمواصفات الفنية ومتطلبات المشروع.',
      introEn:
        'At EL DAMARANY, quality and safety are our highest priorities. Our projects are delivered through careful planning, continuous monitoring and adherence to technical specifications and project requirements.',
    },
    {
      key: 'risk-management',
      eyebrowAr: 'إدارة المخاطر',
      eyebrowEn: 'Risk Management',
      titleAr: 'إدارة المخاطر جزء أساسي من نجاح المشروع.',
      titleEn: 'Risk Management Is Part of Project Success.',
    },
    {
      key: 'sectors',
      eyebrowAr: 'القطاعات',
      eyebrowEn: 'Sectors',
      titleAr: 'القطاعات التي نعمل بها',
      titleEn: 'Sectors We Work In',
    },
    {
      key: 'contact',
      eyebrowAr: 'تواصل معنا',
      eyebrowEn: 'Contact',
      titleAr: 'لديك مشروع؟ دعنا نبدأ من هنا.',
      titleEn: "Have a Project? Let's Start Here.",
    },
    // Legal pages start as drafts with no body: they stay out of the footer,
    // the sitemap and the index until the company supplies real wording.
    {
      key: 'privacy',
      titleAr: 'سياسة الخصوصية',
      titleEn: 'Privacy Policy',
      status: 'DRAFT' as const,
    },
    {
      key: 'terms',
      titleAr: 'الشروط والأحكام',
      titleEn: 'Terms & Conditions',
      status: 'DRAFT' as const,
    },
  ];

  for (const page of pages) {
    const { key, ...rest } = page;
    await prisma.page.upsert({
      where: { key },
      // Never resurrect a page the owner has since published or edited.
      update: {},
      create: { key, ...rest },
    });
  }
  console.log(`• Pages: ${pages.length}`);
}

async function seedContentBlocks() {
  const blocks = [
    {
      pageKey: 'about',
      key: 'vision',
      titleAr: 'بناء خبرة اليوم لمشروعات المستقبل.',
      titleEn: "Building Today's Experience for Tomorrow's Projects.",
      bodyAr:
        'نواصل تطوير خبراتنا وإمكاناتنا الفنية والتشغيلية بهدف تقديم حلول أكثر تكاملًا وكفاءة، وبناء علاقات طويلة الأمد مع عملائنا وشركائنا.',
      bodyEn:
        'We continue to develop our expertise and our technical and operational capabilities in order to deliver more integrated, more efficient solutions and to build long-term relationships with our clients and partners.',
      sortOrder: 0,
    },
    {
      pageKey: 'about',
      key: 'mission',
      titleAr: 'رسالتنا',
      titleEn: 'Our Mission',
      bodyAr:
        'تقديم أعمال ومشروعات تتميز بالجودة والدقة والالتزام، من خلال توظيف الخبرات الفنية المتراكمة والكوادر المتخصصة والإمكانات التشغيلية، مع التركيز على السلامة وإدارة المخاطر وتحقيق متطلبات العملاء.',
      bodyEn:
        'To deliver work and projects distinguished by quality, precision and commitment — through accumulated technical expertise, specialised personnel and operational capability — with a focus on safety, risk management and meeting client requirements.',
      sortOrder: 1,
    },
    {
      pageKey: 'about',
      key: 'values',
      titleAr: 'قيمنا',
      titleEn: 'Our Values',
      // Values restate the company's own approved priorities; nothing added.
      bodyAr: 'الجودة\nالسلامة\nدقة التنفيذ\nالالتزام',
      bodyEn: 'Quality\nSafety\nPrecision of Execution\nCommitment',
      sortOrder: 2,
    },
    {
      pageKey: 'about',
      key: 'geographic-scope',
      titleAr: 'نطاق العمل الجغرافي',
      titleEn: 'Geographic Scope',
      bodyAr: 'جمهورية مصر العربية — جميع المحافظات.',
      bodyEn: 'Egypt — all governorates.',
      sortOrder: 3,
    },
  ];

  for (const block of blocks) {
    await prisma.contentBlock.upsert({
      where: { pageKey_key: { pageKey: block.pageKey, key: block.key } },
      update: block,
      create: block,
    });
  }
  console.log(`• Content blocks: ${blocks.length}`);
}

async function seedProjects() {
  const alexandria = await prisma.governorate.findUnique({ where: { slug: 'alexandria' } });

  const collection = await prisma.projectCollection.upsert({
    where: { slug: 'alexandria-governorate-projects' },
    update: {},
    create: {
      slug: 'alexandria-governorate-projects',
      nameAr: 'مشروعات محافظة الإسكندرية',
      nameEn: 'Alexandria Governorate Projects',
      sortOrder: 0,
    },
  });

  const sectorIds = new Map<string, string>();
  for (const sector of await prisma.sector.findMany()) sectorIds.set(sector.slug, sector.id);

  const projects: Array<{
    slugAr: string;
    slugEn: string;
    titleAr: string;
    titleEn: string;
    sector: string;
    locationAr?: string;
    locationEn?: string;
    governorateId?: string | null;
    collectionId?: string | null;
    featured?: boolean;
    featuredOrder?: number | null;
  }> = [
    {
      slugAr: 'مجمع-تخزين-النفط-رأس-بدران',
      slugEn: 'ras-badran-oil-storage-complex',
      titleAr: 'مجمع تخزين النفط – رأس بدران',
      titleEn: 'Ras Badran Oil Storage Complex',
      sector: 'oil-gas',
      locationAr: 'رأس بدران، مصر',
      locationEn: 'Ras Badran, Egypt',
      featured: true,
      featuredOrder: 0,
    },
    {
      slugAr: 'شركة-ميدور',
      slugEn: 'midor',
      titleAr: 'شركة ميدور',
      titleEn: 'MIDOR',
      sector: 'industrial',
      featured: true,
      featuredOrder: 1,
    },
    {
      slugAr: 'قاعدة-محمد-نجيب',
      slugEn: 'mohamed-naguib-military-base',
      titleAr: 'قاعدة محمد نجيب',
      titleEn: 'Mohamed Naguib Military Base',
      sector: 'infrastructure',
      featured: true,
      featuredOrder: 2,
    },
    {
      slugAr: 'طريق-غاز-مليحة',
      slugEn: 'meleiha-gas-road',
      titleAr: 'طريق غاز مليحة',
      titleEn: 'Meleiha Gas Road',
      sector: 'roads-paving',
      featured: true,
      featuredOrder: 3,
    },
    {
      slugAr: 'كباري-سموحة',
      slugEn: 'smouha-bridges',
      titleAr: 'كباري سموحة',
      titleEn: 'Smouha Bridges',
      sector: 'bridges',
      locationAr: 'سموحة، الإسكندرية، مصر',
      locationEn: 'Smouha, Alexandria, Egypt',
      governorateId: alexandria?.id ?? null,
      featured: true,
      featuredOrder: 4,
    },
    {
      slugAr: 'مجمع-الأسمدة-الأزوتية',
      slugEn: 'nitrogen-fertilizer-complex',
      titleAr: 'مجمع الأسمدة الأزوتية',
      titleEn: 'Nitrogen Fertilizer Complex',
      sector: 'industrial',
      featured: true,
      featuredOrder: 5,
    },
    {
      // The umbrella entry for the Alexandria collection; individual Alexandria
      // projects can be attached to the same collection later.
      slugAr: 'مشروعات-محافظة-الإسكندرية',
      slugEn: 'alexandria-governorate-projects',
      titleAr: 'مشروعات محافظة الإسكندرية',
      titleEn: 'Alexandria Governorate Projects',
      sector: 'infrastructure',
      locationAr: 'الإسكندرية، مصر',
      locationEn: 'Alexandria, Egypt',
      governorateId: alexandria?.id ?? null,
      collectionId: collection.id,
    },
  ];

  for (const [index, project] of projects.entries()) {
    const { sector, ...rest } = project;
    const data = {
      ...rest,
      sectorId: sectorIds.get(sector) ?? null,
      sortOrder: index,
      publishStatus: 'PUBLISHED' as const,
      publishedAt: new Date(),
    };

    await prisma.project.upsert({
      where: { slugEn: project.slugEn },
      // Only structural fields are refreshed — never overwrite the owner's edits.
      update: { sectorId: data.sectorId },
      create: data,
    });
  }

  console.log(`• Projects: ${projects.length} (details left empty until supplied)`);
  console.log('• Project collection: Alexandria Governorate Projects');
}

async function main() {
  console.log('\nSeeding EL DAMARANY CMS…\n');

  await seedSettings();
  await seedSocialLinks();
  await seedNavigation();
  await seedGovernorates();
  await seedSectors();
  await seedServices();
  await seedCapabilities();
  await seedQuality();
  await seedRisk();
  await seedTimeline();
  await seedStatistics();
  await seedPages();
  await seedContentBlocks();
  await seedHomepage();
  await seedProjects();
  await seedAdmin();

  console.log('\nSeed complete.\n');
}

main()
  .catch((error) => {
    console.error('\nSeed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

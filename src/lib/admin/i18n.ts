/**
 * Dashboard interface language.
 *
 * The public site uses next-intl, but the dashboard is a single-audience tool
 * with a much smaller vocabulary, so it carries its own flat dictionary. Keys
 * read as English sentences: a missing translation falls back to the key
 * itself, which is still usable rather than showing `admin.settings.title`.
 *
 * This module has no server-only imports — client components use it directly.
 */
export type AdminLocale = 'ar' | 'en';

export const ADMIN_LOCALES: AdminLocale[] = ['ar', 'en'];

export function isAdminLocale(value: unknown): value is AdminLocale {
  return value === 'ar' || value === 'en';
}

/** English key → Arabic translation. */
const AR: Record<string, string> = {
  // --- Chrome -------------------------------------------------------------
  Dashboard: 'لوحة التحكم',
  Overview: 'نظرة عامة',
  Work: 'الأعمال',
  Pages: 'الصفحات',
  Content: 'المحتوى',
  Configuration: 'الإعدادات',
  System: 'النظام',
  Projects: 'المشروعات',
  Collections: 'المجموعات',
  'Media Library': 'مكتبة الصور',
  Homepage: 'الصفحة الرئيسية',
  'Pages & SEO': 'الصفحات والسيو',
  Services: 'الخدمات',
  Sectors: 'القطاعات',
  Capabilities: 'القدرات',
  'Quality & Safety': 'الجودة والسلامة',
  'Risk Management': 'إدارة المخاطر',
  Timeline: 'الخط الزمني',
  Statistics: 'الإحصائيات',
  'Contact Messages': 'الرسائل',
  'Site Settings': 'إعدادات الموقع',
  'Social Links': 'روابط التواصل',
  Navigation: 'القوائم',
  Users: 'المستخدمون',
  'Activity Log': 'سجل النشاط',
  'View site': 'عرض الموقع',
  'Sign out': 'تسجيل الخروج',
  'Sign in': 'تسجيل الدخول',
  Administrator: 'مدير',
  Editor: 'محرر',
  'Open dashboard menu': 'فتح القائمة',
  'Close dashboard menu': 'إغلاق القائمة',
  'Dashboard sections': 'أقسام لوحة التحكم',

  // --- Common actions -----------------------------------------------------
  Save: 'حفظ',
  'Save changes': 'حفظ التعديلات',
  'Save settings': 'حفظ الإعدادات',
  'Save section': 'حفظ القسم',
  'Save page': 'حفظ الصفحة',
  'Save block': 'حفظ المحتوى',
  'Save image': 'حفظ الصورة',
  'Save selection': 'حفظ الاختيار',
  'Save note': 'حفظ الملاحظة',
  'Saving…': 'جارٍ الحفظ…',
  Cancel: 'إلغاء',
  Delete: 'حذف',
  'Deleting…': 'جارٍ الحذف…',
  Edit: 'تعديل',
  Add: 'إضافة',
  Search: 'بحث',
  Close: 'إغلاق',
  Clear: 'مسح',
  Remove: 'إزالة',
  Previous: 'السابق',
  Next: 'التالي',
  'Try again': 'إعادة المحاولة',
  'Loading…': 'جارٍ التحميل…',
  Published: 'منشور',
  Draft: 'مسودة',
  Visibility: 'الظهور',
  'Published — visible on the website': 'منشور — ظاهر في الموقع',
  'Draft — hidden from the website': 'مسودة — مخفي عن الموقع',
  'Draft — hidden': 'مسودة — مخفي',

  // --- Fields -------------------------------------------------------------
  'العربية — Arabic': 'العربية',
  English: 'English',
  Image: 'صورة',
  Icon: 'أيقونة',
  'Choose image': 'اختر صورة',
  'Select image': 'اختر صورة',
  'Change image': 'تغيير الصورة',
  'Select an image': 'اختر صورة',
  'No icon selected': 'لم يتم اختيار أيقونة',
  'URL fragment': 'الرابط المختصر',
  Title: 'العنوان',
  Description: 'الوصف',
  Label: 'التسمية',
  Value: 'القيمة',
  Year: 'السنة',
  Link: 'الرابط',
  Name: 'الاسم',
  Email: 'البريد الإلكتروني',
  Password: 'كلمة المرور',
  Phone: 'الهاتف',
  Mobile: 'المحمول',
  Role: 'الصلاحية',

  // --- Dashboard home -----------------------------------------------------
  'Quick actions': 'إجراءات سريعة',
  'New project': 'مشروع جديد',
  'Upload media': 'رفع صور',
  'Edit homepage': 'تعديل الرئيسية',
  'Recently updated projects': 'آخر المشروعات المحدّثة',
  'Recent activity': 'آخر النشاطات',
  'View all': 'عرض الكل',
  Drafts: 'مسودات',
  Featured: 'مميّز',
  'Media assets': 'ملفات الوسائط',
  'New messages': 'رسائل جديدة',
  'No projects yet': 'لا توجد مشروعات بعد',
  'No activity recorded yet.': 'لم يُسجَّل أي نشاط بعد.',
  'No messages': 'لا توجد رسائل',

  // --- Projects -----------------------------------------------------------
  'Project name': 'اسم المشروع',
  'Short summary': 'وصف مختصر',
  'Full description': 'الوصف الكامل',
  'Scope of work': 'نطاق الأعمال',
  'Project details': 'تفاصيل المشروع',
  Location: 'الموقع',
  Client: 'جهة التعاقد',
  Status: 'الحالة',
  Sector: 'القطاع',
  Governorate: 'المحافظة',
  Collection: 'المجموعة',
  'Not specified': 'غير محدد',
  Planned: 'قيد التخطيط',
  Ongoing: 'قيد التنفيذ',
  Completed: 'مكتمل',
  Photographs: 'الصور',
  'Add images': 'إضافة صور',
  'Related projects': 'مشروعات ذات صلة',
  'Save draft': 'حفظ كمسودة',
  Publish: 'نشر',
  'Preview draft': 'معاينة المسودة',
  'View live page': 'عرض الصفحة',
  'Duplicate project': 'نسخ المشروع',
  'Delete project': 'حذف المشروع',
  'Other actions': 'إجراءات أخرى',
  'Search projects…': 'ابحث في المشروعات…',
  All: 'الكل',
  Cover: 'الغلاف',
  Hero: 'الرئيسية',
  Images: 'الصور',
  Updated: 'آخر تحديث',
  Project: 'المشروع',

  // --- Media --------------------------------------------------------------
  'Upload images': 'رفع صور',
  'Drag files here or click to browse': 'اسحب الملفات هنا أو اضغط للاختيار',
  'Upload a new image': 'رفع صورة جديدة',
  'Upload new images': 'رفع صور جديدة',
  'Search the library…': 'ابحث في المكتبة…',
  Preview: 'معاينة',
  Details: 'التفاصيل',
  'Replace file': 'استبدال الملف',
  'Delete image': 'حذف الصورة',
  'Alt text': 'النص البديل',
  Caption: 'التعليق',
  'Image position': 'موضع الصورة',
  'Desktop view': 'شاشة الكمبيوتر',
  'Mobile view': 'شاشة الموبايل',
  'Horizontal (desktop)': 'أفقي (كمبيوتر)',
  'Vertical (desktop)': 'رأسي (كمبيوتر)',
  'Horizontal (mobile)': 'أفقي (موبايل)',
  'Vertical (mobile)': 'رأسي (موبايل)',
  'Reset to centre': 'إعادة للمنتصف',
  'File name': 'اسم الملف',
  Type: 'النوع',
  Size: 'الحجم',
  Dimensions: 'الأبعاد',
  Uploaded: 'تاريخ الرفع',
  'Used in': 'مستخدمة في',

  // --- Settings -----------------------------------------------------------
  Company: 'الشركة',
  'Company name': 'اسم الشركة',
  Tagline: 'الشعار النصي',
  'Contact details': 'بيانات التواصل',
  'WhatsApp number': 'رقم واتساب',
  'Head office address': 'عنوان المركز الرئيسي',
  'Branch address': 'عنوان الفرع',
  'Google Maps link': 'رابط خرائط جوجل',
  Logo: 'الشعار',
  'Primary logo': 'الشعار الأساسي',
  'Logo for dark backgrounds': 'شعار للخلفيات الغامقة',
  'Logo for light backgrounds': 'شعار للخلفيات الفاتحة',
  'Compact logo': 'شعار مصغّر',
  'Browser icon (favicon)': 'أيقونة المتصفح',
  Icons: 'الأيقونات',
  'Show icons on the website': 'إظهار الأيقونات في الموقع',
  Typography: 'الخطوط',
  'Arabic typeface': 'الخط العربي',
  'Search engines & sharing': 'محركات البحث والمشاركة',
  'Default page title': 'عنوان الصفحة الافتراضي',
  'Default description': 'الوصف الافتراضي',
  'Default sharing image': 'صورة المشاركة الافتراضية',
  'Maintenance mode': 'وضع الصيانة',
  'Turn on maintenance mode': 'تفعيل وضع الصيانة',
  'Dashboard language': 'لغة لوحة التحكم',
  Arabic: 'العربية',
  Profiles: 'الحسابات',

  // --- Messages -----------------------------------------------------------
  'Mark contacted': 'تم التواصل',
  'Mark closed': 'إغلاق',
  Reopen: 'إعادة فتح',
  'Internal note': 'ملاحظة داخلية',
  NEW: 'جديدة',
  CONTACTED: 'تم التواصل',
  CLOSED: 'مغلقة',

  // --- Users --------------------------------------------------------------
  Accounts: 'الحسابات',
  'Add user': 'إضافة مستخدم',
  'New user': 'مستخدم جديد',
  'Create user': 'إنشاء المستخدم',
  'Reset password': 'إعادة تعيين كلمة المرور',
  'New password': 'كلمة مرور جديدة',
  'Set password': 'تعيين كلمة المرور',
  'Account is active': 'الحساب مفعّل',
  You: 'أنت',
  Disabled: 'معطّل',

  // --- Activity -----------------------------------------------------------
  When: 'التوقيت',
  Who: 'المستخدم',
  Action: 'الإجراء',
  Page: 'صفحة',
  entries: 'سجل',

  /* -----------------------------------------------------------------------
     Longer help and description text.

     Brand names (Facebook, LinkedIn…), example placeholders and URL fragments
     are deliberately absent: they read the same in both languages.
  ----------------------------------------------------------------------- */

  // --- Dashboard home -----------------------------------------------------
  'Everything on the public website is managed from here. Changes appear on the site as soon as they are saved and published.':
    'كل ما يظهر على الموقع يُدار من هنا. التعديلات تظهر على الموقع فور حفظها ونشرها.',
  'The tasks you are most likely to need.': 'الإجراءات الأكثر استخدامًا.',
  'Nothing recorded yet': 'لا يوجد شيء مسجَّل بعد',
  New: 'جديد',

  // --- Projects -----------------------------------------------------------
  'Each project has its own page on the website. Published projects appear in the archive; featured ones also appear on the homepage.':
    'لكل مشروع صفحة خاصة على الموقع. المشروعات المنشورة تظهر في أرشيف الأعمال، والمميّزة منها تظهر أيضًا على الصفحة الرئيسية.',
  'Enter what you know and save a draft. Photographs can be added as soon as the project is saved.':
    'أدخل ما تعرفه واحفظه كمسودة. يمكن إضافة الصور فور حفظ المشروع.',
  'Leave anything you do not know empty — the website hides empty fields rather than showing placeholder text.':
    'اترك أي حقل لا تعرفه فارغًا — الموقع يخفي الحقول الفارغة ولا يعرض نصًا بديلًا.',
  'The name shown on the website. Fill in both languages where you can — if one is missing, the other is used.':
    'الاسم الذي يظهر على الموقع. املأ اللغتين إن أمكن — وإذا غابت إحداهما تُستخدم الأخرى.',
  'One or two lines, shown on project cards.': 'سطر أو سطران، يظهران على بطاقات المشروعات.',
  'Leave a blank line between paragraphs.': 'اترك سطرًا فارغًا بين كل فقرة والتي تليها.',
  'Leave a blank line between paragraphs. For lists such as Values, put one item per line.':
    'اترك سطرًا فارغًا بين الفقرات. وفي القوائم مثل «القيم» ضع كل عنصر في سطر مستقل.',
  'Shown as a fact list on the project page.': 'تظهر كقائمة بيانات في صفحة المشروع.',
  'Show this project on the homepage': 'إظهار هذا المشروع على الصفحة الرئيسية',
  'Order on the homepage': 'الترتيب على الصفحة الرئيسية',
  'Lower numbers appear first.': 'الأرقام الأصغر تظهر أولًا.',
  'Optional. Leave empty to let the website choose automatically, based on sector, governorate and collection.':
    'اختياري. اتركه فارغًا ليختار الموقع تلقائيًا حسب القطاع والمحافظة والمجموعة.',
  'Optional. When empty, the project name and summary are used.':
    'اختياري. إذا تُرك فارغًا يُستخدم اسم المشروع ووصفه المختصر.',
  'Used when the project link is shared on social media. Defaults to the site-wide image.':
    'تُستخدم عند مشاركة رابط المشروع على مواقع التواصل. وإن تُركت فارغة تُستخدم صورة الموقع العامة.',
  'Hide this project from search engines': 'إخفاء هذا المشروع عن محركات البحث',
  'Duplicating creates a draft copy, including the gallery. Deleting cannot be undone; the photographs stay in the media library.':
    'النسخ يُنشئ مسودة مطابقة بما فيها معرض الصور. أما الحذف فلا يمكن التراجع عنه، وتبقى الصور في مكتبة الصور.',
  'Create your first project to see it on the website.': 'أضف أول مشروع ليظهر على الموقع.',
  'Filter projects': 'تصفية المشروعات',
  'Generated from the Arabic name': 'يُولَّد من الاسم العربي',
  'Generated from the English name': 'يُولَّد من الاسم الإنجليزي',
  'Leave empty to generate automatically.': 'اتركه فارغًا ليُولَّد تلقائيًا.',
  'Arabic URL': 'الرابط العربي',
  'English URL': 'الرابط الإنجليزي',

  // --- Project gallery ----------------------------------------------------
  'Add images to this project': 'إضافة صور إلى هذا المشروع',
  'Add images from the library or upload new ones. The first image added becomes the hero automatically.':
    'أضف صورًا من المكتبة أو ارفع صورًا جديدة. أول صورة تُضاف تصبح الصورة الرئيسية تلقائيًا.',
  'Drag to reorder. The hero image opens the project page; the cover is used on cards and listings. Each image keeps its own crop.':
    'اسحب لإعادة الترتيب. الصورة الرئيسية تتصدّر صفحة المشروع، وصورة الغلاف تُستخدم في البطاقات والقوائم. ولكل صورة قصّتها الخاصة.',
  'No photographs yet': 'لا توجد صور بعد',
  'Alt text for this project': 'النص البديل لهذه الصورة داخل المشروع',
  'Overrides the description saved in the media library.': 'يحلّ محل الوصف المحفوظ في مكتبة الصور.',
  'Shown beneath the image in the full-screen gallery.': 'يظهر أسفل الصورة في العرض الكامل.',

  // --- Media --------------------------------------------------------------
  'Upload once, use anywhere. Images can be reused across projects, services and page headers — each usage keeps its own crop.':
    'ارفع الصورة مرة واحدة واستخدمها في أي مكان. يمكن استخدام الصورة نفسها في المشروعات والخدمات ورؤوس الصفحات، مع قصّة مستقلة لكل استخدام.',
  'Drag files in, or click to browse. Files are checked, resized and optimised automatically.':
    'اسحب الملفات إلى هنا أو اضغط للاختيار. تُفحص الملفات وتُضبط أحجامها وتُحسَّن تلقائيًا.',
  'Search by name, alt text or caption…': 'ابحث بالاسم أو النص البديل أو التعليق…',
  'Alt text is read aloud by screen readers and used by search engines. Captions appear under gallery images.':
    'النص البديل تقرأه برامج قراءة الشاشة وتستخدمه محركات البحث. أما التعليق فيظهر أسفل الصور في المعرض.',
  'Describe what the photograph shows, in a few words.': 'صف ما تُظهره الصورة في كلمات قليلة.',
  'Choose a replacement image': 'اختر صورة بديلة',
  'Upload a new file to replace this one everywhere it is used. Alt text, captions and crops are kept.':
    'ارفع ملفًا جديدًا ليحل محل هذا الملف في كل مكان استُخدم فيه، مع الاحتفاظ بالنص البديل والتعليق والقصّات.',
  'Choose the part of the image that must stay visible when it is cropped. Desktop and mobile are set separately because mobile crops are much tighter.':
    'حدّد الجزء الذي يجب أن يظل ظاهرًا من الصورة عند قصّها. تُضبط شاشة الكمبيوتر والموبايل كلٌّ على حدة لأن القصّ على الموبايل أضيق كثيرًا.',
  'Focal point being edited': 'نقطة التركيز قيد التعديل',
  'Desktop — wide banner': 'الكمبيوتر — شريط عريض',
  'Mobile — tall crop': 'الموبايل — قصّ طولي',
  File: 'الملف',
  'Media pages': 'صفحات المكتبة',

  // --- Homepage -----------------------------------------------------------
  'Everything on the front page of the website is edited here. Changes are live as soon as they are saved.':
    'كل ما يظهر على الصفحة الرئيسية يُعدَّل من هنا. التعديلات تصبح فعّالة فور حفظها.',
  'Each band of the homepage, top to bottom. Empty fields are hidden on the site rather than left blank.':
    'أقسام الصفحة الرئيسية من أعلى إلى أسفل. الحقول الفارغة تُخفى من الموقع ولا تظهر فارغة.',
  'Homepage sections': 'أقسام الصفحة الرئيسية',
  'Show this section on the homepage': 'إظهار هذا القسم على الصفحة الرئيسية',
  'Hero — the opening screen': 'الواجهة — الشاشة الافتتاحية',
  'Closing call to action': 'قسم الدعوة الختامية',
  'Projects on the homepage': 'المشروعات على الصفحة الرئيسية',
  'Featured projects appear in the Our Work section of the homepage, in the order set below.':
    'المشروعات المميّزة تظهر في قسم «أعمالنا» على الصفحة الرئيسية بالترتيب المحدَّد أدناه.',
  'Choose which projects appear in the Our Work section, then drag them into the order you want.':
    'اختر المشروعات التي تظهر في قسم «أعمالنا»، ثم اسحبها إلى الترتيب الذي تريده.',
  'Used as the background of this section.': 'تُستخدم كخلفية لهذا القسم.',
  'Section image': 'صورة القسم',
  Heading: 'العنوان الرئيسي',
  Subheading: 'العنوان الفرعي',
  'Small label above the heading': 'تسمية صغيرة فوق العنوان',
  'Body text': 'النص',
  Introduction: 'المقدمة',
  Text: 'النص',
  'Button label': 'نص الزر',
  'Button link': 'رابط الزر',
  'Second button label': 'نص الزر الثاني',
  'Second button link': 'رابط الزر الثاني',
  'Internal links start with a slash; the language prefix is added automatically.':
    'الروابط الداخلية تبدأ بشرطة مائلة، وتُضاف بادئة اللغة تلقائيًا.',

  // --- Pages & SEO --------------------------------------------------------
  'Headers, introductions and search-engine settings for each fixed page of the website.':
    'العناوين والمقدمات وإعدادات محركات البحث لكل صفحة ثابتة في الموقع.',
  'Page heading': 'عنوان الصفحة',
  'Page title': 'عنوان الصفحة في المتصفح',
  'Meta description': 'وصف الصفحة لمحركات البحث',
  'Header image': 'صورة رأس الصفحة',
  'Full-width image behind the page heading.': 'صورة بعرض الشاشة خلف عنوان الصفحة.',
  'Sharing image': 'صورة المشاركة',
  'Canonical URL': 'الرابط الأساسي',
  'Leave empty unless this page exists elsewhere': 'اتركه فارغًا إلا إذا كانت الصفحة موجودة على رابط آخر',
  'Hide this page from search engines': 'إخفاء هذه الصفحة عن محركات البحث',
  'Reference key': 'المُعرِّف',
  'Internal identifier, unique within this page.': 'مُعرِّف داخلي، فريد داخل هذه الصفحة.',
  About: 'من نحن',
  'Who we are': 'من نحن',
  'What we do': 'ما نقدمه',
  'Our work': 'أعمالنا',
  Contact: 'تواصل معنا',
  'Quality & safety': 'الجودة والسلامة',
  'Risk management': 'إدارة المخاطر',
  'Site settings': 'إعدادات الموقع',
  'Privacy Policy': 'سياسة الخصوصية',
  'Terms & Conditions': 'الشروط والأحكام',
  None: 'بدون',

  // --- Collections --------------------------------------------------------
  'Group several projects under one umbrella.': 'اجمع عدة مشروعات تحت مظلة واحدة.',

  // --- Settings -----------------------------------------------------------
  'Company details, contact channels, logo and search-engine defaults for the whole website.':
    'بيانات الشركة وقنوات التواصل والشعار وإعدادات محركات البحث للموقع بأكمله.',
  'Only the fields you fill in appear on the website. Leave anything you do not want published empty.':
    'تظهر على الموقع الحقول التي تملؤها فقط. اترك فارغًا كل ما لا تريد نشره.',
  'Show the floating WhatsApp button on the website': 'إظهار زر واتساب العائم على الموقع',
  'Only appears once a WhatsApp number has been saved.': 'لا يظهر إلا بعد حفظ رقم واتساب.',
  'The website picks the right version automatically. If nothing is uploaded, a typographic EL DAMARANY wordmark is used.':
    'يختار الموقع النسخة المناسبة تلقائيًا. وإذا لم تُرفع أي نسخة يُستخدم اسم EL DAMARANY بخط الشعار.',
  'Used wherever no specific version is set.': 'تُستخدم في كل موضع لم تُحدَّد له نسخة بعينها.',
  'Shown in the header and footer.': 'تظهر في رأس الصفحة وتذييلها.',
  'Optional, for narrow screens.': 'اختياري، للشاشات الضيقة.',
  "Small icons appear beside services, sectors, capabilities and the quality themes. Each item's icon is chosen in its own editor; this switch turns them all on or off at once.":
    'تظهر أيقونات صغيرة بجانب الخدمات والقطاعات والقدرات ومحاور الجودة. تُختار أيقونة كل عنصر من صفحة تحريره، وهذا المفتاح يُظهرها أو يخفيها جميعًا دفعة واحدة.',
  'Turn this off for a purely typographic look. The icons you have chosen are kept, just hidden.':
    'أوقف هذا الخيار للحصول على مظهر نصي خالص. تبقى الأيقونات التي اخترتها محفوظة، لكنها تُخفى فقط.',
  'The Arabic typeface used across the whole website. Every option below is a professional face designed for long-form Arabic reading — pick the one that reads best to you.':
    'الخط العربي المستخدم في الموقع بأكمله. كل خط في القائمة أدناه خط احترافي مصمَّم للقراءة الطويلة بالعربية — اختر ما يريح عينك أكثر.',
  'Changes the language and reading direction of this dashboard only. The website itself always offers both Arabic and English.':
    'يغيّر لغة لوحة التحكم واتجاه القراءة فيها فقط. أما الموقع نفسه فيظل متاحًا بالعربية والإنجليزية معًا.',
  'The dashboard reloads in the chosen language once the settings are saved.':
    'تُعاد لوحة التحكم باللغة المختارة بمجرد حفظ الإعدادات.',
  'Defaults used by any page that has no title or description of its own.':
    'قيم افتراضية تُستخدم لأي صفحة ليس لها عنوان أو وصف خاص بها.',
  'Shown when a link to the website is posted on social media.':
    'تظهر عند نشر رابط الموقع على مواقع التواصل.',
  'Leave empty to load no analytics at all.': 'اتركه فارغًا حتى لا تُحمَّل أي أدوات تحليل إطلاقًا.',
  'Closes the public website and shows a short notice instead. Signed-in staff keep full access.':
    'يغلق الموقع أمام الزوار ويعرض إشعارًا مختصرًا بدلًا منه. ويظل الدخول كاملًا لمن سجّل دخوله.',
  'Paste the full address of each profile. Empty fields are simply not shown on the website — no placeholder icons appear.':
    'الصق العنوان الكامل لكل حساب. الحقول الفارغة لا تظهر على الموقع إطلاقًا، ولا تُعرض أيقونات فارغة.',
  'Links appear in the footer and on the contact page as soon as they are saved.':
    'تظهر الروابط في تذييل الموقع وصفحة التواصل فور حفظها.',

  // --- Messages -----------------------------------------------------------
  'Enquiries submitted through the contact form on the website.':
    'الطلبات الواردة عبر نموذج التواصل في الموقع.',
  "Enquiries from the website's contact form will appear here.":
    'ستظهر هنا الطلبات الواردة من نموذج التواصل في الموقع.',
  'Filter messages': 'تصفية الرسائل',
  'Optional — not visible to the sender': 'اختياري — لا يراه المُرسِل',

  // --- Users --------------------------------------------------------------
  'Who can sign in to this dashboard.': 'من يستطيع الدخول إلى لوحة التحكم.',
  'Editors can manage content, projects and media. Administrators can additionally delete records and manage users.':
    'المحرر يدير المحتوى والمشروعات والصور. أما المدير فيستطيع إضافة إلى ذلك حذف السجلات وإدارة المستخدمين.',
  'Administrator — full access, including deletion': 'مدير — صلاحية كاملة تشمل الحذف',
  'Editor — content, projects and media': 'محرر — المحتوى والمشروعات والصور',

  // --- Activity -----------------------------------------------------------
  'A record of what has been changed in the dashboard, and by whom.':
    'سجل بما تم تغييره في لوحة التحكم ومن قام به.',
  'Actions taken in the dashboard will be listed here.': 'ستُدرَج هنا الإجراءات التي تتم في لوحة التحكم.',
  'Activity pages': 'صفحات السجل',
  'Looking for a specific change?': 'تبحث عن تغيير بعينه؟',
  'Open the project list': 'افتح قائمة المشروعات',
  'to see when each project was last updated.': 'لمعرفة آخر تحديث لكل مشروع.',

  // --- Odds and ends ------------------------------------------------------
  Welcome: 'مرحبًا',
  'View messages': 'عرض الرسائل',
  of: 'من',
  never: 'لم يحدث',
  'Last sign-in': 'آخر دخول',
  'Add a project': 'إضافة مشروع',
  'Search media': 'البحث في الصور',
  'Uploading files…': 'جارٍ رفع الملفات…',
  'Content blocks': 'أقسام المحتوى',
  'New block': 'قسم جديد',
  'Additional prose sections on this page — vision, mission, values and similar. Blocks without text are hidden on the website.':
    'أقسام نصية إضافية في هذه الصفحة — الرؤية والرسالة والقيم وما شابهها. الأقسام التي بلا نص تُخفى من الموقع.',
  'How the image will be cropped on the site': 'كيف ستُقصّ الصورة على الموقع',
  'Drag to set the desktop focal point': 'اسحب لتحديد نقطة التركيز على شاشة الكمبيوتر',
  'Drag to set the mobile focal point': 'اسحب لتحديد نقطة التركيز على شاشة الموبايل',
  Breadcrumb: 'مسار التنقل',
  'Search projects': 'البحث في المشروعات',
  'Nothing here yet': 'لا يوجد شيء هنا بعد',

  // --- News, partners and the newsletter ----------------------------------
  'The two panels on the homepage and the Quality & Safety page. Each panel is built from its own themes: the first theme with a description supplies the panel’s opening line, the first with a photograph supplies its backdrop, and the rest become the ticked list.':
    'اللوحتان اللتان تظهران على الصفحة الرئيسية وصفحة الجودة والسلامة. تُبنى كل لوحة من محاورها: أول محور له وصف يصبح جملة اللوحة الافتتاحية، وأول محور له صورة تصبح خلفيتها، وباقي المحاور تصير القائمة المؤشَّرة.',
  'Filled in on the first theme of a column, this becomes the sentence under the panel heading — and that theme drops out of the ticked list.':
    'إذا مُلئ في أول محور من العمود، يصبح الجملة التي تحت عنوان اللوحة — ويخرج ذلك المحور من القائمة المؤشَّرة.',
  'A photograph on the first theme of a column becomes the backdrop behind that whole panel.':
    'الصورة الموضوعة على أول محور من العمود تصبح خلفية اللوحة كلها.',

  News: 'الأخبار',
  'News item': 'خبر',
  Headline: 'العنوان',
  'Full text': 'النص الكامل',
  Date: 'التاريخ',
  'One or two lines, shown on the card. The full text goes below.':
    'سطر أو سطران يظهران على البطاقة. أما النص الكامل فيوضع أسفله.',
  'The date shown on the card. Set it to when the work happened, not when you type it.':
    'التاريخ الذي يظهر على البطاقة. اضبطه على وقت حدوث العمل، لا على وقت كتابتك للخبر.',
  'Announcements shown on the homepage and the News page, newest first. Nothing appears on the website until an item is published.':
    'الأخبار التي تظهر على الصفحة الرئيسية وصفحة الأخبار، الأحدث أولًا. ولا يظهر أي خبر على الموقع قبل نشره.',
  Partners: 'الشركاء',
  Partner: 'شريك',
  Organisation: 'الجهة',
  Website: 'الموقع الإلكتروني',
  'Preferably on a transparent background.': 'يُفضَّل أن يكون بخلفية شفافة.',
  'Optional. When set, the logo links to it.': 'اختياري. وعند ضبطه يصبح الشعار رابطًا إليه.',
  'Organisations shown in the partners strip. A partner with no logo uploaded is left off the website rather than shown as an empty box.':
    'الجهات التي تظهر في شريط الشركاء. والشريك الذي لم يُرفع له شعار يُستبعد من الموقع بدل عرضه كمربع فارغ.',
  Newsletter: 'النشرة البريدية',
  subscriber: 'مشترك',
  subscribers: 'مشترك',
  'No subscribers yet': 'لا يوجد مشتركون بعد',
  Language: 'اللغة',
  Subscribed: 'تاريخ الاشتراك',
  'Addresses collected by the subscribe form on the website. Copy them into whichever mailing tool you use — nothing is sent from here.':
    'العناوين التي جمعها نموذج الاشتراك في الموقع. انسخها إلى أداة البريد التي تستخدمها — لا يُرسَل أي بريد من هنا.',
  'Anyone who subscribes through the website will be listed here.':
    'سيظهر هنا كل من يشترك عبر الموقع.',
  Hidden: 'مخفي',
  'Save the project first — the photo gallery, hero selection and image cropping become available once it exists.':
    'احفظ المشروع أولًا — يصبح معرض الصور واختيار الصورة الرئيسية وقصّ الصور متاحًا بمجرد وجوده.',
  'Draft — will not appear': 'مسودة — لن تظهر',
  'Only published projects appear on the homepage. Set the page title and social image under':
    'المشروعات المنشورة وحدها هي التي تظهر على الصفحة الرئيسية. ويُضبط عنوان الصفحة وصورة المشاركة من',

  // --- Homepage section hints --------------------------------------------
  'Full-screen image, headline and the two main buttons.':
    'صورة بملء الشاشة، والعنوان الرئيسي، والزرّان الأساسيان.',
  'Introduction to the company, with a link to the About page.':
    'تعريف بالشركة مع رابط إلى صفحة «من نحن».',
  'Label above the figures. Edit the figures themselves under Content → Statistics.':
    'التسمية التي تعلو الأرقام. أما الأرقام نفسها فتُحرَّر من المحتوى ← الإحصائيات.',
  'Heading for the services list. Edit the services under Content → Services.':
    'عنوان قائمة الخدمات. وتُحرَّر الخدمات نفسها من المحتوى ← الخدمات.',
  'Heading for the featured projects, chosen further down this page.':
    'عنوان المشروعات المميّزة، وتُختار من أسفل هذه الصفحة.',
  'Dark band summarising the quality and safety approach.':
    'شريط داكن يلخّص نهج الجودة والسلامة.',
  'Heading for the risk process. Edit the steps under Content → Risk Management.':
    'عنوان عملية إدارة المخاطر. وتُحرَّر الخطوات من المحتوى ← إدارة المخاطر.',
  'The final band, above the footer.': 'الشريط الأخير، أعلى تذييل الصفحة.',
  'You cannot change your own role or disable your own account.':
    'لا يمكنك تغيير صلاحيتك أنت، ولا تعطيل حسابك الخاص.',
  'At least 12 characters, with a letter and a number.':
    'اثنا عشر حرفًا على الأقل، على أن تتضمن حرفًا ورقمًا.',

  // --- Content resources (services, sectors, capabilities, …) -------------
  Capability: 'قدرة',
  'Company Timeline': 'الخط الزمني للشركة',
  Milestone: 'محطة',
  'Project Collections': 'مجموعات المشروعات',
  'Collection name': 'اسم المجموعة',
  'Menu item': 'عنصر قائمة',
  Menu: 'القائمة',
  Header: 'رأس الصفحة',
  Footer: 'تذييل الصفحة',
  Service: 'خدمة',
  'Service name': 'اسم الخدمة',
  'Sector name': 'اسم القطاع',
  Theme: 'محور',
  Quality: 'الجودة',
  Safety: 'السلامة',
  Column: 'العمود',
  Step: 'خطوة',
  'Step name': 'اسم الخطوة',
  'Step number': 'رقم الخطوة',
  Statistic: 'إحصائية',
  Prefix: 'بادئة',
  Suffix: 'لاحقة',
  'Cover image': 'صورة الغلاف',
  'External link (opens in a new tab)': 'رابط خارجي (يُفتح في تبويب جديد)',
  'Show on the homepage': 'إظهار على الصفحة الرئيسية',
  'Visible on the website': 'ظاهر على الموقع',
  'Internal identifier; must be unique.': 'مُعرِّف داخلي، ويجب أن يكون فريدًا.',
  'Leave empty to hide this statistic.': 'اتركه فارغًا لإخفاء هذه الإحصائية.',
  'Used for links such as /services#roads-paving.': 'يُستخدم في روابط مثل /services#roads-paving.',
  'Shown beside the service. Icons can be hidden site-wide in Site Settings.':
    'تظهر بجانب الخدمة. ويمكن إخفاء الأيقونات من الموقع كله من إعدادات الموقع.',
  'The fields of work shown on the homepage and the Services page. Drag to change the order they appear in.':
    'مجالات العمل التي تظهر على الصفحة الرئيسية وصفحة الخدمات. اسحب لتغيير ترتيب ظهورها.',
  'Technical and operational capabilities, shown in three bands. Choose which band each one belongs to, then drag to order it within that band.':
    'القدرات الفنية والتشغيلية، معروضة في ثلاثة نطاقات. اختر النطاق الذي ينتمي إليه كل عنصر، ثم اسحبه لترتيبه داخل نطاقه.',
  Band: 'النطاق',
  'Experience & delivery': 'الخبرة والتنفيذ',
  Resources: 'الإمكانات',
  'Fields of work': 'مجالات العمل',
  'The steps of the risk-management process, drawn as a numbered sequence.':
    'خطوات عملية إدارة المخاطر، معروضة كتسلسل مرقّم.',
  'Themes shown in the two columns of the Quality & Safety page. Choose which column each one belongs to.':
    'المحاور التي تظهر في عمودَي صفحة الجودة والسلامة. اختر العمود الذي ينتمي إليه كل محور.',
  'Milestones in the company history, shown on the About page. Only add years you can confirm.':
    'محطات في تاريخ الشركة تظهر في صفحة «من نحن». لا تُضِف إلا السنوات التي يمكنك تأكيدها.',
  'Umbrella groups such as “Alexandria Governorate Projects”. Assign projects to a collection from the project editor.':
    'مجموعات جامعة مثل «مشروعات محافظة الإسكندرية». يمكن ضم المشروعات إلى مجموعة من صفحة تحرير المشروع.',
  'Sectors classify projects and drive the filters on the Projects page. A sector with no published projects is listed as text only.':
    'القطاعات تصنّف المشروعات وتُبنى عليها عوامل التصفية في صفحة المشروعات. والقطاع الذي لا مشروعات منشورة فيه يظهر كنص فقط.',
  'Figures shown on the homepage and About page. A statistic with an empty value is hidden automatically — never invent a number.':
    'أرقام تظهر على الصفحة الرئيسية وصفحة «من نحن». والإحصائية التي بلا قيمة تُخفى تلقائيًا — ولا يجوز اختلاق أي رقم.',
  'Links in the header and footer menus. Internal links start with a slash, for example /projects — the language prefix is added automatically.':
    'روابط قوائم رأس الصفحة والتذييل. الروابط الداخلية تبدأ بشرطة مائلة، مثل /projects — وتُضاف بادئة اللغة تلقائيًا.',
  file: 'ملف',
  files: 'ملف',
  'No matching files': 'لا توجد ملفات مطابقة',
  'No media uploaded yet': 'لم تُرفع أي صور بعد',
  'Try a different search term.': 'جرّب كلمة بحث أخرى.',
  'Upload photographs of your projects to use them across the website.':
    'ارفع صور مشروعاتك لاستخدامها في أنحاء الموقع.',
  'JPEG, PNG, WebP, AVIF or SVG': 'JPEG أو PNG أو WebP أو AVIF أو SVG',
  'JPEG, PNG, WebP, AVIF or SVG — up to 50 files at a time':
    'JPEG أو PNG أو WebP أو AVIF أو SVG — حتى ٥٠ ملفًا في المرة الواحدة',
  'No matching projects': 'لا توجد مشروعات مطابقة',
  'Try clearing the filters.': 'جرّب إزالة عوامل التصفية.',
  'Create your first project, add photographs and publish it to the website.':
    'أنشئ أول مشروع، وأضف الصور، ثم انشره على الموقع.',
  'Google Analytics ID': 'معرّف Google Analytics',
  'Google site verification': 'رمز تحقق Google',
};

/**
 * Returns a translator for the given locale. English is the source language,
 * so its translator is the identity function.
 */
export function adminT(locale: AdminLocale) {
  if (locale === 'en') return (key: string) => key;
  return (key: string) => AR[key] ?? key;
}

export type AdminTranslator = ReturnType<typeof adminT>;

export function adminDirection(locale: AdminLocale): 'rtl' | 'ltr' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

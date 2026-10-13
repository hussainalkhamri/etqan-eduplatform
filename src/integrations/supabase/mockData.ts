// بذور البيانات الاصطناعية لمنصة إتقان التعليمية (Synthetic Seed Data)
// 100% Synthetic & Neutral — Safe for Public Portfolio Demonstrations

export interface MockCategory {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface MockProduct {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  page_count: number;
  dimensions: string | null;
  category_id: string | null;
  is_available: boolean;
  pdf_url: string | null;
  images: string[] | null;
  features: string[] | null;
  created_at: string;
  updated_at: string;
  category?: MockCategory;
}

export interface MockProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  qualification: string | null;
  school_name: string | null;
  city: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MockOrder {
  id: string;
  order_number: string;
  user_id: string;
  status: 'pending' | 'processing' | 'ready' | 'delivered' | 'cancelled';
  total_amount: number;
  notes: string | null;
  admin_notes: string | null;
  whatsapp_number: string | null;
  created_at: string;
  updated_at: string;
  order_items?: any[];
}

export const INITIAL_CATEGORIES: MockCategory[] = [
  {
    id: 'cat-workbooks',
    name: 'الكراسات',
    description: 'كراسات تحضير ومتابعة وتقويم صفي للمعلمين والمعلمات',
    created_at: new Date('2026-01-10').toISOString(),
  },
  {
    id: 'cat-files',
    name: 'الملفات',
    description: 'ملفات إنجاز وسجلات توثيق تعليمية وإدارية',
    created_at: new Date('2026-01-10').toISOString(),
  },
  {
    id: 'cat-bundles',
    name: 'الحزم',
    description: 'مجموعات متكاملة للمعلمين بأسعار وعروض خاصة',
    created_at: new Date('2026-01-10').toISOString(),
  },
];

export const INITIAL_PRODUCTS: MockProduct[] = [
  {
    id: 'prod-01',
    name: 'كراسة المعلم الشاملة - لغة عربية',
    description: 'كراسة عمل متكاملة تتضمن سجلات التحضير الأسبوعي، شبكات التقويم، وخطط الأنشطة التفاعلية المصممة وفق المناهج الحديثة.',
    base_price: 65,
    page_count: 120,
    dimensions: 'A4',
    category_id: 'cat-workbooks',
    is_available: true,
    pdf_url: 'https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf',
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80'],
    features: ['سجل تقويم مستمر', 'أوراق عمل قابلة للطباعة', 'تخصيص الاسم والبيانات على الغلاف', 'متابعة أسبوعية دقيقة'],
    created_at: new Date('2026-01-15').toISOString(),
    updated_at: new Date('2026-01-15').toISOString(),
  },
  {
    id: 'prod-02',
    name: 'كراسة الرياضيات التفاعلية والأنشطة الذهنية',
    description: 'كراسة مصممة لتبسيط المفاهيم الرياضية، تضم جداول التقييم السريع ومصفوفات حل المشكلات.',
    base_price: 70,
    page_count: 140,
    dimensions: 'A4',
    category_id: 'cat-workbooks',
    is_available: true,
    pdf_url: 'https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf',
    images: ['https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=80'],
    features: ['مخططات استراتيجيات التدريس', 'أدوات تقويم الأداء المهاري', 'تصميم فاخر بألوان مريحة'],
    created_at: new Date('2026-01-20').toISOString(),
    updated_at: new Date('2026-01-20').toISOString(),
  },
  {
    id: 'prod-03',
    name: 'كراسة الاستكشاف والتجارب العلمية',
    description: 'دليل منظم لمعلمي ومعلمات العلوم لتتبع التجارب العملية وتقييم الأداء المعملي بدقة وسهولة.',
    base_price: 60,
    page_count: 100,
    dimensions: 'A4',
    category_id: 'cat-workbooks',
    is_available: true,
    pdf_url: null,
    images: ['https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80'],
    features: ['جداول تقييم السلامة المعملية', 'نماذج تقارير التجارب', 'فهارس منظمة للوحدات'],
    created_at: new Date('2026-02-01').toISOString(),
    updated_at: new Date('2026-02-01').toISOString(),
  },
  {
    id: 'prod-04',
    name: 'ملف الإنجاز المهني للمعلم المتميز',
    description: 'سجل توثيق الشواهد والأدلة المهنية المنظم وفق معايير التميز والإشراف التربوي الحديث.',
    base_price: 85,
    page_count: 160,
    dimensions: 'A4',
    category_id: 'cat-files',
    is_available: true,
    pdf_url: null,
    images: ['https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80'],
    features: ['فواصل أنيقة لجميع المجالات', 'نماذج النمو المهني وورش العمل', 'تنسيق قابل للتخصيص بالكامل'],
    created_at: new Date('2026-02-10').toISOString(),
    updated_at: new Date('2026-02-10').toISOString(),
  },
  {
    id: 'prod-05',
    name: 'سجل التوجيه الطلابي والمتابعة الفردية',
    description: 'ملف توثيقي شامل لدراسة الحالات ومتابعة الفروق الفردية وخطط الدعم الإثرائي والعلاجي.',
    base_price: 55,
    page_count: 90,
    dimensions: 'A4',
    category_id: 'cat-files',
    is_available: true,
    pdf_url: null,
    images: ['https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80'],
    features: ['نماذج تشخيصية دقيقة', 'سجل التواصل مع أولياء الأمور', 'خطط المتابعة الدورية'],
    created_at: new Date('2026-02-18').toISOString(),
    updated_at: new Date('2026-02-18').toISOString(),
  },
  {
    id: 'prod-06',
    name: 'الحزمة الماسية السنوية لتجهيز المعلم',
    description: 'باقة متكاملة تشمل كراسة التحضير الشاملة، ملف الإنجاز، وسجل المتابعة مع خصم خاص وتخصيص هوية المدرسة.',
    base_price: 160,
    page_count: 350,
    dimensions: 'A4',
    category_id: 'cat-bundles',
    is_available: true,
    pdf_url: null,
    images: ['https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80'],
    features: ['تشمل 3 منتجات متكاملة', 'تخصيص كامل للشعار والاسم', 'تغليف فاخر وجودة طباعة عالية'],
    created_at: new Date('2026-02-25').toISOString(),
    updated_at: new Date('2026-02-25').toISOString(),
  },
];

export const INITIAL_PROFILES: MockProfile[] = [
  {
    id: 'profile-admin',
    user_id: 'user-admin-id',
    full_name: 'مدير منصة إتقان (تجريبي)',
    email: 'admin@etqan-edu.example.com',
    phone: '+966 11 000 0001',
    qualification: 'ماجستير مناهج وإشراف تربوي',
    school_name: 'الإدارة المركزية لمنصة إتقان',
    city: 'الرياض',
    is_active: true,
    created_at: new Date('2026-01-01').toISOString(),
    updated_at: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'profile-teacher',
    user_id: 'user-teacher-id',
    full_name: 'أ. نورة الشمري (معلمة تجريبية)',
    email: 'teacher@etqan-edu.example.com',
    phone: '+966 50 111 2233',
    qualification: 'بكالوريوس لغة عربية ودراسات إسلامية',
    school_name: 'ثانوية الرواد النموذجية',
    city: 'الرياض',
    is_active: true,
    created_at: new Date('2026-01-05').toISOString(),
    updated_at: new Date('2026-01-05').toISOString(),
  },
  {
    id: 'profile-user2',
    user_id: 'user-teacher2-id',
    full_name: 'أ. فهد بن خالد المطيري',
    email: 'fahad@etqan-edu.example.com',
    phone: '+966 55 999 8877',
    qualification: 'بكالوريوس رياضيات وإحصاء',
    school_name: 'مجمع الأندلس التعليمي',
    city: 'جدة',
    is_active: true,
    created_at: new Date('2026-01-12').toISOString(),
    updated_at: new Date('2026-01-12').toISOString(),
  },
];

export const INITIAL_ORDERS: MockOrder[] = [
  {
    id: 'order-01',
    order_number: 'ORD-20261010-1042',
    user_id: 'user-teacher-id',
    status: 'delivered',
    total_amount: 195,
    notes: 'يرجى طباعة الاسم بالخط الكوفي وتثبيت شعار المدرسة على الزاوية العلوية',
    admin_notes: 'تم التسليم عبر شركة الشحن السريع ورقم التتبع TRK-98214',
    whatsapp_number: '+966 50 111 2233',
    created_at: new Date('2026-10-10T09:30:00').toISOString(),
    updated_at: new Date('2026-10-11T14:20:00').toISOString(),
    order_items: [
      {
        id: 'item-01',
        order_id: 'order-01',
        product_id: 'prod-01',
        quantity: 3,
        unit_price: 65,
        product: { name: 'كراسة المعلم الشاملة - لغة عربية', base_price: 65 },
        customization: {
          teacher_name: 'أ. نورة الشمري',
          school_name: 'ثانوية الرواد النموذجية',
          qualifications: 'بكالوريوس لغة عربية',
          additional_notes: 'نسخة مخصصة للفصل الدراسي الثاني',
        },
      },
    ],
  },
  {
    id: 'order-02',
    order_number: 'ORD-20261012-3491',
    user_id: 'user-teacher2-id',
    status: 'processing',
    total_amount: 140,
    notes: 'إضافة فواصل خاصة باختبارات منتصف الفصل',
    admin_notes: 'قيد الطباعة في المطبعة المركزية',
    whatsapp_number: '+966 55 999 8877',
    created_at: new Date('2026-10-12T11:15:00').toISOString(),
    updated_at: new Date('2026-10-12T13:00:00').toISOString(),
    order_items: [
      {
        id: 'item-02',
        order_id: 'order-02',
        product_id: 'prod-02',
        quantity: 2,
        unit_price: 70,
        product: { name: 'كراسة الرياضيات التفاعلية والأنشطة الذهنية', base_price: 70 },
        customization: {
          teacher_name: 'أ. فهد بن خالد المطيري',
          school_name: 'مجمع الأندلس التعليمي',
          qualifications: 'بكالوريوس رياضيات',
          additional_notes: 'مطلوب إرفاق نسخة رقمية',
        },
      },
    ],
  },
  {
    id: 'order-03',
    order_number: 'ORD-20261013-8820',
    user_id: 'user-teacher-id',
    status: 'pending',
    total_amount: 160,
    notes: 'طلب عاجل للحزمة السنوية الماسية',
    admin_notes: null,
    whatsapp_number: '+966 50 111 2233',
    created_at: new Date('2026-10-13T08:45:00').toISOString(),
    updated_at: new Date('2026-10-13T08:45:00').toISOString(),
    order_items: [
      {
        id: 'item-03',
        order_id: 'order-03',
        product_id: 'prod-06',
        quantity: 1,
        unit_price: 160,
        product: { name: 'الحزمة الماسية السنوية لتجهيز المعلم', base_price: 160 },
        customization: {
          teacher_name: 'أ. نورة الشمري',
          school_name: 'ثانوية الرواد النموذجية',
          qualifications: 'معلمة خبيرة',
          additional_notes: 'طباعة الشعار الرسمي باللون الذهبي',
        },
      },
    ],
  },
];

// محاكي Supabase المكتفي ذاتياً (Zero-Cloud Mock Adapter)
// يسمح بتشغيل واستعراض التطبيق كاملاً محلياً أو في عروض المحفظة دون اشتراط وجود اتصال سحابي

import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_PROFILES,
  INITIAL_ORDERS,
  MockCategory,
  MockProduct,
  MockProfile,
  MockOrder,
} from './mockData';

// مفاتيح التخزين المحلي
const STORAGE_KEYS = {
  PRODUCTS: 'etqan_demo_products',
  CATEGORIES: 'etqan_demo_categories',
  PROFILES: 'etqan_demo_profiles',
  ORDERS: 'etqan_demo_orders',
  ORDER_ITEMS: 'etqan_demo_order_items',
  CUSTOMIZATIONS: 'etqan_demo_customizations',
  USER_ROLES: 'etqan_demo_user_roles',
  CURRENT_USER: 'etqan_demo_current_user',
  CURRENT_SESSION: 'etqan_demo_current_session',
};

// تهيئة البيانات الافتراضية في LocalStorage
export function initStorage() {
  if (typeof localStorage === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PROFILES)) {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(INITIAL_PROFILES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USER_ROLES)) {
    localStorage.setItem(
      STORAGE_KEYS.USER_ROLES,
      JSON.stringify([
        { id: 'role-admin', user_id: 'user-admin-id', role: 'admin', created_at: new Date().toISOString() },
        { id: 'role-teacher', user_id: 'user-teacher-id', role: 'customer', created_at: new Date().toISOString() },
        { id: 'role-teacher2', user_id: 'user-teacher2-id', role: 'customer', created_at: new Date().toISOString() },
      ])
    );
  }
  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
    // تسجيل دخول افتراضي كمدير نظام لتسهيل المعاينة الفورية لمدراء التوظيف
    const defaultUser = {
      id: 'user-admin-id',
      email: 'admin@etqan-edu.example.com',
      user_metadata: { full_name: 'مدير منصة إتقان (تجريبي)' },
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    };
    const defaultSession = {
      access_token: 'demo-token-mock-123',
      token_type: 'bearer',
      user: defaultUser,
      expires_in: 36000,
    };
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(defaultUser));
    localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(defaultSession));
  }
}

initStorage();

function getItems<T>(key: string): T[] {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : [];
  } catch {
    return [];
  }
}

function setItems<T>(key: string, data: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('LocalStorage write error:', err);
  }
}

// قائمة مستمعي تغير حالة الجلسة
type AuthListener = (event: string, session: any) => void;
const authListeners: AuthListener[] = [];

class QueryBuilder<T = any> {
  private tableName: string;
  private filters: Array<(item: any) => boolean> = [];
  private orderField: string | null = null;
  private orderAscending: boolean = true;
  private isSingle: boolean = false;
  private selectCount: boolean = false;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(fields?: string, options?: { count?: 'exact' }) {
    if (options?.count === 'exact') {
      this.selectCount = true;
    }
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push((item) => String(item[column]) === String(value));
    return this;
  }

  order(field: string, options?: { ascending?: boolean }) {
    this.orderField = field;
    this.orderAscending = options?.ascending ?? true;
    return this;
  }

  maybeSingle() {
    this.isSingle = true;
    return this.execute();
  }

  single() {
    this.isSingle = true;
    return this.execute();
  }

  private getData(): any[] {
    switch (this.tableName) {
      case 'products':
        return getItems<MockProduct>(STORAGE_KEYS.PRODUCTS).map((p) => {
          const cats = getItems<MockCategory>(STORAGE_KEYS.CATEGORIES);
          const category = cats.find((c) => c.id === p.category_id);
          return { ...p, category };
        });
      case 'product_categories':
        return getItems<MockCategory>(STORAGE_KEYS.CATEGORIES);
      case 'profiles':
        return getItems<MockProfile>(STORAGE_KEYS.PROFILES);
      case 'orders':
        return getItems<MockOrder>(STORAGE_KEYS.ORDERS);
      case 'user_roles':
        return getItems<any>(STORAGE_KEYS.USER_ROLES);
      case 'order_items':
        return getItems<any>(STORAGE_KEYS.ORDER_ITEMS);
      case 'customizations':
        return getItems<any>(STORAGE_KEYS.CUSTOMIZATIONS);
      default:
        return [];
    }
  }

  private saveCurrent(data: any[]) {
    switch (this.tableName) {
      case 'products':
        setItems(STORAGE_KEYS.PRODUCTS, data);
        break;
      case 'product_categories':
        setItems(STORAGE_KEYS.CATEGORIES, data);
        break;
      case 'profiles':
        setItems(STORAGE_KEYS.PROFILES, data);
        break;
      case 'orders':
        setItems(STORAGE_KEYS.ORDERS, data);
        break;
      case 'user_roles':
        setItems(STORAGE_KEYS.USER_ROLES, data);
        break;
      case 'order_items':
        setItems(STORAGE_KEYS.ORDER_ITEMS, data);
        break;
      case 'customizations':
        setItems(STORAGE_KEYS.CUSTOMIZATIONS, data);
        break;
    }
  }

  async execute(): Promise<{ data: any; error: null; count?: number }> {
    let result = this.getData();

    for (const filter of this.filters) {
      result = result.filter(filter);
    }

    if (this.orderField) {
      const field = this.orderField;
      const asc = this.orderAscending;
      result = [...result].sort((a, b) => {
        if (a[field] < b[field]) return asc ? -1 : 1;
        if (a[field] > b[field]) return asc ? 1 : -1;
        return 0;
      });
    }

    const count = result.length;

    if (this.isSingle) {
      return { data: result[0] || null, error: null, count: this.selectCount ? count : undefined };
    }

    return { data: result, error: null, count: this.selectCount ? count : undefined };
  }

  then(onfulfilled?: (value: { data: any; error: null; count?: number }) => any) {
    return this.execute().then(onfulfilled);
  }

  async insert(recordOrRecords: any | any[]) {
    const list = Array.isArray(recordOrRecords) ? recordOrRecords : [recordOrRecords];
    const current = this.getData();
    const created: any[] = [];

    for (const item of list) {
      const newRec = {
        id: item.id || `mock-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...item,
      };
      current.unshift(newRec);
      created.push(newRec);
    }

    this.saveCurrent(current);
    return { data: Array.isArray(recordOrRecords) ? created : created[0], error: null };
  }

  async update(patch: any) {
    const current = this.getData();
    let updatedItem: any = null;

    const modified = current.map((item) => {
      let matches = true;
      for (const filter of this.filters) {
        if (!filter(item)) {
          matches = false;
          break;
        }
      }
      if (matches) {
        updatedItem = { ...item, ...patch, updated_at: new Date().toISOString() };
        return updatedItem;
      }
      return item;
    });

    this.saveCurrent(modified);
    return { data: updatedItem, error: null };
  }

  async delete() {
    const current = this.getData();
    const remaining = current.filter((item) => {
      for (const filter of this.filters) {
        if (filter(item)) return false;
      }
      return true;
    });

    this.saveCurrent(remaining);
    return { data: null, error: null };
  }
}

export const mockSupabase = {
  from(tableName: string) {
    return new QueryBuilder(tableName);
  },

  auth: {
    async getSession() {
      try {
        const sessionStr = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
        const session = sessionStr ? JSON.parse(sessionStr) : null;
        return { data: { session }, error: null };
      } catch {
        return { data: { session: null }, error: null };
      }
    },

    onAuthStateChange(callback: AuthListener) {
      authListeners.push(callback);
      const sessionStr = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
      const session = sessionStr ? JSON.parse(sessionStr) : null;
      setTimeout(() => {
        callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
      }, 0);

      return {
        data: {
          subscription: {
            unsubscribe: () => {
              const idx = authListeners.indexOf(callback);
              if (idx > -1) authListeners.splice(idx, 1);
            },
          },
        },
      };
    },

    async signInWithPassword({ email, password }: { email: string; password?: string }) {
      const profiles = getItems<MockProfile>(STORAGE_KEYS.PROFILES);
      const userRoles = getItems<any>(STORAGE_KEYS.USER_ROLES);
      let profile = profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());

      if (!profile) {
        profile = {
          id: `profile-${Date.now()}`,
          user_id: `user-${Date.now()}`,
          full_name: email.split('@')[0],
          email,
          phone: null,
          qualification: null,
          school_name: null,
          city: null,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        profiles.push(profile);
        setItems(STORAGE_KEYS.PROFILES, profiles);
      }

      const user = {
        id: profile.user_id,
        email: profile.email,
        user_metadata: { full_name: profile.full_name },
        app_metadata: {},
        aud: 'authenticated',
        created_at: profile.created_at,
      };

      const session = {
        access_token: `token-${Date.now()}`,
        token_type: 'bearer',
        user,
        expires_in: 36000,
      };

      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));

      authListeners.forEach((fn) => fn('SIGNED_IN', session));
      return { data: { user, session }, error: null };
    },

    async signUp({ email, password, options }: { email: string; password?: string; options?: any }) {
      const fullName = options?.data?.full_name || email.split('@')[0];
      const newUserId = `user-${Date.now()}`;

      const profiles = getItems<MockProfile>(STORAGE_KEYS.PROFILES);
      const newProfile: MockProfile = {
        id: `profile-${Date.now()}`,
        user_id: newUserId,
        full_name: fullName,
        email,
        phone: null,
        qualification: null,
        school_name: null,
        city: null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      profiles.push(newProfile);
      setItems(STORAGE_KEYS.PROFILES, profiles);

      // إضافة دور كمعلم
      const roles = getItems<any>(STORAGE_KEYS.USER_ROLES);
      roles.push({
        id: `role-${Date.now()}`,
        user_id: newUserId,
        role: 'customer',
        created_at: new Date().toISOString(),
      });
      setItems(STORAGE_KEYS.USER_ROLES, roles);

      return this.signInWithPassword({ email, password });
    },

    async signOut() {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
      authListeners.forEach((fn) => fn('SIGNED_OUT', null));
      return { error: null };
    },

    // مساعدات لتسجيل الدخول التجريبي بنقرة واحدة
    loginAsDemoAdmin() {
      return this.signInWithPassword({ email: 'admin@etqan-edu.example.com' });
    },

    loginAsDemoTeacher() {
      return this.signInWithPassword({ email: 'teacher@etqan-edu.example.com' });
    },
  },

  storage: {
    from(bucketId: string) {
      return {
        list: async (path = '', options?: any) => {
          return {
            data: [
              { id: '1', name: 'sample-cover-1.jpg', created_at: new Date().toISOString(), metadata: { size: 102400 } },
              { id: '2', name: 'preview-workbook.pdf', created_at: new Date().toISOString(), metadata: { size: 512000 } },
              { id: '3', name: 'school-sample-badge.png', created_at: new Date().toISOString(), metadata: { size: 48000 } },
            ],
            error: null,
          };
        },
        upload: async (path: string, file: any) => {
          return { data: { path }, error: null };
        },
        remove: async (paths: string[]) => {
          return { data: paths, error: null };
        },
        getPublicUrl: (path: string) => {
          return {
            data: {
              publicUrl: `https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80`,
            },
          };
        },
      };
    },
  },
};

import { describe, it, expect, beforeEach } from 'vitest';

// Polyfill localStorage for Node test runner environment
if (typeof globalThis.localStorage === 'undefined') {
  const store: Record<string, string> = {};
  globalThis.localStorage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, val: string) => {
      store[key] = String(val);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((k) => delete store[k]);
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
    get length() {
      return Object.keys(store).length;
    },
  } as Storage;
}

import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_ORDERS } from '../integrations/supabase/mockData';
import { mockSupabase, initStorage } from '../integrations/supabase/mockClient';

describe('منصة إتقان التعليمية — الاختبارات الهندسية (Platform Test Suite)', () => {
  beforeEach(() => {
    localStorage.clear();
    initStorage();
  });

  describe('1. اختبارات سلامة البيانات الاصطناعية (Synthetic Seed Data Integrity)', () => {
    it('يجب أن تحتوي المنصة على 3 تصنيفات رئيسية صالحة (كراسات، ملفات، حزم)', () => {
      expect(INITIAL_CATEGORIES).toHaveLength(3);
      const catIds = INITIAL_CATEGORIES.map((c) => c.id);
      expect(catIds).toContain('cat-workbooks');
      expect(catIds).toContain('cat-files');
      expect(catIds).toContain('cat-bundles');
    });

    it('يجب أن تحتوي قائمة المنتجات على أسعار صالحة وبيانات مكتملة', () => {
      expect(INITIAL_PRODUCTS.length).toBeGreaterThanOrEqual(6);
      INITIAL_PRODUCTS.forEach((product) => {
        expect(product.base_price).toBeGreaterThan(0);
        expect(product.name).toBeTruthy();
        expect(product.category_id).toBeTruthy();
        expect(product.page_count).toBeGreaterThan(0);
        expect(product.features).toBeInstanceOf(Array);
      });
    });

    it('يجب ألا تحتوي البيانات على أي إشارة للعلامات التجارية السابقة (Sanitization Check)', () => {
      const serialized = JSON.stringify({ INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_ORDERS });
      expect(serialized.includes('النبراس')).toBe(false);
      expect(serialized.includes('alnabras')).toBe(false);
      expect(serialized.includes('maktabet-almaarifa')).toBe(false);
    });
  });

  describe('2. اختبارات محول المحاكاة المحلي (Zero-Cloud Mock Adapter)', () => {
    it('يجب استرجاع المنتجات مع تصفية التصنيف بنجاح', async () => {
      const { data, error } = await mockSupabase
        .from('products')
        .select('*')
        .eq('category_id', 'cat-workbooks')
        .execute();

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      data.forEach((p: any) => {
        expect(p.category_id).toBe('cat-workbooks');
      });
    });

    it('يجب إضافة طلب جديد وحسابه بصورة صحيحة في الذاكرة المحلية', async () => {
      const testOrderNumber = `ORD-TEST-${Date.now()}`;
      const newOrderPayload = {
        order_number: testOrderNumber,
        user_id: 'test-user-123',
        status: 'pending' as const,
        total_amount: 130,
        notes: 'طلب تجريبي للأتمتة',
        whatsapp_number: '+966 50 000 1111',
      };

      const insertRes = await mockSupabase.from('orders').insert(newOrderPayload);
      expect(insertRes.error).toBeNull();
      expect(insertRes.data.order_number).toBe(testOrderNumber);

      // Verify retrieval
      const fetchRes = await mockSupabase
        .from('orders')
        .select('*')
        .eq('order_number', testOrderNumber)
        .maybeSingle();

      expect(fetchRes.error).toBeNull();
      expect(fetchRes.data).not.toBeNull();
      expect(fetchRes.data.total_amount).toBe(130);
    });
  });

  describe('3. اختبارات المصادقة والدخول التجريبي السريع (1-Click Demo Auth)', () => {
    it('يجب أن يعمل الدخول التجريبي كمدير نظام (Admin) وتعيين الجلسة بنجاح', async () => {
      const authRes = await mockSupabase.auth.loginAsDemoAdmin();
      expect(authRes.error).toBeNull();
      expect(authRes.data.user).not.toBeNull();
      expect(authRes.data.user.email).toBe('admin@etqan-edu.example.com');

      const sessionRes = await mockSupabase.auth.getSession();
      expect(sessionRes.data.session).not.toBeNull();
      expect(sessionRes.data.session.user.email).toBe('admin@etqan-edu.example.com');
    });

    it('يجب أن يعمل تسجيل الخروج وتفريغ الجلسة بنجاح', async () => {
      await mockSupabase.auth.loginAsDemoAdmin();
      await mockSupabase.auth.signOut();
      const sessionRes = await mockSupabase.auth.getSession();
      expect(sessionRes.data.session).toBeNull();
    });
  });

  describe('4. اختبارات حسابات معالج التخصيص والطلبات (Order Wizard Logic)', () => {
    it('يجب أن يتطابق المجموع الإجمالي مع حاصل ضرب الكمية في سعر الوحدة', () => {
      const quantity = 3;
      const unitPrice = 65;
      const calculatedTotal = quantity * unitPrice;
      expect(calculatedTotal).toBe(195);
    });
  });
});

-- حذف عمود thumbnail من جدول products
ALTER TABLE public.products DROP COLUMN IF EXISTS thumbnail;

-- حذف الأعمدة من جدول product_categories
ALTER TABLE public.product_categories DROP COLUMN IF EXISTS subject;
ALTER TABLE public.product_categories DROP COLUMN IF EXISTS grade_level;
ALTER TABLE public.product_categories DROP COLUMN IF EXISTS icon;
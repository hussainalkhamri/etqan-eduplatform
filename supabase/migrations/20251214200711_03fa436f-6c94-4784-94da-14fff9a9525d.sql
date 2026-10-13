-- =============================================
-- مكتبة المعرفة - قاعدة البيانات الأساسية
-- =============================================

-- 1. إنشاء enum للأدوار
CREATE TYPE public.app_role AS ENUM ('admin', 'customer');

-- 2. إنشاء enum لحالات الطلب
CREATE TYPE public.order_status AS ENUM ('pending', 'processing', 'ready', 'delivered', 'cancelled');

-- =============================================
-- جدول الأدوار (منفصل للأمان)
-- =============================================
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- جدول الملفات الشخصية
-- =============================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    qualification TEXT,
    school_name TEXT,
    city TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- جدول تصنيفات المنتجات
-- =============================================
CREATE TABLE public.product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    grade_level TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- =============================================
-- جدول المنتجات (الكراسات)
-- =============================================
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.product_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    page_count INTEGER NOT NULL DEFAULT 0,
    dimensions TEXT DEFAULT 'A4',
    base_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    is_available BOOLEAN NOT NULL DEFAULT true,
    thumbnail TEXT,
    images TEXT[] DEFAULT '{}',
    features TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- =============================================
-- جدول الطلبات
-- =============================================
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    order_number TEXT NOT NULL UNIQUE,
    status order_status NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- =============================================
-- جدول عناصر الطلب
-- =============================================
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- =============================================
-- جدول التخصيص
-- =============================================
CREATE TABLE public.customizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_item_id UUID REFERENCES public.order_items(id) ON DELETE CASCADE NOT NULL UNIQUE,
    teacher_name TEXT NOT NULL,
    qualifications TEXT,
    school_name TEXT,
    school_logo_path TEXT,
    additional_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.customizations ENABLE ROW LEVEL SECURITY;

-- =============================================
-- دالة التحقق من الدور (Security Definer)
-- =============================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- =============================================
-- دالة إنشاء ملف شخصي وتعيين دور عند التسجيل
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- إنشاء الملف الشخصي
    INSERT INTO public.profiles (user_id, full_name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
        NEW.email
    );
    
    -- تعيين دور العميل افتراضياً
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'customer');
    
    RETURN NEW;
END;
$$;

-- Trigger لإنشاء الملف الشخصي
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- دالة تحديث updated_at
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Triggers للتحديث التلقائي
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- دالة توليد رقم الطلب
-- =============================================
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    RETURN NEW;
END;
$$;

CREATE TRIGGER set_order_number
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_order_number();

-- =============================================
-- سياسات RLS
-- =============================================

-- سياسات user_roles
CREATE POLICY "Users can view their own roles"
    ON public.user_roles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
    ON public.user_roles FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
    ON public.user_roles FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));

-- سياسات profiles
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all profiles"
    ON public.profiles FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));

-- سياسات product_categories (الجميع يمكنهم القراءة)
CREATE POLICY "Anyone can view categories"
    ON public.product_categories FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage categories"
    ON public.product_categories FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));

-- سياسات products (الجميع يمكنهم القراءة)
CREATE POLICY "Anyone can view available products"
    ON public.products FOR SELECT
    USING (is_available = true);

CREATE POLICY "Admins can view all products"
    ON public.products FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage products"
    ON public.products FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));

-- سياسات orders
CREATE POLICY "Users can view their own orders"
    ON public.orders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
    ON public.orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
    ON public.orders FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all orders"
    ON public.orders FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));

-- سياسات order_items
CREATE POLICY "Users can view their own order items"
    ON public.order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create order items for their orders"
    ON public.order_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all order items"
    ON public.order_items FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));

-- سياسات customizations
CREATE POLICY "Users can view their own customizations"
    ON public.customizations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.order_items
            JOIN public.orders ON orders.id = order_items.order_id
            WHERE order_items.id = customizations.order_item_id
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create customizations for their orders"
    ON public.customizations FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.order_items
            JOIN public.orders ON orders.id = order_items.order_id
            WHERE order_items.id = customizations.order_item_id
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all customizations"
    ON public.customizations FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- إنشاء Storage bucket للشعارات
-- =============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('school-logos', 'school-logos', true);

-- سياسات Storage
CREATE POLICY "Authenticated users can upload logos"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'school-logos');

CREATE POLICY "Anyone can view logos"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'school-logos');

CREATE POLICY "Users can update their own logos"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'school-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own logos"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'school-logos' AND auth.uid()::text = (storage.foldername(name))[1]);
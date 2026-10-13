import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ShoppingCart, BookOpen, FileText, Ruler, Check, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import Layout from '@/components/layout/Layout';
import PDFViewer from '@/components/PDFViewer';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Category = Tables<'product_categories'>;

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:product_categories(*)')
        .eq('id', id!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">المنتج غير موجود</h1>
          <p className="text-muted-foreground mb-6">عذراً، لم نتمكن من العثور على هذا المنتج</p>
          <Button asChild>
            <Link to="/catalog">العودة للكتالوج</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const category = product.category as Category | null;
  const features = product.features || [];

  return (
    <Layout>
      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary transition-colors">الرئيسية</Link>
          <ArrowRight className="h-4 w-4" />
          <Link to="/catalog" className="hover:text-primary transition-colors">الكتالوج</Link>
          <ArrowRight className="h-4 w-4" />
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
              <img
                src={product.images?.[0] || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {category && (
              <Badge className="absolute top-4 right-4" variant="secondary">
                {category.name}
              </Badge>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{product.name}</h1>
              {category && (
                <p className="text-muted-foreground">
                  {category.name}
                </p>
              )}
            </div>

            <div className="text-3xl font-bold text-primary">
              {product.base_price} ر.س
            </div>

            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            <Separator />

            {/* Specifications */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">عدد الصفحات</p>
                  <p className="font-semibold text-foreground">{product.page_count} صفحة</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <Ruler className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">المقاس</p>
                  <p className="font-semibold text-foreground">{product.dimensions}</p>
                </div>
              </div>
            </div>

            {/* Features */}
            {features.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-3">المميزات</h3>
                <ul className="space-y-2">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-muted-foreground">
                      <Check className="h-5 w-5 text-secondary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Separator />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="flex-1" asChild>
                <Link to={`/order?product=${product.id}`}>
                  <ShoppingCart className="h-5 w-5 ml-2" />
                  اطلب الآن مع التخصيص
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/catalog">تصفح المزيد</Link>
              </Button>
            </div>

            {/* Note */}
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">ملاحظة:</strong> يمكنك إضافة اسمك ومؤهلاتك وشعار مدرستك على الكراسة عند الطلب
              </p>
            </div>
          </div>
        </div>

        {/* PDF Viewer Section */}
        {product.pdf_url && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Eye className="h-6 w-6 text-primary" />
              معاينة المنتج
            </h2>
            <PDFViewer 
              pdfUrl={(() => {
                const raw = product.pdf_url;
                if (!raw) return '';
                if (raw.startsWith('http')) return raw;
                const normalizedPath = raw.includes('/') ? raw : `products/${raw}`;
                return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/product-pdfs/${normalizedPath}`;
              })()}
              title={product.name} 
            />
          </div>
        )}
      </div>
    </Layout>
  );
}

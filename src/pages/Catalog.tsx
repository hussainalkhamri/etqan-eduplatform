import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText, FolderOpen, Layers, ArrowLeft, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';

// التصنيفات الرئيسية للكتالوج
const mainCategories = [
  {
    id: 'workbooks',
    name: 'الكراسات',
    icon: FileText,
    description: 'كراسات تحضير ومتابعة وتقويم',
    color: 'bg-primary/10 text-primary border-primary/20',
    hoverColor: 'hover:bg-primary/20 hover:border-primary/40',
  },
  {
    id: 'files',
    name: 'الملفات',
    icon: FolderOpen,
    description: 'ملفات تعليمية وإدارية متنوعة',
    color: 'bg-secondary/10 text-secondary border-secondary/20',
    hoverColor: 'hover:bg-secondary/20 hover:border-secondary/40',
  },
  {
    id: 'bundles',
    name: 'الحزم',
    icon: Layers,
    description: 'مجموعات مميزة بأسعار خاصة',
    color: 'bg-warning/10 text-warning border-warning/20',
    hoverColor: 'hover:bg-warning/20 hover:border-warning/40',
  },
];

export default function Catalog() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['products-count'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id')
        .eq('is_available', true);
      if (error) throw error;
      return data;
    },
  });

  return (
    <Layout>
      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary transition-colors">الرئيسية</Link>
          <ArrowRight className="h-4 w-4" />
          <span className="text-foreground font-medium">الكتالوج</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">تصفح الكتالوج</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            اختر القسم الذي تريد تصفحه لاستعراض الكراسات المتوفرة
          </p>
          {!isLoading && products && (
            <p className="text-sm text-muted-foreground mt-2">
              إجمالي الكراسات: {products.length} كراسة
            </p>
          )}
        </div>

        {/* Main Categories */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {mainCategories.map((category) => (
            <Link
              key={category.id}
              to={`/catalog/${category.id}`}
              className={`flex flex-col items-center gap-6 p-10 rounded-2xl border-2 transition-all duration-300 ${category.color} ${category.hoverColor} card-hover`}
            >
              <div className="p-5 rounded-2xl bg-background shadow-card">
                <category.icon className="h-12 w-12" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-2">{category.name}</h2>
                <p className="text-muted-foreground">{category.description}</p>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                تصفح القسم
                <ArrowLeft className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Stats */}
        {isLoading ? (
          <div className="flex justify-center gap-8 mt-16">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-32 rounded-xl" />
            ))}
          </div>
        ) : null}
      </div>
    </Layout>
  );
}

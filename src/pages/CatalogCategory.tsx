import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Grid3X3, List, ShoppingCart, Filter, Eye, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'>;
type Category = Tables<'product_categories'>;

// تعريف التصنيفات الرئيسية
const mainCategoriesInfo: Record<string, { name: string; description: string }> = {
  workbooks: {
    name: 'الكراسات',
    description: 'كراسات تحضير ومتابعة وتقويم للمعلمين والمعلمات',
  },
  files: {
    name: 'الملفات',
    description: 'ملفات تعليمية وإدارية متنوعة',
  },
  bundles: {
    name: 'الحزم',
    description: 'مجموعات مميزة بأسعار خاصة',
  },
};

export default function CatalogCategory() {
  const { categoryType } = useParams<{ categoryType: string }>();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const categoryInfo = categoryType ? mainCategoriesInfo[categoryType] : null;

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products', categoryType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:product_categories(*)')
        .eq('is_available', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  // فلترة المنتجات
  const filteredProducts = products?.filter(product => {
    const category = product.category as Category | null;
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || category?.id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // تجميع المنتجات حسب التصنيفات
  const productsByCategory = filteredProducts?.reduce((acc, product) => {
    const category = product.category as Category | null;
    const categoryName = category?.name || 'عام';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(product);
    return acc;
  }, {} as Record<string, typeof products>);

  const categoryKeys = Object.keys(productsByCategory || {});

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'all';

  if (!categoryInfo) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">القسم غير موجود</h1>
          <Button asChild>
            <Link to="/">العودة للرئيسية</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary transition-colors">الرئيسية</Link>
          <ArrowRight className="h-4 w-4" />
          <Link to="/catalog" className="hover:text-primary transition-colors">الكتالوج</Link>
          <ArrowRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{categoryInfo.name}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{categoryInfo.name}</h1>
          <p className="text-muted-foreground">{categoryInfo.description}</p>
        </div>

        {/* Search & Filters */}
        <div className="bg-card rounded-xl border border-border p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث عن كراسة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            
            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="التصنيف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع التصنيفات</SelectItem>
                {categories?.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} className="gap-2">
                <X className="h-4 w-4" />
                مسح الفلاتر
              </Button>
            )}
          </div>
        </div>

        {/* View Toggle & Count */}
        <div className="flex justify-between items-center mb-8">
          <p className="text-muted-foreground">
            عرض {filteredProducts?.length || 0} كراسة {categoryKeys.length > 0 && `في ${categoryKeys.length} تصنيف`}
          </p>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {productsLoading ? (
          <div className="space-y-12">
            {[1, 2].map((i) => (
              <div key={i}>
                <Skeleton className="h-8 w-48 mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((j) => (
                    <Card key={j} className="overflow-hidden">
                      <Skeleton className="h-48 w-full" />
                      <CardContent className="p-4">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts?.length === 0 ? (
          <div className="text-center py-16">
            <Filter className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">لا توجد كراسات</h3>
            <p className="text-muted-foreground mb-4">
              {hasActiveFilters ? 'لا توجد نتائج تطابق معايير البحث' : 'لا توجد كراسات في هذا القسم حالياً'}
            </p>
            {hasActiveFilters ? (
              <Button onClick={clearFilters}>مسح الفلاتر</Button>
            ) : (
              <Button asChild>
                <Link to="/">العودة للرئيسية</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-12">
            {categoryKeys.map((categoryName) => (
              <section key={categoryName}>
                {/* Category Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">{categoryName}</h2>
                  <span className="text-sm text-muted-foreground">
                    {productsByCategory?.[categoryName]?.length || 0} كراسة
                  </span>
                </div>

                {/* Products Grid */}
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
                  {productsByCategory?.[categoryName]?.map((product) => {
                    const category = product.category as Category | null;
                    const productImage = product.images?.[0] || '/placeholder.svg';
                    return (
                      <Card key={product.id} className="overflow-hidden card-hover group">
                        <div className="relative h-48 bg-muted">
                          <img
                            src={productImage}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                          {category && (
                            <Badge className="absolute top-3 right-3" variant="secondary">
                              {category.name}
                            </Badge>
                          )}
                          {/* Preview Button */}
                          <Link
                            to={`/product/${product.id}`}
                            className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          >
                            <Button variant="secondary" size="sm">
                              <Eye className="h-4 w-4 ml-2" />
                              معاينة
                            </Button>
                          </Link>
                        </div>
                        <CardContent className="p-4">
                          <Link to={`/product/${product.id}`}>
                            <h3 className="font-semibold text-foreground mb-2 line-clamp-2 hover:text-primary transition-colors">
                              {product.name}
                            </h3>
                          </Link>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {product.description}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{product.page_count} صفحة</span>
                            <span>•</span>
                            <span>{product.dimensions}</span>
                          </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex items-center justify-between">
                          <span className="text-xl font-bold text-primary">{product.base_price} ر.س</span>
                          <Button size="sm" asChild>
                            <Link to={`/order?product=${product.id}`}>
                              <ShoppingCart className="h-4 w-4 ml-2" />
                              اطلب
                            </Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

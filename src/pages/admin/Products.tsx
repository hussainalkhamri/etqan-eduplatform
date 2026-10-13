import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Package, Upload, FileText, Eye, Search, X, Image } from 'lucide-react';
import AdminNav from '@/components/admin/AdminNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';
import PDFViewer from '@/components/PDFViewer';

type Product = Tables<'products'>;
type Category = Tables<'product_categories'>;

export default function AdminProducts() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_price: 0,
    page_count: 0,
    dimensions: 'A4',
    category_id: '',
    is_available: true,
    pdf_url: '',
    images: [] as string[],
  });

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/auth');
    }
  }, [user, isAdmin, loading, navigate]);

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:product_categories(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user && isAdmin,
  });

  // فلترة الكراسات
  const filteredProducts = products?.filter(product => 
    !searchQuery || 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(data)
          .eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setIsDialogOpen(false);
      setEditingProduct(null);
      resetForm();
      setIsUploading(false);
      toast.success(editingProduct ? 'تم تحديث الكراسة' : 'تمت إضافة الكراسة');
    },
    onError: (error: any) => {
      setIsUploading(false);
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('تم حذف الكراسة');
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      base_price: 0,
      page_count: 0,
      dimensions: 'A4',
      category_id: '',
      is_available: true,
      pdf_url: '',
      images: [],
    });
    setPdfFile(null);
    setImageFiles([]);
    setExistingImages([]);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      base_price: product.base_price,
      page_count: product.page_count,
      dimensions: product.dimensions || 'A4',
      category_id: product.category_id || '',
      is_available: product.is_available,
      pdf_url: product.pdf_url || '',
      images: product.images || [],
    });
    setPdfFile(null);
    setImageFiles([]);
    setExistingImages(product.images || []);
    setIsDialogOpen(true);
  };

  const uploadPdf = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-pdfs')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('product-pdfs')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let pdfUrl = formData.pdf_url;

      if (pdfFile) {
        pdfUrl = await uploadPdf(pdfFile);
      }

      // Upload new images
      const newImageUrls = await Promise.all(
        imageFiles.map(file => uploadImage(file))
      );

      // Combine existing + new images
      const allImages = [...existingImages, ...newImageUrls];

      saveMutation.mutate({ 
        ...formData, 
        pdf_url: pdfUrl,
        images: allImages 
      });
    } catch (error: any) {
      toast.error('فشل رفع الملف: ' + error.message);
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-foreground">إدارة الكراسات</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/">العودة للموقع</Link>
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <AdminNav currentPage="products" />

      {/* Search & Add Button */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث عن كراسة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingProduct(null); resetForm(); }}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة كراسة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'تعديل الكراسة' : 'إضافة كراسة جديدة'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">اسم الكراسة</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="base_price">السعر (ر.س)</Label>
                  <Input
                    id="base_price"
                    type="number"
                    value={formData.base_price}
                    onChange={e => setFormData({ ...formData, base_price: Number(e.target.value) })}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="page_count">عدد الصفحات</Label>
                  <Input
                    id="page_count"
                    type="number"
                    value={formData.page_count}
                    onChange={e => setFormData({ ...formData, page_count: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dimensions">المقاس</Label>
                  <Input
                    id="dimensions"
                    value={formData.dimensions}
                    onChange={e => setFormData({ ...formData, dimensions: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="category_id">التصنيف</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={value => setFormData({ ...formData, category_id: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="اختر التصنيف" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Image Upload Section */}
              <div>
                <Label>صور المنتج</Label>
                <div className="mt-2 space-y-3">
                  {/* Existing Images */}
                  {existingImages.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {existingImages.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`صورة ${index + 1}`}
                            className="w-20 h-20 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="absolute -top-2 -left-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* New Images Preview */}
                  {imageFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {imageFiles.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`صورة جديدة ${index + 1}`}
                            className="w-20 h-20 object-cover rounded-lg border border-primary"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewImage(index)}
                            className="absolute -top-2 -left-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Upload Input */}
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={e => {
                        const files = Array.from(e.target.files || []);
                        setImageFiles(prev => [...prev, ...files]);
                        e.target.value = '';
                      }}
                      className="flex-1"
                    />
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Image className="h-3 w-3" />
                      {existingImages.length + imageFiles.length} صور
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="pdf_file">ملف PDF</Label>
                <div className="mt-1 flex items-center gap-2">
                  <Input
                    id="pdf_file"
                    type="file"
                    accept=".pdf"
                    onChange={e => setPdfFile(e.target.files?.[0] || null)}
                    className="flex-1"
                  />
                  {(formData.pdf_url || pdfFile) && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {pdfFile ? pdfFile.name : 'ملف موجود'}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="is_available"
                  checked={formData.is_available}
                  onCheckedChange={checked => setFormData({ ...formData, is_available: checked })}
                />
                <Label htmlFor="is_available">متاح للبيع</Label>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={saveMutation.isPending || isUploading}>
                  {isUploading ? 'جاري الرفع...' : saveMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Products List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            الكراسات ({filteredProducts?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : filteredProducts?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {searchQuery ? 'لا توجد نتائج مطابقة' : 'لا توجد كراسات بعد'}
            </p>
          ) : (
            <div className="space-y-4">
              {filteredProducts?.map((product) => {
                const category = product.category as Category | null;
                return (
                  <div
                    key={product.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-4 mb-4 md:mb-0">
                      <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt=""
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {category?.name} - {product.page_count} صفحة
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={product.is_available ? 'default' : 'secondary'}>
                        {product.is_available ? 'متاح' : 'غير متاح'}
                      </Badge>
                      <span className="font-bold text-primary">{product.base_price} ر.س</span>
                      <div className="flex gap-2">
                        {product.pdf_url && (
                          <Button 
                            size="icon" 
                            variant="outline"
                            onClick={() => setPreviewPdfUrl(product.pdf_url)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="icon" variant="outline" onClick={() => handleEdit(product)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="text-destructive"
                          onClick={() => deleteMutation.mutate(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* PDF Preview Dialog */}
      <Dialog open={!!previewPdfUrl} onOpenChange={() => setPreviewPdfUrl(null)}>
        <DialogContent className="max-w-5xl w-[95vw] h-[85vh] p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>معاينة الملف</DialogTitle>
          </DialogHeader>
          {previewPdfUrl && (
            <iframe
              src={previewPdfUrl}
              className="w-full flex-1 h-[calc(85vh-80px)]"
              title="PDF Preview"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

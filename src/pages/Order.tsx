import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronLeft, ChevronRight, Upload, User, School, FileText, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const steps = [
  { id: 1, title: 'اختيار المنتج', icon: FileText },
  { id: 2, title: 'بيانات التخصيص', icon: User },
  { id: 3, title: 'رفع الشعار', icon: Upload },
  { id: 4, title: 'المعاينة', icon: Eye },
  { id: 5, title: 'التأكيد', icon: Check },
];

export default function Order() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProductId, setSelectedProductId] = useState(searchParams.get('product') || '');
  const [formData, setFormData] = useState({
    teacherName: '',
    qualifications: '',
    schoolName: '',
    phone: '',
    notes: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_available', true)
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const selectedProduct = products?.find(p => p.id === selectedProductId);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('يرجى تسجيل الدخول أولاً');
      navigate('/auth');
      return;
    }

    if (!selectedProduct) {
      toast.error('يرجى اختيار منتج');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create order with whatsapp number
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user.id,
          order_number: `ORD-${Date.now()}`,
          total_amount: selectedProduct.base_price,
          notes: formData.notes,
          whatsapp_number: formData.phone,
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order item
      const { data: orderItem, error: itemError } = await supabase
        .from('order_items')
        .insert({
          order_id: order.id,
          product_id: selectedProduct.id,
          quantity: 1,
          unit_price: selectedProduct.base_price,
        })
        .select()
        .single();

      if (itemError) throw itemError;

      // Upload logo if exists
      let logoPath = null;
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${order.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('school-logos')
          .upload(fileName, logoFile);
        if (!uploadError) {
          logoPath = fileName;
        }
      }

      // Create customization
      const { error: customError } = await supabase
        .from('customizations')
        .insert({
          order_item_id: orderItem.id,
          teacher_name: formData.teacherName,
          qualifications: formData.qualifications,
          school_name: formData.schoolName,
          school_logo_path: logoPath,
          additional_notes: formData.notes,
        });

      if (customError) throw customError;

      toast.success('تم إرسال طلبك بنجاح!');
      navigate('/account');
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ أثناء إرسال الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return !!selectedProductId;
      case 2: return !!formData.teacherName && !!formData.phone;
      case 3: return true;
      case 4: return true;
      default: return true;
    }
  };

  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-foreground mb-8 text-center">طلب جديد</h1>

        {/* Steps Progress */}
        <div className="flex items-center justify-between mb-12">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                    currentStep >= step.id
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'border-border text-muted-foreground'
                  }`}
                >
                  <step.icon className="h-5 w-5" />
                </div>
                <span className={`text-xs mt-2 ${currentStep >= step.id ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`hidden md:block w-16 h-0.5 mx-2 ${currentStep > step.id ? 'bg-primary' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardContent className="p-6">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="product">اختر الكراسة</Label>
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="اختر منتجاً..." />
                    </SelectTrigger>
                    <SelectContent>
                      {products?.map(product => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - {product.base_price} ر.س
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedProduct && (
                  <div className="p-4 rounded-lg bg-muted/50">
                    <h3 className="font-semibold text-foreground mb-2">{selectedProduct.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{selectedProduct.description}</p>
                    <p className="text-lg font-bold text-primary">{selectedProduct.base_price} ر.س</p>
                  </div>
                )}
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="teacherName">اسم المعلم/ة *</Label>
                    <Input
                      id="teacherName"
                      value={formData.teacherName}
                      onChange={e => setFormData({ ...formData, teacherName: e.target.value })}
                      placeholder="الاسم كما سيظهر على الكراسة"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="qualifications">المؤهلات</Label>
                    <Input
                      id="qualifications"
                      value={formData.qualifications}
                      onChange={e => setFormData({ ...formData, qualifications: e.target.value })}
                      placeholder="مثال: بكالوريوس تربية"
                      className="mt-2"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="schoolName">اسم المدرسة</Label>
                    <Input
                      id="schoolName"
                      value={formData.schoolName}
                      onChange={e => setFormData({ ...formData, schoolName: e.target.value })}
                      placeholder="اسم المدرسة"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">رقم الواتساب للتواصل *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="05xxxxxxxx"
                      className="mt-2"
                      dir="ltr"
                    />
                    <p className="text-xs text-muted-foreground mt-1">سيتم التواصل معك عبر هذا الرقم</p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <Label>رفع شعار المدرسة (اختياري)</Label>
                  <div className="mt-4">
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo preview" className="h-full object-contain" />
                      ) : (
                        <>
                          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                          <span className="text-muted-foreground">اضغط لرفع الشعار</span>
                          <span className="text-xs text-muted-foreground mt-1">PNG, JPG حتى 5MB</span>
                        </>
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">معاينة الطلب</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">المنتج</p>
                      <p className="font-semibold text-foreground">{selectedProduct?.name}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">اسم المعلم/ة</p>
                      <p className="font-semibold text-foreground">{formData.teacherName}</p>
                    </div>
                    {formData.qualifications && (
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">المؤهلات</p>
                        <p className="font-semibold text-foreground">{formData.qualifications}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    {formData.schoolName && (
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">المدرسة</p>
                        <p className="font-semibold text-foreground">{formData.schoolName}</p>
                      </div>
                    )}
                    {formData.phone && (
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">رقم الواتساب</p>
                        <p className="font-semibold text-foreground" dir="ltr">{formData.phone}</p>
                      </div>
                    )}
                    {logoPreview && (
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground mb-2">شعار المدرسة</p>
                        <img src={logoPreview} alt="Logo" className="h-20 object-contain" />
                      </div>
                    )}
                    <div className="p-4 rounded-lg bg-primary/10">
                      <p className="text-sm text-muted-foreground">الإجمالي</p>
                      <p className="text-2xl font-bold text-primary">{selectedProduct?.base_price} ر.س</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="text-center py-8">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Check className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">تأكيد الطلب</h3>
                <p className="text-muted-foreground mb-6">
                  هل أنت متأكد من إرسال الطلب؟ سيتم التواصل معك لتأكيد التفاصيل والدفع.
                </p>
                <div>
                  <Label htmlFor="notes">ملاحظات إضافية</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="أي ملاحظات أو طلبات خاصة..."
                    className="mt-2"
                    rows={3}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(s => s - 1)}
            disabled={currentStep === 1}
          >
            <ChevronRight className="h-4 w-4 ml-2" />
            السابق
          </Button>
          {currentStep < 5 ? (
            <Button
              onClick={() => setCurrentStep(s => s + 1)}
              disabled={!canProceed()}
            >
              التالي
              <ChevronLeft className="h-4 w-4 mr-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'جاري الإرسال...' : 'تأكيد الطلب'}
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
}

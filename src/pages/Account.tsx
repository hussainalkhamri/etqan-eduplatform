import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { User, Package, Clock, CheckCircle, XCircle, Truck, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useState } from 'react';

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  processing: { label: 'قيد التنفيذ', color: 'bg-blue-100 text-blue-700', icon: Settings },
  ready: { label: 'جاهز', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  delivered: { label: 'تم التسليم', color: 'bg-gray-100 text-gray-700', icon: Truck },
  cancelled: { label: 'ملغي', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export default function Account() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (name, images)
          )
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    school_name: profile?.school_name || '',
    city: profile?.city || '',
    qualification: profile?.qualification || '',
  });

  const handleUpdateProfile = async () => {
    if (!user) return;
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          school_name: formData.school_name,
          city: formData.city,
          qualification: formData.qualification,
        })
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('تم تحديث البيانات بنجاح');
      refetchProfile();
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">يرجى تسجيل الدخول</h1>
          <p className="text-muted-foreground mb-6">للوصول إلى حسابك، يرجى تسجيل الدخول أولاً</p>
          <Button onClick={() => navigate('/auth')}>تسجيل الدخول</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">حسابي</h1>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-96">
            <TabsTrigger value="orders">طلباتي</TabsTrigger>
            <TabsTrigger value="profile">الملف الشخصي</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  طلباتي
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : orders?.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">لا توجد طلبات بعد</p>
                    <Button onClick={() => navigate('/catalog')}>تصفح الكتالوج</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders?.map((order) => {
                      const status = statusConfig[order.status] || statusConfig.pending;
                      const StatusIcon = status.icon;
                      return (
                        <div
                          key={order.id}
                          className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-4 mb-4 md:mb-0">
                            <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                              {order.order_items?.[0]?.product?.images?.[0] ? (
                                <img
                                  src={order.order_items[0].product.images[0]}
                                  alt=""
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <Package className="h-8 w-8 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">
                                {order.order_items?.[0]?.product?.name || 'منتج'}
                                {order.order_items.length > 1 && ` (+${order.order_items.length - 1})`}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                رقم الطلب: {order.order_number}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.created_at).toLocaleDateString('ar-SA')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge className={status.color}>
                              <StatusIcon className="h-4 w-4 ml-1" />
                              {status.label}
                            </Badge>
                            <span className="font-bold text-primary">{order.total_amount} ر.س</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  الملف الشخصي
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profileLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="full_name">الاسم الكامل</Label>
                        <Input
                          id="full_name"
                          value={formData.full_name || profile?.full_name || ''}
                          onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">البريد الإلكتروني</Label>
                        <Input
                          id="email"
                          value={profile?.email || ''}
                          disabled
                          className="mt-2 bg-muted"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">رقم الهاتف</Label>
                        <Input
                          id="phone"
                          value={formData.phone || profile?.phone || ''}
                          onChange={e => setFormData({ ...formData, phone: e.target.value })}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">المدينة</Label>
                        <Input
                          id="city"
                          value={formData.city || profile?.city || ''}
                          onChange={e => setFormData({ ...formData, city: e.target.value })}
                          className="mt-2"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="school_name">اسم المدرسة</Label>
                        <Input
                          id="school_name"
                          value={formData.school_name || profile?.school_name || ''}
                          onChange={e => setFormData({ ...formData, school_name: e.target.value })}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="qualification">المؤهل</Label>
                        <Input
                          id="qualification"
                          value={formData.qualification || profile?.qualification || ''}
                          onChange={e => setFormData({ ...formData, qualification: e.target.value })}
                          className="mt-2"
                        />
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <Button onClick={handleUpdateProfile} disabled={isUpdating}>
                        {isUpdating ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                      </Button>
                      <Button variant="outline" onClick={signOut}>تسجيل الخروج</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingCart, Clock, CheckCircle, XCircle, Truck, Settings, Eye, Phone, Search, Download, FileText, Calendar, StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';
import AdminNav from '@/components/admin/AdminNav';

type OrderStatus = Database['public']['Enums']['order_status'];

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: any }> = {
  pending: { label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  processing: { label: 'قيد التنفيذ', color: 'bg-blue-100 text-blue-700', icon: Settings },
  ready: { label: 'جاهز', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  delivered: { label: 'تم التسليم', color: 'bg-gray-100 text-gray-700', icon: Truck },
  cancelled: { label: 'ملغي', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export default function AdminOrders() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/auth');
    }
  }, [user, isAdmin, loading, navigate]);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (name, base_price),
            customization:customizations (*)
          )
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user && isAdmin,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('تم تحديث حالة الطلب');
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const updateNotesMutation = useMutation({
    mutationFn: async ({ orderId, notes }: { orderId: string; notes: string }) => {
      const { error } = await supabase
        .from('orders')
        .update({ admin_notes: notes })
        .eq('id', orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('تم حفظ الملاحظات');
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const filteredOrders = orders?.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = !searchQuery || 
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.whatsapp_number?.includes(searchQuery);
    
    let matchesDate = true;
    if (dateFrom) {
      matchesDate = matchesDate && new Date(order.created_at) >= new Date(dateFrom);
    }
    if (dateTo) {
      matchesDate = matchesDate && new Date(order.created_at) <= new Date(dateTo + 'T23:59:59');
    }
    
    return matchesStatus && matchesSearch && matchesDate;
  });

  const exportToCSV = () => {
    if (!filteredOrders?.length) {
      toast.error('لا توجد طلبات للتصدير');
      return;
    }

    const headers = ['رقم الطلب', 'التاريخ', 'الحالة', 'المبلغ', 'رقم الواتساب', 'ملاحظات العميل', 'ملاحظات المسؤول'];
    const rows = filteredOrders.map(order => [
      order.order_number,
      new Date(order.created_at).toLocaleDateString('ar-SA'),
      statusConfig[order.status as OrderStatus].label,
      order.total_amount,
      order.whatsapp_number || '',
      order.notes || '',
      order.admin_notes || '',
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('تم تصدير الطلبات بنجاح');
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
        <h1 className="text-3xl font-bold text-foreground">إدارة الطلبات</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 ml-2" />
            تصدير CSV
          </Button>
          <Button variant="outline" asChild>
            <Link to="/">العودة للموقع</Link>
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <AdminNav currentPage="orders" />

      {/* Search & Filter */}
      <div className="grid md:grid-cols-5 gap-4 mb-6">
        <div className="relative md:col-span-2">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث برقم الطلب أو رقم الواتساب..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger>
            <SelectValue placeholder="فلترة حسب الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الطلبات</SelectItem>
            {Object.entries(statusConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative">
          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="pr-10"
            placeholder="من تاريخ"
          />
        </div>
        <div className="relative">
          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="pr-10"
            placeholder="إلى تاريخ"
          />
        </div>
      </div>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            الطلبات ({filteredOrders?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : filteredOrders?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">لا توجد طلبات</p>
          ) : (
            <div className="space-y-4">
              {filteredOrders?.map((order) => {
                const status = statusConfig[order.status as OrderStatus];
                const StatusIcon = status.icon;
                return (
                  <div
                    key={order.id}
                    className="flex flex-col lg:flex-row lg:items-center justify-between p-4 rounded-lg bg-muted/50"
                  >
                    <div className="mb-4 lg:mb-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-foreground">{order.order_number}</p>
                        <Badge className={status.color}>
                          <StatusIcon className="h-3 w-3 ml-1" />
                          {status.label}
                        </Badge>
                        {order.admin_notes && (
                          <Badge variant="outline" className="gap-1">
                            <StickyNote className="h-3 w-3" />
                            ملاحظة
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-primary text-lg">{order.total_amount} ر.س</span>
                      <Select
                        value={order.status}
                        onValueChange={(value: OrderStatus) => 
                          updateStatusMutation.mutate({ orderId: order.id, status: value })
                        }
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusConfig).map(([key, config]) => (
                            <SelectItem key={key} value={key}>{config.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => {
                              setSelectedOrder(order);
                              setAdminNotes(order.admin_notes || '');
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>تفاصيل الطلب {order.order_number}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6">
                            {/* Whatsapp */}
                            {order.whatsapp_number && (
                              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                                <p className="text-sm text-muted-foreground mb-1">رقم الواتساب</p>
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-green-600" />
                                  <a 
                                    href={`https://wa.me/${order.whatsapp_number.replace(/^0/, '966')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-semibold text-green-600 hover:underline"
                                    dir="ltr"
                                  >
                                    {order.whatsapp_number}
                                  </a>
                                </div>
                              </div>
                            )}
                            <div className="p-4 rounded-lg bg-muted/50">
                              <p className="text-sm text-muted-foreground">الإجمالي</p>
                              <p className="text-2xl font-bold text-primary">{order.total_amount} ر.س</p>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">المنتجات</h4>
                              {order.order_items?.map((item: any) => (
                                <div key={item.id} className="p-4 rounded-lg bg-muted/50 mb-2">
                                  <p className="font-medium">{item.product?.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    الكمية: {item.quantity} × {item.unit_price} ر.س
                                  </p>
                                  {item.customization && (
                                    <div className="mt-2 pt-2 border-t border-border">
                                      <p className="text-sm"><strong>اسم المعلم:</strong> {item.customization.teacher_name}</p>
                                      {item.customization.qualifications && (
                                        <p className="text-sm"><strong>المؤهلات:</strong> {item.customization.qualifications}</p>
                                      )}
                                      {item.customization.school_name && (
                                        <p className="text-sm"><strong>المدرسة:</strong> {item.customization.school_name}</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                            {order.notes && (
                              <div className="p-4 rounded-lg bg-muted/50">
                                <p className="text-sm text-muted-foreground">ملاحظات العميل</p>
                                <p>{order.notes}</p>
                              </div>
                            )}
                            {/* Admin Notes */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                                <StickyNote className="h-4 w-4" />
                                ملاحظات المسؤول (خاصة)
                              </label>
                              <Textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="أضف ملاحظات خاصة بهذا الطلب..."
                                rows={3}
                              />
                              <Button
                                size="sm"
                                onClick={() => updateNotesMutation.mutate({ orderId: order.id, notes: adminNotes })}
                                disabled={updateNotesMutation.isPending}
                              >
                                حفظ الملاحظات
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

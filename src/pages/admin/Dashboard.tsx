import { useQuery } from '@tanstack/react-query';
import { Package, ShoppingCart, Users, TrendingUp, Clock, CheckCircle, FolderOpen, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import AdminNav from '@/components/admin/AdminNav';

const COLORS = ['hsl(38, 92%, 50%)', 'hsl(217, 91%, 60%)', 'hsl(160, 84%, 39%)', 'hsl(215, 16%, 47%)', 'hsl(0, 84%, 60%)'];

const statusLabels: Record<string, string> = {
  pending: 'قيد الانتظار',
  processing: 'قيد التنفيذ',
  ready: 'جاهز',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
};

export default function AdminDashboard() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [timePeriod, setTimePeriod] = useState('30');

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/auth');
    }
  }, [user, isAdmin, loading, navigate]);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [productsRes, ordersRes, usersRes, categoriesRes] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact' }),
        supabase.from('orders').select('id, status, total_amount, created_at'),
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('product_categories').select('id', { count: 'exact' }),
      ]);

      const orders = ordersRes.data || [];
      const pendingOrders = orders.filter(o => o.status === 'pending').length;
      const totalRevenue = orders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + (o.total_amount || 0), 0);

      return {
        productsCount: productsRes.count || 0,
        ordersCount: orders.length,
        usersCount: usersRes.count || 0,
        categoriesCount: categoriesRes.count || 0,
        pendingOrders,
        totalRevenue,
      };
    },
    enabled: !!user && isAdmin,
  });

  const { data: chartData } = useQuery({
    queryKey: ['admin-charts', timePeriod],
    queryFn: async () => {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(timePeriod));

      const { data: orders, error } = await supabase
        .from('orders')
        .select('status, total_amount, created_at')
        .gte('created_at', daysAgo.toISOString());

      if (error) throw error;

      // Status distribution
      const statusCounts: Record<string, number> = {};
      orders?.forEach(order => {
        statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
      });
      const statusData = Object.entries(statusCounts).map(([status, count]) => ({
        name: statusLabels[status] || status,
        value: count,
      }));

      // Monthly sales
      const salesByMonth: Record<string, number> = {};
      orders?.forEach(order => {
        if (order.status !== 'cancelled') {
          const month = new Date(order.created_at).toLocaleDateString('ar-SA', { month: 'short' });
          salesByMonth[month] = (salesByMonth[month] || 0) + (order.total_amount || 0);
        }
      });
      const salesData = Object.entries(salesByMonth).map(([month, amount]) => ({
        month,
        amount,
      }));

      return { statusData, salesData };
    },
    enabled: !!user && isAdmin,
  });

  const { data: topProducts } = useQuery({
    queryKey: ['admin-top-products'],
    queryFn: async () => {
      const { data: orderItems, error } = await supabase
        .from('order_items')
        .select('product_id, quantity, product:products(name)');

      if (error) throw error;

      const productSales: Record<string, { name: string; quantity: number }> = {};
      orderItems?.forEach(item => {
        if (item.product_id && item.product) {
          if (!productSales[item.product_id]) {
            productSales[item.product_id] = { name: (item.product as any).name, quantity: 0 };
          }
          productSales[item.product_id].quantity += item.quantity;
        }
      });

      return Object.values(productSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
    },
    enabled: !!user && isAdmin,
  });

  const { data: recentOrders } = useQuery({
    queryKey: ['admin-recent-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profile:profiles!orders_user_id_fkey (full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!user && isAdmin,
  });

  if (loading) {
    return (
      <div className="p-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { title: 'إجمالي المنتجات', value: stats?.productsCount || 0, icon: Package, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    { title: 'إجمالي الطلبات', value: stats?.ordersCount || 0, icon: ShoppingCart, color: 'text-green-500', bgColor: 'bg-green-500/10' },
    { title: 'طلبات قيد الانتظار', value: stats?.pendingOrders || 0, icon: Clock, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
    { title: 'إجمالي المستخدمين', value: stats?.usersCount || 0, icon: Users, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
    { title: 'التصنيفات', value: stats?.categoriesCount || 0, icon: FolderOpen, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-foreground">لوحة التحكم</h1>
        <div className="flex gap-2">
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">آخر 7 أيام</SelectItem>
              <SelectItem value="30">آخر 30 يوم</SelectItem>
              <SelectItem value="90">آخر 3 أشهر</SelectItem>
              <SelectItem value="365">آخر سنة</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" asChild>
            <Link to="/">العودة للموقع</Link>
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <AdminNav currentPage="dashboard" />

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {isLoading ? <Skeleton className="h-8 w-12" /> : stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor} ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Card */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">إجمالي الإيرادات</p>
              <p className="text-4xl font-bold text-primary mt-1">
                {isLoading ? <Skeleton className="h-12 w-32" /> : `${stats?.totalRevenue?.toLocaleString() || 0} ر.س`}
              </p>
            </div>
            <div className="p-4 rounded-full bg-primary/10 text-primary">
              <DollarSign className="h-8 w-8" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle>المبيعات</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData?.salesData?.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toLocaleString()} ر.س`, 'المبيعات']}
                    labelStyle={{ fontFamily: 'Tajawal' }}
                  />
                  <Bar dataKey="amount" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12">لا توجد بيانات كافية</p>
            )}
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>توزيع حالات الطلبات</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData?.statusData?.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {chartData.statusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12">لا توجد بيانات كافية</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>المنتجات الأكثر مبيعاً</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts?.length ? (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center font-semibold">
                        {index + 1}
                      </span>
                      <span className="text-foreground">{product.name}</span>
                    </div>
                    <span className="text-muted-foreground">{product.quantity} مبيعات</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">لا توجد مبيعات بعد</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>آخر الطلبات</span>
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin/orders">عرض الكل</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders?.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">لا توجد طلبات بعد</p>
            ) : (
              <div className="space-y-4">
                {recentOrders?.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-primary">{order.total_amount} ر.س</p>
                      <p className="text-sm text-muted-foreground">{statusLabels[order.status]}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

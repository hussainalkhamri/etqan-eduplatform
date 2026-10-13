import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Mail, Phone, MapPin, Shield, ShieldOff, Search, ShoppingCart, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import AdminNav from '@/components/admin/AdminNav';

export default function AdminUsers() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/auth');
    }
  }, [user, isAdmin, loading, navigate]);

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user && isAdmin,
  });

  const { data: userRoles } = useQuery({
    queryKey: ['admin-user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*');
      if (error) throw error;
      const rolesMap: Record<string, string[]> = {};
      data.forEach(role => {
        if (!rolesMap[role.user_id]) {
          rolesMap[role.user_id] = [];
        }
        rolesMap[role.user_id].push(role.role);
      });
      return rolesMap;
    },
    enabled: !!user && isAdmin,
  });

  const { data: orderCounts } = useQuery({
    queryKey: ['admin-user-order-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('user_id');
      if (error) throw error;
      const counts: Record<string, number> = {};
      data.forEach(order => {
        counts[order.user_id] = (counts[order.user_id] || 0) + 1;
      });
      return counts;
    },
    enabled: !!user && isAdmin,
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: isActive })
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('تم تحديث حالة المستخدم');
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const toggleAdminMutation = useMutation({
    mutationFn: async ({ userId, makeAdmin }: { userId: string; makeAdmin: boolean }) => {
      if (makeAdmin) {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'admin' });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user-roles'] });
      toast.success('تم تحديث صلاحيات المستخدم');
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const filteredUsers = users?.filter(profile => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      profile.full_name?.toLowerCase().includes(query) ||
      profile.email?.toLowerCase().includes(query) ||
      profile.phone?.includes(query) ||
      profile.school_name?.toLowerCase().includes(query)
    );
  });

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
        <h1 className="text-3xl font-bold text-foreground">إدارة المستخدمين</h1>
        <Button variant="outline" asChild>
          <Link to="/">العودة للموقع</Link>
        </Button>
      </div>

      {/* Navigation */}
      <AdminNav currentPage="users" />

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث بالاسم أو البريد أو الهاتف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            المستخدمون ({filteredUsers?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : filteredUsers?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">لا يوجد مستخدمون</p>
          ) : (
            <div className="space-y-4">
              {filteredUsers?.map((profile) => {
                const roles = userRoles?.[profile.user_id] || [];
                const isUserAdmin = roles.includes('admin');
                const ordersCount = orderCounts?.[profile.user_id] || 0;
                
                return (
                  <div
                    key={profile.id}
                    className="flex flex-col lg:flex-row lg:items-center justify-between p-4 rounded-lg bg-muted/50"
                  >
                    <div className="mb-4 lg:mb-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-foreground">{profile.full_name}</p>
                        {isUserAdmin && (
                          <Badge className="bg-primary/10 text-primary">
                            <Crown className="h-3 w-3 ml-1" />
                            مسؤول
                          </Badge>
                        )}
                        {!profile.is_active && (
                          <Badge variant="destructive">محظور</Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {profile.email}
                        </span>
                        {profile.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {profile.phone}
                          </span>
                        )}
                        {profile.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {profile.city}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <ShoppingCart className="h-4 w-4" />
                          {ordersCount} طلب
                        </span>
                      </div>
                      {profile.school_name && (
                        <p className="text-sm text-muted-foreground mt-1">
                          المدرسة: {profile.school_name}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <p className="text-sm text-muted-foreground">
                        {new Date(profile.created_at).toLocaleDateString('ar-SA')}
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">مسؤول</span>
                          <Switch
                            checked={isUserAdmin}
                            onCheckedChange={(checked) =>
                              toggleAdminMutation.mutate({ userId: profile.user_id, makeAdmin: checked })
                            }
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {profile.is_active ? 'نشط' : 'محظور'}
                          </span>
                          <Switch
                            checked={profile.is_active}
                            onCheckedChange={(checked) =>
                              toggleActiveMutation.mutate({ userId: profile.user_id, isActive: checked })
                            }
                          />
                        </div>
                      </div>
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

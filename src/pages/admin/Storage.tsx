import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HardDrive, Image, FileText, Trash2, Eye, Download, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import AdminNav from '@/components/admin/AdminNav';

const BUCKETS = [
  { id: 'product-images', name: 'صور المنتجات', icon: Image },
  { id: 'product-pdfs', name: 'ملفات PDF', icon: FileText },
  { id: 'school-logos', name: 'شعارات المدارس', icon: FolderOpen },
];

export default function AdminStorage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedBucket, setSelectedBucket] = useState('product-images');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/auth');
    }
  }, [user, isAdmin, loading, navigate]);

  // Fetch all files including nested folders
  const { data: files, isLoading } = useQuery({
    queryKey: ['storage-files', selectedBucket],
    queryFn: async () => {
      const allFiles: Array<{ name: string; path: string; metadata?: any }> = [];
      
      // Helper function to list files recursively
      const listFilesRecursively = async (path: string = '') => {
        const { data, error } = await supabase.storage
          .from(selectedBucket)
          .list(path, { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
        
        if (error) throw error;
        
        for (const item of data || []) {
          const fullPath = path ? `${path}/${item.name}` : item.name;
          
          // Check if it's a folder (no metadata or id is null)
          if (!item.id || item.metadata === null) {
            // It's a folder, recurse into it
            await listFilesRecursively(fullPath);
          } else {
            // It's a file
            allFiles.push({
              name: item.name,
              path: fullPath,
              metadata: item.metadata,
            });
          }
        }
      };
      
      await listFilesRecursively();
      return allFiles;
    },
    enabled: !!user && isAdmin,
  });

  const deleteMutation = useMutation({
    mutationFn: async (filePath: string) => {
      const { error } = await supabase.storage
        .from(selectedBucket)
        .remove([filePath]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storage-files', selectedBucket] });
      toast.success('تم حذف الملف بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const getPublicUrl = (filePath: string) => {
    const { data } = supabase.storage.from(selectedBucket).getPublicUrl(filePath);
    return data.publicUrl;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 بايت';
    const k = 1024;
    const sizes = ['بايت', 'ك.ب', 'م.ب', 'ج.ب'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImage = (fileName: string) => {
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileName);
  };

  const totalSize = files?.reduce((sum, file) => sum + (file.metadata?.size || 0), 0) || 0;

  if (loading) {
    return (
      <div className="p-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-foreground">إدارة الملفات</h1>
        <Button variant="outline" asChild>
          <Link to="/">العودة للموقع</Link>
        </Button>
      </div>

      {/* Navigation */}
      <AdminNav currentPage="storage" />

      {/* Storage Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {BUCKETS.map((bucket) => {
          const BucketIcon = bucket.icon;
          const isActive = selectedBucket === bucket.id;
          return (
            <Card 
              key={bucket.id} 
              className={`cursor-pointer transition-all ${isActive ? 'ring-2 ring-primary' : 'hover:bg-muted/50'}`}
              onClick={() => setSelectedBucket(bucket.id)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-3 rounded-full ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <BucketIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{bucket.name}</p>
                  <p className="text-sm text-muted-foreground">{bucket.id}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Files List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              الملفات ({files?.length || 0})
            </div>
            <span className="text-sm font-normal text-muted-foreground">
              الحجم الإجمالي: {formatFileSize(totalSize)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
          ) : files?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">لا توجد ملفات</p>
          ) : (
            <div className="grid md:grid-cols-4 gap-4">
              {files?.map((file) => (
                <div
                  key={file.path}
                  className="group relative rounded-lg border border-border overflow-hidden bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  {/* Preview */}
                  <div className="aspect-square flex items-center justify-center bg-muted">
                    {isImage(file.name) ? (
                      <img
                        src={getPublicUrl(file.path)}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FileText className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <p className="text-sm font-medium text-foreground truncate" title={file.path}>
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {file.path !== file.name && <span className="block truncate">{file.path}</span>}
                      {formatFileSize(file.metadata?.size || 0)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    {isImage(file.name) && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="icon" variant="secondary" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>{file.name}</DialogTitle>
                          </DialogHeader>
                          <img src={getPublicUrl(file.path)} alt={file.name} className="w-full rounded-lg" />
                        </DialogContent>
                      </Dialog>
                    )}
                    <Button 
                      size="icon" 
                      variant="secondary" 
                      className="h-8 w-8"
                      onClick={() => window.open(getPublicUrl(file.path), '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="destructive" className="h-8 w-8">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>حذف الملف</AlertDialogTitle>
                          <AlertDialogDescription>
                            هل أنت متأكد من حذف "{file.name}"؟ قد يؤثر هذا على المنتجات المرتبطة.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(file.path)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            حذف
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

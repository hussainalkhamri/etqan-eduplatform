import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.svg';

interface AdminNavProps {
  currentPage: 'dashboard' | 'products' | 'categories' | 'orders' | 'users' | 'storage';
}

const navItems = [
  { id: 'dashboard', label: 'الرئيسية', path: '/admin' },
  { id: 'products', label: 'المنتجات', path: '/admin/products' },
  { id: 'categories', label: 'التصنيفات', path: '/admin/categories' },
  { id: 'orders', label: 'الطلبات', path: '/admin/orders' },
  { id: 'users', label: 'المستخدمين', path: '/admin/users' },
  { id: 'storage', label: 'الملفات', path: '/admin/storage' },
];

export default function AdminNav({ currentPage }: AdminNavProps) {
  return (
    <div className="mb-8">
      {/* Admin Header with Logo */}
      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border">
        <Link to="/admin" className="flex items-center gap-3">
          <img src={logo} alt="منصة إتقان التعليمية" className="h-10 w-auto" />
          <div className="hidden sm:block">
            <span className="text-xs text-muted-foreground">لوحة التحكم</span>
          </div>
        </Link>
      </div>
      
      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-4">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            className={currentPage === item.id ? 'text-primary bg-primary/10 font-semibold' : ''}
            asChild
          >
            <Link to={item.path}>{item.label}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
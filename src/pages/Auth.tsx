import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Shield, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import logo from '@/assets/logo.svg';

const loginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

const signupSchema = z.object({
  fullName: z.string().min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'كلمتا المرور غير متطابقتين',
  path: ['confirmPassword'],
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isSignup, setIsSignup] = useState(searchParams.get('mode') === 'signup');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signIn, signUp } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
  });

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const { error } = await signIn(data.email, data.password);
      if (error) {
        toast({
          title: 'خطأ في تسجيل الدخول',
          description: error.message === 'Invalid login credentials' 
            ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
            : error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'مرحباً بك!',
          description: 'تم تسجيل الدخول بنجاح',
        });
        navigate('/');
      }
    } catch {
      toast({
        title: 'حدث خطأ',
        description: 'يرجى المحاولة مرة أخرى',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, redirectTarget: string) => {
    setIsLoading(true);
    try {
      const { error } = await signIn(demoEmail, 'demo123456');
      if (!error) {
        toast({
          title: 'تم تسجيل الدخول التجريبي',
          description: `مرحباً بك في وضع المعاينة (${demoEmail})`,
        });
        navigate(redirectTarget);
      }
    } catch {
      toast({
        title: 'حدث خطأ في الدخول التجريبي',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      const { error } = await signUp(data.email, data.password, data.fullName);
      if (error) {
        let message = error.message;
        if (error.message.includes('already registered')) {
          message = 'هذا البريد الإلكتروني مسجل بالفعل';
        }
        toast({
          title: 'خطأ في إنشاء الحساب',
          description: message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'تم إنشاء الحساب!',
          description: 'مرحباً بك في منصة إتقان التعليمية',
        });
        navigate('/');
      }
    } catch {
      toast({
        title: 'حدث خطأ',
        description: 'يرجى المحاولة مرة أخرى',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center mb-8">
          <img src={logo} alt="منصة إتقان التعليمية" className="h-20 w-auto" />
        </Link>

        {/* Auth Card */}
        <div className="bg-card rounded-2xl border border-border p-8 shadow-card">
          {/* Quick Demo Access Box for Portfolio Evaluators */}
          <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20 text-right">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary text-primary-foreground">
                وضع المحفظة التجريبية
              </span>
              <span className="text-xs font-semibold text-primary">دخول تجريبي فوري</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              يمكنك تجربة المنصة وصلاحيات لوحة الإدارة فورياً بنقرة واحدة:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isLoading}
                className="text-xs border-primary/30 hover:bg-primary/20 flex items-center justify-center gap-1.5"
                onClick={() => handleDemoLogin('admin@etqan-edu.example.com', '/admin')}
              >
                <Shield className="h-3.5 w-3.5 text-primary" />
                مدير النظام (Admin)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isLoading}
                className="text-xs border-primary/30 hover:bg-primary/20 flex items-center justify-center gap-1.5"
                onClick={() => handleDemoLogin('teacher@etqan-edu.example.com', '/catalog')}
              >
                <GraduationCap className="h-3.5 w-3.5 text-secondary" />
                معلم (Teacher)
              </Button>
            </div>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {isSignup ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isSignup 
                ? 'أنشئ حسابك للوصول إلى جميع المميزات' 
                : 'أدخل بياناتك للوصول إلى حسابك'}
            </p>
          </div>

          {isSignup ? (
            <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">الاسم الكامل</Label>
                <Input
                  id="fullName"
                  {...signupForm.register('fullName')}
                  placeholder="محمد أحمد"
                  className="h-11"
                />
                {signupForm.formState.errors.fullName && (
                  <p className="text-sm text-destructive">{signupForm.formState.errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  {...signupForm.register('email')}
                  placeholder="example@email.com"
                  className="h-11"
                  dir="ltr"
                />
                {signupForm.formState.errors.email && (
                  <p className="text-sm text-destructive">{signupForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <Input
                  id="password"
                  type="password"
                  {...signupForm.register('password')}
                  placeholder="••••••••"
                  className="h-11"
                  dir="ltr"
                />
                {signupForm.formState.errors.password && (
                  <p className="text-sm text-destructive">{signupForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...signupForm.register('confirmPassword')}
                  placeholder="••••••••"
                  className="h-11"
                  dir="ltr"
                />
                {signupForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">{signupForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
                إنشاء الحساب
              </Button>
            </form>
          ) : (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  {...loginForm.register('email')}
                  placeholder="example@email.com"
                  className="h-11"
                  dir="ltr"
                />
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...loginForm.register('password')}
                    placeholder="••••••••"
                    className="h-11 pl-10"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
                تسجيل الدخول
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isSignup ? 'لديك حساب بالفعل؟' : 'ليس لديك حساب؟'}
              {' '}
              <button
                type="button"
                onClick={() => setIsSignup(!isSignup)}
                className="text-primary hover:underline font-medium"
              >
                {isSignup ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
import { Link } from 'react-router-dom';
import { BookOpen, Award, Truck, Sparkles, ArrowLeft, FileText, FolderOpen, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';

const features = [
  {
    icon: Sparkles,
    title: 'تصاميم احترافية',
    description: 'كراسات وملفات مصممة بأعلى المعايير التعليمية والتربوية',
  },
  {
    icon: Award,
    title: 'تخصيص كامل',
    description: 'أضف اسمك ومؤهلاتك وشعار مدرستك على المنتج',
  },
  {
    icon: Truck,
    title: 'توصيل سريع',
    description: 'نوصل طلبك إلى باب منزلك في أسرع وقت ممكن',
  },
];

// التصنيفات الرئيسية للكتالوج
const mainCategories = [
  {
    id: 'workbooks',
    name: 'الكراسات',
    icon: FileText,
    description: 'كراسات تحضير ومتابعة وتقويم',
    color: 'bg-primary/10 text-primary',
  },
  {
    id: 'files',
    name: 'الملفات',
    icon: FolderOpen,
    description: 'ملفات تعليمية وإدارية متنوعة',
    color: 'bg-secondary/10 text-secondary',
  },
  {
    id: 'bundles',
    name: 'الحزم',
    icon: Layers,
    description: 'مجموعات مميزة بأسعار خاصة',
    color: 'bg-warning/10 text-warning',
  },
];

export default function Index() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-hero py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 fade-in">
              منصة{' '}
              <span className="text-gradient-primary">إتقان</span>{' '}
              التعليمية
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 fade-in" style={{ animationDelay: '0.1s' }}>
              اكتشف مجموعتنا المميزة من الكراسات والملفات التعليمية المصممة خصيصاً لتلبية احتياجاتك.
              تصاميم احترافية وإمكانية تخصيص كاملة.
            </p>

            <div className="flex flex-wrap justify-center gap-4 fade-in" style={{ animationDelay: '0.2s' }}>
              <Button size="lg" asChild className="shadow-primary">
                <Link to="/catalog">
                  تصفح الكتالوج
                  <ArrowLeft className="mr-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/order">اطلب الآن</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-2xl" />
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-secondary/10 rounded-full blur-3xl" />
      </section>

      {/* Main Catalog Categories */}
      <section className="py-16 bg-card">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">تصفح الكتالوج</h2>
            <p className="text-muted-foreground">اختر القسم الذي تريد تصفحه</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {mainCategories.map((category) => (
              <Link
                key={category.id}
                to={`/catalog/${category.id}`}
                className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-background border border-border card-hover text-center"
              >
                <div className={`p-4 rounded-2xl ${category.color}`}>
                  <category.icon className="h-10 w-10" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">لماذا تختارنا؟</h2>
            <p className="text-muted-foreground">نقدم لك أفضل تجربة في إعداد كراساتك التعليمية</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="text-center p-8 rounded-2xl bg-card border border-border card-hover"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-primary">
        <div className="container text-center">
          <BookOpen className="h-16 w-16 text-primary-foreground mx-auto mb-6 animate-float" />
          <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
            جاهز لإنشاء كراستك المخصصة؟
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
            ابدأ الآن واحصل على كراسة تحمل اسمك ومؤهلاتك وشعار مدرستك
          </p>
          <Button size="lg" variant="secondary" asChild className="shadow-lg">
            <Link to="/order">
              ابدأ طلبك الآن
              <ArrowLeft className="mr-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}

import Layout from "@/components/layout/Layout";
import { Book, Target, Users, Award, Heart, Lightbulb } from "lucide-react";

const About = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-background" dir="rtl">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              من نحن
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              منصة إتقان التعليمية - شريكك في رحلة التعليم والإبداع
            </p>
          </div>
        </section>

        {/* About Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-card rounded-2xl p-8 shadow-lg border border-border mb-12">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Book className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">قصتنا</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  انطلقت منصة إتقان التعليمية من إيماننا العميق بأهمية التعليم ودوره المحوري في بناء 
                  الأجيال القادمة. نحن نؤمن بأن المعلم هو ركيزة النجاح التربوي، 
                  ومن هنا جاءت رسالتنا: تقديم أدوات تعليمية وكراسات عمل مخصصة تساعد المعلمين 
                  والمعلمات في المملكة العربية السعودية على تحقيق أهدافهم التربوية بأعلى درجات الكفاءة والإتقان.
                </p>
              </div>

              {/* Mission & Vision */}
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-card rounded-2xl p-8 shadow-lg border border-border">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-secondary/10 rounded-full flex items-center justify-center">
                      <Target className="w-7 h-7 text-secondary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">رسالتنا</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    تمكين المعلمين والمعلمات من خلال توفير كراسات عمل مخصصة 
                    عالية الجودة تلبي احتياجاتهم التعليمية وتعكس هويتهم المهنية.
                  </p>
                </div>

                <div className="bg-card rounded-2xl p-8 shadow-lg border border-border">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center">
                      <Lightbulb className="w-7 h-7 text-accent" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">رؤيتنا</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    أن نكون الوجهة الأولى للمعلمين في المملكة للحصول على 
                    المواد التعليمية المخصصة التي ترتقي بالعملية التعليمية.
                  </p>
                </div>
              </div>

              {/* Values */}
              <div className="bg-card rounded-2xl p-8 shadow-lg border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-8 text-center">قيمنا</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Award className="w-8 h-8 text-primary" />
                    </div>
                    <h4 className="font-bold text-foreground mb-2">الجودة</h4>
                    <p className="text-sm text-muted-foreground">
                      نلتزم بأعلى معايير الجودة في كل منتج نقدمه
                    </p>
                  </div>
                  <div className="text-center p-6">
                    <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-secondary" />
                    </div>
                    <h4 className="font-bold text-foreground mb-2">التخصيص</h4>
                    <p className="text-sm text-muted-foreground">
                      نؤمن بتفرد كل معلم ونقدم حلولاً مخصصة
                    </p>
                  </div>
                  <div className="text-center p-6">
                    <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-8 h-8 text-accent" />
                    </div>
                    <h4 className="font-bold text-foreground mb-2">الشغف</h4>
                    <p className="text-sm text-muted-foreground">
                      نعمل بشغف لخدمة قطاع التعليم ودعم المعلمين
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default About;

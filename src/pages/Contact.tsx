import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: "تم إرسال رسالتك بنجاح",
      description: "سنتواصل معك في أقرب وقت ممكن",
    });

    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background" dir="rtl">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              تواصل معنا
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              نسعد بتواصلكم معنا والإجابة على جميع استفساراتكم
            </p>
          </div>
        </section>

        {/* Contact Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Contact Form */}
                <div className="bg-card rounded-2xl p-8 shadow-lg border border-border">
                  <h2 className="text-2xl font-bold text-foreground mb-6">
                    أرسل لنا رسالة
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">الاسم الكامل</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="أدخل اسمك"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">رقم الجوال</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="05xxxxxxxx"
                          dir="ltr"
                          className="text-right"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">البريد الإلكتروني</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="example@email.com"
                        dir="ltr"
                        className="text-right"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">الموضوع</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="موضوع الرسالة"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">الرسالة</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="اكتب رسالتك هنا..."
                        rows={5}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "جاري الإرسال..." : "إرسال الرسالة"}
                    </Button>
                  </form>
                </div>

                {/* Contact Info */}
                <div className="space-y-6">
                  <div className="bg-card rounded-2xl p-8 shadow-lg border border-border">
                    <h2 className="text-2xl font-bold text-foreground mb-6">
                      معلومات التواصل
                    </h2>
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                          <Phone className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">
                            رقم الهاتف
                          </h4>
                          <p className="text-muted-foreground" dir="ltr">
                            +966 50 000 0000
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center shrink-0">
                          <MessageCircle className="w-5 h-5 text-secondary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">
                            واتساب
                          </h4>
                          <a
                            href="https://wa.me/966500000000"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                            dir="ltr"
                          >
                            +966 50 000 0000
                          </a>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center shrink-0">
                          <Mail className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">
                            البريد الإلكتروني
                          </h4>
                          <a
                            href="mailto:support@etqan-edu.example.com"
                            className="text-primary hover:underline"
                          >
                            support@etqan-edu.example.com
                          </a>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                          <MapPin className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">
                            الموقع
                          </h4>
                          <p className="text-muted-foreground">
                            المملكة العربية السعودية
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center shrink-0">
                          <Clock className="w-5 h-5 text-secondary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">
                            ساعات العمل
                          </h4>
                          <p className="text-muted-foreground">
                            السبت - الخميس: 9 صباحاً - 9 مساءً
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Help */}
                  <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-8 text-primary-foreground">
                    <h3 className="text-xl font-bold mb-4">
                      هل تحتاج مساعدة سريعة؟
                    </h3>
                    <p className="mb-6 opacity-90">
                      تواصل معنا مباشرة عبر الواتساب للحصول على رد فوري
                    </p>
                    <Button
                      variant="secondary"
                      size="lg"
                      className="w-full"
                      asChild
                    >
                      <a
                        href="https://wa.me/966500000000"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="w-5 h-5 ml-2" />
                        تواصل عبر واتساب
                      </a>
                    </Button>
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

export default Contact;

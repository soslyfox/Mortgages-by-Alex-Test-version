import { ArrowRight, Star, Shield, Clock, MapPin, TrendingDown, Heart, Navigation, FileCheck, ShieldCheck, CalendarClock } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { LeadForm } from "@/components/LeadForm";

export default function Home() {
  const { t, language } = useLanguage();

  const trustPoints = [
    { icon: <Star className="h-5 w-5" />,   label: t.home.trust1Label, desc: t.home.trust1Desc },
    { icon: <Shield className="h-5 w-5" />, label: t.home.trust2Label, desc: t.home.trust2Desc },
    { icon: <Clock className="h-5 w-5" />,  label: t.home.trust3Label, desc: t.home.trust3Desc },
  ];

  const scrollToForm = () => {
    document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#003d2b] pt-16 pb-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-0">
            {/* Left: Text */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex-1 text-center lg:text-left pb-12 lg:pb-20 pt-4"
            >
              <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-medium text-green-200 mb-6">
                <span className="flex h-2 w-2 rounded-full bg-green-300 mr-2"></span>
                {t.home.badge} {new Date().toLocaleString(language === 'uk' ? 'uk-UA' : language === 'ru' ? 'ru-RU' : 'en-US', { month: 'long', year: 'numeric' })}
              </div>
              <h1 className="text-4xl md:text-5xl xl:text-6xl font-display font-bold tracking-tight text-white mb-4 leading-tight">
                {t.home.heroTitle1} <br className="hidden md:block"/>
                <span className="text-green-300">{t.home.heroTitle2}</span>
              </h1>
              <p className="text-lg text-white/70 mb-2 max-w-xl">
                {t.home.heroDesc}
              </p>
              <p className="text-base text-green-300 font-medium mb-10 max-w-xl">
                {t.home.heroTagline}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
                <a href="https://calendly.com/garinalek/60-minute-call" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="w-full sm:w-auto bg-white text-[#003d2b] hover:bg-green-50 font-semibold text-base h-12 px-8 rounded-xl shadow-lg">
                    {t.home.ctaBtn} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={scrollToForm}
                  className="w-full sm:w-auto border-white/30 text-white bg-transparent hover:bg-white/10 text-base h-12 px-8 rounded-xl"
                >
                  {t.home.formTitle}
                </Button>
              </div>
              {/* Trust badges */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-6">
                {trustPoints.map((tp) => (
                  <div key={tp.label} className="flex items-center gap-2 text-white/80">
                    <span className="text-green-300">{tp.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-white">{tp.label}</p>
                      <p className="text-xs text-white/55">{tp.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: Alex's photo */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex-shrink-0 lg:self-end"
            >
              <div className="relative">
                <img
                  src={`${import.meta.env.BASE_URL}images/alex.png`}
                  alt="Alex"
                  className="w-64 sm:w-72 lg:w-80 xl:w-96 object-cover object-top rounded-t-2xl"
                />
                <div className="absolute -left-6 bottom-12 bg-white rounded-xl shadow-xl px-4 py-3 text-sm">
                  <p className="font-bold text-[#003d2b]">{t.home.familiesHelped}</p>
                  <p className="text-muted-foreground text-xs">{t.home.familiesRegion}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="w-full overflow-hidden leading-none">
          <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" className="w-full block">
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="hsl(152, 30%, 98%)" />
          </svg>
        </div>
      </section>

      {/* Why Me + Get in Touch — combined block */}
      <section id="contact-form" className="py-16 md:py-24 bg-background border-b border-border/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

            {/* Left: Why Me? */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-display font-bold text-foreground mb-10">{t.home.whyMeTitle}</h2>
              <div className="space-y-8">
                {[
                  { icon: <TrendingDown className="w-5 h-5" />, text: t.home.whyMe1 },
                  { icon: <Heart className="w-5 h-5" />,        text: t.home.whyMe2 },
                  { icon: <Navigation className="w-5 h-5" />,   text: t.home.whyMe3 },
                  { icon: <FileCheck className="w-5 h-5" />,    text: t.home.whyMe4 },
                  { icon: <ShieldCheck className="w-5 h-5" />,  text: t.home.whyMe5 },
                  { icon: <CalendarClock className="w-5 h-5" />, text: t.home.whyMe6 },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.07 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-4"
                  >
                    <div className="w-11 h-11 rounded-full border border-border/60 bg-muted/30 flex items-center justify-center shrink-0 text-[#003d2b]">
                      {item.icon}
                    </div>
                    <p className="text-muted-foreground leading-relaxed pt-2">{item.text}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right: Get in Touch */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-display font-bold text-foreground mb-3">{t.home.formTitle}</h2>
              <p className="text-muted-foreground mb-8">{t.home.formSubtitle}</p>
              <LeadForm />
            </motion.div>

          </div>
        </div>
      </section>

      {/* About Alex — hidden for now, content preserved */}
      {false && (
        <section className="py-16 md:py-24 bg-muted/30 border-y border-border/40">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="flex justify-center lg:justify-end">
                <div className="relative">
                  <div className="w-72 h-72 md:w-80 md:h-80 rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                    <img
                      src={`${import.meta.env.BASE_URL}images/alex.png`}
                      alt="Alex"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="absolute -bottom-5 -left-5 bg-white rounded-xl shadow-lg px-4 py-3 text-sm border border-border/30">
                    <p className="font-bold text-[#003d2b] text-base">2024</p>
                    <p className="text-muted-foreground text-xs">{t.home.timeline2024}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">{t.home.aboutTitle}</h2>
                <p className="text-muted-foreground leading-relaxed">{t.home.aboutP1}</p>
                <p className="text-muted-foreground leading-relaxed">{t.home.aboutP2}</p>
                <p className="text-foreground font-medium leading-relaxed">{t.home.aboutP3}</p>
                <div className="pt-4 space-y-4 border-t border-border/50">
                  {[
                    { year: '2022', label: t.home.timeline2022, desc: t.home.timeline2022desc },
                    { year: '2023', label: t.home.timeline2023, desc: t.home.timeline2023desc },
                    { year: '2024', label: t.home.timeline2024, desc: t.home.timeline2024desc },
                  ].map((item) => (
                    <div key={item.year} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#003d2b] text-white flex items-center justify-center text-sm font-bold">
                        {item.year}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-10 md:py-14 bg-muted/20 border-y border-border/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-display font-bold text-foreground">{t.home.testimonialsTitle}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{t.home.testimonialsSubtitle}</p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 bg-white border border-border/50 rounded-full px-3 py-1.5 shadow-sm">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              ))}
              <span className="text-xs font-semibold text-foreground ml-1">5.0</span>
              <span className="text-xs text-muted-foreground">· Google</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              {
                text: "We've been working with Alex for ages, from getting ready for our English exam to snagging our first home in Calgary. I'd highly recommend him as a truly qualified specialist. He's shown us all that Canada really does offer a fair shot at success for everyone!",
                author: "Oleksandr K.",
                city: "Calgary",
                img: `${import.meta.env.BASE_URL}images/review-oleksandr.png`,
              },
              {
                text: "Everyone knows that buying real estate can be stressful. We're grateful to Alex for his efforts to make the process as comfortable as possible. Our situation was unusual — we purchased our townhouse without a realtor — but everything went smoothly.",
                author: "Anastasiia H.",
                city: "Calgary",
                img: `${import.meta.env.BASE_URL}images/review-anastasiia.png`,
              },
              {
                text: "My wife and I were buying a house for the first time. We didn't know where to start, but after the first (free) consultation, we already had a home-buying strategy in place. Working with Alex was easy, clear, and he was always in touch. Thank you, Alex.",
                author: "Вячеслав С.",
                city: "Leduc",
                img: `${import.meta.env.BASE_URL}images/review-viacheslav.png`,
              },
              {
                text: "Many thanks to Alex Harin! I was amazed at how quickly he found me the best mortgage rate. He was patient answering all my questions and explained each step in detail. Alex, where many told us it was impossible, you made it possible.",
                author: "Дмитрий М.",
                city: "Fort McMurray",
                img: `${import.meta.env.BASE_URL}images/review-dmytro.png`,
              },
            ].map((review, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.07 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-border/40 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                  <div className="h-28 overflow-hidden">
                    <img src={review.img} alt={review.city} className="w-full h-full object-cover object-center" />
                  </div>
                  <CardContent className="p-4 flex flex-col gap-2">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4 italic">"{review.text}"</p>
                    <div className="flex items-center gap-2 pt-1 border-t border-border/30 mt-auto">
                      <div className="w-6 h-6 rounded-full bg-[#003d2b]/10 text-[#003d2b] flex items-center justify-center font-bold text-[10px] shrink-0">
                        {review.author.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground text-xs leading-none truncate">{review.author}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-0.5">
                          <MapPin className="w-2.5 h-2.5 shrink-0" />{review.city}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#003d2b] relative overflow-hidden">
        <div className="mx-auto max-w-5xl px-4 flex flex-col md:flex-row items-center gap-10">
          <img
            src={`${import.meta.env.BASE_URL}images/alex.png`}
            alt="Alex"
            className="w-36 h-36 rounded-full object-cover object-top border-4 border-white/20 shadow-2xl flex-shrink-0"
          />
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-display font-bold text-white mb-4">{t.home.ctaTitle}</h2>
            <p className="text-white/70 mb-6 max-w-xl">{t.home.ctaDesc}</p>
            <a href="https://calendly.com/garinalek/60-minute-call" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-white text-[#003d2b] hover:bg-green-50 font-semibold rounded-xl px-8 h-12 shadow-lg">
                {t.home.ctaBtn}
              </Button>
            </a>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}

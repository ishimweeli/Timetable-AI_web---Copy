import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/component/Ui/button.tsx";
import { useI18n } from "@/hook/useI18n.ts";
import { useTheme } from "@/hook/useTheme.ts";
import {
  Calendar,
  Clock,
  School,
  Building,
  BookOpen,
  Users,
  CheckCircle,
  RotateCw,
  ChevronRight,
  Menu,
  ArrowRightCircle,
} from "lucide-react";
import { ThemeToggle } from "@/component/Ui/theme-toggle.tsx";
import { LanguageSelector } from "@/component/Ui/language-selector.tsx";

const PageHome = () => {
  const { t } = useI18n();
  const { colorScheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: t("features.smartScheduling"),
      description: t("features.aiPowered"),
      animation: "animate-fade-in",
      delay: "delay-0",
    },
    {
      icon: <School className="h-8 w-8 text-primary" />,
      title: t("features.resourceManagement"),
      description: t("features.trackResources"),
      animation: "animate-fade-in",
      delay: "delay-100",
    },
    {
      icon: <BookOpen className="h-8 w-8 text-primary" />,
      title: t("features.multiLanguage"),
      description: t("features.languageSupport"),
      animation: "animate-fade-in",
      delay: "delay-200",
    },
  ];

  const benefits = [
    {
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
      title: t("common.benefits.saveTime"),
      description: t("common.benefits.automatedScheduling"),
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
      title: t("common.benefits.eliminateConflicts"),
      description: t("common.benefits.smartAllocation"),
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
      title: t("common.benefits.optimizeResources"),
      description: t("common.benefits.maximizeEfficiency"),
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
      title: t("common.benefits.easyImplementation"),
      description: t("common.benefits.seamlessIntegration"),
    },
  ];

  return (
      <div className="min-h-screen bg-background">
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "backdrop-blur-sm shadow-sm" : "bg-transparent"} bg-secondary`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-1.5 rounded-full">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <span className="font-bold text-xl">{t("common.appName")}</span>
                </div>
              </div>

              <nav className="hidden md:flex items-center space-x-8">
                <Link
                    to="#features"
                    className="text-foreground/80 hover:text-primary transition-colors"
                >
                  {t("navigation.features")}
                </Link>
                <Link
                    to="#demo"
                    className="text-foreground/80 hover:text-primary transition-colors"
                >
                  {t("navigation.demo")}
                </Link>
                <Link
                    to="#testimonials"
                    className="text-foreground/80 hover:text-primary transition-colors"
                >
                  {t("navigation.successStories")}
                </Link>
                <div className="flex items-center space-x-2">
                  <ThemeToggle />
                  <LanguageSelector />
                </div>
                <Link to="/auth">
                  <Button>{t("auth.signIn")}</Button>
                </Link>
              </nav>

              {/* Mobile menu button */}
              <div className="md:hidden flex items-center">
                <ThemeToggle />
                <LanguageSelector />
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="ml-2 p-2 rounded-md text-foreground hover:bg-muted transition-colors"
                >
                  <Menu className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Mobile Navigation */}
            <div
                className={`md:hidden transition-all duration-300 overflow-hidden ${isMenuOpen ? "max-h-60 pb-4" : "max-h-0"}`}
            >
              <div className="flex flex-col space-y-3">
                <Link
                    to="#features"
                    className="px-2 py-1 rounded hover:bg-primary/10 transition-colors"
                >
                  {t("navigation.features")}
                </Link>
                <Link
                    to="#demo"
                    className="px-2 py-1 rounded hover:bg-primary/10 transition-colors"
                >
                  {t("navigation.demo")}
                </Link>
                <Link
                    to="#testimonials"
                    className="px-2 py-1 rounded hover:bg-primary/10 transition-colors"
                >
                  {t("navigation.successStories")}
                </Link>
                <Link to="/auth">
                  <Button className="w-full">{t("auth.signIn")}</Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="pt-28 md:pt-40 pb-16 md:pb-24 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>
          <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl opacity-30 pointer-events-none"></div>

          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 md:space-y-8">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium animate-fade-in">
                  <RotateCw className="h-4 w-4 animate-spin duration-3000" />
                  {t("landing.hero.subtitle")}
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight animate-fade-in">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                  {t("landing.hero.titleHighlight")}
                </span>{" "}
                  {t("landing.hero.title")}
                </h1>

                <p className="text-xl text-muted-foreground max-w-xl animate-fade-in">
                  {t("landing.hero.description")}
                </p>

                <div className="flex flex-wrap gap-4 animate-fade-in">
                  <Link to="/auth?view=register">
                    <Button size="lg" className="px-8 gap-2 group">
                      <span>{t("landing.cta.freeTrial")}</span>
                      <ArrowRightCircle className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link to="/demo">
                    <Button size="lg" variant="outline" className="px-8">
                      {t("landing.cta.exploreDemo")}
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 animate-fade-in">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                      ED
                    </div>
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
                      ST
                    </div>
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs">
                      UN
                    </div>
                  </div>
                  <span>{t("landing.trustedBy")}</span>
                </div>
              </div>

              <div className="relative lg:h-[500px] rounded-xl overflow-hidden shadow-2xl border border-border animate-fade-in">
                <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
                <img
                    src="/public/assets/images/landing.png"
                    alt={t("features.timetableSystemDashboard")}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="bg-background/80 backdrop-blur-md border border-border rounded-lg p-4 shadow-lg">
                    <h3 className="text-lg font-medium">
                      {t("features.intuitiveInterface")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t("features.visualizeManage")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24 px-4 bg-muted/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t("features.section.title")}
              </h2>
              <p className="text-lg text-muted-foreground">
                {t("features.section.description")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                  <div
                      key={index}
                      className={`bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-all ${feature.animation} ${feature.delay}`}
                  >
                    <div className="bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
              ))}
            </div>

            <div className="mt-16 bg-card border border-border rounded-xl overflow-hidden shadow-lg">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <h3 className="text-2xl md:text-3xl font-bold mb-4">
                    {t("timetable.interactiveManagement")}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {t("timetable.managementDescription")}
                  </p>
                  <ul className="space-y-3 mb-8">
                    {benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-3">
                          {benefit.icon}
                          <div>
                            <h4 className="font-medium">{benefit.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {benefit.description}
                            </p>
                          </div>
                        </li>
                    ))}
                  </ul>
                  <Link to="/timetable">
                    <Button variant="outline" className="w-full sm:w-auto">
                      {t("landing.cta.seeInAction")}
                    </Button>
                  </Link>
                </div>

                <div className="relative min-h-[300px] lg:min-h-0 bg-muted">
                  <img
                      src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=80"
                      alt={t("landing.adminUsingTimetable")}
                      className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Demo Section */}
        <section id="demo" className="py-16 md:py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t("demo.section.title")}
              </h2>
              <p className="text-lg text-muted-foreground">
                {t("demo.section.description")}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="col-span-1 lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden shadow-lg">
                <div className="p-6 bg-muted/50 border-b border-border">
                  <h3 className="font-semibold">
                    {t("demo.conflictResolution")}
                  </h3>
                </div>
                <div className="p-6 flex items-center justify-center min-h-[400px]">
                  <div className="text-center p-4">
                    <Calendar className="h-12 w-12 mx-auto text-primary mb-4" />
                    <h4 className="text-lg font-medium mb-2">
                      {t("demo.tryFullFeatured")}
                    </h4>
                    <p className="text-muted-foreground mb-4">
                      {t("demo.experienceComplete")}
                    </p>
                    <Link to="/demo">
                      <Button>{t("demo.launchDemo")}</Button>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-card rounded-xl border border-border overflow-hidden shadow-lg">
                  <div className="p-4 border-b border-border flex justify-between items-center">
                    <h3 className="font-medium text-sm">{t("resource.allocation")}</h3>
                    <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 px-2 py-1 rounded-full">
                    {t("common.optimized")}
                  </span>
                  </div>
                  <div className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{t("room.classrooms")}</span>
                        <span className="text-sm font-medium">
                        {t("common.efficiency", { value: "94%" })}
                      </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: "94%" }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{t("teacher.faculty")}</span>
                        <span className="text-sm font-medium">
                        {t("common.efficiency", { value: "87%" })}
                      </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: "87%" }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{t("room.labSpaces")}</span>
                        <span className="text-sm font-medium">
                        {t("common.efficiency", { value: "92%" })}
                      </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: "92%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-xl border border-border overflow-hidden shadow-lg">
                  <div className="p-4 border-b border-border flex justify-between items-center">
                    <h3 className="font-medium text-sm">{t("demo.beforeVsAfter")}</h3>
                    <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 px-2 py-1 rounded-full">
                    {t("common.timeSavings")}
                  </span>
                  </div>
                  <div className="p-4">
                    <div className="flex gap-4 mb-4">
                      <div className="flex-1 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <h4 className="text-sm font-medium mb-1">{t("common.before")}</h4>
                        <p className="text-2xl font-bold">26 {t("common.hours")}</p>
                        <p className="text-xs text-muted-foreground">
                          {t("timetable.weeklyScheduling")}
                        </p>
                      </div>
                      <div className="flex-1 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <h4 className="text-sm font-medium mb-1">{t("common.after")}</h4>
                        <p className="text-2xl font-bold">3 {t("common.hours")}</p>
                        <p className="text-xs text-muted-foreground">
                          {t("timetable.weeklyScheduling")}
                        </p>
                      </div>
                    </div>
                    <div className="text-center text-sm text-muted-foreground">
                      <p>{t("common.averageTimeSavings")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials section */}
        <section id="testimonials" className="py-16 md:py-24 px-4 bg-muted/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t("testimonials.section.title")}
              </h2>
              <p className="text-lg text-muted-foreground">
                {t("testimonials.section.description")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                    JD
                  </div>
                  <div>
                    <h4 className="font-medium">{t("testimonials.person1.name")}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t("testimonials.person1.title")}
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  {t("testimonials.person1.quote")}
                </p>
              </div>

              <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                    MR
                  </div>
                  <div>
                    <h4 className="font-medium">{t("testimonials.person2.name")}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t("testimonials.person2.title")}
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  {t("testimonials.person2.quote")}
                </p>
              </div>

              <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                    SL
                  </div>
                  <div>
                    <h4 className="font-medium">{t("testimonials.person3.name")}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t("testimonials.person3.title")}
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  {t("testimonials.person3.quote")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl opacity-30 pointer-events-none"></div>

          <div className="max-w-5xl mx-auto relative">
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
              <div className="p-8 md:p-12 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  {t("landing.cta.title")}
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
                  {t("landing.cta.description")}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link to="/auth?view=register">
                    <Button size="lg" className="px-8 gap-2 w-full sm:w-auto">
                      <span>{t("landing.cta.startFreeTrialLong")}</span>
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/demo">
                    <Button
                        size="lg"
                        variant="outline"
                        className="px-8 w-full sm:w-auto"
                    >
                      {t("landing.cta.exploreInteractiveDemo")}
                    </Button>
                  </Link>
                </div>

                <p className="mt-4 text-sm text-muted-foreground">
                  {t("landing.cta.noCreditCard")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-muted/70 py-12 px-4 border-t border-border">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              <div>
                <h3 className="font-semibold mb-4">{t("footer.product")}</h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                        to="#"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t("navigation.features")}
                    </Link>
                  </li>
                  <li>
                    <Link
                        to="#"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t("navigation.pricing")}
                    </Link>
                  </li>
                  <li>
                    <Link
                        to="#"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t("navigation.demo")}
                    </Link>
                  </li>
                  <li>
                    <Link
                        to="#"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t("navigation.caseStudies")}
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-4">{t("footer.resources")}</h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                        to="#"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t("navigation.documentation")}
                    </Link>
                  </li>
                  <li>
                    <Link
                        to="#"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t("navigation.guides")}
                    </Link>
                  </li>
                  <li>
                    <Link
                        to="#"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t("navigation.apiReference")}
                    </Link>
                  </li>
                  <li>
                    <Link
                        to="#"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t("navigation.support")}
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-4">{t("footer.company")}</h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                        to="#"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t("navigation.about")}
                    </Link>
                  </li>
                  <li>
                    <Link
                        to="#"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t("navigation.blog")}
                    </Link>
                  </li>
                  <li>
                    <Link
                        to="#"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t("navigation.careers")}
                    </Link>
                  </li>
                  <li>
                    <Link
                        to="#"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t("navigation.contact")}
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-4">{t("footer.legal")}</h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                        to="#"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t("navigation.privacy")}
                    </Link>
                  </li>
                  <li>
                    <Link
                        to="#"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t("navigation.terms")}
                    </Link>
                  </li>
                  <li>
                    <Link
                        to="#"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t("navigation.security")}
                    </Link>
                  </li>
                  <li>
                    <Link
                        to="#"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t("navigation.gdpr")}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border">
              <div className="flex items-center gap-2 mb-4 md:mb-0">
                <div className="bg-primary/10 p-1.5 rounded-full">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium">{t("common.appName")}</span>
              </div>

              <div className="flex items-center gap-6">
                <ThemeToggle />
                <LanguageSelector />
              </div>

              <div className="text-sm text-muted-foreground mt-4 md:mt-0">
                &copy; {new Date().getFullYear()} {t("common.appName")}. {t("common.allRightsReserved")}
              </div>
            </div>
          </div>
        </footer>
      </div>
  );
};

export default PageHome;

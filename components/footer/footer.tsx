import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from "next-intl";

import { Logo } from '../logo';
import { NavBarItems } from '@/constants/navbar-items-list';

export default function Footer() {
  const t = useTranslations("Footer");
  const tNav = useTranslations("NavBar");

  return (
    <footer className="border-b bg-white pt-20 dark:bg-transparent">
      <div className="mx-auto max-w-5xl px-6 border-t border-black/20 dark:border-white/20 py-6 space-y-12">

        {/* === Mobile-only image === */}
        <div className="block md:hidden">
          <Image
            src="/footer/facial-skin-features-overview.svg"
            alt="Overview of 17 available facial skin features"
            width={800}
            height={200}
            className="w-full object-cover rounded-xl"
            priority
          />
        </div>

        {/* === Grid Section === */}
        <div className="grid gap-12 md:grid-cols-4">

          {/* Logo - hidden on mobile */}
          <div className="hidden md:block space-y-4 ">
            <Link href="/" aria-label={t("goHome")} className="block size-fit">
              <Logo width={250} />
            </Link>
          </div>

          {/* Mobile: LINKS & FIND US side-by-side */}
          <div className="block md:hidden col-span-full">
            <div className="grid grid-cols-2 gap-6">
              {/* LINKS */}
              <div className="space-y-4 text-sm">
                <span className="block font-medium">{t("linksTitle")}</span>
                {NavBarItems.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="text-muted-foreground hover:text-primary block duration-150"
                  >
                    <span className="capitalize">{tNav(item.title)}</span>
                  </Link>
                ))}
              </div>

              {/* FIND US */}
              <div className="space-y-4 text-sm">
                <span className="block font-medium">{t("findUsTitle")}</span>

                <div className="space-y-1">
                  <div className="font-medium">{t("addressTitle")}</div>
                  <p className="text-muted-foreground text-sm">{t("address")}</p>
                </div>

                <div className="space-y-1">
                  <div className="font-medium">{t("hoursTitle")}</div>
                  <p className="text-muted-foreground text-sm">{t("hours")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop/Tablet: LINKS */}
          <div className="hidden md:block space-y-4 text-sm">
            <span className="block font-medium">{t("linksTitle")}</span>
            {NavBarItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="text-muted-foreground hover:text-primary block duration-150"
              >
                <span className="capitalize">{tNav(item.title)}</span>
              </Link>
            ))}
          </div>

          {/* Desktop/Tablet: FIND US */}
          <div className="hidden md:block space-y-4 text-sm">
            <span className="block font-medium">{t("findUsTitle")}</span>

            <div className="space-y-1">
              <div className="font-medium">{t("addressTitle")}</div>
              <p className="text-muted-foreground text-sm">{t("address")}</p>
            </div>

            <div className="space-y-1">
              <div className="font-medium">{t("hoursTitle")}</div>
              <p className="text-muted-foreground text-sm">{t("hours")}</p>
            </div>
          </div>

          {/* Image Section (shown on desktop/tablet only) */}
          <div className="hidden md:block space-y-4 text-sm">
            <Image
              src="/footer/facial-skin-features-count.png"
              alt="Circular graphic showing 17 facial skin features available."
              width={200}
              height={200}
              className="rounded-xl"
            />
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 border-t border-black/20 dark:border-white/20 pt-6">
          <span className="text-muted-foreground order-last block text-center text-sm md:order-first">
            © {new Date().getFullYear()} Vistasy, {t("copyright")}
          </span>
        </div>
      </div>
    </footer>
  );
}

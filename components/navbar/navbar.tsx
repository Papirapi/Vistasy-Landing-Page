'use client'
import { Link } from '@/i18n/navigation';
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'
import { LanguesDropdownMenu } from '@/components/navbar/language-dropdown-menu'
import { NavBarItems } from '@/constants/navbar-items-list'
import ThemeSwitcher from '../theme/theme-switcher'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl';


export default function NavBar() {
    const [menuState, setMenuState] = useState(false)
    const pathname = usePathname()

    // remove first segment if it's a locale (e.g., /en/home → /home)
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '');

    // Map paths to custom underline colors
    const underlineColors: Record<string, string> = {
        '/home': 'after:bg-c-blue',
        '/benefits': 'after:bg-c-orange',
        '/solution': 'after:bg-c-purple',
        '/pricing': 'after:bg-c-blue',
        '/contact': 'after:bg-c-orange',
    };

    // Fallback color if path not found in mapping
    const getUnderlineColor = (path: string) =>
        underlineColors[path] || 'after:bg-c-blue';

    const t = useTranslations('NavBar');

    return (
        <header>
            <nav
                data-state={menuState && 'active'}
                className="fixed z-20 w-full border-b border-dashed bg-white backdrop-blur md:relative dark:bg-zinc-950/50 lg:dark:bg-transparent">
                <div className="m-auto max-w-6xl px-6">
                    <div className="flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                        <div className="flex w-full justify-between lg:w-auto">
                            <div className='flex'>
                                <Link
                                    href="/home"
                                    aria-label="home"
                                    className="flex items-center">
                                    <Logo  width={40} height={40}/>
                                </Link>
                                <LanguesDropdownMenu />
                            </div>

                            <div className="flex items-center gap-4 lg:hidden">
                                <ThemeSwitcher />
                                <button
                                    onClick={() => setMenuState(!menuState)}
                                    aria-label={menuState ? 'Close Menu' : 'Open Menu'}
                                    className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5"
                                >
                                    <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                                    <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                                </button>
                            </div>
                        </div>

                        <div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
                            <div className="flex lg:pr-4">
                                <ul className="space-y-6 text-base lg:flex lg:gap-8 lg:space-y-0 lg:text-sm">
                                    <li className="hidden lg:block">
                                        <ThemeSwitcher />
                                    </li>
                                    {NavBarItems.map((item, index) => (
                                        <li className='pt-2' key={index}>
                                            <Link
                                                href={item.href}
                                                onClick={() => setMenuState(false)}
                                                className={`relative block pb-1 font-bold text-muted-foreground hover:text-accent-foreground duration-150
    ${pathWithoutLocale === item.href
                                                        ? `text-accent-foreground after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-1/2 ${getUnderlineColor(item.href)} after:transition-all after:duration-300`
                                                        : ''
                                                    }`}
                                            >
                                                <span>{t(item.title)}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit lg:border-l lg:pl-6">
                                <Button
                                    asChild
                                    variant="outline"
                                    size="sm">
                                    <Link href="#">
                                        <span>Login</span>
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="sm">
                                    <Link href="#">
                                        <span>Register</span>
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
}
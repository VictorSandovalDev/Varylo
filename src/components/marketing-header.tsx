"use client"

import * as React from "react"
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";
import { LanguageSwitcher } from '@/components/language-switcher';

interface NavDict {
    home: string;
    features: string;
    pricing: string;
    login: string;
    getStarted: string;
}

interface MarketingHeaderProps {
    lang: string;
    nav: NavDict;
}

export function MarketingHeader({ lang, nav }: MarketingHeaderProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [scrolled, setScrolled] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-slate-950/90 backdrop-blur-xl border-b border-indigo-500/10 shadow-lg shadow-indigo-950/20' : 'bg-transparent'}`}>
            <div className="container mx-auto flex h-16 max-w-screen-2xl items-center px-4">
                <Link href={`/${lang}`} className="mr-8 flex items-center gap-2.5 group">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow">V</div>
                    <span className="font-bold text-xl text-white tracking-tight">VARYLO</span>
                </Link>

                <nav className="hidden md:flex items-center gap-8 text-sm">
                    <Link href={`/${lang}/#hero`} className="text-slate-400 hover:text-white transition-colors font-medium">{nav.home}</Link>
                    <Link href={`/${lang}/#features`} className="text-slate-400 hover:text-white transition-colors font-medium">{nav.features}</Link>
                    <Link href={`/${lang}/#pricing`} className="text-slate-400 hover:text-white transition-colors font-medium">{nav.pricing}</Link>
                </nav>

                <div className="flex flex-1 items-center justify-end gap-3">
                    <div className="hidden md:flex items-center gap-3">
                        <LanguageSwitcher />
                        <Link href={`/${lang}/login`}>
                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-white/5 font-medium">{nav.login}</Button>
                        </Link>
                        <Link href={`/${lang}/register`}>
                            <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 border-0 text-white shadow-lg shadow-indigo-600/30 font-semibold">{nav.getStarted}</Button>
                        </Link>
                    </div>

                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" className="px-0 text-white hover:bg-transparent focus-visible:bg-transparent md:hidden">
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="bg-slate-950 border-indigo-500/10 text-white">
                            <div className="flex flex-col gap-6 mt-8 px-2">
                                <Link href={`/${lang}/#hero`} className="text-lg font-medium text-slate-300 hover:text-white transition-colors" onClick={() => setIsOpen(false)}>{nav.home}</Link>
                                <Link href={`/${lang}/#features`} className="text-lg font-medium text-slate-300 hover:text-white transition-colors" onClick={() => setIsOpen(false)}>{nav.features}</Link>
                                <Link href={`/${lang}/#pricing`} className="text-lg font-medium text-slate-300 hover:text-white transition-colors" onClick={() => setIsOpen(false)}>{nav.pricing}</Link>
                                <div className="h-px bg-indigo-500/20" />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-400">Idioma</span>
                                    <LanguageSwitcher />
                                </div>
                                <div className="h-px bg-indigo-500/20" />
                                <Link href={`/${lang}/login`} onClick={() => setIsOpen(false)}>
                                    <Button variant="outline" className="w-full border-indigo-500/20 text-white hover:bg-indigo-500/10">{nav.login}</Button>
                                </Link>
                                <Link href={`/${lang}/register`} onClick={() => setIsOpen(false)}>
                                    <Button className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 border-0 text-white font-semibold">{nav.getStarted}</Button>
                                </Link>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}

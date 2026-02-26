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

    return (
        <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/80 backdrop-blur-xl">
            <div className="container mx-auto flex h-16 max-w-screen-2xl items-center px-4">
                <Link href={`/${lang}`} className="mr-8 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white font-bold text-sm">V</div>
                    <span className="font-bold text-xl text-white">VARYLO</span>
                </Link>

                <nav className="hidden md:flex items-center gap-8 text-sm">
                    <Link href={`/${lang}/#hero`} className="text-zinc-400 hover:text-white transition-colors">{nav.home}</Link>
                    <Link href={`/${lang}/#features`} className="text-zinc-400 hover:text-white transition-colors">{nav.features}</Link>
                    <Link href={`/${lang}/#pricing`} className="text-zinc-400 hover:text-white transition-colors">{nav.pricing}</Link>
                </nav>

                <div className="flex flex-1 items-center justify-end gap-3">
                    <div className="hidden md:flex items-center gap-3">
                        <LanguageSwitcher />
                        <Link href={`/${lang}/login`}>
                            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-white/5">{nav.login}</Button>
                        </Link>
                        <Link href={`/${lang}/register`}>
                            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 border-0 text-white shadow-lg shadow-blue-600/20">{nav.getStarted}</Button>
                        </Link>
                    </div>

                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" className="px-0 text-white hover:bg-transparent focus-visible:bg-transparent md:hidden">
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="bg-zinc-950 border-white/5 text-white">
                            <div className="flex flex-col gap-6 mt-8 px-2">
                                <Link href={`/${lang}/#hero`} className="text-lg font-medium text-zinc-300 hover:text-white" onClick={() => setIsOpen(false)}>{nav.home}</Link>
                                <Link href={`/${lang}/#features`} className="text-lg font-medium text-zinc-300 hover:text-white" onClick={() => setIsOpen(false)}>{nav.features}</Link>
                                <Link href={`/${lang}/#pricing`} className="text-lg font-medium text-zinc-300 hover:text-white" onClick={() => setIsOpen(false)}>{nav.pricing}</Link>
                                <div className="h-px bg-white/10" />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-zinc-400">Idioma</span>
                                    <LanguageSwitcher />
                                </div>
                                <div className="h-px bg-white/10" />
                                <Link href={`/${lang}/login`} onClick={() => setIsOpen(false)}>
                                    <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5">{nav.login}</Button>
                                </Link>
                                <Link href={`/${lang}/register`} onClick={() => setIsOpen(false)}>
                                    <Button className="w-full bg-gradient-to-r from-blue-600 to-violet-600 border-0 text-white">{nav.getStarted}</Button>
                                </Link>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}

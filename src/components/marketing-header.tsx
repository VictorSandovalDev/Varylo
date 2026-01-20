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
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-14 max-w-screen-2xl items-center px-4">
                <Link href={`/${lang}`} className="mr-6 flex items-center space-x-2">
                    <span className="font-bold text-xl inline-block">
                        VARYLO
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                    <Link href={`/${lang}/#hero`} className="transition-colors hover:text-foreground/80 text-foreground/60">{nav.home}</Link>
                    <Link href={`/${lang}/#features`} className="transition-colors hover:text-foreground/80 text-foreground/60">{nav.features}</Link>
                    <Link href={`/${lang}/#pricing`} className="transition-colors hover:text-foreground/80 text-foreground/60">{nav.pricing}</Link>
                </nav>

                <div className="flex flex-1 items-center justify-end space-x-2">
                    <div className="hidden md:flex items-center space-x-2">
                        <LanguageSwitcher />
                        <Link href={`/${lang}/login`}>
                            <Button variant="ghost" size="sm">{nav.login}</Button>
                        </Link>
                        <Link href={`/${lang}/register`}>
                            <Button size="sm">{nav.getStarted}</Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Trigger */}
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                className="px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
                            >
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="pl-1 pr-0">
                            <div className="flex flex-col space-y-4 px-7 mt-8">
                                <Link
                                    href={`/${lang}/#hero`}
                                    className="text-lg font-medium"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {nav.home}
                                </Link>
                                <Link
                                    href={`/${lang}/#features`}
                                    className="text-lg font-medium"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {nav.features}
                                </Link>
                                <Link
                                    href={`/${lang}/#pricing`}
                                    className="text-lg font-medium"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {nav.pricing}
                                </Link>
                                <div className="h-px bg-muted" />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Idioma</span>
                                    <LanguageSwitcher />
                                </div>
                                <div className="h-px bg-muted" />
                                <Link
                                    href={`/${lang}/login`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Button variant="outline" className="w-full justify-start">{nav.login}</Button>
                                </Link>
                                <Link
                                    href={`/${lang}/register`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Button className="w-full justify-start">{nav.getStarted}</Button>
                                </Link>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}

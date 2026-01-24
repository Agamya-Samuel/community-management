"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { UserAvatar } from "@/components/UserAvatar"
import { authClient } from "@/lib/auth/client"
import { Zap, Menu, X } from "lucide-react"

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const checkSession = async () => {
            try {
                const session = await authClient.getSession()
                setIsLoggedIn(!!session?.data?.user)
            } catch (error) {
                console.error("Error fetching session:", error)
                setIsLoggedIn(false)
            } finally {
                setIsLoading(false)
            }
        }

        checkSession()
    }, [])

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    return (
        <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <Zap className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold text-foreground font-[family-name:var(--font-playfair)]">
                            EventFlow
                        </span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {!isLoading && (
                            <>
                                {isLoggedIn ? (
                                    <UserAvatar />
                                ) : (
                                    <>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href="/auth/login">Login</Link>
                                        </Button>
                                        <Button size="sm" asChild>
                                            <Link href="/auth/sign-up">Sign Up</Link>
                                        </Button>
                                    </>
                                )}
                            </>
                        )}
                        <ModeToggle />
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="flex md:hidden items-center space-x-4">
                        {!isLoading && isLoggedIn && <UserAvatar />}
                        <ModeToggle />
                        <Button variant="ghost" size="icon" onClick={toggleMenu} aria-label="Toggle menu">
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-border bg-background">
                    <div className="container mx-auto px-4 py-4 space-y-4 flex flex-col">
                        {!isLoading && !isLoggedIn && (
                            <div className="flex flex-col gap-2 mt-4">
                                <Button variant="ghost" size="sm" asChild className="w-full justify-start">
                                    <Link href="/auth/login">Login</Link>
                                </Button>
                                <Button size="sm" asChild className="w-full justify-start">
                                    <Link href="/auth/sign-up">Sign Up</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}

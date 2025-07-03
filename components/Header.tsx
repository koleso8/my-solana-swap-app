"use client";

import React, { useState } from "react";
import { ThemeToggleButton } from "./ThemeToggleButton";

export function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const openMenu = () => {
        setIsOpen(true);
        setIsClosing(false);
    };

    const closeMenu = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsOpen(false);
            setIsClosing(false);
        }, 250);
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            closeMenu();
        }
    };

    return (
        <nav className="bg-white dark:bg-gray-900 shadow-md border-b border-gray-200 dark:border-gray-800 py-2 fixed top-0 w-full z-[1999] flex">
            <div className="container mx-auto px-6 py-3 flex justify-between items-center">
                <a href="/" className="flex items-center space-x-2 select-none">
                    <img src="/logo.png" alt="logo" width={40} />
                    {/* <h1 className="text-2xl font-extrabold bg-gradient-to-bl from-[#00ffa3] to-[#dc1fff] bg-clip-text text-transparent"> */}
                    <h1 className="text-2xl font-extrabold text-black dark:text-white">
                        SOLDEV TOOLS
                    </h1>
                </a>
                <div className="flex items-center space-x-4">

                    <ThemeToggleButton />
                    <button

                        onClick={() => (isOpen ? closeMenu() : openMenu())}
                        className="md:hidden text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded transition-colors duration-200"
                        aria-label="Toggle menu"
                    >
                        <svg className="h-7 w-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            {isOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                    <div className="min-w-80 hidden md:flex items-center gap-4 px-4">

                        <NavLink href="/">Home</NavLink>
                        <NavLink href="/docs">API Docs</NavLink>
                        <NavLink href="/dashboard">Dashboard</NavLink>
                    </div>
                </div>
            </div>

            {(isOpen || isClosing) && (
                <div
                    className={`fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-[1998] md:hidden flex justify-end
                    ${isClosing ? "pointer-events-none" : "pointer-events-auto"}`}
                    onClick={handleBackdropClick}
                    style={{ transition: "background-color 250ms ease" }}
                >
                    <div
                        className={`w-56 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-l-2xl shadow-xl p-4 flex flex-col space-y-4 select-none
                            ${isClosing ? "animate-slideOut" : "animate-slideIn"}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={closeMenu}
                            aria-label="Close menu"
                            className="self-end text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <NavLink href="/" onClick={closeMenu}>Home</NavLink>
                        <NavLink href="/docs" onClick={closeMenu}>API Docs</NavLink>
                        <NavLink href="/dashboard" onClick={closeMenu}>Dashboard</NavLink>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideIn {
                  0% { transform: translateX(100%); opacity: 0; }
                  100% { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                  0% { transform: translateX(0); opacity: 1; }
                  100% { transform: translateX(100%); opacity: 0; }
                }
                .animate-slideIn { animation: slideIn 250ms ease forwards; }
                .animate-slideOut { animation: slideOut 250ms ease forwards; }
            `}</style>
        </nav>
    );
}

function NavLink({
    href,
    children,
    onClick,
}: {
    href: string;
    children: React.ReactNode;
    onClick?: () => void;
}) {
    return (
        <a
            href={href}
            onClick={onClick}
            className="block px-3 py-2 rounded-md transition-colors duration-200 hover:bg-blue-100 dark:hover:bg-gray-700 hover:text-blue-700 dark:hover:text-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
            {children}
        </a>
    );
}

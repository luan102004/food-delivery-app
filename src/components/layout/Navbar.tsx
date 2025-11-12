'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const { data: session } = useSession();
  const { t } = useLanguage();

  // 🔗 Danh sách link hiển thị dựa theo vai trò người dùng
  const getRoleBasedLinks = () => {
    if (!session) return [];

    const baseLinks = [
      { href: '/profile', label: t('navbar.profile') }, // 🔹 Thêm link Profile chung cho tất cả
    ];

    switch (session.user.role) {
      case 'customer':
        return [
          { href: '/customer', label: t('navbar.home') },
          { href: '/customer/order', label: t('navbar.orders') },
          ...baseLinks,
        ];
      case 'restaurant':
        return [
          { href: '/restaurant', label: t('navbar.home') },
          { href: '/restaurant/dashboard', label: t('navbar.dashboard') },
          ...baseLinks,
        ];
      case 'driver':
        return [
          { href: '/driver', label: t('navbar.home') },
          { href: '/driver/dashboard', label: t('navbar.dashboard') },
          ...baseLinks,
        ];
      case 'admin':
        return [
          { href: '/admin', label: t('navbar.dashboard') },
          { href: '/admin/users', label: 'Users' },
          ...baseLinks,
        ];
      default:
        return baseLinks;
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo + Navigation Links */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl">🍔</span>
              <span className="ml-2 text-xl font-bold text-gray-900">
                FoodDelivery
              </span>
            </Link>

            {/* Nav links */}
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {getRoleBasedLinks().map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Language + Auth Buttons */}
          <div className="flex items-center gap-4">
            <LanguageSwitcher />

            {session ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">
                  {session.user.name}
                </span>
                <button
                  onClick={() => signOut()}
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                >
                  {t('common.logout')}
                </button>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                {t('common.login')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

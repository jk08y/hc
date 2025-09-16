// src/components/layout/Layout.jsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import LeftSidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import Notifications from '../common/Notifications';
import AuthModal from '../auth/AuthModal';
import Lightbox from '../common/Lightbox';
import ConfirmationModal from '../common/ConfirmationModal';
import PostComposer from '../feed/PostComposer';
import Banner from '../common/Banner';
import { useUI } from '../../hooks/useUI';
import { useAuth } from '../../hooks/useAuth';
import { FaPenNib, FaExclamationTriangle } from 'react-icons/fa';

const SuspensionBanner = () => (
    <div className="bg-yellow-500 text-white text-center p-2 text-sm sticky top-0 z-50">
        <FaExclamationTriangle className="inline mr-2" />
        Your account is suspended. You have limited access and cannot post, like, or comment.
    </div>
);

const Layout = () => {
    const { isComposerOpen, openComposer, closeComposer } = useUI();
    const { user, userData, isSuspended } = useAuth();
    const location = useLocation();

    // Paths where the floating action button should be hidden.
    const hideFabOnPaths = ['/settings', '/premium', '/messages', '/admin'];
    const showFab = !hideFabOnPaths.some(path => location.pathname.startsWith(path));

    // **THE FIX**: This logic now intelligently determines when to show the premium banner.
    // It will only show if:
    // 1. A user is logged in.
    // 2. Their account is NOT verified.
    // 3. They are not currently on the premium page.
    const showPremiumBanner = user && !userData?.premium?.isVerified && location.pathname !== '/premium';

    return (
        <div className="min-h-screen bg-white dark:bg-dark">
            {isSuspended && <SuspensionBanner />}
            {showPremiumBanner && (
                <Banner
                    id="premium_promo_1"
                    text="Support this project and get verified."
                    linkText="Go Premium"
                    linkTo="/premium"
                />
            )}
            <div className="container mx-auto flex justify-center">

                <header className="hidden md:flex md:w-20 lg:w-64 xl:w-72 flex-shrink-0">
                    <LeftSidebar />
                </header>

                <LeftSidebar isMobile />

                <main className="w-full md:max-w-[600px] border-x border-gray-200 dark:border-dark-border min-h-screen">
                    <Header />
                    <Outlet />
                </main>

                <aside className="hidden lg:block lg:w-72 xl:w-80 flex-shrink-0">
                    <div className="sticky top-0 h-screen overflow-y-auto">
                        <RightSidebar />
                    </div>
                </aside>
            </div>

            {user && !isSuspended && showFab && (
                <div className="fixed right-5 bottom-20 md:bottom-5 z-30">
                    <button
                        onClick={() => openComposer()}
                        className="w-14 h-14 flex items-center justify-center bg-primary text-white rounded-full shadow-lg hover:bg-primary-dark transition-transform active:scale-90"
                        aria-label="Create post"
                    >
                        <FaPenNib size={22} />
                    </button>
                </div>
            )}

            <Notifications />
            <AuthModal />
            <Lightbox />
            <ConfirmationModal />
            {isComposerOpen && <PostComposer isModal={true} onSuccess={closeComposer} />}
        </div>
    );
};

export default Layout;

import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, Sun, Moon, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";

const Navbar = ({ navLinks, autoHide = false }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const { isLoggedIn, user } = useAuth();

  const [active, setActive] = useState("");
  const [openMobile, setOpenMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /* ── Auto-hide: navbar visible state ───────────────────── */
  const [navVisible, setNavVisible] = useState(!autoHide);
  const hideTimeout = useRef(null);

  /* Show navbar briefly on mount, then hide */
  useEffect(() => {
    if (!autoHide) {
      setNavVisible(true);
      return;
    }
    setNavVisible(true);
    hideTimeout.current = setTimeout(() => setNavVisible(false), 1500);
    return () => clearTimeout(hideTimeout.current);
  }, [autoHide]);

  /* ── Scroll-aware header background ─────────────────────── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Click handler — smooth scroll to section ───────────── */
  const handleNav = (item) => {
    setOpenMobile(false);
    const targetId = item.href.replace("#", "");
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
  };

  /* ── Direct page navigation items ──────────────────────── */
  const directNavItems = [
    { label: "Virtual Tours", path: "/virtual-tours" },
  ];

  /* ── Intersection observer for active highlight ─────────── */
  useEffect(() => {
    if (!navLinks || navLinks.length === 0) return;
    const ids = navLinks.map((n) => n.href.replace("#", ""));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [navLinks]);

  const links = navLinks || [];

  return (
    <>
      {/* Invisible hover trigger zone at top of viewport (only when autoHide is on) */}
      {autoHide && !navVisible && (
        <div
          onMouseEnter={() => {
            clearTimeout(hideTimeout.current);
            setNavVisible(true);
          }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "60px",
            zIndex: 49,
            background: "transparent",
          }}
        />
      )}

      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={autoHide
          ? { y: navVisible ? 0 : "-100%", opacity: 1 }
          : { y: 0, opacity: 1 }
        }
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        onMouseEnter={() => {
          if (autoHide) {
            clearTimeout(hideTimeout.current);
            setNavVisible(true);
          }
        }}
        onMouseLeave={() => {
          if (autoHide) {
            hideTimeout.current = setTimeout(() => setNavVisible(false), 400);
          }
        }}
        className={`
          fixed top-0 left-0 w-full z-50
          ${scrolled
            ? "bg-black/90 backdrop-blur-2xl shadow-2xl py-4"
            : "bg-gradient-to-b from-black/70 to-transparent py-6"
          }
        `}
      >
      {/* subtle bottom line */}
      <div
        className={`absolute inset-x-0 bottom-0 h-px transition-opacity duration-500 ${scrolled ? "opacity-100" : "opacity-0"
          } bg-gradient-to-r from-transparent via-amber-400/40 to-transparent`}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between">
        {/* ── LOGO ─────────────────────────────────────────── */}
        <div
          onClick={() => navigate("/home")}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <span className="text-xl md:text-2xl font-extrabold tracking-[0.25em] text-white group-hover:text-amber-300 transition-colors duration-300">
            BRAJYATRA
          </span>
          <span className="text-amber-400 text-xl md:text-2xl font-light tracking-wider">.AI</span>
        </div>

        {/* ── DESKTOP NAV ──────────────────────────────────── */}
        <div className="hidden md:flex items-center justify-center gap-6">
          {links.map((item) => {
            const targetId = item.href.replace("#", "");
            const isActive = active === targetId;

            return (
              <button
                key={item.label}
                onClick={() => handleNav(item)}
                className="relative group py-2"
              >
                <span
                  className={`text-[15px] font-medium tracking-wide transition-all duration-300 ${isActive
                    ? "text-white"
                    : "text-white/60 group-hover:text-white/90"
                    }`}
                >
                  {item.label}
                </span>

                {/* active indicator */}
                <span
                  className={`absolute -bottom-1 left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-amber-400 transition-all duration-300 ${isActive ? "w-6 opacity-100" : "w-0 opacity-0 group-hover:w-4 group-hover:opacity-50"
                    }`}
                />
              </button>
            );
          })}

          {/* Direct page links */}
          {directNavItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="relative group py-2"
            >
              <span className="text-[15px] font-medium tracking-wide text-amber-400/80 group-hover:text-amber-300 transition-all duration-300">
                {item.label}
              </span>
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-amber-400 w-0 opacity-0 group-hover:w-4 group-hover:opacity-50 transition-all duration-300" />
            </button>
          ))}
        </div>

        {/* ── CTA + TOGGLES + MOBILE TOGGLE ────────────────── */}
        <div className="flex items-center gap-3">
          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            aria-pressed={theme === 'dark'}
            className="p-2 rounded-full text-white/60 hover:text-amber-300 hover:bg-white/10 transition-all duration-300"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Language toggle */}
          <button
            onClick={toggleLanguage}
            aria-label={language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
            className="px-3 py-1.5 rounded-full text-xs font-bold tracking-wider
                       border border-white/20 text-white/70
                       hover:text-amber-300 hover:border-amber-300/40
                       transition-all duration-300"
          >
            {language === 'en' ? 'हिन्दी' : 'EN'}
          </button>

          {/* Profile icon */}
          <button
            onClick={() => navigate(isLoggedIn ? "/account" : "/login")}
            aria-label={isLoggedIn ? "Account" : "Login"}
            className="p-2 rounded-full text-white/60 hover:text-amber-300 hover:bg-white/10 transition-all duration-300"
          >
            {isLoggedIn && user?.name ? (
              <span className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-xs font-bold">
                {user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
              </span>
            ) : (
              <User size={20} />
            )}
          </button>

          {/* Plan Trip CTA */}
          <button
            onClick={() => navigate("/create-trip")}
            className="hidden md:block px-5 py-2 text-sm font-semibold tracking-widest uppercase
                       bg-gradient-to-r from-amber-500 to-orange-500
                       text-white rounded-full
                       shadow-lg shadow-amber-500/20
                       hover:shadow-amber-500/40 hover:scale-[1.03]
                       transition-all duration-300"
          >
            {t('btn_plan_trip')}
          </button>

          <button
            onClick={() => setOpenMobile(true)}
            className="md:hidden text-white hover:text-amber-300 transition-colors"
          >
            <Menu size={26} />
          </button>
        </div>
      </div>

      {/* ── MOBILE FULL-SCREEN MENU ────────────────────────── */}
      <AnimatePresence>
        {openMobile && (
          <>
            {/* backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpenMobile(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* slide-in panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
              className="fixed inset-y-0 right-0 w-80 bg-gray-950/95 backdrop-blur-xl z-50 flex flex-col"
            >
              {/* close */}
              <div className="flex justify-between items-center px-8 py-6">
                <span className="text-amber-400 text-lg font-bold tracking-widest">MENU</span>
                <button
                  onClick={() => setOpenMobile(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* divider */}
              <div className="mx-8 h-px bg-white/10" />

              {/* nav links */}
              <div className="flex flex-col gap-1 px-8 py-8">
                {links.map((item, i) => {
                  const targetId = item.href.replace("#", "");
                  const isActive = active === targetId;

                  return (
                    <motion.button
                      key={item.label}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.06 }}
                      onClick={() => handleNav(item)}
                      className={`text-left py-3 px-4 rounded-xl text-lg font-medium tracking-wide transition-all duration-200 ${isActive
                        ? "text-amber-400 bg-amber-400/10"
                        : "text-white/70 hover:text-white hover:bg-white/5"
                        }`}
                    >
                      {item.label}
                    </motion.button>
                  );
                })}
              </div>

              {/* Direct nav links (mobile) */}
              <div className="px-8 mb-2">
                {directNavItems.map((item, i) => (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.06 }}
                    onClick={() => { setOpenMobile(false); navigate(item.path); }}
                    className="w-full text-left py-3 px-4 rounded-xl text-lg font-medium tracking-wide text-amber-400/80 hover:text-amber-300 hover:bg-amber-400/10 transition-all duration-200"
                  >
                    {item.label}
                  </motion.button>
                ))}
              </div>

              {/* Mobile toggles */}
              <div className="px-8 flex items-center gap-4 mb-6">
                <button
                  onClick={toggleTheme}
                  aria-label="Toggle dark mode"
                  className="p-2 rounded-full text-white/60 hover:text-amber-300 hover:bg-white/10 transition-all"
                >
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button
                  onClick={toggleLanguage}
                  aria-label={language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
                  className="px-3 py-1.5 rounded-full text-xs font-bold border border-white/20 text-white/70 hover:text-amber-300 hover:border-amber-300/40 transition-all"
                >
                  {language === 'en' ? 'हिन्दी' : 'EN'}
                </button>
              </div>

              {/* Mobile profile link */}
              <div className="px-8 mb-4">
                <button
                  onClick={() => { setOpenMobile(false); navigate(isLoggedIn ? "/account" : "/login"); }}
                  className="w-full py-3 px-4 rounded-xl text-left text-lg font-medium tracking-wide text-white/70 hover:text-amber-400 hover:bg-amber-400/10 transition-all flex items-center gap-3"
                >
                  <User size={20} />
                  {isLoggedIn ? "My Account" : "Login"}
                </button>
              </div>

              {/* CTA */}
              <div className="mt-auto px-8 pb-10">
                <button
                  onClick={() => {
                    setOpenMobile(false);
                    navigate("/create-trip");
                  }}
                  className="w-full py-3 text-sm font-bold tracking-widest uppercase
                             bg-gradient-to-r from-amber-500 to-orange-500
                             text-white rounded-full
                             shadow-lg shadow-amber-500/20
                             hover:shadow-amber-500/40
                             transition-all duration-300"
                >
                  {t('btn_plan_trip')}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      </motion.nav>
    </>
  );
};

export default Navbar;

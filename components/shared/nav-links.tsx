'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { navLinks } from '@/constants';
import Logo from './logo';
import ThemeToggle from './theme-toggle';

const NavLinks = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);

  const menuVars = {
    initial: {
      opacity: 0,
      clipPath: 'inset(0 0 100% 0)',
    },
    animate: {
      opacity: 1,
      clipPath: 'inset(0 0 0% 0)',
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
    exit: {
      opacity: 0,
      clipPath: 'inset(0 0 100% 0)',
      transition: {
        delay: 0.15,
        duration: 0.4,
        ease: [0.65, 0, 0.35, 1],
      },
    },
  };

  const containerVars = {
    initial: {
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
    animate: {
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.07,
        staggerDirection: 1,
      },
    },
  };

  const navItemVars = {
    initial: {
      y: '110%',
      transition: {
        duration: 0.3,
        ease: [0.37, 0, 0.63, 1],
      },
    },
    animate: {
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <div className='flex shrink-0 items-center gap-2 md:gap-10'>
      <button
        type='button'
        aria-label={isNavOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isNavOpen}
        className='icon-button relative z-50 -ml-2 lg:hidden'
        onClick={() => setIsNavOpen(!isNavOpen)}>
        <AnimatePresence
          initial={false}
          mode='wait'>
          {isNavOpen ? (
            <motion.span
              key='close'
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}>
              <X className='size-5' />
            </motion.span>
          ) : (
            <motion.span
              key='menu'
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}>
              <Menu className='size-5' />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <Logo className='relative z-50' />

      {/* Desktop Navigation */}
      <ul className='hidden items-center gap-1 lg:flex'>
        {navLinks.map(link => (
          <li key={link.link}>
            <Link
              href={link.link}
              className='rounded-full px-3.5 py-2 text-[0.9375rem] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring'>
              {link.name}
            </Link>
          </li>
        ))}
      </ul>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isNavOpen && (
          <motion.div
            variants={menuVars}
            initial='initial'
            animate='animate'
            exit='exit'
            className='fixed inset-0 z-40 flex h-dvh flex-col bg-background px-6 pb-10 pt-24 lg:hidden'>
            <motion.ul
              variants={containerVars}
              initial='initial'
              animate='animate'
              exit='initial'
              className='flex flex-col'>
              {navLinks.map(link => (
                <li
                  key={link.link}
                  className='overflow-hidden border-b border-border'>
                  <motion.div variants={navItemVars}>
                    <Link
                      href={link.link}
                      onClick={() => setIsNavOpen(false)}
                      className='block py-5 font-display text-[2.5rem] leading-none tracking-tight text-foreground transition-colors hover:text-brand-ink'>
                      {link.name}
                    </Link>
                  </motion.div>
                </li>
              ))}
            </motion.ul>

            <div className='mt-auto flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>Appearance</span>
              <ThemeToggle className='border border-border' />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NavLinks;

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { navLinks } from '@/constants';
import Logo from './logo';
import { Input } from '../ui/input';
import SearchBar from './search-bar';

const NavLinks = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);

  const menuVars = {
    initial: {
      scaleY: 0,
    },
    animate: {
      scaleY: 1,
      transition: {
        duration: 0.5,
        ease: [0.12, 0, 0.39, 0],
      },
    },
    exit: {
      scaleY: 0,
      transition: {
        delay: 0.5,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const containerVars = {
    initial: {
      transition: {
        staggerChildren: 0.09,
        staggerDirection: -1,
      },
    },
    animate: {
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.09,
        staggerDirection: 1,
      },
    },
  };

  const navItemVars = {
    initial: {
      y: '30vh',
      transition: {
        duration: 0.5,
        ease: [0.37, 0, 0.63, 1],
      },
    },
    animate: {
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0, 0.55, 0.45, 1],
      },
    },
  };

  return (
    <div className='flex items-center justify-between gap-8'>
      <button
        className='flex lg:hidden items-center justify-center relative z-50'
        onClick={() => setIsNavOpen(!isNavOpen)}>
        <AnimatePresence
          initial={false}
          mode='wait'>
          {isNavOpen ? (
            <motion.div
              key='close'
              initial={{ rotate: 0 }}
              animate={{ rotate: 180 }}
              exit={{ rotate: 0 }}
              transition={{ duration: 0.4 }}>
              <X size={28} />
            </motion.div>
          ) : (
            <motion.div
              key='menu'
              initial={{ rotate: 180 }}
              animate={{ rotate: 0 }}
              exit={{ rotate: 180 }}
              transition={{ duration: 0.4 }}>
              <Menu size={28} />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Desktop Navigation */}
      <div className='hidden md:block'>
        <Logo />
      </div>

      <ul className='hidden lg:flex items-center gap-4 ml-4'>
        {navLinks.map(link => (
          <li key={link.link}>
            <Link
              href={link.link}
              className='text-gray-700 hover:text-gray-900 transition-colors duration-300 dark:text-white'>
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
            className='fixed left-0 top-0 w-full h-screen origin-top z-40
                 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl
                 border-r border-zinc-100 dark:border-zinc-800/60'>
            {/* Subtle background texture */}
            <div
              className='absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))]
                      from-indigo-50/60 via-transparent to-transparent
                      dark:from-indigo-950/30 dark:via-transparent dark:to-transparent pointer-events-none'
            />

            {/* Accent glow blob */}
            <div
              className='absolute top-1/3 -right-20 w-64 h-64 rounded-full
                      bg-indigo-400/10 dark:bg-indigo-500/10 blur-3xl pointer-events-none'
            />

            <motion.div
              variants={containerVars}
              initial='initial'
              animate='animate'
              exit='initial'
              className='relative flex flex-col h-full justify-center items-start gap-2 px-10'>
              {navLinks.map((link, index) => (
                <div
                  key={index}
                  className='overflow-hidden w-full'>
                  <motion.div variants={navItemVars}>
                    <Link
                      href={link.link}
                      onClick={() => setIsNavOpen(false)}
                      className='group flex items-center gap-4 py-3 w-full'>
                      {/* Animated accent line */}
                      <span
                        className='h-px w-0 group-hover:w-8 transition-all duration-300 ease-out
                                 bg-indigo-500 dark:bg-indigo-400'
                      />

                      <span
                        className='text-[2.5rem] font-semibold tracking-tight leading-none
                                 text-zinc-300 dark:text-zinc-600
                                 group-hover:text-zinc-900 dark:group-hover:text-zinc-50
                                 transition-colors duration-300'>
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <span
                        className='text-2xl font-semibold tracking-tight
                                 text-zinc-800 dark:text-zinc-100
                                 group-hover:text-indigo-600 dark:group-hover:text-indigo-400
                                 transition-colors duration-300'>
                        {link.name}
                      </span>
                    </Link>

                    {/* Divider */}
                    {index < navLinks.length - 1 && <div className='h-px w-full bg-zinc-100 dark:bg-zinc-800/80 ml-0' />}
                  </motion.div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NavLinks;

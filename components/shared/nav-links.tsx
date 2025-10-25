'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { navLinks } from '@/constants';
import Logo from './logo';

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
      <div className='block lg:hidden mt-4 self-center -translate-y-2.5'>
        <Logo />
      </div>

      {/* Desktop Navigation */}
      <div className='hidden lg:block'>
        <Logo />
      </div>

      <ul className='hidden lg:flex items-center gap-4 ml-4'>
        {navLinks.map(link => (
          <li key={link.link}>
            <Link
              href={link.link}
              className='text-gray-700 hover:text-gray-900 transition-colors duration-300'>
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
            className='fixed left-0 top-0 w-full h-screen bg-white origin-top p-10 z-40  bg-gradient-to-b from-white via-gray-200 to-red-300
                      dark:from-gray-900 dark:via-gray-800 dark:to-gray-950'>
            <motion.div
              variants={containerVars}
              initial='initial'
              animate='animate'
              exit='initial'
              className='flex flex-col h-full justify-center items-center gap-8'>
              {navLinks.map((link, index) => (
                <div
                  key={index}
                  className='overflow-hidden'>
                  <motion.div variants={navItemVars}>
                    <Link
                      href={link.link}
                      className='text-3xl font-medium text-gray-800 hover:text-gray-950'
                      onClick={() => setIsNavOpen(false)}>
                      {link.name}
                    </Link>
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

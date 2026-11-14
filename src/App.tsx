/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  Language,
  ThemeMode,
  NavTabId,
  MarketSymbol,
} from './theme/tokens';
import { useHyperliquidData } from './theme/hyperliquid';
import { NavigationShell } from './components/NavigationShell';
import { DesignNoteModal } from './components/DesignNoteModal';
import { CommandPalette } from './components/CommandPalette';
import { StartView } from './views/StartView';
import { PreSessionView } from './views/PreSessionView';
import { InSessionView } from './views/InSessionView';
import { PostSessionView } from './views/PostSessionView';
import { MarketsView } from './views/MarketsView';
import { KnowledgeAndMcpView } from './views/KnowledgeAndMcpView';
import { EASE_OUT_EXPO } from './components/MotionPrimitives';
import { DeskBootLoader } from './components/DeskBootLoader';

export default function App() {
  const [lang, setLang] = useState<Language>('pl');
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [activeTab, setActiveTab] = useState<NavTabId>('start');
  const [selectedMarket, setSelectedMarket] = useState<MarketSymbol>('BTC');
  const [isDesignNoteOpen, setIsDesignNoteOpen] = useState<boolean>(false);
  const [isCmdOpen, setIsCmdOpen] = useState<boolean>(false);
  const prefersReduced = useReducedMotion();

  const hlState = useHyperliquidData();

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const isDark =
        themeMode === 'dark' ||
        (themeMode === 'system' && mediaQuery.matches);
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();
    mediaQuery.addEventListener('change', applyTheme);
    return () => mediaQuery.removeEventListener('change', applyTheme);
  }, [themeMode]);

  // Global Cmd+K / Ctrl+K shortcut for Command Palette
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCmdOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  return (
    <>
      <DeskBootLoader lang={lang} />
      <NavigationShell
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        selectedMarket={selectedMarket}
        onSelectMarket={setSelectedMarket}
        lang={lang}
        onChangeLang={setLang}
        themeMode={themeMode}
        onChangeTheme={setThemeMode}
        hlState={hlState}
        onOpenDesignNote={() => setIsDesignNoteOpen(true)}
        onOpenCommandPalette={() => setIsCmdOpen(true)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeTab}-${selectedMarket}`}
            initial={
              prefersReduced
                ? false
                : { opacity: 0, y: 12, scale: 0.992 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              prefersReduced
                ? { opacity: 0 }
                : { opacity: 0, y: -10, scale: 0.994 }
            }
            transition={{ duration: 0.24, ease: EASE_OUT_EXPO }}
          >
            {activeTab === 'start' && (
              <StartView
                lang={lang}
                selectedMarket={selectedMarket}
                hlState={hlState}
                onNavigate={setActiveTab}
                onSelectMarket={setSelectedMarket}
                onOpenDesignNote={() => setIsDesignNoteOpen(true)}
              />
            )}

            {activeTab === 'pre-session' && (
              <PreSessionView
                lang={lang}
                selectedMarket={selectedMarket}
                hlState={hlState}
                onNavigate={setActiveTab}
              />
            )}

            {activeTab === 'in-session' && (
              <InSessionView
                lang={lang}
                selectedMarket={selectedMarket}
                hlState={hlState}
              />
            )}

            {activeTab === 'post-session' && (
              <PostSessionView
                lang={lang}
                selectedMarket={selectedMarket}
                hlState={hlState}
              />
            )}

            {activeTab === 'markets' && (
              <MarketsView
                lang={lang}
                selectedMarket={selectedMarket}
                onSelectMarket={setSelectedMarket}
                hlState={hlState}
              />
            )}

            {(activeTab === 'lessons' ||
              activeTab === 'research' ||
              activeTab === 'sources' ||
              activeTab === 'mcp') && (
              <KnowledgeAndMcpView
                activeSection={activeTab}
                lang={lang}
                hlState={hlState}
                onNavigate={setActiveTab}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </NavigationShell>

      <CommandPalette
        isOpen={isCmdOpen}
        onClose={() => setIsCmdOpen(false)}
        lang={lang}
        onSelectTab={setActiveTab}
        onSelectMarket={setSelectedMarket}
        onChangeLang={setLang}
        onChangeTheme={setThemeMode}
      />

      <DesignNoteModal
        isOpen={isDesignNoteOpen}
        onClose={() => setIsDesignNoteOpen(false)}
        lang={lang}
      />
    </>
  );
}

"use client";
import { createContext, useContext } from 'react';

export const DocsContext = createContext({
    darkMode: false,
    setDarkMode: () => { },
    collapsed: false,
    setCollapsed: () => { },
});

export const useDocsTheme = () => useContext(DocsContext);

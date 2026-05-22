/**
 * Polyfill for import.meta to fix Supabase compatibility with Metro bundler on web
 * This file should be imported before any Supabase imports
 * 
 * Note: import.meta is a compile-time feature, so this polyfill may not work
 * if the code is already compiled. The real fix is in Metro/Babel configuration.
 */

// This is a placeholder - the real fix is in metro.config.js and babel.config.js
// Metro should transform import.meta during bundling


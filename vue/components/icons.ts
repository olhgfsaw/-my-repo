/** Stroke icons of the Aurelia screens (24-grid, 1.5px stroke, currentColor). */
export const ICONS = {
  Home: 'M4 10.5 12 4l8 6.5V20h-5v-6H9v6H4z',
  Pipeline: 'M5 4h2a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-14a1 1 0 0 1 1 -1zM11 4h2a1 1 0 0 1 1 1v9a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-9a1 1 0 0 1 1 -1zM17 4h2a1 1 0 0 1 1 1v5a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-5a1 1 0 0 1 1 -1z',
  Deals: 'M9 7h11M9 12h11M9 17h11M4 7h1M4 12h1M4 17h1',
  Approvals: 'M3.5 12a8.5 8.5 0 1 0 17 0a8.5 8.5 0 1 0 -17 0M8.5 12l2.5 2.5 4.5-5',
  Contacts: 'M5.5 9a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0 -7 0M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5M16 5.5a3.5 3.5 0 0 1 0 7M18 14.5c2 .6 3 2.6 3 5.5',
  Companies: 'M4 20V5h10v15M14 9h6v11M3 20h18M8 9h2M8 13h2M8 17h2',
  Tasks: 'M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2zM4 10h16M9 3v4M15 3v4',
  Forecast: 'M4 20V4M4 20h16M8 16l4-5 3 3 5-6',
  Agents: 'M9 7h6a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-6a2 2 0 0 1 -2 -2v-6a2 2 0 0 1 2 -2zM10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4',
  Search: 'M18 11a7 7 0 1 1-14 0 7 7 0 0 1 14 0M20 20l-3.5-3.5',
  Plus: 'M12 5v14M5 12h14',
  Check: 'M5 12l5 5 9-10',
  X: 'M6 6l12 12M18 6 6 18',
  ChevronDown: 'M6 9l6 6 6-6',
  ChevronRight: 'M9 6l6 6-6 6',
  ArrowLeft: 'M19 12H5M11 6l-6 6 6 6',
  ArrowRight: 'M5 12h14M13 6l6 6-6 6',
  More: 'M5 12h.01M12 12h.01M19 12h.01',
} as const;

export type IconName = keyof typeof ICONS;
export const ICON_NAMES = Object.keys(ICONS) as IconName[];

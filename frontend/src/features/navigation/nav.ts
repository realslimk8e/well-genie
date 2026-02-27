export type NavKey =
  | 'overview'
  | 'sleep'
  | 'diet'
  | 'exercise'
  | 'chatbot'
  | 'settings'
  | 'import';

export const allowedTabs: NavKey[] = [
  'overview',
  'sleep',
  'diet',
  'exercise',
  'chatbot',
  'settings',
  'import',
];

export const mobileTabs: NavKey[] = [
  'overview',
  'sleep',
  'diet',
  'exercise',
  'chatbot',
];

export const isNavKey = (value: string): value is NavKey =>
  allowedTabs.includes(value as NavKey);

export const tabFromHash = (hash: string): NavKey => {
  const raw = (hash || '').replace(/^#\/?/, '');
  return isNavKey(raw) ? raw : 'overview';
};

import type { Prisma } from '@prisma/client';
import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  BoxIcon,
  FolderTreeIcon,
  GalleryHorizontalIcon,
  PackageIcon,
  PencilIcon,
  PlusIcon,
  ReceiptTextIcon,
  ScrollTextIcon,
  Trash2Icon,
  UserRoundIcon,
  type LucideIcon,
} from 'lucide-react';

import type { ActivityAction, ActivityLogEntry } from '@/actions/activity.action';

// ---------------------------------------------------------------------------
// Actions & entities
// ---------------------------------------------------------------------------

export interface ActionMeta {
  label: string;
  /** Past-tense verb used in the feed sentence ("Jane updated product …"). */
  verb: string;
  icon: LucideIcon;
  /** Badge colours (background, text, border) for light and dark mode. */
  badgeClass: string;
  /** Solid marker colour shown on the actor's avatar. */
  markerClass: string;
}

export const ACTION_META: Record<ActivityAction, ActionMeta> = {
  CREATE: {
    label: 'Created',
    verb: 'created',
    icon: PlusIcon,
    badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/70 dark:bg-emerald-900/30 dark:text-emerald-300',
    markerClass: 'bg-emerald-500 text-white',
  },
  UPDATE: {
    label: 'Updated',
    verb: 'updated',
    icon: PencilIcon,
    badgeClass: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800/70 dark:bg-sky-900/30 dark:text-sky-300',
    markerClass: 'bg-sky-500 text-white',
  },
  DELETE: {
    label: 'Deleted',
    verb: 'deleted',
    icon: Trash2Icon,
    badgeClass: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800/70 dark:bg-rose-900/30 dark:text-rose-300',
    markerClass: 'bg-rose-500 text-white',
  },
  ARCHIVE: {
    label: 'Archived',
    verb: 'archived',
    icon: ArchiveIcon,
    badgeClass: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/70 dark:bg-amber-900/30 dark:text-amber-300',
    markerClass: 'bg-amber-500 text-white',
  },
  RESTORE: {
    label: 'Restored',
    verb: 'restored',
    icon: ArchiveRestoreIcon,
    badgeClass: 'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800/70 dark:bg-teal-900/30 dark:text-teal-300',
    markerClass: 'bg-teal-500 text-white',
  },
};

export const ACTION_OPTIONS = (Object.keys(ACTION_META) as ActivityAction[]).map(value => ({ value, label: ACTION_META[value].label }));

const isKnownAction = (action: string): action is ActivityAction => Object.prototype.hasOwnProperty.call(ACTION_META, action);

export const getActionMeta = (action: string): ActionMeta =>
  isKnownAction(action)
    ? ACTION_META[action]
    : {
        label: humanize(action),
        verb: action.toLowerCase(),
        icon: BoxIcon,
        badgeClass: 'border-gray-200 bg-gray-50 text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-300',
        markerClass: 'bg-gray-500 text-white',
      };

export interface EntityMeta {
  /** Singular, lower-case noun used mid-sentence. */
  noun: string;
  /** Plural label used in the filter. */
  plural: string;
  icon: LucideIcon;
}

const ENTITY_META: Record<string, EntityMeta> = {
  PRODUCT: { noun: 'product', plural: 'Products', icon: PackageIcon },
  CATEGORY: { noun: 'category', plural: 'Categories', icon: FolderTreeIcon },
  BANNER: { noun: 'banner', plural: 'Banners', icon: GalleryHorizontalIcon },
  ORDER: { noun: 'order', plural: 'Orders', icon: ReceiptTextIcon },
  USER: { noun: 'user', plural: 'Users', icon: UserRoundIcon },
  ACTIVITY_LOG: { noun: 'activity log', plural: 'Activity log', icon: ScrollTextIcon },
};

/** Entities shown in the filter even before anything has been logged for them. */
const CORE_ENTITIES = ['PRODUCT', 'CATEGORY', 'BANNER', 'USER'];

export const getEntityMeta = (entity: string): EntityMeta => {
  const known = ENTITY_META[entity.toUpperCase()];
  if (known) return known;
  const noun = humanize(entity).toLowerCase();
  return { noun, plural: humanize(entity), icon: BoxIcon };
};

export const getEntityOptions = (logged: string[]) =>
  Array.from(new Set([...CORE_ENTITIES, ...logged.map(e => e.toUpperCase())]))
    .map(value => ({ value, label: getEntityMeta(value).plural }))
    .sort((a, b) => a.label.localeCompare(b.label));

// ---------------------------------------------------------------------------
// Actors
// ---------------------------------------------------------------------------

export const getActorName = (user: ActivityLogEntry['user']) => {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
  return user.name?.trim() || fullName || user.email;
};

export const getInitials = (name: string) => {
  const words = name.replace(/@.*/, '').split(/[\s._-]+/).filter(Boolean);
  const initials = words.length > 1 ? words[0][0] + words[words.length - 1][0] : (words[0] ?? '?').slice(0, 2);
  return initials.toUpperCase();
};

// ---------------------------------------------------------------------------
// Field labels & values
// ---------------------------------------------------------------------------

const FIELD_LABELS: Record<string, string> = {
  adminNotes: 'Admin notes',
  coverImage: 'Cover image',
  ctaLabel: 'Button label',
  deletedEntries: 'Entries removed',
  discountPercent: 'Discount (%)',
  endsAt: 'Ends',
  hasVariants: 'Has variants',
  href: 'Link',
  imageUrl: 'Image',
  isActive: 'Active',
  isEmailVerified: 'Email verified',
  sortOrder: 'Sort order',
  startsAt: 'Starts',
  userStatus: 'Status',
};

const REDACTED_FIELD = /pass(word)?|secret|token|hash/i;
const MAX_TEXT = 160;
const MAX_TITLE = 1000;
const MAX_LIST_ITEMS = 5;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?$/;
const URL_LIKE = /^(https?:)?\/\/\S+$/i;

/** "discountPercent" / "discount_percent" / "DISCOUNT_PERCENT" → "Discount percent". */
export function humanize(key: string) {
  const words = key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
    .toLowerCase();
  return words ? words[0].toUpperCase() + words.slice(1) : key;
}

export const fieldLabel = (field: string) => FIELD_LABELS[field] ?? humanize(field.replace(/^is(?=[A-Z])/, ''));

export interface FormattedValue {
  text: string;
  /** Full value when `text` was shortened. */
  title?: string;
  /** Empty / hidden values are rendered muted rather than as content. */
  muted?: boolean;
  mono?: boolean;
}

const truncate = (text: string, max = MAX_TEXT) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text);

const truncateMiddle = (text: string, max = 60) => {
  if (text.length <= max) return text;
  const keep = Math.floor((max - 1) / 2);
  return `${text.slice(0, keep)}…${text.slice(-keep)}`;
};

const formatDate = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' })} UTC`;
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isEmpty = (value: unknown) =>
  value === null || value === undefined || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0);

/** One-line plain-text summary of any JSON value, for use inside lists and nested objects. */
function summarize(value: unknown, depth = 0): string {
  if (isEmpty(value)) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
  if (typeof value === 'string') {
    if (ISO_DATE.test(value)) return formatDate(value);
    return URL_LIKE.test(value) ? truncateMiddle(value) : value;
  }
  if (depth > 2) return '…';
  if (Array.isArray(value)) {
    const shown = value.slice(0, MAX_LIST_ITEMS).map(item => summarize(item, depth + 1));
    const rest = value.length - shown.length;
    return rest > 0 ? `${shown.join(', ')} +${rest} more` : shown.join(', ');
  }
  if (isPlainObject(value)) {
    for (const key of ['name', 'title', 'label', 'email', 'color']) {
      if (typeof value[key] === 'string' && value[key]) return value[key];
    }
    return Object.entries(value)
      .filter(([key]) => !REDACTED_FIELD.test(key))
      .map(([key, v]) => `${fieldLabel(key)}: ${summarize(v, depth + 1)}`)
      .join(', ');
  }
  return String(value);
}

export function formatValue(value: unknown, field = ''): FormattedValue {
  if (field && REDACTED_FIELD.test(field)) return { text: 'Hidden', muted: true };
  if (isEmpty(value)) return { text: 'Empty', muted: true };
  if (typeof value === 'boolean') return { text: value ? 'Yes' : 'No' };
  if (typeof value === 'number') return { text: summarize(value) };

  if (typeof value === 'string' && ISO_DATE.test(value)) return { text: formatDate(value) };
  if (typeof value === 'string' && URL_LIKE.test(value)) {
    return { text: truncateMiddle(value), title: value.length > 60 ? value.slice(0, MAX_TITLE) : undefined, mono: true };
  }

  const full = summarize(value);
  return full.length > MAX_TEXT ? { text: truncate(full), title: truncate(full, MAX_TITLE) } : { text: full };
}

// ---------------------------------------------------------------------------
// Details
// ---------------------------------------------------------------------------

export type FieldChange =
  | { field: string; label: string; kind: 'value'; from: FormattedValue; to: FormattedValue }
  | { field: string; label: string; kind: 'list'; added: string[]; removed: string[] };

export type ParsedDetails =
  | { kind: 'none' }
  | { kind: 'changes'; changes: FieldChange[] }
  | { kind: 'snapshot'; entries: { field: string; label: string; value: FormattedValue }[] }
  | { kind: 'text'; value: FormattedValue };

/** compareData() writes `{ old, new }` per field; JSON drops `undefined`, so either key may be missing. */
const isChangeRecord = (value: unknown): value is { old?: unknown; new?: unknown } =>
  isPlainObject(value) && Object.keys(value).length > 0 && Object.keys(value).every(key => key === 'old' || key === 'new');

const isPrimitiveList = (value: unknown): value is (string | number | boolean)[] =>
  Array.isArray(value) && value.every(item => ['string', 'number', 'boolean'].includes(typeof item));

function toChange(field: string, record: { old?: unknown; new?: unknown }): FieldChange {
  const label = fieldLabel(field);
  const before = record.old ?? null;
  const after = record.new ?? null;

  // Lists of plain values read best as "added / removed" rather than two long strings.
  const beforeList = before === null ? [] : before;
  const afterList = after === null ? [] : after;
  if (!REDACTED_FIELD.test(field) && isPrimitiveList(beforeList) && isPrimitiveList(afterList) && (Array.isArray(before) || Array.isArray(after))) {
    const oldItems = beforeList.map(item => summarize(item));
    const newItems = afterList.map(item => summarize(item));
    const added = newItems.filter(item => !oldItems.includes(item));
    const removed = oldItems.filter(item => !newItems.includes(item));
    if (added.length || removed.length) return { field, label, kind: 'list', added, removed };
  }

  return { field, label, kind: 'value', from: formatValue(before, field), to: formatValue(after, field) };
}

/** Normalises whatever was stored in `details` (null, JSON string, change map, snapshot) for display. */
export function parseDetails(details: Prisma.JsonValue | null): ParsedDetails {
  let value: unknown = details;

  // Some call sites store JSON.stringify(...) output, i.e. a JSON string inside the JSON column.
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        value = JSON.parse(trimmed);
      } catch {
        /* not JSON: show it as text */
      }
    }
  }

  if (isEmpty(value) || (isPlainObject(value) && Object.keys(value).length === 0)) return { kind: 'none' };

  if (isPlainObject(value)) {
    const entries = Object.entries(value);
    if (entries.every(([, v]) => isChangeRecord(v))) {
      return {
        kind: 'changes',
        changes: entries.map(([field, record]) => toChange(field, isChangeRecord(record) ? record : {})),
      };
    }
    return {
      kind: 'snapshot',
      entries: entries.map(([field, v]) => ({ field, label: fieldLabel(field), value: formatValue(v, field) })),
    };
  }

  return { kind: 'text', value: formatValue(value) };
}

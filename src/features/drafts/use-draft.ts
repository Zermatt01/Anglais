/**
 * Draft of a text field (UI-03, NO-06): the text is saved on the device at each
 * typing pause, and also when the page is hidden or closed, when the field
 * disappears, and before an update reloads the application. A saved draft is
 * restored the next time the field appears.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppServices } from '../app-services.ts';
import { registerDraftFlush } from './draft-registry.ts';

/** Typing pause after which the draft is saved. */
export const DRAFT_SAVE_DELAY_MS = 600;

export type DraftSaveState = 'idle' | 'pending' | 'saved' | 'error';

export interface Draft {
  readonly text: string;
  /** False until the stored draft has been read: the field must stay disabled. */
  readonly ready: boolean;
  /** True when the text comes from a draft left unsaved last time. */
  readonly restored: boolean;
  /**
   * True when a previous draft could not be read: it is set aside (and kept in
   * the export) before anything replaces it. The field must say so.
   */
  readonly unreadable: boolean;
  readonly saveState: DraftSaveState;
  setText(text: string): void;
  /** Saves the pending text now. */
  flush(): Promise<void>;
  /** Forgets the draft (after a successful submission) and shows `text`. */
  discard(text: string): Promise<void>;
}

/**
 * @param key where the text is typed, for example `settings:profile-remarks`
 * @param committedText the text already submitted: no draft is kept for it
 */
export function useDraft(
  key: string,
  committedText: string,
  delayMs: number = DRAFT_SAVE_DELAY_MS,
): Draft {
  const { drafts } = useAppServices();
  const [text, setTextState] = useState(committedText);
  const [ready, setReady] = useState(false);
  const [restored, setRestored] = useState(false);
  const [unreadable, setUnreadable] = useState(false);
  const [saveState, setSaveState] = useState<DraftSaveState>('idle');

  const latestText = useRef(committedText);
  const committed = useRef(committedText);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirty = useRef(false);

  // When the committed text changes elsewhere (an import, later the sync), the
  // field follows it, unless the learner has unsaved text: showing a stale text
  // would let "save" overwrite the newer version. Derived during rendering, as
  // React recommends for state that follows a prop.
  const [previousCommitted, setPreviousCommitted] = useState(committedText);
  if (committedText !== previousCommitted) {
    setPreviousCommitted(committedText);
    if (text === previousCommitted) setTextState(committedText);
  }

  useEffect(() => {
    committed.current = committedText;
    if (!dirty.current) latestText.current = committedText;
  }, [committedText]);

  // Load the stored draft. A parent that changes `key` should remount the field.
  useEffect(() => {
    let cancelled = false;
    drafts.get(key).then(
      (stored) => {
        if (cancelled) return;
        if (stored.state === 'present' && stored.text !== committed.current) {
          latestText.current = stored.text;
          setTextState(stored.text);
          setRestored(true);
        }
        if (stored.state === 'unreadable') setUnreadable(true);
        setReady(true);
      },
      () => {
        // Unreadable storage: the field still works, the text is simply not restored.
        if (!cancelled) setReady(true);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [drafts, key]);

  const save = useCallback(async () => {
    if (!dirty.current) return;
    dirty.current = false;
    const value = latestText.current;
    try {
      if (value === committed.current) await drafts.remove(key);
      else await drafts.save(key, value);
      setSaveState(value === committed.current ? 'idle' : 'saved');
    } catch {
      dirty.current = true;
      setSaveState('error');
    }
  }, [drafts, key]);

  const flush = useCallback(async () => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    await save();
  }, [save]);

  const setText = useCallback(
    (value: string) => {
      latestText.current = value;
      dirty.current = true;
      setTextState(value);
      setSaveState('pending');
      if (timer.current !== null) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        timer.current = null;
        void save();
      }, delayMs);
    },
    [delayMs, save],
  );

  const discard = useCallback(
    async (value: string) => {
      if (timer.current !== null) {
        clearTimeout(timer.current);
        timer.current = null;
      }
      dirty.current = false;
      latestText.current = value;
      setTextState(value);
      setRestored(false);
      setSaveState('idle');
      await drafts.remove(key);
    },
    [drafts, key],
  );

  // Save before the page is hidden or closed, before an update, and on unmount.
  useEffect(() => {
    const onHidden = () => {
      if (document.visibilityState === 'hidden') void flush();
    };
    const onPageHide = () => {
      void flush();
    };
    document.addEventListener('visibilitychange', onHidden);
    window.addEventListener('pagehide', onPageHide);
    const unregister = registerDraftFlush(flush);
    return () => {
      document.removeEventListener('visibilitychange', onHidden);
      window.removeEventListener('pagehide', onPageHide);
      unregister();
      void flush();
    };
  }, [flush]);

  return { text, ready, restored, unreadable, saveState, setText, flush, discard };
}

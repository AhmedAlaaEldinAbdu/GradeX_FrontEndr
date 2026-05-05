import { useCallback } from 'react';
import type { FieldErrors, FieldValues } from 'react-hook-form';

interface ScrollOptions {
  containerSelector?: string;
  offset?: number;
}

function findFirstErrorPath(errors: FieldErrors | Record<string, unknown>): string | null {
  const visit = (node: unknown, path: string[]): string | null => {
    if (node == null) return null;
    if (typeof node === 'string') {
      return node.length > 0 && path.length > 0 ? path.join('.') : null;
    }
    if (typeof node !== 'object') return null;
    const obj = node as Record<string, unknown>;
    if ('message' in obj && (obj as { message?: unknown }).message) {
      return path.join('.');
    }
    for (const key of Object.keys(obj)) {
      if (key === 'ref' || key === 'type' || key === 'types' || key === 'message') continue;
      const found = visit(obj[key], [...path, key]);
      if (found) return found;
    }
    return null;
  };
  return visit(errors, []);
}

function locateElement(fieldName: string): HTMLElement | null {
  const escaped = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(fieldName) : fieldName;
  const selectors = [`[data-form-field="${escaped}"]`, `[name="${escaped}"]`, `#${escaped}`];
  for (const selector of selectors) {
    const el = document.querySelector(selector) as HTMLElement | null;
    if (el) return el;
  }
  return null;
}

function findScrollableAncestor(element: HTMLElement): HTMLElement | null {
  let current: HTMLElement | null = element.parentElement;
  while (current && current !== document.body) {
    const style = window.getComputedStyle(current);
    const overflowY = style.overflowY;
    const isScrollable = overflowY === 'auto' || overflowY === 'scroll';
    if (isScrollable && current.scrollHeight > current.clientHeight) {
      return current;
    }
    current = current.parentElement;
  }
  return null;
}

export function useScrollToFirstError<T extends FieldValues = FieldValues>(
  options: ScrollOptions = {}
) {
  const { containerSelector, offset = 80 } = options;

  return useCallback(
    (errors: FieldErrors<T> | Record<string, unknown>) => {
      const fieldName = findFirstErrorPath(errors);
      if (!fieldName) return;

      const target = locateElement(fieldName);
      if (!target) return;

      const explicitContainer = containerSelector
        ? (document.querySelector(containerSelector) as HTMLElement | null)
        : null;
      const container = explicitContainer ?? findScrollableAncestor(target);

      if (container) {
        const containerRect = container.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        const top = container.scrollTop + (targetRect.top - containerRect.top) - offset;
        container.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      } else {
        const top = window.scrollY + target.getBoundingClientRect().top - offset;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      }

      const focusable = target.matches('input, select, textarea, button')
        ? target
        : (target.querySelector('input, select, textarea, button') as HTMLElement | null);
      if (focusable && typeof focusable.focus === 'function') {
        focusable.focus({ preventScroll: true });
      }
    },
    [containerSelector, offset]
  );
}

export default useScrollToFirstError;

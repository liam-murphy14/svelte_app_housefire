// @vitest-environment happy-dom
// @vitest-environment-options {"customExportConditions":["browser"]}

import { flushSync } from 'svelte';
import { createClassComponent } from 'svelte/legacy';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const lifecycleTestDouble = vi.hoisted(() => ({
  onMountCallbacks: [] as Array<() => void | (() => void)>,
}));

vi.mock('svelte', async (importOriginal) => ({
  ...(await importOriginal<typeof import('svelte')>()),
  onMount: (callback: () => void | (() => void)) => {
    lifecycleTestDouble.onMountCallbacks.push(callback);
  },
}));

import Page from './+page.svelte';

const leafletTestDouble = vi.hoisted(() => {
  const map = {
    setView: vi.fn(),
  };

  map.setView.mockReturnValue(map);

  return {
    leaflet: {
      Icon: { Default: { imagePath: '' } },
      map: vi.fn(() => map),
      tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
      marker: vi.fn(() => ({
        addTo: vi.fn(() => ({ bindPopup: vi.fn() })),
      })),
    },
  };
});

vi.mock('leaflet', () => ({ default: leafletTestDouble.leaflet }));

const properties = Array.from({ length: 26 }, (_, index) => ({
  id: `property-${index + 1}`,
  name: `Property ${index + 1}`,
  addressInput: `${index + 1} Main Street, Dallas, TX`,
  city: 'Dallas',
  state: 'TX',
  facts: [],
}));

const observerCallbacks: IntersectionObserverCallback[] = [];

class IntersectionObserverStub {
  observe = vi.fn();
  disconnect = vi.fn();

  constructor(callback: IntersectionObserverCallback) {
    observerCallbacks.push(callback);
  }
}

const settleMap = async () => {
  await Promise.resolve();
  await vi.dynamicImportSettled();
  flushSync();
};

describe('ticker property page mobile loading', () => {
  beforeEach(() => {
    leafletTestDouble.leaflet.marker.mockClear();
    observerCallbacks.splice(0);
    lifecycleTestDouble.onMountCallbacks.splice(0);
    vi.stubGlobal('IntersectionObserver', IntersectionObserverStub);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('loads the next mobile property batch while keeping markers for all properties', async () => {
    const target = document.createElement('div');
    document.body.append(target);
    const component = createClassComponent({
      component: Page,
      target,
      props: {
        data: {
          ticker: 'PLD',
          properties,
          metaTags: { title: 'PLD Property Data', description: 'Property data' },
        },
      },
    } as never);

    lifecycleTestDouble.onMountCallbacks.forEach((callback) => callback());
    await settleMap();

    expect(leafletTestDouble.leaflet.marker).toHaveBeenCalledTimes(26);
    expect(target.textContent).toContain('Property 25');
    expect(target.textContent).not.toContain('Property 26');

    observerCallbacks[0](
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
    flushSync();
    await Promise.resolve();

    expect(target.textContent).toContain('Property 26');

    component.$destroy();
    target.remove();
  });
});

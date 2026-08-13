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

const leafletTestDouble = vi.hoisted(() => {
  const map = {
    setView: vi.fn(),
  };
  let resolveImport: () => void;
  let resolveImportStarted: () => void;
  let importReady: Promise<void>;
  let importStarted: Promise<void>;

  const resetImport = () => {
    importReady = new Promise((resolve) => {
      resolveImport = resolve;
    });
    importStarted = new Promise((resolve) => {
      resolveImportStarted = resolve;
    });
  };

  map.setView.mockReturnValue(map);
  resetImport();

  return {
    leaflet: {
      Icon: { Default: { imagePath: '' } },
      map: vi.fn(() => map),
      tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
      marker: vi.fn(() => ({
        addTo: vi.fn(() => ({ bindPopup: vi.fn() })),
      })),
    },
    get importReady() {
      return importReady;
    },
    get importStarted() {
      return importStarted;
    },
    markImportStarted: () => resolveImportStarted(),
    resetImport,
    resolveImport: () => resolveImport(),
  };
});

vi.mock('leaflet', async () => {
  leafletTestDouble.markImportStarted();
  await leafletTestDouble.importReady;
  return { default: leafletTestDouble.leaflet };
});

import Page from './+page.svelte';

const properties = Array.from({ length: 26 }, (_, index) => ({
  id: `property-${index + 1}`,
  name: `Property ${index + 1}`,
  addressInput: `${index + 1} Main Street, Dallas, TX`,
  city: 'Dallas',
  state: 'TX',
  facts: [],
}));

const observerCallbacks: IntersectionObserverCallback[] = [];
const observerInstances: IntersectionObserverStub[] = [];

class IntersectionObserverStub {
  connected = true;
  observe = vi.fn();
  disconnect = vi.fn(() => {
    this.connected = false;
  });

  constructor(callback: IntersectionObserverCallback) {
    observerCallbacks.push(callback);
    observerInstances.push(this);
  }
}

const settleMap = async () => {
  await Promise.resolve();
  await vi.dynamicImportSettled();
  flushSync();
};

const mountPage = async () => {
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
  const cleanups = lifecycleTestDouble.onMountCallbacks
    .map((callback) => callback())
    .filter((cleanup): cleanup is () => void => typeof cleanup === 'function');

  return {
    component,
    destroy: () => {
      component.$destroy();
      cleanups.forEach((cleanup) => cleanup());
      target.remove();
    },
    target,
  };
};

describe('ticker property page mobile loading', () => {
  beforeEach(() => {
    leafletTestDouble.leaflet.marker.mockClear();
    leafletTestDouble.resetImport();
    observerCallbacks.splice(0);
    observerInstances.splice(0);
    lifecycleTestDouble.onMountCallbacks.splice(0);
    vi.stubGlobal('IntersectionObserver', IntersectionObserverStub);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('does not leave a mobile observer connected when destroyed before Leaflet loads', async () => {
    const page = await mountPage();
    await leafletTestDouble.importStarted;

    page.destroy();
    leafletTestDouble.resolveImport();
    await settleMap();

    expect(observerInstances.filter((observer) => observer.connected)).toHaveLength(0);
  });

  it('disconnects the mobile observer when the component is destroyed', async () => {
    leafletTestDouble.resolveImport();
    const page = await mountPage();
    await settleMap();

    expect(observerInstances).toHaveLength(1);
    expect(observerInstances[0].connected).toBe(true);

    page.destroy();

    expect(observerInstances[0].disconnect).toHaveBeenCalledOnce();
    expect(observerInstances[0].connected).toBe(false);
  });

  it('loads the next mobile property batch while keeping markers for all properties', async () => {
    leafletTestDouble.resolveImport();
    const page = await mountPage();
    await settleMap();

    expect(leafletTestDouble.leaflet.marker).toHaveBeenCalledTimes(26);
    expect(page.target.textContent).toContain('Property 25');
    expect(page.target.textContent).not.toContain('Property 26');
    const sentinel = page.target.querySelector('div[aria-hidden="true"]');
    expect(observerInstances[0].observe).toHaveBeenCalledWith(sentinel);

    observerCallbacks[0](
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
    flushSync();
    await Promise.resolve();

    expect(page.target.textContent).toContain('Property 26');

    page.destroy();
  });
});

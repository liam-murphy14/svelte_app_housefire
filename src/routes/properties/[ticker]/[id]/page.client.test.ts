// @vitest-environment happy-dom
// @vitest-environment-options {"customExportConditions":["browser"]}

import { flushSync } from 'svelte';
import { createClassComponent } from 'svelte/legacy';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Page from './+page.svelte';

const leafletTestDouble = vi.hoisted(() => {
  const maps: Array<{ element: HTMLDivElement }> = [];

  return {
    maps,
    reset: () => maps.splice(0),
    leaflet: {
      Icon: { Default: { imagePath: '' } },
      map: vi.fn((mapElement: HTMLDivElement) => {
        const element = document.createElement('div');
        element.dataset.propertyMap = 'active';
        mapElement.append(element);

        const instance = {
          setView: vi.fn((coordinates: [number, number]) => {
            element.dataset.coordinates = coordinates.join(',');
            return instance;
          }),
          remove: vi.fn(() => {
            element.dataset.removed = 'true';
            element.remove();
          }),
        };
        maps.push({ element });
        return instance;
      }),
      tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
      marker: vi.fn(() => ({
        addTo: vi.fn(() => ({
          bindPopup: vi.fn(() => ({ openPopup: vi.fn() })),
        })),
      })),
    },
  };
});

vi.mock('leaflet', () => ({ default: leafletTestDouble.leaflet }));

const detailData = (
  property: Record<string, unknown>,
): { ticker: string; property: Record<string, unknown>; metaTags: Record<string, string> } => ({
  ticker: 'PLD',
  property: {
    id: 'property-1',
    addressInput: 'backend-only-address-input',
    address: '1 Main Street',
    facts: [],
    ...property,
  },
  metaTags: { title: 'Property Details', description: 'Property details' },
});

const settleMap = async () => {
  await Promise.resolve();
  await vi.dynamicImportSettled();
  flushSync();
};

describe('property detail page map lifecycle', () => {
  beforeEach(() => {
    leafletTestDouble.reset();
  });

  it('keeps the focused map lifecycle in sync with same-route property data changes', async () => {
    const target = document.createElement('div');
    document.body.append(target);
    const component = createClassComponent({
      component: Page,
      target,
      props: { data: detailData({ latitude: 32.7767, longitude: -96.797 }) },
    } as never);

    await settleMap();

    const firstMap = leafletTestDouble.maps[0].element;
    expect(firstMap.dataset.coordinates).toBe('32.7767,-96.797');

    component.$set({
      data: detailData({ id: 'property-2', latitude: 40.7128, longitude: -74.006 }),
    });
    flushSync();
    await settleMap();

    expect(firstMap.dataset.removed).toBe('true');
    expect(leafletTestDouble.maps).toHaveLength(2);
    const secondMap = leafletTestDouble.maps[1].element;
    expect(secondMap.dataset.coordinates).toBe('40.7128,-74.006');

    component.$set({ data: detailData({ id: 'property-3' }) });
    flushSync();
    await settleMap();

    expect(secondMap.dataset.removed).toBe('true');
    expect(target.textContent).toContain('Map unavailable for this property.');

    component.$set({
      data: detailData({ id: 'property-4', latitude: 34.0522, longitude: -118.2437 }),
    });
    flushSync();
    await settleMap();

    expect(leafletTestDouble.maps).toHaveLength(3);
    expect(leafletTestDouble.maps[2].element.dataset.coordinates).toBe('34.0522,-118.2437');

    component.$destroy();
    target.remove();
  });
});

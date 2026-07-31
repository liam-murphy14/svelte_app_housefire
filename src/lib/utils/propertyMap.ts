import type { Property } from '@prisma/client';

const htmlEscapeMap: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (character) => htmlEscapeMap[character]);

export const propertyDetailsPath = (ticker: string, id: string): string =>
  `/properties/${encodeURIComponent(ticker)}/${encodeURIComponent(id)}`;

type PropertyPopupData = Pick<Property, 'id' | 'name' | 'address' | 'addressInput'>;

export const propertyPopupContent = (property: PropertyPopupData, ticker: string): string => {
  const title = property.name?.trim() || property.addressInput.trim() || 'Property';
  const address = property.address?.trim() || property.addressInput.trim() || 'Address unavailable';
  const href = propertyDetailsPath(ticker, property.id);

  return `<b>${escapeHtml(title)}</b><br>${escapeHtml(address)}<br><a class="text-hf-orange underline" href="${escapeHtml(href)}">View property details</a>`;
};

export type CarrierCode = 'G' | 'L' | 'S';

interface CarrierInfo {
  name: string;
  logo: string;
}

export const CARRIERS: Record<CarrierCode, CarrierInfo> = {
  G: { name: 'Grab', logo: '/carriers/grab.png.webp' },
  L: { name: 'Line-Man', logo: '/carriers/line-man.png' },
  S: { name: 'Shopee', logo: '/carriers/Shopee.png' },
};

export function getCarrier(code: string): CarrierInfo {
  return CARRIERS[code as CarrierCode] ?? { name: code, logo: '' };
}

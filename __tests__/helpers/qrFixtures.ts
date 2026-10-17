import type { BusinessQrSummary } from '@api/businessQrApi';

const svg = (label: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 29 29"><path d="M1 1h7v7H1z"/><desc>${label}</desc></svg>`;

const qr = (url: string) => ({ url, svg: svg(url) });

/** `/business-qr/summary` for a two-branch business with two tap devices. */
export const qrSummaryFixture: BusinessQrSummary = {
  business: {
    id: 'biz-1',
    name: 'Urban Grill',
    logoUrl: 'https://cdn.example.com/logo.png',
    code: 'BIZ8820',
    qr: qr('https://vemtap.com/b/BIZ8820'),
  },
  stats: {
    scans: { current: 120, previous: 100 },
    newCustomers: { current: 30, previous: 0 },
    claimRate: 0.25,
  },
  branches: [
    {
      id: 'b-wuse',
      name: 'Wuse Flagship',
      address: 'Wuse II, Abuja',
      code: 'WUSE01',
      username: 'wuse',
      isMainBranch: true,
      isActive: true,
      scans: { current: 90, previous: 70 },
      qr: qr('https://vemtap.com/b/WUSE01'),
    },
    {
      id: 'b-garki',
      name: 'Garki Express',
      address: null,
      code: 'GARKI1',
      username: null,
      isMainBranch: false,
      isActive: true,
      scans: { current: 30, previous: 30 },
      qr: qr('https://vemtap.com/b/GARKI1'),
    },
  ],
  points: [
    {
      id: 'd-till',
      name: 'Till 01',
      code: 'DEV1',
      type: 'Card',
      location: 'Main counter',
      branchId: 'b-wuse',
      branchName: 'Wuse Flagship',
      active: true,
      live: true,
      lastActive: '2026-10-15T10:00:00.000Z',
      totalScans: 412,
      scans: 60,
      weekScans: 18,
      qr: qr('https://vemtap.com/wuse/DEV1'),
    },
    {
      id: 'd-door',
      name: 'Front Door',
      code: 'DEV2',
      type: 'Stand',
      location: null,
      branchId: 'b-garki',
      branchName: 'Garki Express',
      active: false,
      live: false,
      lastActive: null,
      totalScans: 3,
      scans: 0,
      weekScans: 0,
      qr: qr('https://vemtap.com/b/GARKI1'),
    },
  ],
  totals: { branches: 2, points: 2, activePoints: 1, livePoints: 1, weekScans: 18 },
};

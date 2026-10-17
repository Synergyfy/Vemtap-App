import type { BusinessQrSummary } from '@api/businessQrApi';
import type { IconName } from '@components/ui/Icon';
import { strings } from '@constants/strings';
import { count, deltaView, percent, type DeltaView } from './analyticsMappers';

/** `https://vemtap.com/b/ABC` → `vemtap.com/b/ABC`. */
export const displayUrl = (url: string) => url.replace(/^https?:\/\//, '');

export interface BusinessQrView {
  businessName: string;
  statusSub: string;
  url: string;
  displayUrl: string;
  code: string;
  svg: string;
  stats: {
    id: string;
    label: string;
    value: string;
    note: string;
    direction: DeltaView['direction'];
    icon: IconName;
  }[];
}

export function toBusinessQrView(summary: BusinessQrSummary): BusinessQrView {
  const copy = strings.businessQr;
  const main =
    summary.branches.find(branch => branch.isMainBranch) ?? summary.branches[0];
  const scans = deltaView(summary.stats.scans);
  const fresh = deltaView(summary.stats.newCustomers);
  return {
    businessName: summary.business.name,
    statusSub: copy.statusSub(main?.name ?? '', summary.business.name),
    url: summary.business.qr.url,
    displayUrl: displayUrl(summary.business.qr.url),
    code: summary.business.code,
    svg: summary.business.qr.svg,
    stats: [
      {
        id: 'scans',
        label: copy.totalScansLabel,
        value: count(summary.stats.scans.current),
        note: scans.label,
        direction: scans.direction,
        icon: 'qrCodeScanner',
      },
      {
        id: 'new',
        label: copy.newSignupsLabel,
        value: count(summary.stats.newCustomers.current),
        note: fresh.label,
        direction: fresh.direction,
        icon: 'personAdd',
      },
      {
        id: 'claims',
        label: copy.dealClaimedLabel,
        value: percent(summary.stats.claimRate),
        note: copy.claimRateNote,
        direction: 'flat',
        icon: 'localOffer',
      },
    ],
  };
}

export interface QrCodeCard {
  id: string;
  branchId: string;
  name: string;
  meta: string;
  url: string;
  svg: string;
}

export interface LocationQrView {
  subtitle: string;
  groups: { id: string | null; label: string; count: string }[];
  network: { label: string; value: string; icon: IconName }[];
  branchCodes: (QrCodeCard & { scans: string })[];
  points: (QrCodeCard & {
    icon: IconName;
    status: string;
    tone: 'success' | 'brand' | 'neutral';
    weekly: string;
    total: string;
  })[];
}

const POINT_ICON: Record<string, IconName> = {
  card: 'contactlessPay',
  stand: 'storefront',
  sticker: 'qrCodeScanner',
  table: 'tableBar',
};

export function toLocationQrView(summary: BusinessQrSummary): LocationQrView {
  const copy = strings.locationQr;
  const pointsByBranch = new Map<string, number>();
  summary.points.forEach(point =>
    pointsByBranch.set(point.branchId, (pointsByBranch.get(point.branchId) ?? 0) + 1),
  );
  return {
    subtitle: copy.manageSubtitle(summary.totals.branches),
    groups: [
      {
        id: null,
        label: copy.allBranches,
        count: copy.branchCount(summary.points.length + summary.branches.length),
      },
      ...summary.branches.map(branch => ({
        id: branch.id,
        label: branch.name,
        count: copy.branchCount((pointsByBranch.get(branch.id) ?? 0) + 1),
      })),
    ],
    network: [
      {
        label: copy.network.points,
        value: count(summary.totals.points),
        icon: 'pinDrop',
      },
      {
        label: copy.network.live,
        value: count(summary.totals.livePoints),
        icon: 'sensors',
      },
      {
        label: copy.network.scans,
        value: count(summary.totals.weekScans),
        icon: 'qrCodeScanner',
      },
      {
        label: copy.network.branches,
        value: count(summary.totals.branches),
        icon: 'storefront',
      },
    ],
    branchCodes: summary.branches.map(branch => ({
      id: `branch-${branch.id}`,
      branchId: branch.id,
      name: branch.name,
      meta: copy.branchQrLabel,
      scans: copy.branchQrMeta(count(branch.scans.current)),
      url: branch.qr.url,
      svg: branch.qr.svg,
    })),
    points: summary.points.map(point => ({
      id: point.id,
      branchId: point.branchId,
      name: point.name,
      meta: [point.branchName, point.type, point.location].filter(Boolean).join(' • '),
      icon: POINT_ICON[point.type.toLowerCase()] ?? 'contactless',
      status: point.live
        ? copy.statusLive
        : point.active
          ? copy.statusActive
          : copy.statusInactive,
      tone: point.live ? 'success' : point.active ? 'brand' : 'neutral',
      weekly: copy.weeklyScans(count(point.weekScans)),
      total: copy.totalScans(count(point.totalScans)),
      url: point.qr.url,
      svg: point.qr.svg,
    })),
  };
}

export interface QrReadyView {
  businessName: string;
  descriptor: string;
  url: string;
  displayUrl: string;
  svg: string;
  logoUrl: string | null;
}

export function toQrReadyView(summary: BusinessQrSummary): QrReadyView {
  const main =
    summary.branches.find(branch => branch.isMainBranch) ?? summary.branches[0];
  return {
    businessName: summary.business.name,
    descriptor: [main?.name, main?.address].filter(Boolean).join(' • '),
    url: summary.business.qr.url,
    displayUrl: displayUrl(summary.business.qr.url),
    svg: summary.business.qr.svg,
    logoUrl: summary.business.logoUrl,
  };
}

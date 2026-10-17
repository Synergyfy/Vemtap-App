import React, { useMemo, useState } from 'react';
import { Clipboard, Share } from 'react-native';
import { strings } from '@constants/strings';
import { ApiError } from '@api/ApiError';
import type { BusinessQrQuery } from '@api/businessQrApi';
import { analyticsQuery } from '@store/analyticsFilterStore';
import {
  useBusinessQrKit,
  useBusinessQrSummary,
} from '@features/business/hooks/useBusinessQr';
import {
  toBusinessQrView,
  toLocationQrView,
  type QrCodeCard,
} from '@features/business/utils/qrMappers';
import { shareBase64File } from '@utils/csvExport';
import { BusinessQrScreen } from '@features/business/screens/BusinessQrScreen';
import { LocationQrScreen } from '@features/business/screens/LocationQrScreen';
import { useBusinessNavigation } from './useBusinessNavigation';

type Notice = { tone: 'success' | 'error'; text: string } | null;

/** The QR screens report the last 30 days, stable for the day. */
export function useQrWindow(): BusinessQrQuery {
  return useMemo(() => {
    const { from, to } = analyticsQuery({
      preset: '30d',
      customFrom: null,
      customTo: null,
      branchId: null,
    });
    return { from, to };
  }, []);
}

/** Builds the printable kit and hands it to the share sheet. */
export function useQrKitShare() {
  const copy = strings.businessQr;
  const kit = useBusinessQrKit();
  const [notice, setNotice] = useState<Notice>(null);

  async function shareKit(query: BusinessQrQuery = {}) {
    setNotice(null);
    try {
      const file = await kit.mutateAsync(query);
      const shared = await shareBase64File(
        file.filename,
        file.contentBase64,
        file.mimeType,
        copy.downloadKitCta,
      );
      setNotice(
        shared
          ? { tone: 'success', text: copy.downloadKitReady(file.codes) }
          : { tone: 'error', text: copy.shareUnavailable },
      );
    } catch (error) {
      setNotice({
        tone: 'error',
        text: error instanceof ApiError ? error.message : copy.downloadKitFailed,
      });
    }
  }

  return { shareKit, isBusy: kit.isPending, notice, setNotice };
}

export function shareQrLink(business: string, url: string) {
  return Share.share({
    message: strings.businessQr.shareMessage(business, url),
    url,
  }).catch(() => undefined);
}

export function BusinessQrRoute() {
  const navigation = useBusinessNavigation();
  const window = useQrWindow();
  const summary = useBusinessQrSummary(window);
  const kit = useQrKitShare();
  const view = useMemo(
    () => (summary.data ? toBusinessQrView(summary.data) : undefined),
    [summary.data],
  );
  const share = () => {
    if (view) void shareQrLink(view.businessName, view.url);
  };

  return (
    <BusinessQrScreen
      view={view}
      isError={summary.isError}
      onRetry={() => void summary.refetch()}
      isKitBusy={kit.isBusy}
      notice={kit.notice}
      onBack={navigation.goBack}
      onOpenNotifications={() => navigation.navigate('BusinessNotifications')}
      onOpenSubTab={tabKey => {
        if (tabKey === 'Analytics') navigation.navigate('BusinessPerformanceAnalytics');
        if (tabKey === 'Hub') navigation.navigate('BusinessDiscoveryFeed');
      }}
      onShare={share}
      onSendToSocials={share}
      onDownloadKit={() => void kit.shareKit()}
      onOrderStandee={() => navigation.navigate('BusinessSupportHelp')}
      onCustomizeStandee={() => navigation.navigate('BusinessSupportHelp')}
      onCopyCode={value => {
        Clipboard.setString(value);
        kit.setNotice({ tone: 'success', text: strings.businessQr.copiedLabel });
      }}
      onOpenLocationQrs={() => navigation.navigate('LocationQr')}
    />
  );
}

export function LocationQrRoute() {
  const navigation = useBusinessNavigation();
  const window = useQrWindow();
  const summary = useBusinessQrSummary(window);
  const kit = useQrKitShare();
  const view = useMemo(
    () => (summary.data ? toLocationQrView(summary.data) : undefined),
    [summary.data],
  );

  return (
    <LocationQrScreen
      view={view}
      isError={summary.isError}
      onRetry={() => void summary.refetch()}
      isKitBusy={kit.isBusy}
      notice={kit.notice}
      onBack={navigation.goBack}
      onOpenNotifications={() => navigation.navigate('BusinessNotifications')}
      onOpenSubTab={tabKey => {
        if (tabKey === 'Analytics') navigation.navigate('BusinessPerformanceAnalytics');
        if (tabKey === 'Hub') navigation.navigate('BusinessDiscoveryFeed');
      }}
      onShare={(code: QrCodeCard) => void shareQrLink(code.name, code.url)}
      onPrintSheet={branchId => void kit.shareKit(branchId ? { branchId } : {})}
      onRequestDevices={() => navigation.navigate('BusinessSupportHelp')}
    />
  );
}

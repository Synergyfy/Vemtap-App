import React, { useMemo, useState } from 'react';
import { Clipboard, Linking, Share } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { strings } from '@constants/strings';
import { ApiError } from '@api/ApiError';
import type { NetworkSummary, ReferralStatusFilter } from '@api/businessNetworkApi';
import { useDebounce } from '@hooks/useDebounce';
import { useAuthStore } from '@store/authStore';
import { showSuccess } from '@components/shared/toast';
import {
  useDiscoveryPresence,
  useNetworkSummary,
  useReferral,
  useReferrals,
  useUpdateDiscoverySetting,
} from '@features/business/hooks/useBusinessNetwork';
import { count } from '@features/business/utils/analyticsMappers';
import {
  toDiscoveryView,
  toNetworkHubView,
  toReferralDetailView,
  toReferralsView,
} from '@features/business/utils/networkMappers';
import { BusinessDiscoveryFeedScreen } from '@features/business/screens/BusinessDiscoveryFeedScreen';
import { BusinessNetworkActiveDashboardScreen } from '@features/business/screens/BusinessNetworkActiveDashboardScreen';
import { BusinessNetworkInfoScreen } from '@features/business/screens/BusinessNetworkInfoScreen';
import { BusinessNetworkIntroHubScreen } from '@features/business/screens/BusinessNetworkIntroHubScreen';
import { InviteABusinessSheet } from '@features/business/screens/InviteABusinessSheet';
import { MyBusinessNetworkScreen } from '@features/business/screens/MyBusinessNetworkScreen';
import { MyReferralsScreen } from '@features/business/screens/MyReferralsScreen';
import { NetworkMilestonesScreen } from '@features/business/screens/NetworkMilestonesScreen';
import { ReferralDetailScreen } from '@features/business/screens/ReferralDetailScreen';
import type { BusinessTabParamList } from './types';
import { useBusinessNavigation } from './useBusinessNavigation';

/** Opens a share target for the invite message; falls back to the share sheet. */
async function shareTo(channel: string, message: string) {
  const text = encodeURIComponent(message);
  const urls: Record<string, string> = {
    whatsapp: `whatsapp://send?text=${text}`,
    sms: `sms:?body=${text}`,
    messages: `sms:?body=${text}`,
    email: `mailto:?subject=${encodeURIComponent(strings.inviteABusiness.title)}&body=${text}`,
    telegram: `tg://msg?text=${text}`,
  };
  const url = urls[channel];
  try {
    if (url && (await Linking.canOpenURL(url))) {
      await Linking.openURL(url);
      return;
    }
  } catch {
    // Fall through to the system sheet.
  }
  await Share.share({ message }).catch(() => undefined);
}

/** The invite sheet state and its handlers, wired to the business's link. */
function useInviteSheet(summary: NetworkSummary | undefined) {
  const [open, setOpen] = useState(false);
  const link = summary?.referralLink ?? '';
  const message = strings.myBusinessNetwork.shareMessage(link);
  const copied = strings.myBusinessNetwork.copiedToast;
  const stats = useMemo(
    () => [
      {
        id: 'referrals',
        label: strings.inviteABusiness.stats.referrals,
        value: count(summary?.counts.total ?? 0),
      },
      {
        id: 'verified',
        label: strings.inviteABusiness.stats.verified,
        value: count(summary?.counts.verified ?? 0),
      },
      {
        id: 'nearby',
        label: strings.inviteABusiness.stats.nearby,
        value: count(summary?.nearby.total ?? 0),
      },
    ],
    [summary],
  );
  return {
    open: () => setOpen(true),
    copyLink: () => {
      if (!link) return;
      Clipboard.setString(link);
      showSuccess(copied);
    },
    share: (channel = 'more') => void shareTo(channel, message),
    sheet: (
      <InviteABusinessSheet
        visible={open && Boolean(link)}
        onClose={() => setOpen(false)}
        referralLink={link}
        message={message}
        stats={stats}
        onCopyMessage={() => {
          Clipboard.setString(message);
          showSuccess(copied);
        }}
        onCopyLink={() => {
          Clipboard.setString(link);
          showSuccess(copied);
        }}
        onShareDevice={() => void Share.share({ message }).catch(() => undefined)}
        onShareChannel={channel => void shareTo(channel, message)}
      />
    ),
  };
}

export function BusinessNetworkIntroHubRoute() {
  const navigation = useBusinessNavigation();
  const summary = useNetworkSummary();
  const view = useMemo(
    () => (summary.data ? toNetworkHubView(summary.data) : undefined),
    [summary.data],
  );
  return (
    <BusinessNetworkIntroHubScreen
      view={view}
      isError={summary.isError}
      onRetry={() => void summary.refetch()}
      onBack={navigation.goBack}
      onOpenHelp={() => navigation.navigate('BusinessSupportHelp')}
      onOpenSubTab={tabKey => {
        if (tabKey === 'Boost') navigation.navigate('BoostEngine');
        if (tabKey === 'Campaigns') navigation.navigate('CampaignsHub');
        if (tabKey === 'Segments') navigation.navigate('CustomerSegments');
      }}
      onGetReferralLink={() => navigation.navigate('MyBusinessNetwork')}
      onReadMore={() => navigation.navigate('BusinessNetworkInfo')}
    />
  );
}

export function MyBusinessNetworkRoute() {
  const navigation = useBusinessNavigation();
  const summary = useNetworkSummary();
  const invite = useInviteSheet(summary.data);
  const view = useMemo(
    () => (summary.data ? toNetworkHubView(summary.data) : undefined),
    [summary.data],
  );
  return (
    <>
      <MyBusinessNetworkScreen
        view={view}
        isError={summary.isError}
        onRetry={() => void summary.refetch()}
        onBack={navigation.goBack}
        onOpenSearch={() => navigation.navigate('MyReferrals')}
        onOpenSubTab={tabKey => {
          if (tabKey === 'Deals') navigation.navigate('CentralDealsManagement');
          if (tabKey === 'Manage') navigation.navigate('MyReferrals');
        }}
        onCopyLink={invite.copyLink}
        onShareLink={invite.open}
        onQuickShare={channel => invite.share(channel)}
        onScan={invite.open}
        onOpenMilestones={() => navigation.navigate('NetworkMilestones')}
        onOpenPartner={referralId =>
          navigation.navigate('ReferralDetail', { referralId })
        }
        onViewAllPartners={() => navigation.navigate('MyReferrals')}
        onOpenHowItWorks={() => navigation.navigate('BusinessNetworkInfo')}
      />
      {invite.sheet}
    </>
  );
}

export function NetworkMilestonesRoute() {
  const navigation = useBusinessNavigation();
  const summary = useNetworkSummary();
  const view = useMemo(() => {
    if (!summary.data) return undefined;
    const hub = toNetworkHubView(summary.data);
    return {
      currentTier: summary.data.current?.name ?? strings.networkMilestones.noTier,
      verified: hub.growth.verifiedCount,
      milestones: hub.milestones,
    };
  }, [summary.data]);
  return (
    <NetworkMilestonesScreen
      view={view}
      isError={summary.isError}
      onRetry={() => void summary.refetch()}
      onBack={navigation.goBack}
      onOpenInfo={() => navigation.navigate('BusinessNetworkInfo')}
      onOpenSubTab={tabKey => {
        if (tabKey === 'Network') navigation.navigate('BusinessNetworkDashboard');
        if (tabKey === 'Partners') navigation.navigate('MyReferrals');
      }}
    />
  );
}

export function BusinessNetworkInfoRoute() {
  const navigation = useBusinessNavigation();
  const summary = useNetworkSummary();
  return (
    <BusinessNetworkInfoScreen
      connectedCount={summary.data?.counts.verified}
      onBack={navigation.goBack}
      onOpenHelp={() => navigation.navigate('BusinessSupportHelp')}
      onGetLink={() => navigation.navigate('MyBusinessNetwork')}
      onBackToNetwork={() => navigation.goBack()}
    />
  );
}

export function MyReferralsRoute() {
  const navigation = useBusinessNavigation();
  const [filter, setFilter] = useState<ReferralStatusFilter>('all');
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search.trim(), 350);
  const summary = useNetworkSummary();
  const referrals = useReferrals({ status: filter, search: debounced || undefined });
  const invite = useInviteSheet(summary.data);
  const view = useMemo(
    () => (referrals.data ? toReferralsView(referrals.data, summary.data) : undefined),
    [referrals.data, summary.data],
  );
  return (
    <>
      <MyReferralsScreen
        view={view}
        isError={referrals.isError}
        onRetry={() => void referrals.refetch()}
        filter={filter}
        search={search}
        onChangeSearch={setSearch}
        onApplyFilter={setFilter}
        onBack={navigation.goBack}
        onOpenReferral={referralId =>
          navigation.navigate('ReferralDetail', { referralId })
        }
        onInvite={invite.open}
      />
      {invite.sheet}
    </>
  );
}

export function ReferralDetailRoute() {
  const navigation = useBusinessNavigation();
  const route = useRoute<RouteProp<BusinessTabParamList, 'ReferralDetail'>>();
  const referralId = route.params?.referralId;
  const referral = useReferral(referralId);
  const summary = useNetworkSummary();
  const view = useMemo(
    () => (referral.data ? toReferralDetailView(referral.data) : undefined),
    [referral.data],
  );
  const appUrl = summary.data?.referralLink.split('/get-started')[0];
  return (
    <ReferralDetailScreen
      view={view}
      isError={referral.isError || !referralId}
      onRetry={() => void referral.refetch()}
      onBack={navigation.goBack}
      onShare={() => {
        if (summary.data)
          void shareTo(
            'more',
            strings.myBusinessNetwork.shareMessage(summary.data.referralLink),
          );
      }}
      onSendMessage={() => navigation.navigate('BusinessMessages')}
      onViewBusiness={() => {
        if (appUrl && referral.data) {
          void Linking.openURL(`${appUrl}/b/${encodeURIComponent(referral.data.code)}`);
        }
      }}
    />
  );
}

export function BusinessNetworkDashboardRoute() {
  const navigation = useBusinessNavigation();
  const summary = useNetworkSummary();
  const view = useMemo(
    () => (summary.data ? toNetworkHubView(summary.data) : undefined),
    [summary.data],
  );
  return (
    <BusinessNetworkActiveDashboardScreen
      view={view}
      isError={summary.isError}
      onRetry={() => void summary.refetch()}
      onBack={navigation.goBack}
      onOpenSubTab={tabKey => {
        if (tabKey === 'Promos') navigation.navigate('CampaignsHub');
        if (tabKey === 'Partners') navigation.navigate('MyReferrals');
        if (tabKey === 'Analytics') navigation.navigate('BusinessPerformanceAnalytics');
      }}
      onShareLink={() => navigation.navigate('MyBusinessNetwork')}
      onOpenConnection={referralId =>
        navigation.navigate('ReferralDetail', { referralId })
      }
      onViewAllReferrals={() => navigation.navigate('MyReferrals')}
      onOpenMilestones={() => navigation.navigate('NetworkMilestones')}
      onOpenHowItWorks={() => navigation.navigate('BusinessNetworkInfo')}
    />
  );
}

export function BusinessDiscoveryFeedRoute() {
  const navigation = useBusinessNavigation();
  const role = useAuthStore(state => state.user?.role ?? '');
  const presence = useDiscoveryPresence();
  const update = useUpdateDiscoverySetting();
  const [notice, setNotice] = useState<string | null>(null);
  const view = useMemo(
    () => (presence.data ? toDiscoveryView(presence.data) : undefined),
    [presence.data],
  );
  return (
    <BusinessDiscoveryFeedScreen
      view={view}
      isError={presence.isError}
      onRetry={() => void presence.refetch()}
      canEditControls={String(role).toLowerCase() === 'owner'}
      notice={notice}
      onBack={navigation.goBack}
      onOpenNotifications={() => navigation.navigate('BusinessNotifications')}
      onOpenSubTab={tabKey => {
        if (tabKey === 'Campaigns') navigation.navigate('CampaignsHub');
        if (tabKey === 'QR & Tap') navigation.navigate('BusinessQr');
        if (tabKey === 'Analytics') navigation.navigate('BusinessPerformanceAnalytics');
      }}
      onEditFeedCard={() => navigation.navigate('BusinessProfilePreview')}
      onOpenIndexRow={rowId =>
        rowId === 'deals'
          ? navigation.navigate('CentralDealsManagement')
          : rowId === 'hours'
            ? navigation.navigate('LocationsBranches')
            : navigation.navigate('CentralCatalogue')
      }
      onOpenZone={branchId => navigation.navigate('WuseBranchDetails', { branchId })}
      onToggleControl={(id, value) => {
        if (!view) return;
        setNotice(null);
        update.mutate(
          { branchId: view.branchId, patch: { [id]: value } },
          {
            onError: error =>
              setNotice(
                error instanceof ApiError
                  ? error.message
                  : strings.businessDiscoveryFeed.saveFailed,
              ),
          },
        );
      }}
      onBoostFeed={() => navigation.navigate('BoostEngine')}
    />
  );
}

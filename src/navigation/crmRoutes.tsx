import React, { useMemo, useState } from 'react';
import { useStartNewDeal } from '@navigation/useStartNewDeal';
import { Clipboard, Linking } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { strings } from '@constants/strings';
import { ApiError } from '@api/ApiError';
import type { CustomerSegmentFilter, CustomerSort } from '@api/businessCustomersApi';
import { useDebounce } from '@hooks/useDebounce';
import {
  useMyBusiness,
  toBranchList,
} from '@features/business/hooks/useBusinessDashboardData';
import {
  useCustomerDirectory,
  useCustomerDossier,
  useExportCustomers,
  useSaveCustomerNote,
} from '@features/business/hooks/useBusinessCustomers';
import { count } from '@features/business/utils/analyticsMappers';
import {
  toCustomerDirectoryView,
  toCustomerDossierView,
} from '@features/business/utils/crmMappers';
import { shareBase64File } from '@utils/csvExport';
import { CustomerCrmDirectoryScreen } from '@features/business/screens/CustomerCrmDirectoryScreen';
import { CustomerProfileDossierScreen } from '@features/business/screens/CustomerProfileDossierScreen';
import type { BusinessTabParamList } from './types';
import { useBusinessNavigation } from './useBusinessNavigation';

type Notice = { tone: 'success' | 'error'; text: string } | null;

export function CustomerCrmDirectoryRoute() {
  const navigation = useBusinessNavigation();
  const copy = strings.customerCrm;
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<CustomerSegmentFilter>('all');
  const [sort, setSort] = useState<CustomerSort>('recent');
  const [scope, setScope] = useState('');
  const [notice, setNotice] = useState<Notice>(null);
  const debouncedSearch = useDebounce(search.trim(), 350);
  const myBusiness = useMyBusiness();
  const exporter = useExportCustomers();

  const query = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      segment: filter,
      sort,
      branchId: scope || undefined,
      limit: 20,
    }),
    [debouncedSearch, filter, sort, scope],
  );
  const directory = useCustomerDirectory(query);
  const view = useMemo(
    () => (directory.data ? toCustomerDirectoryView(directory.data.pages) : undefined),
    [directory.data],
  );
  const scopes = useMemo(
    () => [
      { label: copy.allBranches, value: '' },
      ...toBranchList(myBusiness.data).map(branch => ({
        label: branch.name,
        value: branch.id,
      })),
    ],
    [copy.allBranches, myBusiness.data],
  );

  async function exportDirectory() {
    setNotice(null);
    try {
      const { limit: _limit, ...filters } = query;
      const file = await exporter.mutateAsync(filters);
      const shared = await shareBase64File(
        file.filename,
        file.contentBase64,
        file.mimeType,
        copy.export,
      );
      setNotice(
        shared
          ? { tone: 'success', text: copy.exportReady(count(file.records)) }
          : { tone: 'error', text: copy.shareUnavailable },
      );
    } catch (error) {
      setNotice({
        tone: 'error',
        text: error instanceof ApiError ? error.message : copy.exportFailed,
      });
    }
  }

  return (
    <CustomerCrmDirectoryScreen
      view={view}
      isError={directory.isError}
      onRetry={() => void directory.refetch()}
      search={search}
      onChangeSearch={setSearch}
      filter={filter}
      onChangeFilter={setFilter}
      sort={sort}
      onChangeSort={setSort}
      scopes={scopes}
      scope={scope}
      onChangeScope={setScope}
      hasMore={Boolean(directory.hasNextPage)}
      isLoadingMore={directory.isFetchingNextPage}
      onLoadMore={() => void directory.fetchNextPage()}
      isExporting={exporter.isPending}
      notice={notice}
      onNotifications={() => navigation.navigate('BusinessNotifications')}
      onScanCode={() => navigation.navigate('PosCustomerLookupList')}
      onExport={() => void exportDirectory()}
      onMessageCustomer={() => navigation.navigate('BusinessMessages')}
      onViewProfile={customerId =>
        navigation.navigate('CustomerProfileDossier', { customerId })
      }
      onOpenAnalytics={() => navigation.navigate('BusinessCustomerIntelligence')}
    />
  );
}

export function CustomerProfileDossierRoute() {
  const startNewDeal = useStartNewDeal();
  const navigation = useBusinessNavigation();
  const copy = strings.customerDossier;
  const route = useRoute<RouteProp<BusinessTabParamList, 'CustomerProfileDossier'>>();
  const customerId = route.params?.customerId;
  const dossier = useCustomerDossier(customerId);
  const saveNote = useSaveCustomerNote(customerId);
  const [noteMessage, setNoteMessage] = useState<string | null>(null);
  const view = useMemo(
    () => (dossier.data ? toCustomerDossierView(dossier.data) : undefined),
    [dossier.data],
  );

  return (
    <CustomerProfileDossierScreen
      view={view}
      isError={dossier.isError || !customerId}
      onRetry={() => void dossier.refetch()}
      isSavingNote={saveNote.isPending}
      noteMessage={noteMessage}
      onBack={navigation.goBack}
      onCall={phone => void Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`)}
      onCopyEmail={email => Clipboard.setString(email)}
      onSendMessage={() => navigation.navigate('BusinessMessages')}
      onCustomDeal={startNewDeal}
      onLogVisit={() => navigation.navigate('PosCustomerLookupActive', { customerId })}
      onViewOrder={() => navigation.navigate('BusinessOrders')}
      onViewVoucher={() => navigation.navigate('CentralDealsManagement')}
      onSaveNote={input => {
        setNoteMessage(null);
        saveNote.mutate(input, {
          onSuccess: () => setNoteMessage(copy.noteSaved),
          onError: error =>
            setNoteMessage(error instanceof ApiError ? error.message : copy.noteFailed),
        });
      }}
    />
  );
}

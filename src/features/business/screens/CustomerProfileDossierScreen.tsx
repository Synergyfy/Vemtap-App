import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { ErrorState, LoadingState } from '@components/shared';
import { Button } from '@components/ui/Button';
import { Icon, type IconName } from '@components/ui/Icon';
import { Input } from '@components/ui/Input';
import { AppModal } from '@components/ui/Modal';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { MetaLine } from '@features/business/components/BusinessSetupPrimitives';
import {
  BusinessProductImage,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessKeyValueRow,
  BusinessLinkRow,
  BusinessMetricTile,
  BusinessPanel,
  BusinessToastPill,
} from '@features/business/components/BusinessOpsPrimitives';
import { BusinessInitialsAvatar } from '@features/business/components/BusinessPosPrimitives';
import type { CustomerDossierView } from '@features/business/utils/crmMappers';

cssInterop(Pressable, { className: 'style' });

const copy = strings.customerDossier;

export interface CustomerProfileDossierScreenProps {
  view?: CustomerDossierView;
  isError?: boolean;
  onRetry?: () => void;
  isSavingNote?: boolean;
  /** Result of the last note save, shown as a toast. */
  noteMessage?: string | null;
  onBack?: () => void;
  onMoreActions?: () => void;
  onCall?: (phone: string) => void;
  onCopyEmail?: (email: string) => void;
  onSendMessage?: () => void;
  onCustomDeal?: () => void;
  onLogVisit?: () => void;
  onViewOrder?: () => void;
  onViewVoucher?: () => void;
  onSaveNote?: (input: { note: string; tags: string[] }) => void;
}

/**
 * Customer dossier: who they are, how they relate to the business, what they
 * bought and claimed recently, their points, and the team's private note.
 */
export function CustomerProfileDossierScreen({
  view,
  isError,
  onRetry,
  isSavingNote = false,
  noteMessage,
  onBack,
  onMoreActions,
  onCall,
  onCopyEmail,
  onSendMessage,
  onCustomDeal,
  onLogVisit,
  onViewOrder,
  onViewVoucher,
  onSaveNote,
}: CustomerProfileDossierScreenProps) {
  const [toast, setToast] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (noteMessage) {
      setToast(noteMessage);
      setEditing(false);
    }
  }, [noteMessage]);

  const openEditor = () => {
    setDraft(view?.note?.body ?? '');
    setTags(view?.note?.tags.join(', ') ?? '');
    setEditing(true);
  };

  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        onBack,
        actions: [{ icon: 'more', label: copy.headerTitle, onPress: onMoreActions }],
      }}
      contentContainerClassName="pb-8"
    >
      {!view ? (
        isError ? (
          <ErrorState
            title={copy.error.title}
            description={copy.error.body}
            onRetry={onRetry}
          />
        ) : (
          <LoadingState label={copy.loading} />
        )
      ) : (
        <>
          <View className="mt-1 gap-3 rounded-card bg-surface p-4 shadow-sm">
            <View className="flex-row items-start gap-4">
              <View className="h-16 w-16 shrink-0">
                {view.avatarUrl ? (
                  <BusinessProductImage
                    source={{ uri: view.avatarUrl }}
                    alt={view.name}
                    className="h-full w-full rounded-full shadow-sm"
                  />
                ) : (
                  <BusinessInitialsAvatar
                    initials={view.initials}
                    size="lg"
                    tone="brand"
                  />
                )}
              </View>
              <View className="min-w-0 flex-1">
                <VemtapText
                  variant="headingMd"
                  className="font-sans-semibold"
                  numberOfLines={1}
                >
                  {view.name}
                </VemtapText>
                <View className="mt-1 flex-row items-center gap-1.5">
                  <View className="h-2 w-2 shrink-0 rounded-full bg-badge-discount-text" />
                  <VemtapText
                    variant="labelSm"
                    className="min-w-0 flex-1 font-sans-semibold text-primary"
                    numberOfLines={1}
                  >
                    {view.tierLine}
                  </VemtapText>
                </View>
                <VemtapText
                  variant="caption"
                  tone="tertiary"
                  className="mt-0.5"
                  numberOfLines={1}
                >
                  {copy.id(view.code)}
                </VemtapText>
              </View>
            </View>

            <View className="gap-3 rounded-field bg-surface-subtle p-3">
              <ContactRow
                icon="call"
                value={view.phone ?? copy.noPhone}
                actionLabel={copy.call}
                onAction={view.phone ? () => onCall?.(view.phone as string) : undefined}
              />
              <ContactRow
                icon="mail"
                value={view.email ?? copy.noEmail}
                actionLabel={copy.copyEmail}
                onAction={
                  view.email
                    ? () => {
                        setToast(copy.emailCopied);
                        onCopyEmail?.(view.email as string);
                      }
                    : undefined
                }
              />
              <View className="flex-row items-center gap-3">
                <Icon name="storefront" size={17} color={colors.textSecondary} />
                <VemtapText
                  variant="caption"
                  tone="secondary"
                  className="min-w-0 flex-1"
                  numberOfLines={1}
                >
                  {view.preferred}
                </VemtapText>
              </View>
            </View>
          </View>

          <View className="mt-3 gap-2">
            <Button
              label={copy.sendMessage}
              labelVariant="labelMd"
              onPress={onSendMessage}
              leftIcon={<Icon name="message" size={19} color={colors.surface} />}
            />
            <View className="flex-row gap-2">
              <Button
                label={copy.customDeal}
                labelVariant="labelSm"
                variant="secondary"
                className="flex-1"
                onPress={onCustomDeal}
                leftIcon={<Icon name="localOffer" size={17} color={colors.primary} />}
              />
              <Button
                label={copy.logVisit}
                labelVariant="labelSm"
                variant="secondary"
                className="flex-1"
                onPress={onLogVisit}
                leftIcon={<Icon name="pointOfSale" size={17} color={colors.text} />}
              />
            </View>
          </View>

          <View className="mt-4 flex-row items-center justify-between gap-2">
            <VemtapText variant="labelMd" className="font-sans-semibold">
              {copy.summaryTitle}
            </VemtapText>
            <BusinessStatusPill label={copy.syncedLive} tone="success" />
          </View>
          <View className="mt-2 flex-row flex-wrap gap-2">
            {view.metrics.map(metric => (
              <BusinessMetricTile
                key={metric.label}
                label={metric.label}
                figure={metric.figure}
                subline={metric.sub}
                icon={metric.icon}
                className="min-w-[45%]"
              />
            ))}
          </View>

          <BusinessPanel className="mt-4" tone="low">
            <BusinessKeyValueRow
              icon="history"
              label={copy.firstInteraction}
              value={view.firstInteraction}
            />
            <BusinessKeyValueRow
              icon="schedule"
              label={copy.latestInteraction}
              value={view.latestInteraction}
            />
          </BusinessPanel>

          <VemtapText variant="labelMd" className="mt-4 font-sans-semibold">
            {copy.transactionsTitle}
          </VemtapText>

          <View className="mt-2 gap-3">
            {view.purchases.length === 0 ? (
              <VemtapText variant="caption" tone="tertiary">
                {copy.noPurchases}
              </VemtapText>
            ) : null}
            {view.purchases.map(purchase => (
              <View
                key={purchase.id}
                className="gap-2 rounded-card bg-surface p-3 shadow-sm"
              >
                <View className="flex-row items-center justify-between gap-2">
                  <View className="min-w-0 flex-1 flex-row items-center gap-2">
                    <View className="h-2 w-2 shrink-0 rounded-full bg-badge-discount-text" />
                    <VemtapText
                      variant="labelMd"
                      className="min-w-0 flex-1 font-sans-semibold"
                      numberOfLines={1}
                    >
                      {purchase.title}
                    </VemtapText>
                  </View>
                  <BusinessStatusPill label={purchase.badge} tone="success" />
                </View>
                {purchase.items ? (
                  <VemtapText variant="bodyMd" tone="secondary" numberOfLines={2}>
                    {purchase.items}
                  </VemtapText>
                ) : null}
                <View className="flex-row items-center justify-between gap-2 border-t border-border pt-2">
                  <VemtapText variant="labelMd" className="font-sans-bold">
                    {purchase.amount}
                  </VemtapText>
                  <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
                    {purchase.when}
                  </VemtapText>
                </View>
              </View>
            ))}
            {view.purchases.length ? (
              <BusinessLinkRow label={copy.viewOrder} onPress={onViewOrder} />
            ) : null}

            {view.claims.length === 0 ? (
              <VemtapText variant="caption" tone="tertiary">
                {copy.noClaims}
              </VemtapText>
            ) : null}
            {view.claims.map(claim => (
              <View
                key={claim.id}
                className="gap-2 rounded-card bg-surface p-3 shadow-sm"
              >
                <View className="flex-row items-center justify-between gap-2">
                  <VemtapText
                    variant="labelMd"
                    className="min-w-0 flex-1 font-sans-semibold"
                    numberOfLines={1}
                  >
                    {claim.title}
                  </VemtapText>
                  <BusinessStatusPill label={claim.status} tone={claim.tone} />
                </View>
                <View className="flex-row items-center justify-between gap-2">
                  <VemtapText
                    variant="caption"
                    tone="secondary"
                    className="min-w-0 flex-1"
                    numberOfLines={1}
                  >
                    {claim.code}
                  </VemtapText>
                  {claim.saved ? (
                    <VemtapText
                      variant="labelSm"
                      className="shrink-0 font-sans-semibold text-badge-discount-text"
                    >
                      {claim.saved}
                    </VemtapText>
                  ) : null}
                </View>
                {claim.where ? (
                  <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
                    {claim.where}
                  </VemtapText>
                ) : null}
              </View>
            ))}
            {view.claims.length ? (
              <BusinessLinkRow label={copy.viewVoucher} onPress={onViewVoucher} />
            ) : null}

            <View className="gap-2 rounded-card bg-surface p-3 shadow-sm">
              <View className="flex-row items-center justify-between gap-2">
                <VemtapText
                  variant="labelMd"
                  className="min-w-0 flex-1 font-sans-semibold"
                  numberOfLines={1}
                >
                  {copy.ledgerTitle}
                </VemtapText>
                <Icon name="trophy" size={17} color={colors.textTertiary} />
              </View>
              {view.ledger.length === 0 ? (
                <VemtapText variant="caption" tone="tertiary">
                  {copy.noLedger}
                </VemtapText>
              ) : null}
              {view.ledger.map(entry => (
                <MetaLine
                  key={entry.id}
                  icon={(entry.positive ? 'plusCircle' : 'remove') as IconName}
                  value={entry.text}
                  trailing={entry.when}
                  iconColor={
                    entry.positive ? colors.badgeDiscountText : colors.tertiaryContainer
                  }
                />
              ))}
            </View>
          </View>

          <BusinessPanel
            className="mt-4"
            title={copy.notesTitle}
            badge={copy.notesPrivate}
            badgeTone="warning"
          >
            <View className="gap-1 rounded-field bg-surface-subtle p-3">
              <VemtapText variant="bodyMd" tone="secondary" className="leading-relaxed">
                {view.note?.body || copy.notesEmpty}
              </VemtapText>
              {view.note?.tags.length ? (
                <View className="flex-row flex-wrap gap-1">
                  {view.note.tags.map(tag => (
                    <BusinessStatusPill key={tag} label={tag} tone="neutral" />
                  ))}
                </View>
              ) : null}
              {view.note ? (
                <VemtapText variant="caption" tone="tertiary">
                  {view.note.author}
                </VemtapText>
              ) : null}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={view.note ? copy.editNote : copy.addNote}
              onPress={openEditor}
              className="min-h-11 flex-row items-center justify-center gap-1.5 rounded-field bg-surface-container active:scale-[0.98]"
            >
              <Icon name={view.note ? 'edit' : 'plus'} size={17} color={colors.primary} />
              <VemtapText
                variant="labelMd"
                className="font-sans-semibold text-primary"
                numberOfLines={1}
              >
                {view.note ? copy.editNote : copy.addNote}
              </VemtapText>
            </Pressable>
          </BusinessPanel>
        </>
      )}

      <AppModal
        visible={editing}
        onClose={() => setEditing(false)}
        title={view?.note ? copy.editNote : copy.addNote}
      >
        <View className="gap-3">
          <Input
            label={copy.notesTitle}
            value={draft}
            onChangeText={setDraft}
            placeholder={copy.notePlaceholder}
            multiline
            maxLength={2000}
          />
          <Input
            label={copy.tagsLabel}
            value={tags}
            onChangeText={setTags}
            autoCapitalize="none"
          />
          <View className="flex-row gap-2">
            <Button
              label={copy.cancel}
              variant="secondary"
              className="flex-1"
              onPress={() => setEditing(false)}
            />
            <Button
              label={copy.saveNote}
              className="flex-1"
              loading={isSavingNote}
              disabled={isSavingNote}
              onPress={() =>
                onSaveNote?.({
                  note: draft.trim(),
                  tags: tags
                    .split(',')
                    .map(tag => tag.trim())
                    .filter(Boolean),
                })
              }
            />
          </View>
        </View>
      </AppModal>

      {toast ? <BusinessToastPill message={toast} /> : null}
    </BusinessScreenLayout>
  );
}

function ContactRow({
  icon,
  value,
  actionLabel,
  onAction,
}: {
  icon: IconName;
  value: string;
  actionLabel: string;
  onAction?: () => void;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <Icon name={icon} size={17} color={colors.textSecondary} />
      <VemtapText
        variant="bodyMd"
        className="min-w-0 flex-1 font-sans-medium"
        numberOfLines={1}
      >
        {value}
      </VemtapText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={actionLabel}
        accessibilityState={{ disabled: !onAction }}
        disabled={!onAction}
        onPress={onAction}
        className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container-high active:scale-95"
      >
        <Icon name={icon === 'call' ? 'send' : 'copy'} size={15} color={colors.primary} />
      </Pressable>
    </View>
  );
}

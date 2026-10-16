import React from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { Input } from '@components/ui/Input';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { EmptyState } from '@components/shared/EmptyState';
import {
  BusinessActionDock,
  BusinessScreenLayout,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessChipScroller,
  BusinessCountChip,
  BusinessPanel,
} from '@features/business/components/BusinessOpsPrimitives';
import {
  BusinessGrandTotalRow,
  BusinessInitialsAvatar,
  BusinessTotalsRow,
} from '@features/business/components/BusinessPosPrimitives';
import type { SplitMode } from '@api/posApi';
import type { TotalsRow } from '@features/business/utils/posMappers';

const copy = strings.splitTheBill;

export type SplitTender = 'cash' | 'card' | 'transfer';

export interface SplitPersonDraft {
  key: string;
  name: string;
  lineIds: string[];
  amount: string;
  tender: SplitTender;
}

export interface SplitTheBillScreenProps {
  lines: { id: string; name: string; qty: number; price: string }[];
  mode: SplitMode;
  people: SplitPersonDraft[];
  /** Server-computed share per person, aligned with `people`; null while pricing. */
  shares: { amount: string; detail: string }[] | null;
  totals: TotalsRow[];
  grandTotal: string;
  error: string | null;
  tenders: SplitTender[];
  isSubmitting?: boolean;
  onBack?: () => void;
  onChangeMode?: (mode: SplitMode) => void;
  onChangePerson?: (key: string, patch: Partial<SplitPersonDraft>) => void;
  onAddPerson?: () => void;
  onRemovePerson?: (key: string) => void;
  onSettle?: () => void;
}

/** Split one ticket across people: equally, by item or by custom amounts, then settle in one sale. */
export function SplitTheBillScreen({
  lines,
  mode,
  people,
  shares,
  totals,
  grandTotal,
  error,
  tenders,
  isSubmitting,
  onBack,
  onChangeMode,
  onChangePerson,
  onAddPerson,
  onRemovePerson,
  onSettle,
}: SplitTheBillScreenProps) {
  if (!lines.length) {
    return (
      <BusinessScreenLayout header={{ title: copy.headerTitle, onBack }}>
        <EmptyState icon="list" title={copy.empty.title} description={copy.empty.body} />
      </BusinessScreenLayout>
    );
  }
  return (
    <BusinessScreenLayout
      header={{ title: copy.headerTitle, onBack }}
      contentContainerClassName="pb-8"
      footer={
        <BusinessActionDock>
          <Button
            label={copy.settleCta(grandTotal)}
            labelVariant="labelMd"
            disabled={!shares || Boolean(error)}
            loading={isSubmitting}
            onPress={onSettle}
            leftIcon={<Icon name="checkCircle" size={18} color={colors.surface} />}
          />
        </BusinessActionDock>
      }
    >
      <BusinessPanel title={copy.modesTitle} icon="callSplitIcon">
        <BusinessChipScroller>
          {(['equal', 'by_item', 'custom'] as const).map(id => (
            <BusinessCountChip
              key={id}
              label={copy.modes[id]}
              selected={mode === id}
              onPress={() => onChangeMode?.(id)}
            />
          ))}
        </BusinessChipScroller>
      </BusinessPanel>

      <BusinessPanel className="mt-3" title={copy.peopleTitle} icon="group">
        <View className="gap-2.5">
          {people.map((person, index) => (
            <View
              key={person.key}
              className="gap-2 rounded-field bg-surface-subtle p-2.5"
            >
              <View className="flex-row items-center gap-2">
                <BusinessInitialsAvatar
                  initials={(person.name || String(index + 1)).slice(0, 2).toUpperCase()}
                  size="sm"
                  tone="brand"
                />
                <View className="min-w-0 flex-1">
                  <Input
                    value={person.name}
                    placeholder={copy.personPlaceholder(index + 1)}
                    onChangeText={text => onChangePerson?.(person.key, { name: text })}
                  />
                </View>
                {people.length > 2 ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={copy.removePerson}
                    onPress={() => onRemovePerson?.(person.key)}
                    className="h-8 w-8 items-center justify-center rounded-lg bg-surface-container"
                  >
                    <Icon name="close" size={15} color={colors.textSecondary} />
                  </Pressable>
                ) : null}
              </View>

              {mode === 'by_item' ? (
                <View className="flex-row flex-wrap gap-1.5">
                  {lines.map(line => {
                    const selected = person.lineIds.includes(line.id);
                    return (
                      <BusinessCountChip
                        key={line.id}
                        label={`${line.qty}× ${line.name}`}
                        selected={selected}
                        onPress={() =>
                          onChangePerson?.(person.key, {
                            lineIds: selected
                              ? person.lineIds.filter(id => id !== line.id)
                              : [...person.lineIds, line.id],
                          })
                        }
                      />
                    );
                  })}
                </View>
              ) : null}

              {mode === 'custom' ? (
                <Input
                  label={copy.amountLabel}
                  keyboardType="numeric"
                  value={person.amount}
                  onChangeText={text => onChangePerson?.(person.key, { amount: text })}
                />
              ) : null}

              <BusinessChipScroller>
                {tenders.map(tender => (
                  <BusinessCountChip
                    key={tender}
                    label={copy.tenders[tender]}
                    selected={person.tender === tender}
                    onPress={() => onChangePerson?.(person.key, { tender })}
                  />
                ))}
              </BusinessChipScroller>

              {shares?.[index] ? (
                <View className="flex-row items-center justify-between gap-2">
                  <VemtapText
                    variant="micro"
                    tone="tertiary"
                    className="min-w-0 flex-1"
                    numberOfLines={2}
                  >
                    {shares[index].detail}
                  </VemtapText>
                  <VemtapText
                    variant="labelMd"
                    className="font-sans-bold text-primary"
                    numberOfLines={1}
                  >
                    {shares[index].amount}
                  </VemtapText>
                </View>
              ) : null}
            </View>
          ))}
        </View>
        {people.length < 20 ? (
          <Button
            label={copy.addPerson}
            labelVariant="labelSm"
            variant="secondary"
            size="sm"
            onPress={onAddPerson}
          />
        ) : null}
        {error ? (
          <VemtapText variant="caption" tone="error">
            {error}
          </VemtapText>
        ) : null}
      </BusinessPanel>

      <BusinessPanel className="mt-3" title={copy.totalsTitle} icon="receipt">
        <View className="gap-1.5">
          {totals.map(row => (
            <BusinessTotalsRow
              key={row.id}
              label={row.label}
              value={row.value}
              tone={row.tone}
            />
          ))}
        </View>
        <BusinessGrandTotalRow label={copy.totalLabel} value={grandTotal} />
      </BusinessPanel>
    </BusinessScreenLayout>
  );
}

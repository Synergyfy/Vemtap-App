import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { AppModal } from '@components/ui/Modal';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { cn } from '@utils/cn';
import { BusinessInlineAction } from '@features/business/components/BusinessPrimitives';

const copy = strings.businessBranchSwitcher;

export interface BusinessBranch {
  id: string;
  name: string;
  address: string;
  active?: boolean;
}

export interface BusinessBranchSwitcherProps {
  branches: readonly BusinessBranch[];
  /** Controlled active branch; omit to let the switcher own it. */
  activeBranchId?: string;
  onChangeBranch?: (branchId: string) => void;
  onAddBranch?: () => void;
  /** `md` for an in-content pill, `sm` for the compact header pill. */
  size?: 'md' | 'sm';
  /** Optional trailing status, e.g. the Overview's live marker. */
  suffix?: string;
  suffixTone?: 'success' | 'secondary';
  /** Optional secondary control beside the pill; opens the same sheet. */
  trailingLabel?: string;
  trailingIcon?: IconName;
  trailingActionLabel?: string;
  className?: string;
}

/**
 * The business branch switcher shared by Overview, Orders and More.
 *
 * One pill + one sheet, so the three surfaces can never disagree about which
 * branch is active or how the list is presented. The pill always renders the
 * *selected* branch name: a switcher that leaves its own label unchanged after
 * a selection looks broken even though the state moved.
 */
export function BusinessBranchSwitcher({
  branches,
  activeBranchId,
  onChangeBranch,
  onAddBranch,
  size = 'md',
  suffix,
  suffixTone = 'success',
  trailingLabel,
  trailingIcon = 'sync',
  trailingActionLabel,
  className,
}: BusinessBranchSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [uncontrolled, setUncontrolled] = useState(
    branches.find(branch => branch.active)?.id ?? branches[0]?.id,
  );

  const activeId = activeBranchId ?? uncontrolled;
  const active = branches.find(branch => branch.id === activeId) ?? branches[0];

  const select = (branchId: string) => {
    if (activeBranchId === undefined) setUncontrolled(branchId);
    onChangeBranch?.(branchId);
    setOpen(false);
  };

  if (!active) return null;

  return (
    <>
      <View className={cn('min-w-0 flex-row items-center gap-2', className)}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${copy.switchLabel}: ${active.name}`}
          onPress={() => setOpen(true)}
          className={cn(
            'min-w-0 flex-1 flex-row items-center gap-2 rounded-full active:scale-95',
            size === 'md'
              ? 'self-start bg-surface-container-low px-3 py-2'
              : 'bg-surface-container-high px-2.5 py-1',
          )}
        >
          <Icon name="storefront" size={size === 'md' ? 17 : 15} color={colors.primary} />
          <VemtapText
            variant={size === 'md' ? 'labelMd' : 'labelSm'}
            className="min-w-0 flex-1 font-sans-semibold"
            numberOfLines={1}
          >
            {active.name}
          </VemtapText>
          {suffix ? (
            <VemtapText
              variant="caption"
              tone={suffixTone}
              className="shrink-0"
              numberOfLines={1}
            >
              {suffix}
            </VemtapText>
          ) : null}
          <Icon
            name="expandMore"
            size={size === 'md' ? 18 : 16}
            color={colors.onSurfaceVariant}
          />
        </Pressable>
        {trailingLabel ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={trailingActionLabel ?? trailingLabel}
            onPress={() => setOpen(true)}
            className={cn(
              'shrink-0 flex-row items-center gap-1.5 rounded-full active:scale-95',
              size === 'md'
                ? 'h-9 bg-surface-container-low px-3'
                : 'bg-surface-container-high px-2.5 py-1',
            )}
          >
            <VemtapText
              variant={size === 'md' ? 'labelSm' : 'caption'}
              tone="brand"
              numberOfLines={1}
            >
              {trailingLabel}
            </VemtapText>
            <Icon name={trailingIcon} size={15} color={colors.primary} />
          </Pressable>
        ) : null}
      </View>

      <AppModal visible={open} onClose={() => setOpen(false)} title={copy.sheetTitle}>
        <View className="gap-3">
          <VemtapText variant="caption" tone="secondary">
            {copy.sheetSubtitle}
          </VemtapText>
          {branches.map(branch => {
            const selected = branch.id === activeId;
            return (
              <Pressable
                key={branch.id}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={branch.name}
                onPress={() => select(branch.id)}
                className={cn(
                  'flex-row items-center gap-2.5 rounded-card border p-3',
                  selected
                    ? 'border-primary bg-surface-tint'
                    : 'border-border bg-surface-subtle',
                )}
              >
                <View className="h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-fixed">
                  <Icon name="storefront" size={18} color={colors.primary} />
                </View>
                <View className="min-w-0 flex-1">
                  <VemtapText
                    variant="labelMd"
                    className="font-sans-semibold"
                    numberOfLines={1}
                  >
                    {branch.name}
                  </VemtapText>
                  <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                    {branch.address}
                  </VemtapText>
                </View>
                {selected ? (
                  <Icon name="checkCircle" size={18} color={colors.primary} />
                ) : null}
              </Pressable>
            );
          })}
          {/* Adding a location is a primary path, so the action is always
              offered even when the host screen has no handler yet. */}
          <BusinessInlineAction
            label={copy.addBranch}
            icon="addLocation"
            onPress={() => {
              setOpen(false);
              onAddBranch?.();
            }}
          />
        </View>
      </AppModal>
    </>
  );
}

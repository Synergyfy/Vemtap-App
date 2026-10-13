import { useCallback, useState } from 'react';
import { Clipboard, Linking, Share } from 'react-native';
import { BottomSheet } from '@components/shared/BottomSheet';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { showToast } from '@components/shared/toast';
import type { IconName } from '@components/ui/Icon';

const copy = strings.urbanConversation.moreSheet;

export interface ConversationActionsProps {
  /** Prefers the claimed pass the thread is about when there is one. */
  hasClaim: boolean;
  branchPhone?: string;
  branchCode?: string;
  /** Carries the claim so the pass route can resolve it. */
  onOpenPass?: (claimId: string) => void;
  onOpenBusiness?: (code: string) => void;
  /** The linked claim, if the thread has one. */
  claimId?: string;
}

export interface ConversationActions {
  /** Spread onto the conversation screen. */
  props: {
    onOpenBusiness: (code: string) => void;
    onOpenDetails: () => void;
    onCallMerchant: () => void;
    onMore: () => void;
  };
  /** The overflow sheet, rendered next to the screen. */
  sheet: React.ReactNode;
}

/**
 * The conversation's overflow actions, shared by the account-stack and the
 * personal-hub copy so both menus offer the same things.
 *
 * The receipt icon has no single right target: it prefers the claimed pass the
 * thread is about and falls back to the merchant's profile, which is what it
 * meant before threads carried a claim at all.
 */
export function useConversationActions({
  hasClaim,
  branchPhone,
  branchCode,
  claimId,
  onOpenPass,
  onOpenBusiness,
}: ConversationActionsProps): ConversationActions {
  const [moreOpen, setMoreOpen] = useState(false);

  const openBusiness = useCallback(
    (code: string) => {
      onOpenBusiness?.(code);
    },
    [onOpenBusiness],
  );

  const callMerchant = useCallback(() => {
    if (!branchPhone) return;
    Linking.openURL(`tel:${branchPhone}`).catch(() => undefined);
  }, [branchPhone]);

  const copyNumber = useCallback(() => {
    if (!branchPhone) return;
    Clipboard.setString(branchPhone);
    showToast(copy.copied, 'success');
    setMoreOpen(false);
  }, [branchPhone]);

  const shareThread = useCallback(() => {
    Share.share({ message: strings.urbanConversation.shareMessage })
      .catch(() => undefined)
      .finally(() => setMoreOpen(false));
  }, []);

  const openDetails = useCallback(() => {
    if (hasClaim && claimId && onOpenPass) {
      onOpenPass(claimId);
    } else if (branchCode) {
      openBusiness(branchCode);
    }
  }, [branchCode, claimId, hasClaim, onOpenPass, openBusiness]);

  const rows: { key: string; label: string; icon: IconName; onPress: () => void }[] = [];
  if (branchCode) {
    rows.push({
      key: 'business',
      label: copy.viewBusiness,
      icon: 'storefront',
      onPress: () => {
        openBusiness(branchCode);
        setMoreOpen(false);
      },
    });
  }
  if (branchPhone) {
    rows.push({
      key: 'call',
      label: copy.callBusiness,
      icon: 'phone',
      onPress: () => {
        callMerchant();
        setMoreOpen(false);
      },
    });
    rows.push({
      key: 'copy',
      label: copy.copyNumber,
      icon: 'receipt',
      onPress: copyNumber,
    });
  }
  rows.push({
    key: 'share',
    label: copy.share,
    icon: 'share',
    onPress: shareThread,
  });

  const sheet = (
    <BottomSheet visible={moreOpen} onClose={() => setMoreOpen(false)} title={copy.title}>
      {rows.map(row => (
        <Button
          key={row.key}
          label={row.label}
          variant="ghost"
          fullWidth
          leftIcon={<Icon name={row.icon} size={18} color={colors.textSecondary} />}
          onPress={row.onPress}
        />
      ))}
    </BottomSheet>
  );

  return {
    props: {
      onOpenBusiness: openBusiness,
      onOpenDetails: openDetails,
      onCallMerchant: callMerchant,
      onMore: () => setMoreOpen(true),
    },
    sheet,
  };
}

import React from 'react';
import { View } from 'react-native';
import { RegistrationHeader } from '@components/auth/RegistrationHeader';
import { EmptyState } from '@components/shared/EmptyState';
import { ErrorState } from '@components/shared/ErrorState';
import { LoadingState } from '@components/shared/LoadingState';
import { showToast } from '@components/shared/toast';
import { strings } from '@constants/strings';
import { ClaimedDealDetailPassScreen } from '@features/claimedDeal/screens/ClaimedDealDetailPassScreen';
import {
  useClaimQr,
  useReleaseClaim,
  type useClaimPass,
} from '@features/myDeals/hooks/useMyClaims';

const copy = strings.claimedDealPass;

/**
 * The claim pass for both stacks that show it (Account and the personal hub):
 * loading, missing and failed states, the server QR, and releasing the claim.
 * `navigate` reaches the deal pages on the root app stack.
 */
export function ClaimPassView({
  pass,
  onBack,
  onOpenChat,
  navigate,
}: {
  pass: ReturnType<typeof useClaimPass>;
  onBack: () => void;
  onOpenChat?: () => void;
  navigate: (route: string, params: object) => void;
}) {
  const qr = useClaimQr(pass.claim?.status === 'ACTIVE' ? pass.claim.id : undefined);
  const release = useReleaseClaim();

  if (!pass.claim) {
    return (
      <View className="flex-1 bg-background">
        <RegistrationHeader title={copy.title} onBack={onBack} />
        {pass.isLoading ? (
          <LoadingState label={copy.loading} />
        ) : pass.isError ? (
          <ErrorState
            title={copy.error.title}
            description={copy.error.body}
            onRetry={() => pass.refetch()}
          />
        ) : (
          <EmptyState
            icon="voucher"
            title={copy.notFound.title}
            description={copy.notFound.body}
            className="mt-16"
          />
        )}
      </View>
    );
  }

  const { claim } = pass;
  return (
    <ClaimedDealDetailPassScreen
      claim={claim}
      qrSvg={qr.data?.svg}
      onBack={onBack}
      onOpenChat={onOpenChat}
      onOpenDeal={() => navigate('DealDetail', { dealId: claim.offer.id })}
      onOpenTerms={() => navigate('DealTermsConditions', { dealId: claim.offer.id })}
      isReleasing={release.isPending}
      onRelease={() =>
        release.mutate(claim.id, {
          onSuccess: () => {
            showToast(copy.released, 'success');
            onBack();
          },
          onError: () => showToast(copy.releaseFailed, 'error'),
        })
      }
    />
  );
}

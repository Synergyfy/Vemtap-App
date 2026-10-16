import React from 'react';
import { View } from 'react-native';
import { VemtapText } from '@components/ui/Text';
import { BottomSheet } from '@components/shared/BottomSheet';
import { LoadingState } from '@components/shared/LoadingState';
import { strings } from '@constants/strings';
import { PreviewShell } from '@features/business/components/BusinessSetupPrimitives';
import { PushNotificationPreview } from '@features/business/components/PushNotificationPreview';

const copy = strings.campaignsHub.live.push;

export interface CampaignPushPreviewSheetProps {
  visible: boolean;
  onClose: () => void;
  /** The notification text; `undefined` while the featured listing loads. */
  push?: { title: string; body: string };
}

/**
 * "Preview Push" on a campaign card: the notification nearby customers get,
 * on the shared bottom sheet with the same card the boost wizard previews.
 */
export function CampaignPushPreviewSheet({
  visible,
  onClose,
  push,
}: CampaignPushPreviewSheetProps) {
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={copy.title}
      titleVariant="headingXl"
      titleClassName="text-heading-xl"
    >
      <View className="gap-3 pb-2">
        <PreviewShell
          label={strings.boostWizard.preview.previewTabs[2]}
          tone="lowest"
          className="gap-3 p-2"
        >
          {push ? (
            <PushNotificationPreview
              app={copy.app}
              time={copy.time}
              title={push.title}
              body={push.body}
            />
          ) : (
            <LoadingState label={copy.loading} />
          )}
        </PreviewShell>
        <VemtapText variant="caption" tone="secondary">
          {copy.caption}
        </VemtapText>
      </View>
    </BottomSheet>
  );
}

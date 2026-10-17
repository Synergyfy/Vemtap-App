import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { BottomSheet } from '@components/shared/BottomSheet';
import { Icon } from '@components/ui/Icon';
import { GoogleLogo } from '@components/ui/GoogleLogo';
import { VemtapText } from '@components/ui/Text';
import { Button } from '@components/ui/Button';
import { colors } from '@theme/colors';
import { typeMetrics } from '@theme/typography';
import { strings } from '@constants/strings';
import { useCurrentUserDisplay } from '@hooks/useCurrentUserDisplay';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, { className: 'style' });
cssInterop(TextInput, { className: 'style' });

export type ClaimDealData = {
  title: string;
  merchant: string;
  price: string;
  priceWas: string;
  save: string;
  badge: string;
  image: { uri: string };
  /** Real countdown from the offer; absent when the API sends no expiry. */
  endsIn?: string;
};

export type RecipientData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export function ClaimConfirmationSheet({
  visible,
  onClose,
  onConfirm,
  deal,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  deal: ClaimDealData;
}) {
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={strings.deals.claimFlow.claimTitle}
      titleVariant="headingXl"
      titleClassName="text-heading-xl text-text"
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.riskBadge}>
          <Icon name="verified" size={16} color={colors.badgeDiscountText} />
          <VemtapText variant="labelSm" className="text-badge-discount-text">
            {strings.deals.claimFlow.riskFree}
          </VemtapText>
        </View>
        <VemtapText variant="bodyMd" tone="secondary" className="mt-2">
          {strings.deals.claimFlow.claimSubtitle(deal.badge)}
        </VemtapText>
        <View style={styles.dealCard}>
          <View style={styles.dealHero}>
            <Image source={deal.image} style={styles.heroImage} resizeMode="cover" />
            <View style={styles.heroDiscount}>
              <VemtapText className="font-sans-bold text-caption text-primary-foreground">
                {deal.badge}
              </VemtapText>
            </View>
          </View>
          <View style={styles.dealBody}>
            <View style={styles.rowBetween}>
              <View style={styles.flexCopy}>
                <View style={styles.row}>
                  <VemtapText variant="labelSm" tone="secondary" numberOfLines={1}>
                    {deal.merchant}
                  </VemtapText>
                  <Icon name="verified" size={16} color={colors.primary} />
                </View>
                <VemtapText
                  variant="headingSm"
                  className="mt-1 text-text"
                  numberOfLines={2}
                >
                  {deal.title}
                </VemtapText>
              </View>
              <View style={styles.dealIcon}>
                <Icon name="restaurant" size={24} color={colors.primary} />
              </View>
            </View>
            <View style={styles.priceBox}>
              <View style={styles.rowBetween}>
                <VemtapText variant="caption" tone="secondary" className="uppercase">
                  {strings.deals.claimFlow.payAtVenue}
                </VemtapText>
                <VemtapText
                  variant="labelSm"
                  className="font-sans-semibold text-badge-discount-text"
                >
                  {deal.save}
                </VemtapText>
              </View>
              <View style={styles.row}>
                <VemtapText className="font-sans-bold text-display-mobile text-text">
                  {deal.price}
                </VemtapText>
                <VemtapText variant="bodyMd" tone="tertiary" className="line-through">
                  {deal.priceWas}
                </VemtapText>
              </View>
            </View>
            <View style={styles.metaGrid}>
              <MetaCell
                icon="eventAvailable"
                label={strings.deals.claimFlow.validUntil}
                value={deal.endsIn ?? strings.deals.claimFlow.validUntilUnknown}
              />
              <MetaCell
                icon="wallet"
                label={strings.deals.claimFlow.commitment}
                value={strings.deals.claimFlow.noCommitment}
              />
            </View>
          </View>
        </View>
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Icon name="shield" size={20} color={colors.primary} />
          </View>
          <View style={styles.flexCopy}>
            <VemtapText variant="labelMd" className="font-sans-semibold text-text">
              {strings.deals.claimFlow.flexibleTitle}
            </VemtapText>
            <VemtapText variant="bodyMd" tone="secondary" className="mt-1">
              {strings.deals.claimFlow.flexibleBody}
            </VemtapText>
          </View>
        </View>
        <Button label={strings.deals.claimFlow.confirmClaim} onPress={onConfirm} />
        <Pressable
          accessibilityRole="button"
          onPress={onClose}
          style={styles.secondaryButton}
        >
          <VemtapText variant="button" tone="secondary">
            {strings.deals.claimFlow.notNow}
          </VemtapText>
        </Pressable>
        <View style={styles.guaranteeRow}>
          <Icon name="lock" size={15} color={colors.textTertiary} />
          <VemtapText variant="caption" tone="tertiary" className="text-center">
            {strings.deals.claimFlow.heldForYou}
          </VemtapText>
        </View>
      </ScrollView>
    </BottomSheet>
  );
}

export function ClaimAuthModalSheet({
  visible,
  onClose,
  onContinue,
  deal,
}: {
  visible: boolean;
  onClose: () => void;
  onContinue: () => void;
  deal: ClaimDealData;
}) {
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={strings.deals.claimFlow.beforeClaim}
      titleVariant="headingMd"
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.authDeal}>
          <Image source={deal.image} style={styles.authImage} resizeMode="cover" />
          <View style={styles.flexCopy}>
            <View style={styles.row}>
              <VemtapText variant="labelSm" tone="secondary" numberOfLines={1}>
                {deal.merchant}
              </VemtapText>
              <Icon name="verified" size={14} color={colors.primary} />
            </View>
            <VemtapText variant="headingSm" numberOfLines={1}>
              {deal.title}
            </VemtapText>
            <View style={styles.row}>
              <VemtapText className="font-sans-bold text-button-md text-text">
                {deal.price}
              </VemtapText>
              <VemtapText variant="labelSm" className="text-badge-discount-text">
                {deal.save}
              </VemtapText>
            </View>
          </View>
        </View>
        <VemtapText variant="bodyMd" tone="secondary" className="mb-4">
          {strings.deals.claimFlow.beforeClaimBody}
        </VemtapText>
        <Button
          label={strings.deals.claimFlow.continueGoogle}
          leftIcon={<GoogleLogo size={20} />}
          onPress={onContinue}
        />
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <VemtapText variant="caption" tone="tertiary" className="px-3 uppercase">
            or
          </VemtapText>
          <View style={styles.dividerLine} />
        </View>
        <Button
          label={strings.deals.claimFlow.continueEmail}
          variant="outline"
          leftIcon={<Icon name="mail" size={20} color={colors.textSecondary} />}
          onPress={onContinue}
        />
        <View style={styles.featurePill}>
          <Icon name="verifiedUser" size={16} color={colors.badgeDiscountText} />
          <VemtapText variant="caption" tone="secondary" className="text-center">
            {strings.deals.claimFlow.instantVoucher}
          </VemtapText>
        </View>
        <View style={styles.authFooter}>
          <VemtapText variant="labelMd" tone="secondary">
            {strings.deals.claimFlow.alreadyAccount}
          </VemtapText>
          <Pressable accessibilityRole="button" onPress={onContinue}>
            <VemtapText variant="labelMd" tone="brand" className="font-sans-semibold">
              {strings.deals.claimFlow.signIn}
            </VemtapText>
          </Pressable>
        </View>
        <VemtapText variant="caption" tone="secondary" className="text-center">
          {strings.deals.claimFlow.returnDeal}
        </VemtapText>
      </ScrollView>
    </BottomSheet>
  );
}

export function ClaimIdentitySheet({
  visible,
  onClose,
  onForMe,
  onGift,
  deal,
}: {
  visible: boolean;
  onClose: () => void;
  onForMe: () => void;
  onGift: () => void;
  deal: ClaimDealData;
}) {
  const claimant = useCurrentUserDisplay();
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={strings.deals.claimFlow.claimTitle}
      titleVariant="displayMobile"
      titleClassName="text-heading-xl text-text"
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.identityDeal}>
          <Icon name="restaurant" size={16} color={colors.primary} />
          <VemtapText
            variant="labelSm"
            className="flex-1 font-sans-semibold text-text"
            numberOfLines={1}
          >
            {deal.merchant}
          </VemtapText>
          <VemtapText variant="labelSm" className="font-sans-bold text-primary">
            {deal.price}
          </VemtapText>
        </View>
        <VemtapText variant="bodyMd" tone="secondary" className="mt-1">
          {strings.deals.claimFlow.identityContext}
        </VemtapText>
        <View style={styles.identityCard}>
          <View style={styles.identityAvatar}>
            <VemtapText className="font-sans-semibold text-heading-sm text-secondary">
              {claimant.initials}
            </VemtapText>
            {/* The badge is a claim about this session's account, so it is
                drawn only when the session says the email is verified. */}
            {claimant.emailVerified ? (
              <View
                style={styles.verifiedDot}
                accessibilityLabel={strings.deals.claimFlow.emailVerified}
              >
                <Icon name="verified" size={12} color={colors.surface} />
              </View>
            ) : null}
          </View>
          <View style={styles.flexCopy}>
            <VemtapText variant="bodyMd" className="font-sans-semibold text-text">
              {claimant.fullName}
            </VemtapText>
            <VemtapText variant="bodyMd" tone="secondary">
              {claimant.email}
            </VemtapText>
            <View style={styles.activePill}>
              <View style={styles.dot} />
              <VemtapText variant="caption" tone="brand" className="font-sans-semibold">
                {strings.deals.claimFlow.activeShopper}
              </VemtapText>
            </View>
          </View>
          <Icon name="checkCircle" size={20} color={colors.textTertiary} />
        </View>
        <Button
          label={strings.deals.claimFlow.claimForMe}
          leftIcon={<Icon name="badge" size={20} color={colors.surface} />}
          onPress={onForMe}
        />
        <VemtapText variant="labelSm" tone="tertiary" className="mt-5 uppercase">
          Other options
        </VemtapText>
        <OptionRow
          icon="localOffer"
          iconBackground={colors.surfaceContainerHigh}
          title={strings.deals.claimFlow.claimGift}
          subtitle={strings.deals.claimFlow.claimGiftSub}
          onPress={onGift}
        />
        <View style={styles.guaranteeRow}>
          <Icon name="lock" size={14} color={colors.textTertiary} />
          <VemtapText variant="caption" tone="tertiary" className="text-center">
            {strings.deals.claimFlow.voucherWallet}
          </VemtapText>
        </View>
      </ScrollView>
    </BottomSheet>
  );
}

export function RecipientDetailsSheet({
  visible,
  onClose,
  onContinue,
  onBack,
  title,
  initialValues,
}: {
  visible: boolean;
  onClose: () => void;
  onContinue: (data: RecipientData) => void;
  onBack: () => void;
  /**
   * Overrides the "claim for someone else" heading. The self-claim flow collects
   * exactly the same fields the API needs (name, email, phone), so the sheet is
   * reused with its own wording rather than forked into a near-duplicate.
   */
  title?: string;
  /**
   * Seeds the form for a claim made under the caller's own identity, so nobody
   * retypes what the session already knows. Absent for the claim-for-someone-
   * else flow, which starts blank on purpose.
   */
  initialValues?: RecipientData;
}) {
  const blank: RecipientData = { firstName: '', lastName: '', email: '', phone: '' };
  const [data, setData] = useState<RecipientData>({ ...blank, ...initialValues });
  const [touched, setTouched] = useState(false);
  const update = (key: keyof RecipientData, value: string) => {
    setTouched(true);
    setData(current => ({ ...current, [key]: value }));
  };

  /**
   * The sheet stays mounted while hidden — `visible` only toggles it — so a
   * mount-time seed would freeze whatever the session held when the screen
   * opened. Re-seeding on each open, while the form is still untouched, keeps
   * a fresh open in sync with the session and never clobbers values the user
   * typed and then stepped back from.
   */
  useEffect(() => {
    if (!visible || touched) return;
    if (initialValues && initialValues !== data) {
      setData({ ...blank, ...initialValues });
    }
    // `data` is read only to skip a no-op re-seed; the caller passes a stable
    // seed (see `useMemo` in the screen) so this settles after one open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, touched, initialValues]);
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={title ?? strings.deals.claimFlow.claimSomeoneElse}
      titleVariant="headingLg"
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoCard}>
          <Icon name="verifiedUser" size={20} color={colors.primary} />
          <VemtapText variant="labelSm" className="flex-1 text-text">
            Your personal profile and active reward points stay unchanged. Only this
            specific claim voucher updates.
          </VemtapText>
        </View>
        <VemtapText variant="headingSm" className="mt-5 text-text">
          Recipient Details
        </VemtapText>
        <View style={styles.formRow}>
          <Field
            label={strings.deals.claimFlow.firstName}
            value={data.firstName}
            placeholder="e.g. Samuel"
            onChangeText={value => update('firstName', value)}
          />
          <Field
            label={strings.deals.claimFlow.lastName}
            value={data.lastName}
            placeholder="e.g. Adeleke"
            onChangeText={value => update('lastName', value)}
          />
        </View>
        <Field
          label={strings.deals.claimFlow.email}
          value={data.email}
          placeholder="recipient@example.com"
          onChangeText={value => update('email', value)}
          icon="mail"
        />
        <Field
          label={strings.deals.claimFlow.phone}
          value={data.phone}
          placeholder="802 345 6789"
          onChangeText={value => update('phone', value)}
        />
        <View style={styles.smsNote}>
          <Icon name="message" size={18} color={colors.textSecondary} />
          <VemtapText variant="caption" tone="secondary" className="flex-1">
            The claim verification and SMS code will be issued directly in this
            person&apos;s name.
          </VemtapText>
        </View>
        <Button
          label={strings.deals.claimFlow.verifyContinue}
          rightIcon={<Icon name="arrowForward" size={18} color={colors.surface} />}
          onPress={() => onContinue(data)}
        />
        <Pressable
          accessibilityRole="button"
          onPress={onBack}
          style={styles.secondaryButton}
        >
          <VemtapText variant="button" tone="secondary">
            Back to my details
          </VemtapText>
        </Pressable>
      </ScrollView>
    </BottomSheet>
  );
}

export function RecipientVerificationSheet({
  visible,
  onClose,
  onContinue,
  onBack,
  email,
  title,
  codeHint,
  minimumDigits,
  onSubmitCode,
  submitLabel,
  busy,
  errorMessage,
  heading,
  bodyCopy,
}: {
  visible: boolean;
  onClose: () => void;
  onContinue: () => void;
  onBack: () => void;
  email: string;
  /** Overrides the "Recipient Verification" heading for other claim paths. */
  title?: string;
  /** Overrides the "Enter 6-digit authorization code" hint. */
  codeHint?: string;
  /**
   * How many characters must be entered before continuing.
   *
   * Default 6 for the recipient flow. Promotion claims accept **4–6** — verified
   * live: a 3-character code is rejected on length and a 7-character one too —
   * so the self-claim path passes 4 and the user can continue on either length.
   */
  minimumDigits?: number;
  /**
   * Receives the entered code. When given it takes precedence over
   * `onContinue`, so a screen can verify against the API instead of advancing.
   */
  onSubmitCode?: (code: string) => void;
  submitLabel?: string;
  busy?: boolean;
  errorMessage?: string;
  /** Overrides the "Verify recipient's email" heading. */
  heading?: string;
  /** Overrides the explanatory sentence under the heading. */
  bodyCopy?: (email: string) => string;
}) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const enteredCount = code.filter(Boolean).length;
  /** Gaps are not allowed: a code must be a contiguous prefix. */
  const requiredDigits = Math.max(1, minimumDigits ?? code.length);
  const otpKeys = [
    'digit-one',
    'digit-two',
    'digit-three',
    'digit-four',
    'digit-five',
    'digit-six',
  ];
  const updateCode = (index: number, value: string) =>
    setCode(current =>
      current.map((digit, i) =>
        i === index ? value.replace(/\D/g, '').slice(-1) : digit,
      ),
    );
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={title ?? strings.deals.claimFlow.recipientVerification}
      titleVariant="headingLg"
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <VemtapText variant="headingXl" className="text-heading-xl text-text">
          {heading ?? strings.deals.claimFlow.verifyRecipient}
        </VemtapText>
        <VemtapText variant="bodyMd" tone="secondary" className="mt-2">
          {(bodyCopy ?? strings.deals.claimFlow.verifyRecipientBody)(email)}{' '}
          <VemtapText className="font-sans-semibold text-text">
            {email || 'recipient@example.com'}
          </VemtapText>
        </VemtapText>
        <Pressable accessibilityRole="button" style={styles.changeEmail}>
          <Icon name="edit" size={14} color={colors.primary} />
          <VemtapText variant="caption" tone="brand" className="font-sans-semibold">
            {strings.deals.claimFlow.changeEmail}
          </VemtapText>
        </Pressable>
        <VemtapText variant="labelSm" tone="secondary" className="mt-5 uppercase">
          {codeHint ?? strings.deals.claimFlow.enterCode}
        </VemtapText>
        <View style={styles.otpRow}>
          {code.map((digit, index) => (
            <TextInput
              key={otpKeys[index]}
              accessibilityLabel={`Digit ${index + 1}`}
              value={digit}
              onChangeText={value => updateCode(index, value)}
              keyboardType="number-pad"
              maxLength={1}
              textContentType="oneTimeCode"
              style={[styles.otpBox, index === 4 && styles.otpBoxActive]}
            />
          ))}
        </View>
        <View style={styles.resendRow}>
          <VemtapText variant="caption" tone="secondary">
            Didn&apos;t receive the email?
          </VemtapText>
          <VemtapText variant="caption" tone="tertiary">
            {strings.deals.claimFlow.resendCode} (0:45)
          </VemtapText>
        </View>
        <View style={styles.infoCard}>
          <Icon name="info" size={18} color={colors.primary} />
          <VemtapText variant="caption" tone="secondary" className="flex-1">
            The recipient must verify this code to authorize claiming the deal and
            registering the redemption voucher directly under their name.
          </VemtapText>
        </View>
        {errorMessage ? (
          <View style={styles.infoCard}>
            <Icon name="info" size={18} color={colors.error} />
            <VemtapText
              accessibilityRole="alert"
              variant="caption"
              tone="secondary"
              className="flex-1"
            >
              {errorMessage}
            </VemtapText>
          </View>
        ) : null}
        <Button
          label={submitLabel ?? strings.deals.claimFlow.verifyContinue}
          loading={busy}
          disabled={busy || enteredCount < requiredDigits}
          rightIcon={<Icon name="arrowForward" size={18} color={colors.surface} />}
          onPress={() => {
            if (onSubmitCode) {
              onSubmitCode(code.join(''));
              return;
            }
            onContinue();
          }}
        />
        <Pressable
          accessibilityRole="button"
          onPress={onBack}
          style={styles.secondaryButton}
        >
          <VemtapText variant="button" tone="secondary">
            {strings.deals.claimFlow.backRecipient}
          </VemtapText>
        </Pressable>
      </ScrollView>
    </BottomSheet>
  );
}

export function GiftDetailsSheet({
  visible,
  onClose,
  onContinue,
  deal,
}: {
  visible: boolean;
  onClose: () => void;
  onContinue: (data: RecipientData & { message: string }) => void;
  deal: ClaimDealData;
}) {
  const [data, setData] = useState<RecipientData & { message: string }>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
  });
  const [messageOpen, setMessageOpen] = useState(false);
  const update = (key: keyof typeof data, value: string) =>
    setData(current => ({ ...current, [key]: value }));
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={strings.deals.claimFlow.giftTitle}
      titleVariant="headingLg"
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.giftContext}>
          <View style={styles.dot} />
          <VemtapText
            variant="labelSm"
            tone="secondary"
            className="font-sans-semibold uppercase"
          >
            {strings.deals.claimFlow.giftExperience}
          </VemtapText>
        </View>
        <VemtapText variant="headingXl" className="mt-4 text-heading-xl text-text">
          {strings.deals.claimFlow.giftTitle}
        </VemtapText>
        <VemtapText variant="bodyMd" tone="secondary" className="mt-1">
          {strings.deals.claimFlow.giftSubtitle}
        </VemtapText>
        <View style={styles.giftDeal}>
          <Image source={deal.image} style={styles.thumbnail} resizeMode="cover" />
          <View style={styles.flexCopy}>
            <View style={styles.row}>
              <VemtapText
                variant="labelSm"
                tone="brand"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {deal.merchant}
              </VemtapText>
              <Icon name="verified" size={14} color={colors.primary} />
            </View>
            <VemtapText variant="headingSm" numberOfLines={1}>
              {deal.title}
            </VemtapText>
            <VemtapText variant="caption" tone="tertiary">
              {strings.deals.claimFlow.validThirtyDays}
            </VemtapText>
          </View>
        </View>
        <View style={styles.formRow}>
          <Field
            label={strings.deals.claimFlow.firstName}
            value={data.firstName}
            placeholder="e.g. Amara"
            onChangeText={value => update('firstName', value)}
          />
          <Field
            label={strings.deals.claimFlow.lastName}
            value={data.lastName}
            placeholder="e.g. Okafor"
            onChangeText={value => update('lastName', value)}
          />
        </View>
        <Field
          label={strings.deals.claimFlow.email}
          value={data.email}
          placeholder="recipient@example.com"
          onChangeText={value => update('email', value)}
          icon="mail"
        />
        <Field
          label={strings.deals.claimFlow.phone}
          value={data.phone}
          placeholder="801 234 5678"
          onChangeText={value => update('phone', value)}
        />
        <Pressable
          accessibilityRole="button"
          onPress={() => setMessageOpen(value => !value)}
          style={styles.giftMessageToggle}
        >
          <View style={styles.infoIcon}>
            <Icon name="localOffer" size={18} color={colors.secondary} />
          </View>
          <View style={styles.flexCopy}>
            <VemtapText variant="labelMd" className="font-sans-semibold text-text">
              {strings.deals.claimFlow.addGiftMessage}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary">
              {strings.deals.claimFlow.giftMessageSub}
            </VemtapText>
          </View>
          <View style={[styles.toggle, messageOpen && styles.toggleActive]}>
            <View style={[styles.toggleKnob, messageOpen && styles.toggleKnobActive]} />
          </View>
        </Pressable>
        {messageOpen ? (
          <View style={styles.giftMessageBox}>
            <TextInput
              value={data.message}
              onChangeText={value => update('message', value)}
              placeholder={strings.deals.claimFlow.giftMessagePlaceholder}
              placeholderTextColor={colors.textTertiary}
              multiline
              maxLength={160}
              className="min-h-24 rounded-xl bg-surface p-3 text-body-md text-text"
            />
            <View style={styles.rowBetween}>
              <View style={styles.row}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => update('message', 'Enjoy your lunch! 🍔')}
                  style={styles.preset}
                >
                  <VemtapText variant="caption">
                    {strings.deals.claimFlow.quickLunch}
                  </VemtapText>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => update('message', 'A little treat for you! ✨')}
                  style={styles.preset}
                >
                  <VemtapText variant="caption">
                    {strings.deals.claimFlow.surprise}
                  </VemtapText>
                </Pressable>
              </View>
              <VemtapText variant="caption" tone="tertiary">
                {data.message.length}/160
              </VemtapText>
            </View>
          </View>
        ) : null}
        <Button
          label={strings.deals.claimFlow.continue}
          rightIcon={<Icon name="arrowForward" size={18} color={colors.surface} />}
          onPress={() => onContinue(data)}
        />
        <View style={styles.guaranteeRow}>
          <Icon name="lock" size={14} color={colors.textTertiary} />
          <VemtapText variant="caption" tone="tertiary" className="text-center">
            {strings.deals.claimFlow.secureCheckout}
          </VemtapText>
        </View>
      </ScrollView>
    </BottomSheet>
  );
}

export function GiftConfirmSheet({
  visible,
  onClose,
  onBack,
  onConfirm,
  recipient,
  deal,
  sending = false,
  errorMessage,
}: {
  visible: boolean;
  onClose: () => void;
  onBack: () => void;
  onConfirm: () => void;
  recipient: RecipientData & { message: string };
  deal: ClaimDealData;
  /** True while `POST /catalogue/offers/claim/gift` is in flight. */
  sending?: boolean;
  /** Set when that send failed; the sheet stays open so it can be retried. */
  errorMessage?: string;
}) {
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={strings.deals.claimFlow.giftConfirmTitle}
      titleVariant="headingMd"
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.giftContext}>
          <View style={styles.giftIcon}>
            <Icon name="localOffer" size={18} color={colors.primary} />
          </View>
          <VemtapText
            variant="labelSm"
            tone="brand"
            className="font-sans-semibold uppercase"
          >
            {strings.deals.claimFlow.giftDispatch}
          </VemtapText>
        </View>
        <VemtapText variant="headingXl" className="mt-4 text-heading-xl text-text">
          {strings.deals.claimFlow.giftConfirmTitle}
        </VemtapText>
        <VemtapText variant="bodyMd" tone="secondary" className="mt-1">
          {strings.deals.claimFlow.giftConfirmSubtitle}
        </VemtapText>
        <View style={styles.giftSummary}>
          <View style={styles.recipientHeader}>
            <View style={styles.recipientAvatar}>
              <VemtapText className="font-sans-bold text-heading-md text-surface">
                {recipient.firstName?.[0] ?? 'A'}
                {recipient.lastName?.[0] ?? 'O'}
              </VemtapText>
            </View>
            <View style={styles.flexCopy}>
              <View style={styles.row}>
                <VemtapText variant="headingSm">
                  {recipient.firstName} {recipient.lastName}
                </VemtapText>
                <Icon name="verified" size={18} color={colors.primary} />
              </View>
              <VemtapText variant="caption" tone="tertiary">
                {strings.deals.claimFlow.verifiedContact}
              </VemtapText>
            </View>
            <View style={styles.giftBadge}>
              <Icon name="localOffer" size={20} color={colors.badgeDiscountText} />
            </View>
          </View>
          <View style={styles.contactBox}>
            <ContactRow
              icon="mail"
              label={strings.deals.claimFlow.email}
              value={recipient.email}
            />
            <ContactRow
              icon="message"
              label={strings.deals.claimFlow.phone}
              value={recipient.phone}
            />
          </View>
          <View style={styles.infoCard}>
            <Icon name="info" size={18} color={colors.primary} />
            <VemtapText variant="caption" tone="secondary" className="flex-1">
              The recipient will receive a verification link and instructions for using
              the claimed deal.
            </VemtapText>
          </View>
        </View>
        <View style={styles.perkCard}>
          <View style={styles.rowBetween}>
            <VemtapText variant="caption" tone="secondary" className="uppercase">
              {strings.deals.claimFlow.attachedPerk}
            </VemtapText>
            <View style={styles.discountPill}>
              <VemtapText className="font-sans-bold text-caption text-badge-discount-text">
                {deal.badge}
              </VemtapText>
            </View>
          </View>
          <View style={styles.row}>
            <Image source={deal.image} style={styles.thumbnail} resizeMode="cover" />
            <View style={styles.flexCopy}>
              <VemtapText variant="headingSm" numberOfLines={1}>
                {deal.merchant}
              </VemtapText>
              <VemtapText variant="bodyMd" tone="secondary">
                Lunch Combo • {deal.price}
              </VemtapText>
            </View>
          </View>
          <VemtapText variant="caption" tone="secondary" className="mt-3">
            Payment is made directly by recipient at the venue upon redemption.
          </VemtapText>
        </View>
        {errorMessage ? (
          <View
            accessibilityRole="alert"
            className="mt-3 flex-row items-start gap-2 rounded-field bg-error-container px-3 py-2"
          >
            <Icon name="alert" size={18} color={colors.error} />
            <VemtapText variant="caption" tone="error" className="flex-1">
              {errorMessage}
            </VemtapText>
          </View>
        ) : null}
        <Button
          label={
            sending
              ? strings.deals.claimFlow.sendingGift
              : strings.deals.claimFlow.confirmSendGift
          }
          disabled={sending}
          leftIcon={<Icon name="send" size={18} color={colors.surface} />}
          onPress={onConfirm}
        />
        <Pressable
          accessibilityRole="button"
          onPress={onBack}
          style={styles.secondaryButton}
        >
          <VemtapText variant="button" tone="secondary">
            {strings.deals.claimFlow.editRecipient}
          </VemtapText>
        </Pressable>
      </ScrollView>
    </BottomSheet>
  );
}

function MetaCell({
  icon,
  label,
  value,
}: {
  icon: 'eventAvailable' | 'wallet';
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metaCell}>
      <View style={styles.metaIcon}>
        <Icon name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.flexCopy}>
        <VemtapText variant="caption" tone="secondary">
          {label}
        </VemtapText>
        <VemtapText
          variant="labelSm"
          className="font-sans-medium text-text"
          numberOfLines={1}
        >
          {value}
        </VemtapText>
      </View>
    </View>
  );
}

function OptionRow({
  icon,
  iconBackground,
  title,
  subtitle,
  onPress,
}: {
  icon: 'localOffer' | 'person';
  iconBackground: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.optionRow}>
      <View style={[styles.optionIcon, { backgroundColor: iconBackground }]}>
        <Icon
          name={icon}
          size={22}
          color={icon === 'person' ? colors.secondary : colors.primary}
        />
      </View>
      <View style={styles.flexCopy}>
        <VemtapText variant="bodyMd" className="font-sans-medium text-text">
          {title}
        </VemtapText>
        <VemtapText variant="caption" tone="secondary">
          {subtitle}
        </VemtapText>
      </View>
      <Icon name="forward" size={18} color={colors.textTertiary} />
    </Pressable>
  );
}

function Field({
  label,
  value,
  placeholder,
  onChangeText,
  icon,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
  icon?: 'mail';
}) {
  return (
    <View style={styles.field}>
      <VemtapText variant="labelSm" tone="secondary">
        {label}
      </VemtapText>
      <View style={styles.inputWrap}>
        {icon ? (
          <Icon
            name={icon}
            size={20}
            color={colors.textTertiary}
            style={styles.inputIcon}
          />
        ) : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          // The visible label is a separate line, so announce it on the input
          // itself — screen readers attach to the field, not the caption.
          accessibilityLabel={label}
          style={[styles.input, icon ? styles.inputWithIcon : null]}
        />
      </View>
    </View>
  );
}

function ContactRow({
  icon,
  label,
  value,
}: {
  icon: 'mail' | 'message';
  label: string;
  value: string;
}) {
  return (
    <View style={styles.contactRow}>
      <View style={styles.row}>
        <Icon name={icon} size={18} color={colors.textTertiary} />
        <VemtapText variant="caption" tone="secondary">
          {label}
        </VemtapText>
      </View>
      <VemtapText
        variant="labelSm"
        className="font-sans-medium text-text"
        numberOfLines={1}
      >
        {value || 'Not provided'}
      </VemtapText>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { maxHeight: 720 },
  content: { paddingHorizontal: 24, paddingBottom: 12, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flexCopy: { flex: 1, minWidth: 0 },
  riskBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    backgroundColor: colors.badgeDiscountBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dealCard: { overflow: 'hidden', borderRadius: 16, backgroundColor: colors.surface },
  dealHero: {
    height: 144,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainer,
  },
  heroImage: { width: '100%', height: '100%' },
  authImage: { width: 64, height: 64, borderRadius: 12 },
  heroDiscount: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    borderRadius: 999,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dealBody: { gap: 16, padding: 16 },
  dealIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerHigh,
  },
  priceBox: {
    gap: 8,
    borderRadius: 8,
    backgroundColor: colors.surfaceContainerLow,
    padding: 12,
  },
  metaGrid: { gap: 8 },
  metaCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 8,
    backgroundColor: colors.surfaceContainerLow,
    padding: 8,
  },
  metaIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainer,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 12,
    backgroundColor: colors.surfaceTint,
    padding: 14,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondaryFixed,
  },
  secondaryButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  authDeal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
    padding: 12,
  },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.surfaceContainerHigh },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    alignSelf: 'center',
    borderRadius: 999,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  authFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  identityDeal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: '100%',
  },
  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    backgroundColor: colors.surfaceContainerLow,
    padding: 16,
  },
  identityAvatar: {
    position: 'relative',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondaryFixed,
  },
  verifiedDot: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  activePill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    backgroundColor: colors.surfaceTint,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    backgroundColor: colors.surface,
    padding: 12,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formRow: { flexDirection: 'row', gap: 8 },
  field: { flex: 1, gap: 6 },
  inputWrap: { position: 'relative', width: '100%', justifyContent: 'center' },
  input: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 16,
    fontFamily: 'Inter',
    ...typeMetrics('body-md'),
    color: colors.text,
  },
  inputWithIcon: { paddingLeft: 44 },
  inputIcon: { position: 'absolute', left: 16, zIndex: 1 },
  smsNote: {
    flexDirection: 'row',
    gap: 8,
    borderRadius: 12,
    backgroundColor: colors.surfaceContainerLow,
    padding: 12,
  },
  otpRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  otpBox: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    textAlign: 'center',
    fontFamily: 'Inter-Bold',
    ...typeMetrics('heading-md'),
    color: colors.text,
  },
  otpBoxActive: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  changeEmail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    minHeight: 32,
  },
  recipientHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  recipientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  contactBox: { gap: 8, borderRadius: 12, backgroundColor: colors.surface, padding: 12 },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  perkCard: {
    gap: 12,
    borderRadius: 16,
    backgroundColor: colors.surfaceContainerLow,
    padding: 16,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainer,
  },
  discountPill: {
    borderRadius: 999,
    backgroundColor: colors.badgeDiscountBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  giftContext: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  giftDeal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    backgroundColor: colors.surfaceContainerLow,
    padding: 12,
  },
  giftMessageToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
    padding: 12,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surfaceContainerHighest,
    padding: 2,
  },
  toggleActive: { backgroundColor: colors.primary },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  toggleKnobActive: { alignSelf: 'flex-end' },
  giftMessageBox: {
    gap: 8,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
    padding: 12,
  },
  preset: {
    borderRadius: 999,
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  giftIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceTint,
  },
  giftBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.badgeDiscountBg,
  },
  giftSummary: {
    gap: 12,
    borderRadius: 16,
    backgroundColor: colors.surfaceMuted,
    padding: 16,
  },
});

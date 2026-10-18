import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { CreateDealStep1DiscountStrategyScreen } from '@features/business/screens/CreateDealStep1DiscountStrategyScreen';
import { CreateDealStep4ReviewLaunchScreen } from '@features/business/screens/CreateDealStep4ReviewLaunchScreen';
import { HelpCentreScreen } from '@features/accountHub/screens/HelpCentreScreen';
import { strings } from '@constants/strings';
import { reviewFixture } from '../../../../../__tests__/helpers/dealReviewFixture';

const { step1, step4 } = strings.businessCreateDeal;
const { helpCentre: help } = strings.accountScreens;

describe('create deal step 1 discount strategy', () => {
  it('renders the synced catalog item, strategies and live pricing math', async () => {
    const view = await render(
      <CreateDealStep1DiscountStrategyScreen
        onBack={jest.fn()}
        item={{ name: 'Aurora Ribeye', basePrice: 12000 }}
      />,
    );

    expect(view.getByText(step1.stepLabel)).toBeTruthy();
    expect(view.getByText('Aurora Ribeye')).toBeTruthy();
    expect(view.getByText('Synced Catalog Item')).toBeTruthy();
    expect(view.getByText('Percentage Discount (% Off)')).toBeTruthy();
    expect(view.getByText('Fixed Amount Off (₦ Off)')).toBeTruthy();
    expect(view.getByText('Combo & Bundle Deal')).toBeTruthy();
    expect(view.getByText('Tiered / Flash Happy Hour')).toBeTruthy();
    expect(view.getByText('Real-Time Pricing Math')).toBeTruthy();
    expect(view.getAllByText('₦9,600')).toHaveLength(2);
    expect(view.getByText('₦2,400 (20% OFF)')).toBeTruthy();
    expect(view.getByText(step1.tipTitle)).toBeTruthy();
  });

  it('recalculates the member price when a preset is pressed', async () => {
    const view = await render(
      <CreateDealStep1DiscountStrategyScreen
        item={{ name: 'Aurora Ribeye', basePrice: 12000 }}
        onBack={jest.fn()}
      />,
    );

    await act(async () => {
      fireEvent.press(view.getByText('40%'));
    });

    expect(view.getAllByText('₦7,200')).toHaveLength(2);
    expect(view.getByText('₦4,800 (40% OFF)')).toBeTruthy();
  });

  it('expands the selected strategy and continues with the discount value', async () => {
    const onContinue = jest.fn();
    const view = await render(
      <CreateDealStep1DiscountStrategyScreen
        item={{ name: 'Aurora Ribeye', basePrice: 12000 }}
        onBack={jest.fn()}
        onContinue={onContinue}
      />,
    );

    await act(async () => {
      fireEvent.press(view.getByText('Fixed Amount Off (₦ Off)'));
    });
    expect(view.queryByText('Real-Time Pricing Math')).toBeNull();

    await act(async () => {
      fireEvent.press(view.getByText('Continue to Limits & Rules'));
    });
    expect(onContinue).toHaveBeenCalledWith(
      expect.objectContaining({ strategy: 'fixed', discountRate: 20, memberPrice: 9600 }),
    );
  });
});

describe('create deal step 4 review and launch', () => {
  it('renders every summary article and the launch dock', async () => {
    const view = await render(
      <CreateDealStep4ReviewLaunchScreen review={reviewFixture()} onBack={jest.fn()} />,
    );

    expect(view.getByText(step4.celebrateTitle)).toBeTruthy();
    expect(view.getByText(step4.readyPill)).toBeTruthy();
    expect(view.getByText('Offer Showcase')).toBeTruthy();
    expect(view.getByText('Limits, Rules & Gifting')).toBeTruthy();
    expect(view.getByText('Branches & Schedule')).toBeTruthy();
    expect(view.getByText('Aurora Wuse')).toBeTruthy();
    // The prototype's sample offer, branches and reach estimate are gone.
    expect(
      view.queryByText(/Woodfire|Wuse II Flagship|Garki II|~1,420|Audience Reach/),
    ).toBeNull();
    expect(view.getByText(step4.publishLabel)).toBeTruthy();
    expect(view.getByText(step4.saveDraft)).toBeTruthy();
  });

  it('launches at once and only reads "Published" once the request succeeds', async () => {
    // It used to run a 1.2s timer and show "Published" before the request was
    // even sent, so a failed save still looked published.
    const onLaunch = jest.fn();
    const view = await render(
      <CreateDealStep4ReviewLaunchScreen
        review={reviewFixture()}
        onBack={jest.fn()}
        onLaunch={onLaunch}
      />,
    );
    await act(async () => {
      fireEvent.press(view.getByText(step4.publishLabel));
    });
    expect(onLaunch).toHaveBeenCalledTimes(1);
    expect(view.queryByText(step4.publishedLabel)).toBeNull();

    await view.rerender(
      <CreateDealStep4ReviewLaunchScreen
        review={reviewFixture()}
        onBack={jest.fn()}
        onLaunch={onLaunch}
        phase="publishing"
        isBusy
      />,
    );
    expect(view.getByText(step4.publishingLive)).toBeTruthy();
    await act(async () => {
      fireEvent.press(view.getByText(step4.publishingLive));
    });
    expect(onLaunch).toHaveBeenCalledTimes(1);

    await view.rerender(
      <CreateDealStep4ReviewLaunchScreen
        review={reviewFixture()}
        onBack={jest.fn()}
        onLaunch={onLaunch}
        phase="published"
      />,
    );
    expect(view.getByText(step4.publishedLabel)).toBeTruthy();
  });

  it('renders the live review instead of the prototype', async () => {
    const view = await render(
      <CreateDealStep4ReviewLaunchScreen
        onBack={jest.fn()}
        review={{
          title: 'Lunch Combo',
          body: 'Rice and chicken',
          discountBadge: '20% OFF',
          strategySummary: 'Percentage Discount (20% Off)',
          originalPrice: '₦10,000',
          memberPrice: '₦8,000',
          savings: 'Instant savings of ₦2,000',
          vouchers: '40 Vouchers',
          vouchersNote: 'Pauses when sold out',
          claimLimit: '1 Per Customer',
          claimLimitNote: 'Fair-share rule',
          giftingTitle: 'Gifting Off',
          giftingBody: 'Only the customer who claims the voucher can redeem it.',
          branches: [{ id: 'b1', name: 'Wuse', address: '' }],
          duration: 'Until Paused',
          durationNote: 'No end date set',
          claimSteps: ['Show the voucher'],
          terms: ['Dine-in only'],
        }}
      />,
    );
    expect(view.getByText('Lunch Combo')).toBeTruthy();
    expect(view.getByText('₦8,000')).toBeTruthy();
    expect(view.getByText('40 Vouchers')).toBeTruthy();
    expect(view.getByText('Show the voucher')).toBeTruthy();
    // prototype-only sections are gone
    expect(view.queryByText('~1,420')).toBeNull();
    expect(view.queryByText(/Ribeye/)).toBeNull();
    expect(view.queryByText(step4.orderTypes)).toBeNull();
  });

  it('blocks launch and draft while the deal cannot launch', async () => {
    const onLaunch = jest.fn();
    const onSaveDraft = jest.fn();
    const view = await render(
      <CreateDealStep4ReviewLaunchScreen
        onBack={jest.fn()}
        onLaunch={onLaunch}
        onSaveDraft={onSaveDraft}
        review={{
          title: 'Untitled deal',
          body: '',
          discountBadge: '20% OFF',
          strategySummary: 'Percentage Discount (20% Off)',
          vouchers: 'Unlimited',
          vouchersNote: 'No cap on claims',
          claimLimit: '1 Per Customer',
          claimLimitNote: 'Fair-share rule',
          giftingTitle: 'Gifting Off',
          giftingBody: '',
          branches: [],
          duration: 'Until Paused',
          durationNote: 'No end date set',
          claimSteps: [],
          terms: [],
          blocker: step4.noItemBlocker,
        }}
      />,
    );
    expect(view.getByText(step4.noItemBlocker)).toBeTruthy();
    await act(async () => {
      fireEvent.press(view.getByText(step4.publishLabel));
      fireEvent.press(view.getByText(step4.saveDraft));
    });
    expect(onLaunch).not.toHaveBeenCalled();
    expect(onSaveDraft).not.toHaveBeenCalled();
  });

  it('reviews an edit with a Save Changes action and no draft option', async () => {
    const view = await render(
      <CreateDealStep4ReviewLaunchScreen
        review={reviewFixture()}
        onBack={jest.fn()}
        mode="edit"
      />,
    );
    expect(view.getByText(step4.saveChanges)).toBeTruthy();
    expect(view.queryByText(step4.saveDraft)).toBeNull();
  });

  it('saves a draft without launching', async () => {
    const onLaunch = jest.fn();
    const onSaveDraft = jest.fn();
    const view = await render(
      <CreateDealStep4ReviewLaunchScreen
        review={reviewFixture()}
        onBack={jest.fn()}
        onLaunch={onLaunch}
        onSaveDraft={onSaveDraft}
      />,
    );

    await act(async () => {
      fireEvent.press(view.getByText(step4.saveDraft));
    });
    expect(onSaveDraft).toHaveBeenCalledTimes(1);
    expect(onLaunch).not.toHaveBeenCalled();
  });
});

describe('help centre and faqs', () => {
  it('renders the concierge header, banner, topics and support options', async () => {
    const view = await render(<HelpCentreScreen onBack={jest.fn()} />);

    expect(view.getByText(help.title)).toBeTruthy();
    expect(view.getByText(help.headline)).toBeTruthy();
    expect(view.getByText(help.bannerTitle)).toBeTruthy();
    expect(view.getByText(help.topicsTitle)).toBeTruthy();
    expect(view.getByText('Deals & Claims')).toBeTruthy();
    expect(view.getByText('Zero In-App Pay')).toBeTruthy();
    expect(view.getByText(help.faqTitle)).toBeTruthy();
    expect(view.getByText(help.supportTitle)).toBeTruthy();
    expect(view.getByText(help.chatTitle)).toBeTruthy();
    expect(view.getByText(help.whatsappTitle)).toBeTruthy();
    expect(view.getByText(help.emailAddress)).toBeTruthy();
    expect(view.getByText(help.ownBusinessLink)).toBeTruthy();
  });

  it('toggles a single FAQ answer and expands every answer', async () => {
    const view = await render(<HelpCentreScreen onBack={jest.fn()} />);

    await act(async () => {
      fireEvent.press(view.getByText(help.faqs[0].question));
    });
    expect(view.getByText(help.faqs[0].answer[1])).toBeTruthy();

    await act(async () => {
      fireEvent.press(view.getByText(help.expandAll));
    });
    expect(view.getByText(help.collapseAll)).toBeTruthy();
    help.faqs.forEach(faq => {
      expect(view.getByText(faq.answer[faq.answer.length - 1])).toBeTruthy();
    });
  });

  it('filters the FAQs from a topic card and shows an empty state for no matches', async () => {
    const view = await render(<HelpCentreScreen onBack={jest.fn()} />);

    await act(async () => {
      fireEvent.press(view.getByText('Zero In-App Pay'));
    });
    expect(view.getByText(help.faqs[1].question)).toBeTruthy();
    expect(view.queryByText(help.faqs[0].question)).toBeNull();

    await act(async () => {
      fireEvent.changeText(view.getByLabelText(help.searchPlaceholder), 'zzz-no-match');
    });
    expect(view.getByText(help.noResultsTitle)).toBeTruthy();
  });

  it('invokes the chat, whatsapp, email and business callbacks', async () => {
    const onStartChat = jest.fn();
    const onOpenWhatsApp = jest.fn();
    const onEmailSupport = jest.fn();
    const onOwnBusiness = jest.fn();
    const view = await render(
      <HelpCentreScreen
        onBack={jest.fn()}
        onStartChat={onStartChat}
        onOpenWhatsApp={onOpenWhatsApp}
        onEmailSupport={onEmailSupport}
        onOwnBusiness={onOwnBusiness}
      />,
    );

    await act(async () => {
      fireEvent.press(view.getByText(help.startChat));
      fireEvent.press(view.getByText(help.whatsappTitle));
      fireEvent.press(view.getByText(help.emailTitle));
      fireEvent.press(view.getByText(help.ownBusinessLink));
    });

    expect(onStartChat).toHaveBeenCalledTimes(1);
    expect(onOpenWhatsApp).toHaveBeenCalledTimes(1);
    expect(onEmailSupport).toHaveBeenCalledTimes(1);
    expect(onOwnBusiness).toHaveBeenCalledTimes(1);
  });
});

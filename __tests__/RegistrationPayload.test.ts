import { pruneRegistrationPayload } from '@features/business/utils/registrationPayload';
import type { OwnerRegistrationPayload } from '@features/business/utils/ownerRegistrationMapper';

const base: OwnerRegistrationPayload = {
  businessName: 'Urban Grill',
};

test('drops empty defaults so strict API validators never see them', () => {
  const result = pruneRegistrationPayload({
    ...base,
    businessLogo: '',
    officialEmail: '   ',
    whatsappNumber: undefined,
    businessWebsite: '',
    engagement: undefined,
  });

  expect(result).toEqual({ businessName: 'Urban Grill' });
});

test('never ships placeholder location coordinates when no address was entered', () => {
  const result = pruneRegistrationPayload({
    ...base,
    latitude: 0,
    longitude: 0,
    city: '',
    state: '',
  });

  expect(result.businessAddress).toBeUndefined();
  expect(result.latitude).toBeUndefined();
  expect(result.longitude).toBeUndefined();
  expect(result.city).toBeUndefined();
  expect(result.state).toBeUndefined();
});

test('keeps the address and coordinates once the location step has run', () => {
  const result = pruneRegistrationPayload({
    ...base,
    businessAddress: '12 Ademola Way, Apo',
    city: 'Abuja',
    state: 'FCT',
    latitude: 9.007,
    longitude: 7.487,
  });

  expect(result).toMatchObject({
    businessAddress: '12 Ademola Way, Apo',
    city: 'Abuja',
    state: 'FCT',
    latitude: 9.007,
    longitude: 7.487,
  });
});

test('normalises a scheme-less website for @IsUrl', () => {
  const result = pruneRegistrationPayload({
    ...base,
    businessWebsite: 'urbangrill.ng',
  });

  expect(result.businessWebsite).toBe('https://urbangrill.ng');
});

test('trims whitespace rather than forwarding it', () => {
  const result = pruneRegistrationPayload({
    ...base,
    businessName: '  Urban Grill  ',
    officialEmail: ' hello@urbangrill.ng ',
  });

  expect(result.businessName).toBe('Urban Grill');
  expect(result.officialEmail).toBe('hello@urbangrill.ng');
});

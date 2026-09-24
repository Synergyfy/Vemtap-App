export interface BookingAddon {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface BookingTherapist {
  id: string;
  name: string;
  role: string;
  image?: string;
}

export interface BookingDate {
  id: string;
  day: string;
  date: string;
  status: string;
}

export interface BookingTime {
  id: string;
  time: string;
  status: 'booked' | 'available' | 'selected';
}

export const bookingImages = {
  hero: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAl7yheUR6DwX6PXu-LZ4cNT9HwzgJoFViDeFGFfamoR5iUd4Hoh5BS-4gQUhekn4wuKFsjSj0cfzjUGRiy0ycA9Rxr-DV9yqJgHQfu9oqwJnyvcrsk0grPxsoPNo5lLDVm50v6UJhHRmert518Bjwq47lwOAok7ppdHLhxh3SmjTTN65AlD59t7JmuWa2c-ywpvrz8fUMiiwTCfp02UKUgbk9qnm3ZKMyN_pErr5w34UTR9HFMdiIkng',
  interior:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCtXm_yeAlXT2VYyAS87t8ZiU5QQ8BdUxIpQ7KyPoL9JXpcYG3Wty6S6OoqKPw5Vat_rhlt4jvsasG75GdEwrkiMsOYmnOoz-YCU6_g1iZIXOWQnTQgZu_cZv4V2cmlSved1zrTxxW808OQ6QB41j21JI5FCs-h9bqHt7Sua7BrQMzC7pnkxeIMzcVyh7Ich44OUhKOu88mDdQNtX0kgjR7ZujlpPu92cb8R2kcysm2AyqRxxuP_XG9wA',
  reception:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBCEXttSehsmIpMSTYJrf_-okLk5MFXIAkGcpM35ACkc6ObYaDnwtbrE9Lv3oHUV1Ijm2fk_F_ihKkCctOypuZxVl_PLWVERn2EoKgfqqE7TojdvR2DUHJFbbIzvvnF3OOYyv9AGu5qsJ-3qeEnXGs27oPodI-ab7dXcfJzQMtIAkCkhyugbMW9jNEr9_QCU-yjKGCJIhsK2SORuNoTOPLLWftCgwAGvQprrJPkDFd-Q1yt04na_riNyg',
  amara:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB18reJGUH9T_8snKmyIFtaIiMR49aB7Gs6wfA5dEb9Fpnsu6A0ookTH4jJfJWXYEw5bz48TZKmd-0rRZK1-Y_VT0LWzZ_Y3L9dwosl1W9-dPX6Ub5ujPFrNi5bXS65JikqIou7ph0fHjWeJlBv_JTTebWo030h46-fGrpw4U_4IrTeuJC3RUBXODEgJGbYb-JQsDWA6vOJhbXQ1Edn8UlCSif1yPTxm3fgaHDjAQxmvpBywNMQ-VvuuQ',
  chioma:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuA9v2TFrdvKRXGGF85l0t6M-KKJxARbic0PG92BPLB1xFkWPvHnDe89TVbObbjmfq0r-kkKPquWgUB3fPjIvFvXYZVIKfSKRWc0THMA1m6Mt_U-vwBYwaw5cNrIEO4GgBBkimpit5C4XGHvMCi5fbuVdPtb_LvASV5sCtc_4gz33L4l0fiZVwRqKmpPF0LIzhboFcny_6W-0hMwzR-swsIFvEFJhtKhnmhAs9D74hu9qDO0JOfkVCtRcA',
  confirmedAmara:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAJdx-C6sRgqYAKPjcDbuq1lpPCD554SHn7RBIwhGUNOOvPU69FMKIeqbQ3vFwNG2ednHU_v4bV19YqUY5XyQFygxXA8D77gRFgNgIuoJcmRAByGUhJ2xvDZ4-Q4hwgiZXutTtcXfxEEq3cct1MIcX68MfiEdDtLqpG62wglhBp3d4q0ED5ZeaDtSFfAdGo_Asq8VL3YNQ49L_7no0ZWCoGYSfTlUEA9nuOaoRnwOiuZLPZ3nacOdDfSw',
  facade:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCNr5SV3CNApSCAIJ3kAhmaZVBjs-OQy1Yv-65iIlZamjAiE34wo6vYhi1YfjOheTF00uWz2QDWTk8jyb0StzFaf9-bxqB3cwzI06h8i821qeSFjkzYjIeWMCxlVn9yOb5gyb1yDL2ud9zl-NnUgD-QTmOQeoFcR4gHKOxYLNkLw-Tg8-SAwCYe6Imbcdd6-RNiINHtGXI6reAM2Kyg2SynPJNZ6ku_L4BIffzSeZ5i4JnJO9v2V8wDag',
} as const;

export const bookingAddons: BookingAddon[] = [
  {
    id: 'led-light-therapy',
    name: 'LED Light Therapy',
    description: 'Reduces redness & accelerates collagen synthesis',
    price: 4000,
  },
  {
    id: 'eye-lip-contour',
    name: 'Hydrating Eye & Lip Contour',
    description: 'Plumps delicate lines and brightens dark eye zones',
    price: 3000,
  },
  {
    id: 'aromatherapy-scalp',
    name: 'Aromatherapy Scalp Massage',
    description: '15 mins organic lavender and rosemary tension release',
    price: 3500,
  },
];

export const bookingTherapists: BookingTherapist[] = [
  { id: 'any', name: 'Any Available', role: 'Fastest Booking' },
  {
    id: 'amara',
    name: 'Amara K.',
    role: 'Lead Aesthetician',
    image: bookingImages.amara,
  },
  {
    id: 'chioma',
    name: 'Chioma B.',
    role: 'Skin Specialist',
    image: bookingImages.chioma,
  },
];

export const bookingDates: BookingDate[] = [
  { id: '2024-10-16', day: 'Wed', date: '16', status: 'Few left' },
  { id: '2024-10-17', day: 'Thu', date: '17', status: 'Selected' },
  { id: '2024-10-18', day: 'Fri', date: '18', status: 'Available' },
  { id: '2024-10-19', day: 'Sat', date: '19', status: '4 slots' },
  { id: '2024-10-20', day: 'Sun', date: '20', status: '10A–8P' },
  { id: '2024-10-21', day: 'Mon', date: '21', status: 'Open' },
];

export const bookingTimes: BookingTime[] = [
  { id: '12:30', time: '12:30 PM', status: 'booked' },
  { id: '1:15', time: '1:15 PM', status: 'selected' },
  { id: '2:00', time: '2:00 PM', status: 'available' },
  { id: '3:15', time: '3:15 PM', status: 'available' },
  { id: '3:45', time: '3:45 PM', status: 'available' },
  { id: '4:15', time: '4:15 PM', status: 'available' },
];

export const bookingServices = [
  {
    id: 'radiance-facial',
    name: 'Deep Hydration Radiance Facial',
    duration: 60,
    price: 16000,
  },
  {
    id: 'gel-manicure',
    name: 'Deluxe Gel Manicure & Hand Therapy',
    duration: 45,
    price: 9000,
  },
] as const;

export const formatBookingNaira = (amount: number) =>
  `₦${amount.toLocaleString('en-US')}`;

import { strings } from '@constants/strings';

export type GlowServiceCategory =
  | 'Hair Styling & Grooming'
  | 'Facials & Aesthetic Skin Care'
  | 'Therapeutic Massage & Wellness'
  | 'Nail Care & Spa Pedicure';

export interface GlowService {
  id: string;
  name: string;
  description: string;
  category: GlowServiceCategory;
  duration: number;
  price: number;
  originalPrice?: number;
  discount?: string;
  badge?: string;
  imageUri: string;
  imageAlt: string;
}

export interface GlowProfileService {
  id: string;
  name: string;
  shortDescription: string;
  duration: string;
  price: number;
  imageUri: string;
  imageAlt: string;
}

export interface GlowDeal {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  imageUri: string;
  imageAlt: string;
  discount: string;
  badge: string;
  timing: string;
  save: string;
}

const serviceImages = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDTKU-AxMRHT7DKG59bqQ4q6fFO7lluXVMkQ3QzPbz4l1JvyopQFjs7C5srQOW_ZPg8M20ktQ1jwbyo03LJYSLmaZ593pQxfY6VIH7U3dUWSzaWne2e_S7hwcMQH4CTQARmMDqlqclBnlmFHoy-edfEG3gyZ3B8dSIqINUCA6r9ML_2UXV0507NG-vTimWzvIY_7Ab9pGWnQRfYNA0VLDu5NY9UUGbbUOUs2wyqwddts2VxwhZQQx-qhg',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDex99fYp79O-ZAps4trALKtx8rjwER_FVRHYVhHgdd2tTtuU5RvCS4EyqcDJy6NwQul2EY2l4wpj9nWZtukojQOSxd5Ni11Z8pKT8jcJt1HEIDxm79veujYy1Biy4wysQRod_-HsR6QFZNMYJfB43s5m9JldsxkwOC72Wa4Qm4VlyJYUeB0mJIVpvZ3uwqj6Y39QZ7MVGlwDgtaFfJMgo9CI56lvst_IsnSfc9MZVVfFuKTP-rU2Bh9g',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBcnCYlffdPEU2h6vbI-n88g4F9ekT-wI_7tjfXg181Q9-CIKGP_9FWmS575bxrsaNJKkjIPWOhQbndXR0uGpNtgU5uCGJ7X4Xz0_AZYg2tcRfbRYTm3Pdw8HyoySLT1STxZ9AZmClmqdGUAL9Ek5QdgyEBYqArz05F2pr5H9pNOU5lWFrg_a_r4Pzrn1vIU1SU3r5XvFfGwDlBV5Uv_Bs8u_cAoF4jOH6uhIrO8gZBqbi_ISk93qZikA',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC0blvjw809gZBGSW2dCZjFZ-vLT2HIa42Mzmq5ZL0Kbu6ZEwI9ixTmPdgaqUXg5C900aFgoKCQHJGorsgzJhlRhVeCrVr_4xg04D8IOzNrzZPeneHz2nYZ1ZrgnwY7TcfWrOwrH9_dGF_QSzhydSMhXZ6PdLrgyIWa7CZTmzfwFmAfGIMg0wT_D4ulNkGW57A0JtDm3pUi-4M_PXpucDbmGuMSF1wzW8FMSk8CyiBazMWUksGwVcXPPw',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAFNkzw2ui4pDyZwmx5Gj1Sqy_fImpZgmsNK7238ERl_NZsMZZhxSIkhaDm8y90O5SOWkmrJHcvTITELaqyq7lqH0cPE91hJ5H1sKdf1TdDBEO--PqhaQV1IVMQhezTP0WyUcQd-hqm1BKtXCJuObiKimfpANttkJHt6YzUqE7-vasc14GlWMKWWqDovVmP_N8872Pm4ZOPHtPoWWy2GbFZMd98DAS8Qsoav0sZRMsE3TS6CL4zDEo2-g',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAZi9BT0EdwdZ3JBs501JUXqV8g14Sko7R_LUVgUGk5YYadpJTtLJrLvCNCTGmfzc0YRkWq-RBeF981wFAXGguHKW0FJJXIR4g2luNo6tnk5CxKYCyZGAK5lPNJ2pB5gxR47xMHRKBZUFkG_0gxR9pVERz8rsGmkY5BQOKlCugIl0H9QLhusF33swMzTew7V7XcLcYHTo2wIzDvXdeh1bYyHvNH-rkyEXxx9lIwWK8HOYz6QbPn3eyJKw',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBPL6AvYPBm_0Hr_9TFNii9IXNZcgE0bIglDybCvcYsJ2Jzm7TBcY5tckwGn2juY6OjhFZYuLOth6VULtLmRv7obdwK-IgrTWQBVcbBUrDcznWv9vjkfzOaOa1rHNMc7PS6o6jmJQUPaF1Ea9S70zB0g_IXxcByIJ9CGIfadVPfdBlYA5ay5t17HT7auWImuzy9B40RaHD1krWiVJsZ_5XNSQIvUlM9sPvqINf5QvWBSwwmp1X0Ih-UIg',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBrgfKsQmN4EEq7U8C0hJ3Qm4t_NVw0_FAiqQ_Vu3ggJGR7B6959AdKQMbFh_RXMjjEdYGHM_D1Sc2kTI58lu7_AIIdPEizBY7ntKMDeHf5ZZc8Xb1QJyy2qdKNtewdXZ60gbFLux-P6ikSwvWorwrSIuq6lycA1NySu3KZ5eCOSwrAXHAk-TMTBJAiYzFxGmQjsBLPaWxY1IZlEvOu5t4YN9Cta_hViw-qxfm1_KQvw0-5On3omlCG-A',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBZ1L5kTpdVOvN7k7AlmLH517hf8kFV0nIe0ZgP-empIhMuqoRVdCWmDjqVvH8d_pa-zsvIz4BVaVhvCRqe8BL4xPuctfMGCCx1lfBS-MgnXyEKQowteB4Q9CrUOhn-Q8rH-_QWhBqzR6ochqjjeux3xriVrQ6WvPwDcgA5HFrDZC2KdYL3MGHedQrjQP611vJHV7I_vdCw8IWi-kGWDaw6eE-xJRCXq6vOYJBMld3XV_oUsHWgfd4gHQ',
] as const;

const profileServiceImages = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDMYnlB1B8tkl4m9wo3XwQRfacqwnp0IfIf4aYt85kHms4qzwGpUFXkOg0oV2_dJyrBPy1xA6rgrGAJoZEhwbV3cGKkCU6NLzveQdhdQMYcO6Fu_roRhk3cwbrJiq-f1MMKlRDqP63xHiLQV5-fHK-dXGzQKu6lK4eoHT1dmSjKJ4V72beperMoPWzsL5Yy_FGFgbx183-1nOu_8g13d3qLDTDGgdmB5ZciIA5Ib8EP55u8qMk1c9uHjg',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuALHXtynCfv9kGeBxuvJKGpLlX9SnkxYRwver_NqBJAiffsDf5gBwfnkG0gMeUjNKuHl1L2LlT1RF-QUx5EhyF2IyGx3HsEsa6UqksO06wmUS1O0zOv2zXDkIGpe3POPaY85qKKumvMMuTd67ip5s43qYpNAuO-axuiu2sMkRBCQNUP7MBkZlcNmPVdyJqEkYyXlZ2v7bYX1JO4ye-HapTEcf8NHGkUJIXoSSvLvfFn3wOVsHpJTNOXoQ',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDlQANs_DfiCGvApbJ2i2qH2G3fn9FbAF9cDzchyLa5XTKbmkI0PlJGrCbaLYvg55wNGxCAKHPa8TJSnY1tWksp5y2i3RXoun3AiH13vvoGTb4EV_CZc9UgEV_q7jpRethrWuvlX0qrBMPlRLVkKf3wvSGPmbcblIqdlKx5yVuS6H2Vy-DzeRCRgSD3PZleuKQp7fDgFvjjDm9F5-VhD1t8Seo9QJFzlEVPtx6RO_NyfYk2sbxNiRuKrw',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCsMxh_z4K-NT1Q6yN9T-vnfZcCcj1yA1-V-ivur3ZmJD9IQfp25Six-syTREYM4J1oTB7_kAaaNC3-X-kZ2iyVTm7WqgclCJsCbxjuXlfzKHiR2-aGUUATKrut0NBQHI6XqXq577_xzVqyrf6H-UDneIdjBmpuQbFrpqllmTotwk2ieZWby6HZdkpqzRd4TjXgF3oTl8U38_COahWkhh_v5cve3En53o7nmpNZxjzDXSAvOh04QTY4OQ',
] as const;

export const glowServices: readonly GlowService[] = strings.glowServices.services.map(
  (service, index) => ({
    ...service,
    imageUri: serviceImages[index],
    imageAlt: strings.glowServices.imageAlts[index],
  }),
);

export const glowProfileServices: readonly GlowProfileService[] =
  strings.glowProfile.profileServices.map((service, index) => ({
    ...service,
    imageUri: profileServiceImages[index],
  }));

export const glowProfileDeals: readonly GlowDeal[] = strings.glowProfile.deals.map(
  (deal, index) => ({
    ...deal,
    imageUri: profileServiceImages[index + 1],
  }),
);

export const glowMapRegion = {
  latitude: 9.0831,
  longitude: 7.4885,
  latitudeDelta: 0.012,
  longitudeDelta: 0.012,
} as const;

export const glowCover = {
  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDLDdKe5mKvQPhabygR_5AN4ktbqUHNAvf13lWEr_e8muGEGWWtCg59l8tMJ4_nl6z7mczhw-UuP4rWYr3Kx00ai-hHAP68sxQ7bYo4f6FhHh4o0pj0dt8_iII5HIk49aKWstPcAbFNWeFOr0FZkT_usOCOaS6DhSHdPf-2BYi-6YXZ4ijQlNZPfKh4iCvM4Z-Uhl9xf5nVYkFbr5E5d-5rZb3l9JuLCSQGOrvoQu-YZKxxDueaThT8Tw',
  alt: strings.glowProfile.coverImageAlt,
} as const;

export const glowLogo = {
  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVmHE_G4hXSQuw2DUq1zwh8QpXYnrNJI9fhvxJ6a_soe2LbzyUevbeP-5kN4Xvukfnhfbq5js6uf5xtANMkOCWDqy9lBo0_rq5uP13m3PBRK5ASS6rQotahBUownhG-dhj5iXNdgzp2pKWuIWhJtSXl4lwmHChQB0CtHhVwZoC_GlOCCm0riYOtkltPXkVLNt-6uJa5g27NUQii19e7IKtq7UDwz_ALUhXkheuUokmNJxm24pRsB5Q4Q',
  alt: strings.glowProfile.name,
} as const;

export const formatGlowNaira = (value: number): string => `₦${value.toLocaleString()}`;

export const formatGlowDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (hours === 0) return `${remainder}m`;
  return remainder > 0 ? `${hours}h ${remainder}m` : `${hours}h`;
};

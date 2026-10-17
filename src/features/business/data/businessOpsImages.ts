/**
 * Media for the business management surfaces (profile preview, deals,
 * catalogue, branch details, CRM, loyalty, staff). Every entry is a stable
 * remote URI from the Stitch designs; screens reference them through this map
 * so an asset is never inlined twice.
 */
export interface BusinessOpsImage {
  uri: string;
  alt: string;
}

export const businessOpsMedia = {
  dealLunch: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAf5E55exAno6vi2RgrfOBr3J8tcEnX4s-H3JRSMVwfA9qIWt00vwq679dz77PHc5S81Bci9xsgfS3xy8qjpD3mbE6_ZyX4fY0HJB14SVtugGGHVKkutmYlx2RlaVBVnv2p5snhB7XAor3tiLEh5H6jCb4M9_zxCvDzjWjELm63xMnzHHlCfYsPM10Bgwi3a8WAovOxk7rg4S7GcSWfDhgpe6ye5OmV7BSx0H5T6Q4eHbNcpRFo9xt2g',
    alt: 'Gourmet lunch combo with steak, fries and a craft drink.',
  },
  dealSpa: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAF7MgEpPcGPfgxZNE3aIyEigoTFllU_OV3PI-f80Lc3Jw_EWFE0J-XRn9miq9i4mUtfwq1bA7U23WaPuJUfJJQHx5OeVJjqUuIpEescBGaPlZOh7cpnhTfUOHlAwtS4qzv7MG9Niq4pFCMRiHWm4Od9vn0Y0VyFHpT1fl0hsQqylGG_TgXt29hhbFdlp2Y9PlPoTDa1eUcT6lN8l3_HqIzhqbI0KG4xXUdx2i17-RZcZQeZdzptVBgrA',
    alt: 'Luxury day spa treatment with botanical oils and warm stones.',
  },
  dealColdBrew: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC6i9xI3hPBd2ZUMjckBw4bSJr8_nVveKlfyhvfBM2ktGBYMSbzf4S5FQ1yovHJThDNB9S9jGa9oi8e8KtbufkpyeMLTrh9myg8Vx2-nR6cm3sLgPrUziNBPDuJyjzWfUB4ngcYHJ8PMzosp9yntpqzhB945WtX_wDzd30599We4Q4Li_kDtJZZQ6Ei4j7pXGofVyv-mK4fR6gjiU4fL6M7WR9BO7XyLsTMMBKjsOuGW2cyPn83-u36cQ',
    alt: 'Two glasses of chilled cold brew coffee with oat milk.',
  },
  productRibeye: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARmJwFGfykpJ12DQzKlrQ8nVmyn8furX9pmPfeq0vBZOBqfFGKVydCleuSJuB8Qj_Ds2S05O6Cxw_XY0slNJfk7PFgId-JaJunrDffoTR6iFLmaqVMhtrkjXTNXJsyGDuKMzYh-l00MNsbSQ_nqi5sKedR-mB0eNiw6VMHQoK0gf92ShDfqv43V59PogUOgn1uMBFmaT3DJlbzEOsKe2hNt8c',
    alt: 'Woodfire grilled prime ribeye steak on a dark slate board.',
  },
  productFries: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFufVae8sCll9rbLZkxeodDlR5es3rrONRF3D7Mg6O5Ucs__BoVU2m7mfcubeTXqgiFtRghRqVfQ1YiABbmerhjTJYgtTNvgqd97QZAF_583NGrSLXbM1y8FzkNigWQsV7Ik5DHrqgpfxoZKa1IbgYCOF9kRxYfwW_z0S-VAvPFUdY6gP09fmBqefSc0aDcyYocvKBaDbyiIgJNpZtSkT8hTxShU-0_JEWz1PBUTELFFKq9zkH0qGk4w',
    alt: 'Truffle parmesan fries served in a metal cone.',
  },
  productCabernet: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOrpMZ2tE1IF6wXYk_WRbuh-nr_OXyZ_NYzYrlZyIvLbwEkGsoczgb5WdVMx0ScErpEiCxes-Ph7_StOkqCcOSNI603EepJAge4Sx4-IbPYyq2o626Vh0lVOuFGhZH0JkeWdU6VABuoo1arewJb_YIClAt0wBXuH8Cr8a1XJOX7w483G1AZm0pC98C3qcPXHl4glcQnDE3AnxqJpCpoiY8g93NFYx0T7zvEieIpmX0WDMG8FinKKouYg',
    alt: 'Vintage reserve cabernet bottle with a filled glass.',
  },
  productSourdough: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAHZPSmQ7l9MxFIpAi2ec1zxKdMx-LEvgvykjEnJc8EmIFcyt57a5kDM4cbPe3K0J6oF207p7W3KqlSsl35xOLwQWi09gNXhlj_co_3MPGX_DkzGrMsfDxZWexqc4KCZ1pEJEVdrlwCtI0nRh1xIIwjyHtuC4YurTt3WzIT0Ep9SsGIHMJ4wAEwOC8mSUKgSicsllgW4pTfDi00khcwXqXt9PrprK5aAy166jls4Mmh2AcAIGBwAiy9w',
    alt: 'Artisan sourdough loaf with garlic butter.',
  },
  productRibeyeSummary: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8cD-H17QAO9FEIfrboS6Fl4mR52ukN-tHIZyMBooU46va9p8B4SUT7oJb-tMYAk2YQJV0vTOgoWjXUIvFoZO-7p6tnmfonoOAo6IIa9lNv1plWx4JpF78rd2uvlPrBoB9JgYNU2OljMq4GDtmeniIpaphl1ccce_w-XBCtqy4j4KXuNx50sZxcTduocQs99NVorVdZShNPQaXaW8e1vXIyLG7FESnO7B41JWa4DnkFjhzE-CymcjtYg',
    alt: 'Woodfire aged ribeye steak with rosemary and flaky salt.',
  },
  productLamb: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1RknnpRrohRVRrxJS-EL6rPl9BnX4Gi_xV404W6oKZAjbj80NN1ihdN9V11M3lXCvkP9sE_2l0mbX1sVzzVyekqTixTaBZdE_4vpKPhO42FXYohRt0z8Y5NILAZ08lK03PfeMFg5_p1zBz7Zr-kHX2Z6DKSp_moFNFFHXOyD63l3QkVEHrpV86PP0VtEsixxkBh5HIfTvigumE_6QX8MDPaw-_W8DeNHNfZuBk3jAwkJ7J6Nq3zP02g',
    alt: 'Woodfire grilled lamb chops with rosemary and smoked sea salt.',
  },
  dealLunchHero: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA1_Z0LwG2JcNNG3mNfDG_T1MIlMoIFbHIhdxxbnnyI-PuSix_NRMDEwlU5rLq-mBlfWYXU5wHpbbsf74yYS_P98kOJVchxXXydUr1CF_smRk0LVgK5jqGX6Viv2lUD-0Od8WTAIWUTueL3ptTJsRMvohWrqzMPKkw4K-ptvDBtCy1i9Qqb16pUgfUdX0wbDH-36nLUw9ctdKYEudfKPAb5hLXEAWmj_aw6Fkc1e3Oj79qrMQYeVgh5rw',
    alt: 'Prime ribeye steak with a chilled passionfruit cocktail.',
  },
  itemRibeye: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWkXAPtK1q1vO4NHMZVNriHUzoV2GLucpM3GshzR3Vf-uh7fye7AabcbOBPfpUMpIQAmsX8F3vHGeoOYtaXss8aCUHw__XIX2JbEBAaKoZ1Gn32EVdEwS6ebqICoUXJC7oGOc0T3Spb_ezioWqn1G9iIq_doyDKNDcVHnOQb1-e1mawA8tM6QPdQ8bG9h_Yw94fiUPe476uiGcKjDqOvhBlzOsguXC5lMlGvSrESEJDNfChL2YITwv0Q',
    alt: 'Charred medium rare ribeye medallion with thyme.',
  },
  itemMojito: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC30TOLTYVASe7u5wL3wVhAqPwIQ3byMvBrZ8Ys7pQAzMoqHjIwmv7rMqALEG_pNTocrM4bXwsXsJzUa6yxkqyhbHUffOpsQ5YtKkZQtmb1mSUmbawwRywAK6kDfEK4G127mLEBkoYw1C5aj-JtY6Z93FwFxEty4elS4_ny678PDHXXHF3sffNv5FjgxuTAQQf45miBGY9Ezgtw08Nfx76YPy6HcvHi4I2Skf-EnX_5be3dfkFMrp6hwK',
    alt: 'Passionfruit house cocktail with mint and crushed ice.',
  },
  serviceFacial: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCi3_Zc8txIrZQJPIMfB_LiX7dHSHeLXTUSAVRKZeygGoDgB0T1T4775Xu418CkX_GmR6zTUr4I4Uvi55K4bfTpjrG8pV1X7fdgsEXl5mRj5tUEOpzpTKg7wiPq0JcEopFr8Ok1Abq-pPdCazvT0mpF9bwiRJBdhcYzptPfqYAbfqTZr2_6tKGB6pyKBJ0xBNpS-6sHFTjuADEfM1xBMg02OjcUfIqlTsBTUQbw08ZurnEEQ2ZXaWY6SA',
    alt: 'Spa facial treatment in a calm treatment room.',
  },
  serviceManicure: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCIAaSKkK2O2gzRD1HTAm83TUXluDByuG6Adyl3RDlp7-5LhihTm5tDrSZdU0bQ-8h_eroTFrqfG26nmZ0U2QBRdbvkEntGUbKv7IfY1Pm19KETsL8y-PVJfltkJkPIAmxHq9LFPrSENokLTkE4yvAdoXYOW',
    alt: 'Nail technician performing a manicure treatment.',
  },
  serviceTasting: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBCEzxKxJVj2ZzFVUY9uHjBm9IS2FhcmFjdGVkX2NoZWYgdGFzdGluZyBtZW51IHdpdGggc2VydmVkIGJ5IHRoZSBzb29mIHBhcnR5IHNoYXJlcyB3aXRoIGFwcGV0aXplcyBhbmQgZW1iZXJza3VkZWQgZ3VhcmRz',
    alt: 'Chef tasting menu plated for a private dining group.',
  },
} as const satisfies Record<string, BusinessOpsImage>;

/** Deal cards, catalogue items and CRM rows resolve their image by id. */
export const businessOpsImageById: Record<string, BusinessOpsImage> = {
  lunch: businessOpsMedia.dealLunch,
  spa: businessOpsMedia.dealSpa,
  'cold-brew': businessOpsMedia.dealColdBrew,
  ribeye: businessOpsMedia.productRibeye,
  fries: businessOpsMedia.productFries,
  cabernet: businessOpsMedia.productCabernet,
  sourdough: businessOpsMedia.productSourdough,
  facial: businessOpsMedia.serviceFacial,
  manicure: businessOpsMedia.serviceManicure,
  tasting: businessOpsMedia.serviceTasting,
};

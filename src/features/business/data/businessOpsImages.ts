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
  profileCover: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBp6rBry6k7jRuALLMX3HgZXGvqhtzZ_RWaMH2XTtAlrpg3owX0m2y22WAOXNTAgLc0QX3cH9RlVNxX-zngWF41Xyu3rYhudg_nsT1QuOXEQfmBadedCMN2lBJmXF5NuNSA9eK3HyXd0jJhd1lfpvnwIUdHApR6IkGaPJWM7wv_jMSsvR9XgaiHHfSHRTkNB9qO4r1xoCR4OjLK_ii8T7aV_6ukKFZ__LwSkCVT1aa_5Ie_1BUAAM5xvg',
    alt: 'Modern restaurant dining hall with warm ambient lighting and wood tables.',
  },
  profileLogo: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQTOcBbqm-ewMAwKsOwDYezk7UGHK4W0l3XS2IEWoQ9z6y1vCvMTl4ex_eMJzJgKuTqxlsNGT-eMQ247dHsUnlj59wV__QeG9jYwUXezMoiVW9RJ6L9l-hWh5XGWdmklSs5a6F-LXxUTR2j3HeaUdwZ9xMrXQmS52OL6-_AiSsa6uzUSLL9uxEKgHN-ut3nycLGOujLm3ZMPCatyV2eBY2yId7qpmtBO_cX2z2c49Nec3nX01Xej1KqA',
    alt: 'Urban Grill and Bistro flame and fork brand emblem.',
  },
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
  rewardVoucher: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArj6yk6hsx0SB_tTLcO72CYTnl-M3Jqi7WJCuMKR5KECsCxs7VvUETPG3ckbAWJIVTxTqfYyjkxX6m60gGjd3TJRjT6GRMq1yqHrvwrgWOjh6u7Bxwm_qEZwHm2SvSot2LGkzRTGPKj1cqfl_mdz8M5Uy9wLVkoIIvMCZ1YZeEECt1GOHqVs2eYOPN-c4oxVouZvdXXkZ9VDGD0NLDsQd0IuxyUSfO6plhxeCZ1ntRlAxzGs9B0kVGwg',
    alt: 'Restaurant dining scene with plated pasta and warm lighting.',
  },
  rewardDessert: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpHOuLbrh0SodwEDc4Dzz5A3ZZrq8j8Ym70jeEXOtIP67hVtqxSa07Pz303OiQSg79dAZ51ZVhSDbHg9-JwX6uPH8C7VqHXvwEBj0Yd4jlAsKFmz_oN0u57PEHsl73_60_eXPMI8rSdngZQ2gwdoRNsmufjILAoLqWWQWLWVoQ6BU-IRg4MQUwXMd9VAYF31d2NLRP0HB7H4j4Hv7BQgnUAiXE5l4eGjJHse8j3HyA9ZfZAX-9Q_v4bw',
    alt: 'Artisanal chocolate layered dessert with gold dust.',
  },
  rewardVip: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAn_m6435uEgEHXB3WfwDOrseajkH4MNnkRPDgqmnPNAoW5jeIEgfMxMVne5gkXxeLY-RDnLiHwzBpTR2ZGPTZd4NuHlJZBZrlRiVhrEzUBuW1t7dn3JFNzMg9OwulJ5mdfnIo7VpYPnHofzFfks9VDtu1PbB4a_ZskoZRtHzEnrAvZNuObw61h9f0jD1jgjoBzwnrlCK7MEDEB6nVm2ueo4bThJOzX9tyUn0_qdiKKfAcRWPnsl3GMPg',
    alt: 'Rooftop lounge table with tropical mocktails at twilight.',
  },
  customerMichael: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBHPBQ75zVOpQtlg67YMogNBNY9Bo79FcgOtTqFI1mj9Ps2i-ZcQsR4Dp9PcZe2S_cuZ0xBNtAJMQeupzPJ3C-Di612GXoDWlNfERXLQkt59OIvUijFCN9zie-_gY-Ye3BwWqojP7GwgXKpNnIL3U1Oz8DuqgJ1gZJJhkUix3btZTzIj_Vw2h683qg3sYngh-fDXVv5zoDJ9Je5cfvHg3CETCTOedn6-WUvesoqRFySUgtoBdqWeO_Lg',
    alt: 'Portrait of Michael James, a smiling professional customer.',
  },
  customerSarah: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlMEwIQkeThXM-Eje4uQyTuojl4AHw-h-qy9koTVpFfgNAAjdIFjRHVYUAomiz5284s8HFCGxXHUKKqUA1ZMgQETBRTu6aLvMMo25yl4LXpnjnBbBMDQyvkxG5LVsOOGAzxYBh4T-qY2bZjRWkwAXz6zQ2EwDonf0CxLTAHOBSJnqgTyzTvqCb7kG1a5ZynmGv-F-N-yK7DPhwEk4CRSlPudq3lKN_8mJ8Ugz5HNlW3FDTq1Fj1mzbwQ',
    alt: 'Portrait of Sarah Adams, a smiling loyal customer.',
  },
  customerChidi: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFbN8MGpuagizIxTdzvOMu3Zc5bkntg83-QZrN6WojbaLUaKNyCqqjse7VwWXCNlA99rQpiS-oT045xpU03s79UpO-j3y233VSbnC-afY1oX10EJxU2gkqnlFeoaccR5YtaPcyVB6-Gvmof_2XgqNiv-ti9aCgePhfPOMwzm5wdrUS83Ff7_DoiI2V8CmZJ3pkA7AeT1mepXIVATTbMOfvSd1ChZR4tz2XSpDVzcYbhWcHyoQCiQZC3A',
    alt: 'Portrait of Dr. Chidi Okafor, a returning customer.',
  },
  customerAmaka: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdlxuVyN18lB2PxTAX-P5cQxo0Pd83Cpi6BboLwRaUgXo6I8GWr8rr_WDLvDbgWfFVV5NvM1sx2UAxIgVLS8IpGbfXdOyzFmEG2D8WjrmIgaXhYs0BdJoeo18BCBag9-3FKreJvlrSMcBDcl4A-2ktt62dDxCFTDQhvVnp2JYhH06JtLrx5kzvUe4QyWdfgir-AvXXiyJXPwj05DizkcEGiwcbPF-Az58Zw-9aHzg44TlCAcfWl7hymA',
    alt: 'Portrait of Amaka Kalu, a new customer.',
  },
  staffZainab: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9hO4pxYCCeJ91-LSGdXvtWQCB20Vb9wvo-ubcrVcHvnWU9nKrKUcJCK0-WgQHwVCKAqfnSO71_UejA-uGoRKEoCRljGiyBQWLVkk4UOBapo7fiq3Ppk7fpwLZUb5tzIQwouoX1vCZisrxyGKyPtyh61WhshdT6xslO5T-NCMrbLhplGaZEcxdWag5mkhuiIv_3nRNgYLotXTK4yi5ZcpA66bP3yxrHhxz9VVlxZ8g2ldPyV9xQP9u4Q',
    alt: 'Portrait of Zainab Ahmed, the business owner.',
  },
  staffJohn: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAs95wClFmROxgiGGXUrOhafs3Uydk7r7n4DDtasU3xI9pBJrVP0Hdh9mUhBvmVdA6XgPdvq_AzbGEPhlufbIEebNV6wxQYwDGa3NRl_E6z5fgmYZ2nyN4jmI4MfH14s0XacGpkzwAklxfPC5UtBN-vfwQV9t_rI4lML0OiIZQQR_hoIEm_s_t_QfLGnwec-hZYcF2XutB57U6JGJy7g-vo12Rp1u2PK77VLaRNimVAy459lrgLik2pxQ',
    alt: 'Portrait of John Peter, branch manager.',
  },
  staffAmara: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCO7yZzv5pz4pz8XRK8L_r-2n4HinvNRnxSsmSEdLrcFJ8Eo13tGyHJ-ek4VaTYaGHzOxbQqufHsdcPJ6Sujb2I9sF63AbRp0GPjMP-zEjK3DOBZMH8GRgDC3K5yTLSzv2Rzv5R9eNpkelzxmM_dshv-61nntxeom8ARUXXXuCDdH_J7UulV9DHUij__eHSVWumlG2Uf1dXRQPtX9U22O7eubvPQJZyoB9N2BswKrEr41rTX7UUUTr8rw',
    alt: 'Portrait of Amara Kalu, service manager.',
  },
  staffTunde: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACQtbLCCK_F4y7AAi929dWlq0mvk0382w3jGAw5hDK9FVDA96MWmEhvizF7ym2M54aXm2SQM4PIwjv_KFVtgc5GY6ivdPaR3X61jfmuIVCYrVt4uaU-XWKYl20JvNnfABETyhTOQOpfDOPvS-tSj4sWrXmVshkBhjF_XsqULStGqTOTVKdU6k2P_j8BmZI2eceXH_6fatrENEfg3Erpu_l51kgQDdV2k-nBwyx9JlngEDRK5pFW5AGxg',
    alt: 'Portrait of Tunde Bakare, a cashier.',
  },
  staffKemi: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHl0qc8JhnnJRPRqrRWMNRq5eyZpWdbqGIfbWbeD2ekdBSQvV_kUoSHIcGhDvYEdOzycirtpBHdR8TYx3n_2wnXZ6faxrTsPm76ppGpPyuEwpfAmOaM8LCPXuRr1cyeeH5RB_bXRg-fZJVYzTvKnjpmFpW0QAYgCImQMH68B_jYAxDmYrBO5cYln3-je8ly8Dt_vXbA9dXyuo32lcZHFl9_xOJYFF2qWWfyChNBf0TtkUFFAtOsvDDtw',
    alt: 'Portrait of Kemi Davies, a service lead awaiting invite acceptance.',
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
  voucher: businessOpsMedia.rewardVoucher,
  dessert: businessOpsMedia.rewardDessert,
  vip: businessOpsMedia.rewardVip,
  michael: businessOpsMedia.customerMichael,
  sarah: businessOpsMedia.customerSarah,
  chidi: businessOpsMedia.customerChidi,
  amaka: businessOpsMedia.customerAmaka,
  zainab: businessOpsMedia.staffZainab,
  john: businessOpsMedia.staffJohn,
  amara: businessOpsMedia.staffAmara,
  tunde: businessOpsMedia.staffTunde,
  kemi: businessOpsMedia.staffKemi,
};

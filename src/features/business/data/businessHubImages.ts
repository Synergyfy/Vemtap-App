export interface BusinessHubImage {
  uri: string;
  alt: string;
}

export const businessHubMedia = {
  cover: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxacsuPHCbO5srJe4QO-0jcwyo4zEfy9sBIMMjdc_SwFuRO1Q6ONK7gywZMqro4hPNQ2sT3qPztNgGN8GYm4EWfnvdnO96I3CgBK_3v5otItiB9N8MDO8ujRBAzsvWxdIy2BnnZoo21LR-OK2Pf9y43cDyQKuR3USFcg62qcHJHGeDAYF-PizSGy4DqZTVvi1g09bAsyqzaAzEn4aN9j9iBKCKPyjcUnWj8rl5SOtUTsg68_leXv70GQ',
    alt: 'Modern bistro dining room with warm pendant lighting and wood tables.',
  },
  logo: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKixM54YqCRzhWFplFnN8VdeThyXbTmh24AEAOLL6UunYeUveQh06x926vtkX0t0thqjrznKDQHQRJoYL5He6ImX7cQiZuen1bBcRk8MfOn2Xbyyj40ZTMPDBcZFseCIW4IPAuyDOhV-85xevBTo0mcXMwCk8oug_e8NoEyfQQVATr4tas92qXycTwkGK607nK3tXU9HLgsSjnOI8ofpCG8r2nYHqeQUPdC_uT_lCa1RGHSm9jCYCcAg',
    alt: 'Urban Grill and Bistro restaurant logo monogram.',
  },
} as const satisfies Record<string, BusinessHubImage>;

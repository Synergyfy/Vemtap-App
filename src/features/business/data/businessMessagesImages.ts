export interface BusinessMessagesImage {
  uri: string;
  alt: string;
}

/** Customer portraits from the Stitch `messages_home_business_communication_center` spec. */
export const businessMessagePortraits = {
  sarah: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrrOEMOQzm8EpeGl3bQAfoRBSDD7gsfxogspSKnvfrJmGrXnBsEvFFXrN6he-t3yWtZ-R-RTyyhiJOkFs4ffgKO1q6d5WxfSufqYCFxhH1-gvutwFGaVyvZZA4FRZmXLqnsEb-DtmXfDVH7wGuHY3aOkv1KwCXPy1ZLqqmyd47aSoOSdL65_9vW9ANkjZA49ZBQxTB-XuGIImVr40KrosVGH9D1f7ZoK4Etqh1jA6yvTVXOFY-L3sRDw',
    alt: 'Close-up portrait of a warm smiling Nigerian businesswoman wearing a sleek navy blazer in an upscale Lagos office, soft diffused natural daylight, high detail, authentic commercial look',
  },
  michael: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_bZAFywj_PMC-4e0wIKR_ecVEFvH5f4zAyo0Bm95vUvBVQ0KPedqsMticFZKnXj6UUy4q-gz6do0s6VnuP3V5I4XhGl1MZadPcgtQhPmpV3hV9uu4ZkTl01wVs_-oaw7xdn-cMlXYNqQeLfx28DpNAqx195i6xGl7P2tI6gBl0OducTYAScByvWjdlQtaypwvIs3EAZ1gFCJEkkX7SPoVOioKVmktdCApieIZmXdCE-2LRG6ni5TgkA',
    alt: 'Sharp portrait shot of a young Nigerian male professional wearing a tailored polo shirt with subtle background cafe lighting, modern smartphone photography style, friendly gaze',
  },
  amaka: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBx6PI9gwK3EO4UziCosrtyqNgS5YL3st269XuhCpFdJtOF5Cb36GTxYhhq-y8P52pqP7E32MlKnFX94d1dOCXtVg414YdkArLe88gIGru25wi-o6kgXiaY8KKny5e7Zqjpnqpuf2q0nV1Gq3Sea7F7uwcV6IGzClCVq3ms3ImcSvR3f7M0e6m_g_yd3KLl-QziWsx-IGBPfig-__2uTKLqMlG8-Q6-ojOFP7o4WTeoEmNs58axOQKW6A',
    alt: 'Portrait of an elegant West African beauty boutique owner with glowing skin, soft studio light, warm beige tones, minimalist and professional look',
  },
  chidi: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9TI5Diz7tLvY-v5o6EkY97ulssRsvN0ZEVh76n_lolNINVXFJ0iIZbyWT1iOO73Ea0Pt44wp_C-_5DOiyLNlmoa5xfkwt05ec431ozln88KZrJzgzCcfmyK6DStHFOj5s3mCsbUoAQ_Ij_smGGAdRDMlrt1p3507psO6EDX0tnzz3CRS3RuHoVKfAjZii1VPhdqvfKaphksWv9sdADXjv-oVokLhV_YOzmhceuo-WGBNiX61RXU7p_w',
    alt: 'Editorial portrait of a mature distinguished Nigerian medical consultant with spectacles and tailored button-down shirt, warm cinematic indoor lighting',
  },
  tunde: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAz7xRAbkyQkR27O8Eblzm50XFC1lcexp4SSN43oa9jhZssIrGlELyXy7X9YyeIhggmFmh2aGZZLO2-LyvmK7cI4x_IHz8izn3m1v_O-ICoZRllCW1rWyqrrxLug7VMum3rxRc9YoEtlZ9HOd99GUjBXKPIDz19C79n3BOhthtrJjJPxOZOpML2TgqtMuZW0SOUybFsu91dqc1rlfUCLu2znuLzrgZ-YSqPV1oczt2i59D7uLxvOjLxiw',
    alt: 'Modern professional headshot of a confident Nigerian tech founder smiling, crisp corporate casual background, natural sunlight, vibrant clean tones',
  },
  halima: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBCIIJuhjD7PEcV5_EI4oaOSkwvoaxtsle4iHmiixmlUr3nqAicOp5A7Cfa0fmbg-Ef1KQIaQu-FssT_O2h7C_zZugyfevfiVHhvLWEboqpKmkpvG_lHa0e6CycscGXv_EfhEzTaenG-qB3gTvSorhnp0Gb1qU4as9Ivv98_s9NKqSduik1jiHIr6MyFPTu6eMU2M6WKteaK0XsoguivKl-KN-FKuUGpKlYubOg_VOdjsk_L7GKVZHIMQ',
    alt: 'Authentic vibrant lifestyle portrait of a stylish young Nigerian woman with braided hair wearing pastel blazer, warm studio lighting, pleasant expression',
  },
} as const satisfies Record<string, BusinessMessagesImage>;

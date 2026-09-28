export interface AccountHubImage {
  uri: string;
  alt: string;
}

export const activityImages = {
  urbanGrill: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBeyRMDHoGyxIEomHPy5Hyw-daupqu4GkwSvioxqtJRZU2gX1m5f75Ee5yYGHkRBN5yCAdsyzFZTQ_qLvO7Ear6acv8qKRwY2BFyGCRLE4AihxR_XZNAnDoa8owrMvOCgNgMRZbEjzPrvZymIfV2bk7ZmB1LQ4Awu16lcTgG0MsdHAEb_ijhfpkdRVUAWAh9ZpfqrMmgq8JyLlHkDFJEBuLg2L1v96JFP-yJr-wfXRtPp4dE1fXwFvV-w',
    alt: 'Urban Grill & Bistro bistro interior with warm lighting.',
  },
  bakery: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvDFzjPTW7THzDxxP8IVliLHcPT6Y2Al-pY3AiNUPiO3WRYJx1_U3sqcu_NxV_eP3vN4f2O6nNA54AYOlizMXvcjM4jtmLLJtbUzGbwBlrb_rPIXFPh6NfHStndowyBjN4NrI-v1R0fTBkzSGhDjbZtYE39OlF0Vt8vkhQlGmsmG8HwhStTYHb2jGx4f9XRrxdtLolxrq6yUay4tV-4TtUJkjWyqfJ-jBznPiltwdm0qGwTqCPFim4zQ',
    alt: 'Artisan sourdough loaves cooling on a bakery counter.',
  },
  spa: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2h7p6DFv-Oga8QJftzzpUcRbbQa_7jJkasofoJi263Fht8mnA-xeMQR4qc9iMr_M5fqJ5hulmV6dfrmcWryI5FmVh-bnISd7VSIC-FnFwPEI85QfKMq9tN300ZIgvQJ4BHp1DmyaQICaNo2477nt-BrTKQ3fBO1uUeMtXNptwxoPHr_BzIQZ6vB03JilD6PYMw1Y_D7Y-Pw3-BU5QPOzttpKOXCnbcf9QVQhzzBdte00eUwrw4FaZeA',
    alt: 'Serene spa treatment room with warm stone and soft light.',
  },
  skyLounge: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAU5MXjmprxvQVRPHcI0CmYQQO93i-jnVZGxmkcoFfTfHKa2oyJZPzla9XJA3cpXd2TvrJdDeTG9DGikRvFgSQ7-8s7Pe1FYrwqpCL1n5qJB0QkihwBV398yKj2s2R-agoRqbkYgia-TyTlJTMGnrlwJ9jvliOQaqhGE-i91x8ZsyUS0LL0o0ksX-DodX6iU-gtnD3Owebyip9u9RFfS8zpxu2jO4VHELx5t3RMpmDIfFEfnr9OTpLxVw',
    alt: 'Fine dining plated dessert under warm rooftop lighting.',
  },
  cafeNeo: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1hvuQIUSpBEAzlnfkCFejYhI1L9msQtY6ni5dEaZNMKinq1gQTc9pnjzZvQi3nA6bywjxxFXEcxfEiSS4fc2kcG5JDNo6vPPKCSte7XTHIYuj9T63HObE7GviiKzFoi1ysuGvLZnvA7LdBtsy9FW_aZ8kI5rRI0LZYl2pIKHUEg9iK_Sr-On4MGYPdhFDMYFphFiik5xshfdTOZEn2KnRQMJdpcS-mqe72E-FN0GrUviXVOSESPwidw',
    alt: 'Bottled cold brew coffee on a wooden coffeehouse table.',
  },
} as const satisfies Record<string, AccountHubImage>;

export const rewardImages = {
  dining: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBr0uBE1l9KtcqjX7GaTPNp9BiooBnIdCpko3yjiLMnEISEbvg4lnWLH9XMidBrGreyozGSp0V6EhIKrdwSIGZcb2Zdv6FRk8QTteo30CQEeL3FD7C6VbL5rDpwGYwBncvUT436l46KQ71jS4v_wGswhnxYd_aRTkxtFkDc-sJWxjUrUccQEsjL677D9pI0FGrYN43PWpBP_xZ7PeN7i1923QaWrNrJWWYr69iPsTYs1ylHvcQRnvaWig',
    alt: 'Gourmet plated meal at an upscale dining spot.',
  },
  wellness: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuABMpzQZIU2VY3qJZFsgNS4hIromPht2XpzoBTNVOYiNycD2vrJaQjpTasKvdhJNsaCw2Hxfmx0KqFhppvWIoJ3cJ7k30aYuC6685-fWTrs8EIoEIB1ZH6P8R9Tvf43KE92fykL1vAS2njtFHIUEXz_Rs6qOOtJejjk0VQ3CcA-zTpq32VbGWZaqroABU-FIR4hn-E2SGYVFlnUepT2-uvK00kUuGw5zR2jnUHPU3TQ7FNEAeUvqiD2cg',
    alt: 'Luxury wellness salon with organic botanicals.',
  },
  fashion: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYpkHZeERUGSGbfkjgDbK3rmEFUfBO6MNTWf3dWwTdTnJ0JRdnQfNHLx9rq3ZYxyWvv0NCTI3yklD-rtNWYPP0lZ6Vg5a86WUnn1CWA0e7aQB2biL4Wq81OgJhY9nNSLQb8Am6WJ8kNbwpLz7f93qoUkHJipbzvf1sKqyC6-_pZV1Aec_1MzerNf2I4Rsmgw_zaKcjdZ_20NMI6v3dqBQSKt0Bypmyvp8g_jT9x3qW-WZO4S5Su0YOSQ',
    alt: 'Sneaker boutique display with curated designer footwear.',
  },
  vip: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQvp5wxdoabBe0F-PyAz4kh-zUp0CKKwENMSxpZtAFRrT4qBKLffwybrYRAgNHxjrAU7t9NPy07QWiZunpiKrxWakuBbSd_TeNlUK9Y3t2SE-TxV0-o0t2uV-b28EmVhHNvZk1NLwaj4BEhSUxL7VUaatZjNfwfixcN3wXNrOfwCkpClMGauB9Ay6YDWQJPg22Tmqzae0pH6rmaoY7ufXVvtuJUaXzDcwTRDxo-NFVCiFCY-YrzHAyPA',
    alt: 'Moody fine-dining chef table with wine pairings.',
  },
} as const satisfies Record<string, AccountHubImage>;

export const savedImages = {
  burger: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBEsUfoX0BR8wQbev0iY0OE3oaZcHAq3f_kmtPuvfFZALp7pRPBJnQVrjLgvZqOE3SLdv6aTMWEffa3q0kptxiKN6qz8PwTTXAK25hfeJ2PvEmN86xYRxv_myVwyUtTEG0z6cThggJsUtfBpHQo0nt1s6cnIjmg9daAPt5Ilc0xRdIDev1DP-tAsrYmgf1bG77UrHwGX8VvvRgIZfhau9QOYuH7F6hHkxgogsDe9AAF',
    alt: 'Gourmet brioche prime beef burger with fries and iced soda.',
  },
  spaInterior: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9O6R9cW4pzDqYdT4glxLJjDCJwXVwqvZNPbNpdbD_nztxqvLjUxA4hfrV-yjyL9iv67jiwnUyIh0CCOFLmRGqwltlF4xwfFrtj08bFwR8W5UmusWtNkpMemY6NSkuqidaWpMCZQOFlOsR_hx1mDZx_KN_UqB4faG6xgeY0z3Crn4a-SY_XP2DjO3k0SE9215rm1GfpwHljDiyDknog6_PlORQISnW-ITM1_z0GXDX',
    alt: 'Serene day spa interior with warm stone and white linen loungers.',
  },
  sneakers: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhm7XroZ9CuhKjfJEOi0R-OjqQQ6dqDHGyajpAWfCcRmp6IDqkVZpysDWCWuXu-eu75kytL4hnqOkpKkZCjyUVTLYHfr0XsU90FbJDP9pw5t2ep23iEOyIcwLlASxKg5rF6zB9n-EbBiaAiFE5fii4-d8VZUoRxAIhgUxTPenZCLcVk_D3HrISWRJ2Y5FtBgBK8atS2XvseRwQZ9Tkn-1WYCF_Y5mqRFd1-MNWGcL1',
    alt: 'Limited release designer sneakers in a minimalist boutique.',
  },
  coldBrew: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCg2NP24GXEqT1vCPeIDzreaRt2jz8tm4qcKNkVIdcuyCqBDOLgnw5BkuzVJQdrxp4yiURvkES7aaFaBStCY9ivtmDq4uwEODfVDfIRdFlBZzDEBeElfOyUlD0GhjJVXxph8r2kqdzk4Muh8c1X9lT2vjbhAX31a-1BFBGcRESgBJBmY5k9qIKxB95xPHTSQn2PUpU-0FdkwHhbSiw8ZWPtEgSrXK-0TkiujK_OUWvh',
    alt: 'Craft cold brew bottle beside a freshly baked croissant.',
  },
} as const satisfies Record<string, AccountHubImage>;

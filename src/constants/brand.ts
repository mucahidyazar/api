export const BRAND = {
  amazon: {
    name: 'amazon',
    xPath: {
      priceElement: '//*[@id="corePrice_feature_div"]/div/span/span[1]',
      addCartButton:
        '//*[@id="pdp-general"]/div[3]/div[3]/div[3]/div[3]/div[2]/button',
      sellerElement: {
        path: `//*[@id="merchant-info"]/span[1]`,
        condition: (text: string) =>
          text === 'Amazon.com.tr tarafından satılır ve gönderilir.',
      },
    },
  },
  // Arcelik: {
  //   name: 'Arcelik',
  //   link: 'https://www.arcelik.com.tr/oyun-konsolu/sony-playstation-5-dijital-surum-hobi-oyun',
  //   xPath: {
  //     priceElement:
  //       '//*[@id="pdp-general"]/div[3]/div[3]/div[3]/div[3]/div[1]/div/div/span/span',
  //     addCartButton:
  //       '//*[@id="pdp-general"]/div[3]/div[3]/div[3]/div[3]/div[2]/button',
  //   },
  // },
  // Beko: {
  //   name: 'Beko',
  //   link: 'https://www.beko.com.tr/oyun-konsolu/sony-playstation-5-dijital-surum-hobi-oyun',
  //   xPath: {
  //     priceElement:
  //       '//*[@id="pdp-general"]/div[3]/div[3]/div[3]/div[3]/div[1]/div/div/span/span',
  //     addCartButton:
  //       '//*[@id="pdp-general"]/div[3]/div[3]/div[3]/div[3]/div[2]/button',
  //   },
  // },
  mediamarkt: {
    name: 'mediamarkt',
    xPath: {
      priceElement: '//*[@id="product-details"]/div[4]/div[1]/div[2]',
      addCartButton: '//*[@id="pdp-add-to-cart"]',
    },
  },
} as const

export type TBrand = keyof typeof BRAND

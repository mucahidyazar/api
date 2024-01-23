import { TBrand, TBrandName } from "../common";

export const BRAND: Record<TBrandName, TBrand> = {
  amazon: {
    name: 'amazon',
    xPath: {
      priceElement: '//*[@id="corePriceDisplay_desktop_feature_div"]/div[1]/span[2]/span[2]/span[1]',
      addCartButton:
        '//*[@id="pdp-general"]/div[3]/div[3]/div[3]/div[3]/div[2]/button',
      sellerElement: {
        path: `//*[@id="merchantInfoFeature_feature_div"]/div[2]/div/span`,
        condition: (text: string) =>
          text === 'Amazon.com.tr',
      },
      productName: '',
      productImage: ''
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
      priceElement: '//*[@id="product-details"]/div[3]/div[1]/div[2]',
      addCartButton: '//*[@id="pdp-add-to-cart"]',
      productName: '//*[@id="product-details"]/div[2]/h1',
      productImage: '//*[@id="product-sidebar"]/div[1]/a/img'
    },
  },
}


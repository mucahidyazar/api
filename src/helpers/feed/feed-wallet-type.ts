import '../../config/db'

import { WalletType } from '../../model/lumara/wallet-type'

async function feed() {
  await WalletType.insertMany([
    { label: 'Bank', multipleBalance: true, hasPlatform: true },
    { label: 'Bank Account', multipleBalance: false, hasPlatform: true },
    { label: 'Case', multipleBalance: true, hasPlatform: true },
    { label: 'Credit Card', multipleBalance: true, hasPlatform: true },
  ])
}

feed()

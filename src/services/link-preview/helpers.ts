import axios from 'axios'
import cheerio from 'cheerio'

import { logger } from '@/client'

interface IGetLinkPreviewResponse {
  title?: string
  description?: string
  image?: string
}

export const getLinkPreviewData = async (
  url: string,
): Promise<IGetLinkPreviewResponse> => {
  try {
    const response = await axios.get(url)
    const $ = cheerio.load(response.data)

    const title = $('head title').text()
    const description = $('meta[name="description"]').attr('content')
    const image = $('meta[property="og:image"]').attr('content')

    return { title, description, image }
  } catch (error) {
    logger.error(`Error while fetching link preview data: ${error}`)
    return {}
  }
}

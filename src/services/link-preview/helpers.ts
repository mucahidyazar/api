import axios from 'axios'

interface IGetLinkPreviewResponse {
  title: string
  description: string
  image: string
}
export const getLinkPreviewData = async (
  url: string,
): Promise<IGetLinkPreviewResponse> => {
  const response = await axios.get(url)
  const html = response.data
  const title = html.match(/<title>(.*?)<\/title>/)?.[1]
  const description = html.match(
    /<meta name="description" content="(.*?)">/,
  )?.[1]
  const image = html.match(/<meta property="og:image" content="(.*?)">/)?.[1]

  return {title, description, image}
}

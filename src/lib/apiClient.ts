export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

interface Envelope<T> {
  success: boolean
  message?: string
  data?: T
}

/**
 * Single network chokepoint. Requests go to the dev-server proxy at /api, which
 * attaches the API key, so no key ever reaches the browser bundle.
 */
export async function request<T>(params: Record<string, string>): Promise<T> {
  const query = new URLSearchParams(params).toString()

  let response: Response
  try {
    response = await fetch(`/api/?${query}`)
  } catch {
    throw new ApiError('Could not reach the sports service. Check your connection.', 0)
  }

  if (response.status === 429) {
    throw new ApiError('Daily API request limit reached. It resets at midnight UTC.', 429)
  }

  let body: Envelope<T> | null = null
  try {
    body = (await response.json()) as Envelope<T>
  } catch {
    body = null
  }

  if (!response.ok || !body?.success) {
    throw new ApiError(body?.message ?? `Request failed (${response.status}).`, response.status)
  }

  return body.data as T
}

export type CodeOutputData = {
  pageId: string
  type: 'src_code' | 'builded'
  pageConfig?: string
}

export type NeededPageConfig = {
  globalConfig?: {
    fontConfig?: Partial<{
      globalFont: string[]
      usedFont: string[][]
    }>
  }
}

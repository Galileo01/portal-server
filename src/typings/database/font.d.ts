export type FontLanguage = 'en' | 'ch'

export type FontType = 'system_exist' | 'platform_provide' | 'user_add'

export type FontFamily = {
  // 名称-英文 用于 样式表 注册
  name: string
  type: FontType
  mainLanguage?: FontLanguage
  previewImg?: string
  src?: string
}

export type FontList = Array<FontFamily>

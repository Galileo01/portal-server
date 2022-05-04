import { Resource } from './resource'

export type TemplateType = 'user' | 'platform'

export type TemplateBaseInfo = Resource & {
  private: number
  type: TemplateType
}

export type TemplateInfoList = Array<TemplateInfo>

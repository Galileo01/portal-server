import { Resource } from './resource'

export type TemplateType = 'user' | 'platform'

export type Template = Resource & {
  private: number
  type: TemplateType
}

export type TemplateList = Array<Template>

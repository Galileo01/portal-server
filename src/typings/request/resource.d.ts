import { ResourceType } from '@/typings/database/resource'

export type GetByIdQuery = {
  resourceId: string
  resourceType?: ResourceType
}

export type GetResourceListQuery = {
  resourceType?: ResourceType
}

export type PublishResourceData = {
  operateType: 'publish' | 'update'
  // 资源 数据
  resourceData: {
    resourceType: ResourceType
    resourceId: string
    title: string
    thumbnailUrl: string
    config: string
    // template 字段
    private?: number
    type?: string
  }
}

export type DeleteByIdData = {
  resourceId: string
  resourceType?: ResourceType
}

import { ResourceType } from '@/typings/database/resource'

export type GetByIdQuery = {
  resourceId: string
  resourceType?: ResourceType
}

export type GetResourceListQuery = {
  resourceType?: ResourceType
  limit?: string
  offset?: string
  // template 过滤条件
  filter?: 'all' | 'private' | 'public' | 'platform'
  titleLike?: string
  order?: 'lastModified' | 'title'
}

export type OperateResourceData = {
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

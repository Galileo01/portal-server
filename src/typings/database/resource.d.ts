export type Resource = {
  resourceId: string
  title: string
  ownerId: string
  thumbnailUrl: string
  config: string
  lastModified: string
}

export type ResourceList = Array<Resource>

export type ResourceType = 'page' | 'template'

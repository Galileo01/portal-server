import STS, { CredentialData } from 'qcloud-cos-sts'

import txCosConfig from '@/config/tx-cos'

export const getCredential = () =>
  new Promise<CredentialData | undefined>((resolve, reject) => {
    // 获取临时密钥
    const LongBucketName = txCosConfig.bucket
    const ShortBucketName = LongBucketName.substr(
      0,
      LongBucketName.lastIndexOf('-')
    )
    const AppId = LongBucketName.substring(LongBucketName.lastIndexOf('-') + 1)
    // 数据万象DescribeMediaBuckets接口需要resource为*,参考 https://cloud.tencent.com/document/product/460/41741
    const policy = {
      version: '2.0',
      statement: [
        {
          action: txCosConfig.allowActions,
          effect: 'allow',
          resource: [
            `qcs::cos:${txCosConfig.region}:uid/${AppId}:prefix//${AppId}/${ShortBucketName}/${txCosConfig.allowPrefix}`,
          ],
        },
      ],
    }

    STS.getCredential(
      {
        secretId: txCosConfig.secretId,
        secretKey: txCosConfig.secretKey,
        durationSeconds: txCosConfig.durationSeconds,
        policy,
      },
      (err, tempKeys) => {
        if (err) {
          reject(err)
        } else if (tempKeys) {
          resolve(tempKeys)
        } else {
          resolve(undefined)
        }
      }
    )
  })

export default getCredential

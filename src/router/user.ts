import Router from '@koa/router'

import { User } from '@/typings/database'
import { UserLoginData } from '@/typings/request/user'
import { UserInCtxState } from '@/typings/common/koa-context'
import knex from '@/utils/kenx'
import { getUniqueId } from '@/utils'
import { signTokenByUserId } from '@/utils/token'

const router = new Router({
  prefix: '/user',
})

// 登陆 / 用户名不存在则自动 注册
router.post('/login', async (ctx) => {
  let success = 0
  let data: unknown = {}

  const postData = ctx.request.body
  const { name, password } = postData as UserLoginData
  const users = await knex.select().from<User>('user').where({ name })

  // // 若没有找到对应名称的用户 则 新建用户 -注册
  if (users.length === 0) {
    const userId = getUniqueId()
    await knex
      .insert({
        ...postData,
        userId,
      })
      .into('user')
    // 下发token
    success = 1
    data = {
      user: {
        userId,
        name,
      },
      token: signTokenByUserId(userId),
      isRegister: 1, // 标识 是 注册行为
    }
  }
  // 对比 密码 正确
  else if (password === users[0].password) {
    // 下发token
    success = 1
    data = {
      user: {
        ...users[0],
        password: undefined, // 不下发 password
      },
      token: signTokenByUserId(users[0].userId),
      isRegister: 0,
    }
  }
  // 密码不正确
  else {
    data = '用户名或密码错误'
  }

  ctx.body = {
    success,
    data,
  }
})

const userBaseColumns = ['userId', 'name', 'avatar']

// 根据 token 获取用户信息
router.get('/getInfo', async (ctx) => {
  const { userId } = ctx.state.user as UserInCtxState
  const users = await knex
    .select(...userBaseColumns)
    .from<User>('user')
    .where({
      userId,
    })

  ctx.body = {
    success: users.length,
    data: users[0],
  }
})

// 更新用户信息
router.post('/updateInfo', async (ctx) => {
  const postData = ctx.request.body
  const { userId } = ctx.state.user as UserInCtxState

  const affectRows = await knex('user').update(postData).where({
    userId,
  })

  const users = await knex
    .select(...userBaseColumns)
    .from<User>('user')
    .where({
      userId,
    })

  ctx.body = {
    success: affectRows === 1 ? 1 : 0,
    data: users[0],
  }
})

export default router

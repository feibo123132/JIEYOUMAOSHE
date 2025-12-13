import cloudbase from '@cloudbase/js-sdk'
import type { User, Cat, Interaction } from '@/types' // 确保这里的路径和你项目里的一致

// 1. 强校验环境变量，防止静默失败
const envId = import.meta.env.VITE_CLOUDBASE_ENV_ID
const region = import.meta.env.VITE_CLOUDBASE_REGION

if (!envId) {
  console.error('【致命错误】: 未找到 VITE_CLOUDBASE_ENV_ID 环境变量！请检查 .env.local 或 GitHub Secrets。')
  throw new Error('Missing CloudBase Env ID')
}

// 2. 集合名称映射
const COL_USERS = 'Cat_users'
const COL_CATS = 'Cat_pet'
const COL_INTERACTIONS = 'Cat_interactions'
const COL_COINS = 'Cat_coins'
const THE_CAT_ID = 'the_one_and_only_cat'

let app: ReturnType<typeof cloudbase.init> | null = null

function getApp() {
  if (!app) {
    app = cloudbase.init({ env: envId, region: region })
  }
  return app
}

// 定义 SDK 返回的原始数据类型，避免 any
type InteractionDoc = {
  _id?: string
  id?: string
  userId: string
  catId: string
  type: string
  experienceGained: number
  createdAt?: number | string | Date
  day: string
}

type LoginState = { user?: { uid: string } } | null

export async function ensureLogin(): Promise<string> {
  const auth = getApp().auth() as any
  
  // 尝试获取当前状态
  const state = await auth.getLoginState()
  
  if (state) {
    // 已有登录态
    return state.user?.uid || ''
  }

  // 无登录态，执行匿名登录
  console.log('正在尝试匿名登录腾讯云...')
  await auth.anonymousAuthProvider().signIn()
  
  // 再次获取
  const newState = await auth.getLoginState()
  const uid = newState?.user?.uid
  
  if (!uid) {
    throw new Error('CloudBase anonymous login failed')
  }
  
  console.log('腾讯云登录成功, UID:', uid)
  return uid
}

export async function getOrCreateUser(uid: string): Promise<User> {
  const db = getApp().database()
  const res = await db.collection(COL_USERS).where({ id: uid }).limit(1).get()
  
  if (res.data.length > 0) {
    const d = res.data[0]
    return {
      id: d.id,
      email: d.email ?? '',
      name: d.name ?? '猫咪爱好者',
      coinBalance: d.coinBalance ?? 0,
      createdAt: new Date(d.createdAt ?? Date.now()),
      lastActive: new Date(d.lastActive ?? Date.now())
    }
  }

  // 创建新用户
  const now = Date.now()
  const u: User = {
    id: uid,
    email: '',
    name: '猫咪爱好者',
    coinBalance: 0,
    createdAt: new Date(now),
    lastActive: new Date(now)
  }

  await db.collection(COL_USERS).add({
    id: u.id,
    email: u.email,
    name: u.name,
    coinBalance: u.coinBalance,
    createdAt: u.createdAt.getTime(),
    lastActive: u.lastActive.getTime()
  })
  
  return u
}

export async function getCat(): Promise<Cat> {
  const db = getApp().database()
  const res = await db.collection(COL_CATS).doc(THE_CAT_ID).get()
  const d = res.data && res.data.length > 0 ? res.data[0] : {}

  // 如果数据库里没猫，这里会报错或者返回空，但按流程你应该已经手动初始化过猫了
  // 为了健壮性，如果没数据，我们返回默认值，并尝试初始化（双重保险）
  if (!d._id) {
    console.warn('云端未找到猫咪数据，尝试初始化...')
    const cat: Cat = {
      id: THE_CAT_ID,
      name: 'JIEYOU萌宠',
      currentLevel: 1,
      totalExperience: 0,
      appearance: 'default',
      createdAt: new Date()
    }
    // 尝试写入（可能会因权限失败，但值得一试）
    try {
      await db.collection(COL_CATS).doc(THE_CAT_ID).set({
        _id: THE_CAT_ID,
        name: cat.name,
        currentLevel: cat.currentLevel,
        totalExperience: cat.totalExperience,
        appearance: cat.appearance,
        createdAt: Date.now()
      })
    } catch (e) {
      console.error('初始化猫咪失败，请检查数据库权限', e)
    }
    return cat
  }

  return {
    id: THE_CAT_ID,
    name: d.name ?? 'JIEYOU萌宠',
    currentLevel: d.currentLevel ?? 1,
    totalExperience: d.totalExperience ?? 0,
    appearance: d.appearance ?? 'default',
    createdAt: new Date(d.createdAt ?? Date.now())
  }
}

function dateKey(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export async function getTodayInteractions(uid: string, date: Date): Promise<Interaction[]> {
  const db = getApp().database()
  const day = dateKey(date)
  
  const res = await db.collection(COL_INTERACTIONS).where({
    userId: uid,
    day: day
  }).get()

  const rows = (res.data ?? []) as InteractionDoc[]
  
  return rows.map((i) => ({
    id: String(i.id ?? i._id ?? Date.now()),
    userId: i.userId,
    catId: i.catId,
    type: i.type as any, // 这里为了兼容前端定义的字面量类型，使用 any 是安全的
    experienceGained: i.experienceGained,
    createdAt: new Date(typeof i.createdAt === 'number' ? i.createdAt : (i.createdAt || Date.now())),
    interactionDate: new Date(typeof i.createdAt === 'number' ? i.createdAt : (i.createdAt || Date.now()))
  }))
}

export async function writeInteraction(i: Interaction) {
  const db = getApp().database()
  const day = dateKey(i.interactionDate)
  
  await db.collection(COL_INTERACTIONS).add({
    userId: i.userId,
    catId: i.catId,
    type: i.type,
    experienceGained: i.experienceGained,
    createdAt: i.createdAt.getTime(),
    day
  })
}

export async function updateCatExperience(totalExperience: number, currentLevel: number) {
  const db = getApp().database()
  await db.collection(COL_CATS).doc(THE_CAT_ID).update({ totalExperience, currentLevel })
}

export async function updateUserCoins(userId: string, coinBalance: number) {
  const db = getApp().database()
  const res = await db.collection(COL_USERS).where({ id: userId }).limit(1).get()
  
  if (res.data.length > 0) {
    // 使用 _id (云端主键) 来更新
    await db.collection(COL_USERS).doc(res.data[0]._id).update({ coinBalance })
  }
}

export async function writeCoin(userId: string, amount: number, sourceType: string) {
  const db = getApp().database()
  const day = dateKey(new Date())
  await db.collection(COL_COINS).add({ 
    userId, 
    amount, 
    sourceType, 
    createdAt: Date.now(), 
    day 
  })
}
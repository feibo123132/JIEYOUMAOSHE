/* eslint-disable @typescript-eslint/ban-ts-comment */
import cloudbase from '@cloudbase/js-sdk'
import type { User, Cat, Interaction } from '@/types'

// 1. 环境变量检查
const envId = import.meta.env.VITE_CLOUDBASE_ENV_ID
const region = import.meta.env.VITE_CLOUDBASE_REGION

if (!envId) {
  console.error('【致命错误】: 未找到 VITE_CLOUDBASE_ENV_ID')
  throw new Error('Missing CloudBase Env ID')
}

// 2. 常量定义
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

// 3. 定义数据库返回的原始类型（杜绝 any）
type UserDoc = {
  id?: string
  _id?: string
  email?: string
  name?: string
  coinBalance?: number
  createdAt?: number | string | Date
  lastActive?: number | string | Date
}

type CatDoc = {
  _id?: string
  name?: string
  currentLevel?: number
  totalExperience?: number
  appearance?: string
  createdAt?: number | string | Date
}

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

// 4. 核心业务函数
export async function ensureLogin(): Promise<string> {
  const auth = getApp().auth() as unknown as {
    getLoginState: () => Promise<{ user?: { uid: string } } | null>
    signInAnonymously?: () => Promise<void>
    anonymousAuthProvider?: () => { signIn: () => Promise<void> }
  }
  const state = await auth.getLoginState()
  if (state?.user?.uid) return state.user.uid

  console.log('正在尝试匿名登录腾讯云...')
  if (typeof auth.signInAnonymously === 'function') {
    await auth.signInAnonymously()
  } else if (typeof auth.anonymousAuthProvider === 'function') {
    await auth.anonymousAuthProvider().signIn()
  } else {
    throw new Error('CloudBase SDK 未提供匿名登录方法，请检查 @cloudbase/js-sdk 版本')
  }

  const newState = await auth.getLoginState()
  const uid = newState?.user?.uid
  if (!uid) throw new Error('CloudBase anonymous login failed')
  return uid
}

export async function getOrCreateUser(uid: string): Promise<User> {
  const db = getApp().database()
  const res = await db.collection(COL_USERS).where({ id: uid }).limit(1).get()
  
  if (res.data.length > 0) {
    const d = res.data[0] as UserDoc
    return {
      id: d.id || uid,
      email: d.email ?? '',
      name: d.name ?? '猫咪爱好者',
      coinBalance: d.coinBalance ?? 0,
      createdAt: new Date(d.createdAt || Date.now()),
      lastActive: new Date(d.lastActive || Date.now())
    }
  }

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
  const d = (res.data && res.data.length > 0 ? res.data[0] : {}) as CatDoc

  if (!d._id) {
    // 如果没有猫，返回默认初始状态（实际生产中应报错或初始化）
    return {
      id: THE_CAT_ID,
      name: 'JIEYOU萌宠',
      currentLevel: 1,
      totalExperience: 0,
      appearance: 'default',
      createdAt: new Date()
    }
  }

  return {
    id: THE_CAT_ID,
    name: d.name ?? 'JIEYOU萌宠',
    currentLevel: d.currentLevel ?? 1,
    totalExperience: d.totalExperience ?? 0,
    appearance: d.appearance ?? 'default',
    createdAt: new Date(d.createdAt || Date.now())
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
    // 强制转换为合法的 InteractionType，修复 ESLint 报错
    type: i.type as Interaction['type'], 
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

type LoginSendRes = { result?: { ok?: boolean } }
type LoginVerifyRes = { result?: { uid?: string }; uid?: string }

async function callLoginFunction(payload: Record<string, unknown>): Promise<unknown> {
  const appInstance = getApp() as any
  // 确保有登录态（匿名）
  try {
    const auth = appInstance.auth()
    const s = await auth.getLoginState()
    if (!s) {
      if (typeof auth.signInAnonymously === 'function') {
        await auth.signInAnonymously()
      } else if (typeof auth.anonymousAuthProvider === 'function') {
        await auth.anonymousAuthProvider().signIn()
      }
    }
  } catch (e) {
    console.error('CloudBase 认证失败:', e)
    throw e
  }
  if (appInstance.functions && typeof appInstance.functions.callFunction === 'function') {
    return appInstance.functions.callFunction({ name: 'login', data: payload })
  }
  if (typeof appInstance.callFunction === 'function') {
    return appInstance.callFunction({ name: 'login', data: payload })
  }
  throw new Error('CloudBase callFunction not available')
}

export async function sendCode(phone: string): Promise<boolean> {
  const res = await callLoginFunction({ action: 'send', phone }) as LoginSendRes
  return !!(res && (res.result?.ok ?? (res as any).result))
}

export async function verifyCode(phone: string, code: string): Promise<string> {
  const res = await callLoginFunction({ action: 'verify', phone, code }) as LoginVerifyRes
  const uid = res?.result?.uid || res?.uid
  if (!uid) throw new Error('verify failed')
  return uid
}

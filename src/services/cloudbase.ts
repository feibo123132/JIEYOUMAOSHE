import cloudbase from '@cloudbase/js-sdk'
import type { User, Cat, Interaction } from '@/types'

const envId = import.meta.env.VITE_CLOUDBASE_ENV_ID as string
const region = import.meta.env.VITE_CLOUDBASE_REGION as string

const COL_USERS = 'Cat_users'
const COL_CATS = 'Cat_pet'
const COL_INTERACTIONS = 'Cat_interactions'
const COL_COINS = 'Cat_coins'
const THE_CAT_ID = 'the_one_and_only_cat'

let app: ReturnType<typeof cloudbase.init> | null = null

function getApp() {
  if (!app) {
    app = cloudbase.init({ env: envId, region })
  }
  return app
}

export async function ensureLogin(): Promise<string> {
  const a = getApp().auth()
  const state = await a.getLoginState()
  if (!state) {
    await a.anonymousAuthProvider().signIn()
  }
  const s = await a.getLoginState()
  return s!.user!.uid
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
  const d = res.data[0] || {}
  if (!d._id) {
    const cat: Cat = {
      id: THE_CAT_ID,
      name: 'JIEYOU萌宠',
      currentLevel: 1,
      totalExperience: 0,
      appearance: 'default',
      createdAt: new Date()
    }
    await db.collection(COL_CATS).doc(THE_CAT_ID).set({
      _id: THE_CAT_ID,
      name: cat.name,
      currentLevel: cat.currentLevel,
      totalExperience: cat.totalExperience,
      appearance: cat.appearance,
      createdAt: Date.now()
    })
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
  const res = await db.collection(COL_INTERACTIONS).where({ userId: uid, day }).get()
  type InteractionDoc = {
    _id?: string
    id?: string
    userId: string
    catId: string
    type: Interaction['type']
    experienceGained: number
    createdAt?: number
    day: string
  }
  const rows = (res.data ?? []) as InteractionDoc[]
  return rows.map((i) => ({
    id: String(i.id ?? i._id ?? Date.now()),
    userId: i.userId,
    catId: i.catId,
    type: i.type,
    experienceGained: i.experienceGained,
    createdAt: new Date(typeof i.createdAt === 'number' ? i.createdAt : Date.now()),
    interactionDate: new Date(typeof i.createdAt === 'number' ? i.createdAt : Date.now())
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
  await db.collection(COL_COINS).add({ userId, amount, sourceType, createdAt: Date.now(), day })
}

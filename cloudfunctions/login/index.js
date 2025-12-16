const cloudbase = require('@cloudbase/node-sdk')

exports.main = async (event, context) => {
  const { ENV_ID } = cloudbase.getCloudbaseContext() || {}
  const app = cloudbase.init({ env: ENV_ID })
  const auth = app.auth()

  const { action, phone, code, requestId } = event || {}

  try {
    if (action === 'send') {
      if (!/^1\d{10}$/.test(String(phone || ''))) {
        return { error: 'bad_phone', message: 'invalid phone' }
      }
      if (typeof auth.sendSmsCode === 'function') {
        const r = await auth.sendSmsCode({ phoneNumber: String(phone) })
        return { result: { ok: true, requestId: r?.requestId } }
      }
      if (typeof auth.sendPhoneCode === 'function') {
        const r = await auth.sendPhoneCode({ phoneNumber: String(phone) })
        return { result: { ok: true, requestId: r?.requestId } }
      }
      return { error: 'api_unavailable', message: 'CloudBase 未提供手机号验证码发送 API' }
    }

    if (action === 'verify') {
      if (!/^1\d{10}$/.test(String(phone || '')) || !/^\d{6}$/.test(String(code || ''))) {
        return { error: 'bad_params', message: 'invalid phone or code' }
      }
      if (typeof auth.signInWithPhone === 'function') {
        const res = await auth.signInWithPhone({ phoneNumber: String(phone), code: String(code) })
        const uid = res?.user?.uid || res?.uid
        return { result: { uid } }
      }
      if (typeof auth.signInWithPhoneCode === 'function') {
        const res = await auth.signInWithPhoneCode({ phoneNumber: String(phone), code: String(code), requestId })
        const uid = res?.user?.uid || res?.uid
        return { result: { uid } }
      }
      return { error: 'api_unavailable', message: 'CloudBase 未提供手机号验证码登录 API' }
    }

    return { error: 'bad_action', message: 'unknown action' }
  } catch (e) {
    return { error: 'operation_fail', message: e?.message || String(e) }
  }
}

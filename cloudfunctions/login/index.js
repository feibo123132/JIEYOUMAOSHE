const cloudbase = require('@cloudbase/node-sdk')

exports.main = async (event, context) => {
  const { ENV_ID } = cloudbase.getCloudbaseContext() || {}
  const app = cloudbase.init({ env: ENV_ID })
  const auth = app.auth()

  const { action, phone, code } = event || {}

  if (action === 'send') {
    if (!/^1\d{10}$/.test(String(phone || ''))) {
      return { result: { ok: false, message: 'bad_phone' } }
    }
    // CloudBase SDK 新版：sendSmsCode；旧版可能需要接入短信通道
    if (typeof auth.sendSmsCode === 'function') {
      await auth.sendSmsCode({ phoneNumber: String(phone) })
      return { result: { ok: true } }
    }
    // 如无内置方法，这里应接入短信服务（腾讯云短信）；示例直接返回成功以便联调
    return { result: { ok: true } }
  }

  if (action === 'verify') {
    if (!/^1\d{10}$/.test(String(phone || '')) || !/^\d{6}$/.test(String(code || ''))) {
      return { error: 'bad_params' }
    }
    // 新版：auth.signInWithPhone
    if (typeof auth.signInWithPhone === 'function') {
      const res = await auth.signInWithPhone({ phoneNumber: String(phone), code: String(code) })
      const uid = res?.user?.uid || res?.uid
      return { result: { uid } }
    }
    // 兼容：旧版可能不同接口；示例返回固定 uid 以便前端联调
    return { result: { uid: `mock_${String(phone)}` } }
  }

  return { error: 'bad_action' }
}


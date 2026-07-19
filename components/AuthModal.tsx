'use client'

import { useState, useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'
import { supabase } from '@/lib/supabase'

interface AuthModalProps {
  open: boolean
  onClose: () => void
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const sbUser = useGameStore(s => s.sbUser)
  const setSbUser = useGameStore(s => s.setSbUser)
  const cloudPull = useGameStore(s => s.cloudPull)
  const setToast = useGameStore(s => s.setToast)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [msgOk, setMsgOk] = useState(false)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user
      if (user) {
        setSbUser({ id: user.id, email: user.email ?? '' })
        setToast('Нэвтэрлээ — синк хийж байна')
        cloudPull()
      } else {
        setSbUser(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [setSbUser, cloudPull, setToast])

  const authMsg = (txt: string, ok = false) => {
    setMsg(txt)
    setMsgOk(ok)
  }

  const handleLogin = async () => {
    authMsg('Нэвтэрч байна…', true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { authMsg(error.message); return }
    authMsg('')
  }

  const handleSignup = async () => {
    if (!email || password.length < 6) {
      authMsg('И-мэйл болон 6+ тэмдэгттэй нууц үг оруулна уу')
      return
    }
    authMsg('Бүртгэж байна…', true)
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) { authMsg(error.message); return }
    if (data.session) authMsg('Бүртгэгдлээ!', true)
    else authMsg('И-мэйлээ шалгаад баталгаажуулна уу, дараа нь нэвтэрнэ.', true)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (!open) return null

  return (
    <div className="modal-bg show" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <h3>Бүртгэл ба синк</h3>
        <p className="sub">
          {sbUser
            ? 'Синк идэвхтэй — явц чинь бүх төхөөрөмж дээр автоматаар хадгалагдана.'
            : 'Нэвтэрснээр давталтын явц, оруулсан үгс чинь бүх төхөөрөмж дээр хадгалагдана.'}
        </p>

        {!sbUser ? (
          <div>
            <input
              className="auth-field"
              type="email"
              placeholder="И-мэйл"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input
              className="auth-field"
              type="password"
              placeholder="Нууц үг (6+ тэмдэгт)"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <div className={`auth-msg ${msgOk ? 'ok' : 'err'}`}>{msg}</div>
            <div className="modal-actions">
              <button className="m-cancel" onClick={handleSignup}>Бүртгүүлэх</button>
              <button className="m-ok" onClick={handleLogin}>Нэвтрэх</button>
            </div>
          </div>
        ) : (
          <div>
            <div className="auth-user">
              <span>{sbUser.email}</span>
              <button onClick={handleLogout}>Гарах</button>
            </div>
            <div className="auth-msg ok" style={{ marginTop: 10 }}>
              Синк идэвхтэй — явц чинь бүх төхөөрөмж дээр автоматаар хадгалагдана.
            </div>
          </div>
        )}

        <div className="modal-actions" style={{ marginTop: 14 }}>
          <button className="m-cancel" style={{ flex: 1 }} onClick={onClose}>Хаах</button>
        </div>
      </div>
    </div>
  )
}

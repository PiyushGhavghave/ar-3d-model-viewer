import { useState, useRef, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import * as api from "../api"
import { useAuth } from "../context/AuthProvider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Verify2FA() {
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const inputRefs = useRef([])
  const navigate = useNavigate()
  const location = useLocation();
  const { setUser } = useAuth()

  const tempToken = location.state?.tempToken;

  useEffect(() => {
    if (!tempToken) {
        navigate("/login");
    }
    inputRefs.current[0]?.focus()
  }, [tempToken, navigate]);

  const handleInputChange = (index, value) => {
    if (value.length > 1 || !/^\d*$/.test(value)) return;

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    
    const verificationCode = code.join("")
    if (verificationCode.length !== 6) {
      setError("Please enter a 6-digit code")
      return
    }

    setLoading(true)
    try {
      const data = await api.verifyTwoFactorLogin(verificationCode, tempToken);
      setUser(data.user)
      navigate("/")
    } catch (err) {
      setError(err.message || "Verification failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-semibold text-slate-800">Two-Factor Authentication</CardTitle>
          <CardDescription className="text-slate-600">
            Enter the code from your authenticator app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center gap-2">
              {code.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-lg font-semibold border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors"
                />
              ))}
            </div>

            {error && <p className="text-center text-red-600 text-sm">{error}</p>}

            <Button
              type="submit"
              disabled={loading || code.join("").length !== 6}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              {loading ? "Verifying..." : "Verify"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
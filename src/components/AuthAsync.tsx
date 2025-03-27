import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { setToken, clearToken } from "@/features/auth/authSlice"
import { useAuth } from "@clerk/clerk-react"

const AuthSync = () => {
  const dispatch = useDispatch()
  const { getToken, isSignedIn } = useAuth()

  useEffect(() => {
    const syncToken = async () => {
      if (isSignedIn) {
        const token = await getToken()
        if (token) {
          dispatch(setToken(token))
        } else {
          dispatch(clearToken())
        }
      } else {
        dispatch(clearToken())
      }
    }

    let interval: NodeJS.Timeout
    interval = setInterval(syncToken, 1 * 60 * 1000)

    syncToken()

    return () => clearInterval(interval)
  }, [getToken, isSignedIn, dispatch])

  return null
}

export default AuthSync

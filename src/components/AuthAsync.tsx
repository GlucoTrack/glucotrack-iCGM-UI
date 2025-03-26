import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { setToken } from "@/features/auth/authSlice"
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
        }
      }
    }

    syncToken()
  }, [getToken, isSignedIn, dispatch])

  return null
}

export default AuthSync
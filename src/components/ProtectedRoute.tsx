import {
  SignedIn,
  useUser,
  useAuth,
} from "@clerk/clerk-react"

const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode
  allowedRoles: string[]
}) => {
  const { isSignedIn } = useUser()
  const { orgRole } = useAuth()

  if (!isSignedIn || !allowedRoles.includes(orgRole as string)) {
    return null
  }
  return (
    <>
      <SignedIn>{children}</SignedIn>
    </>
  )
}

export default ProtectedRoute

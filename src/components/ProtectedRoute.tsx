import {
  SignedIn,
  useUser,
  useAuth,
  useOrganizationList,
} from "@clerk/clerk-react"
import { useEffect } from "react"

const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode
  allowedRoles: string[]
}) => {
  const { isSignedIn } = useUser()
  const { orgRole } = useAuth()
  const { userMemberships, setActive, isLoaded: isOrgListLoaded } = useOrganizationList({
    userMemberships: true,
  })

  useEffect(() => {
    if (!isOrgListLoaded) return

    if (!orgRole && userMemberships.data.length > 0) {
      // If there is no active role, I set the first organization as active
      // TODO: set the id in the .env
      setActive({ organization: userMemberships.data[0].organization.id })
    }
  }, [isOrgListLoaded, userMemberships, setActive, orgRole])

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

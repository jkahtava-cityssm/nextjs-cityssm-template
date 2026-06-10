import { ServerNavigationPermissions } from "@/lib/permissions/navigation-permissions"

export default function Landing() {
    return (<ServerNavigationPermissions.Guard permissionKey="Authenticated">
    <div>...LANDING...</div>
    </ServerNavigationPermissions.Guard>)
}
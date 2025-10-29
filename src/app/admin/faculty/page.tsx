import { getAdminData } from "@/lib/actions";
import { FacultyManager } from "../../../components/admin/faculty-manager";

export default async function FacultyPage() {
    const { faculty } = await getAdminData();
    
    return (
        <div className="p-4 md:p-8 space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">Faculty Management</h1>
            <FacultyManager initialFaculty={faculty} />
        </div>
    );
}
import { getAdminData } from "@/lib/actions";
import { TokenManager } from "@/components/admin/token-manager";
import type { Token } from "@/lib/types";

export default async function TokensPage() {
    const data = await getAdminData();
    const tokens: Token[] = data.tokens ?? [];
    
    return (
        <div className="p-4 md:p-8 space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">Token Management</h1>
            <TokenManager initialTokens={tokens} />
        </div>
    );
}

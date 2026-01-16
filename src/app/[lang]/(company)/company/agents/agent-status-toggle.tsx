'use client';

import { Switch } from "@/components/ui/switch";
import { toggleAgentStatus } from "./actions";
import { useState } from "react";
import { useTransition } from "react";
// Actually let's just use console for now if no toast, or simple UI feedback

export function AgentStatusToggle({ id, initialStatus }: { id: string, initialStatus: boolean }) {
    const [isActive, setIsActive] = useState(initialStatus);
    const [isPending, startTransition] = useTransition();

    const handleToggle = (checked: boolean) => {
        setIsActive(checked); // Optimistic update
        startTransition(async () => {
            try {
                await toggleAgentStatus(id, checked);
            } catch (error) {
                setIsActive(!checked); // Revert on failure
                console.error("Failed to toggle status");
            }
        });
    };

    return (
        <Switch
            checked={isActive}
            onCheckedChange={handleToggle}
            disabled={isPending}
        />
    );
}

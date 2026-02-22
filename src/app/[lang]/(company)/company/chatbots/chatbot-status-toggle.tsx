'use client';

import { Switch } from "@/components/ui/switch";
import { toggleChatbot } from "./actions";
import { useState, useTransition } from "react";

export function ChatbotStatusToggle({ id, initialStatus }: { id: string; initialStatus: boolean }) {
    const [isActive, setIsActive] = useState(initialStatus);
    const [isPending, startTransition] = useTransition();

    const handleToggle = (checked: boolean) => {
        setIsActive(checked);
        startTransition(async () => {
            try {
                await toggleChatbot(id, checked);
            } catch {
                setIsActive(!checked);
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

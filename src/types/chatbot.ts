export interface ChatbotFlowOption {
    label: string;
    match: string[];
    nextNodeId: string;
}

export interface ChatbotFlowAction {
    type: 'transfer_to_human' | 'transfer_to_ai_agent' | 'end_conversation';
}

export interface ChatbotFlowNode {
    id: string;
    message: string;
    options?: ChatbotFlowOption[];
    action?: ChatbotFlowAction;
}

export interface ChatbotFlow {
    startNodeId: string;
    nodes: Record<string, ChatbotFlowNode>;
}

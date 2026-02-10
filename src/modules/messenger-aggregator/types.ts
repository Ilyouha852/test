export interface UnifiedMessage {
    id: string;
    source: string; // 'telegram', 'whatsapp' и т.д.
    userId: string;
    userName?: string;
    chatId: string;
    content: string;
    type: 'text' | 'callback' | 'image' | 'other';
    attachments?: Array<{
        type: string; // 'image', 'document' и т.д.
        url?: string;
        buffer?: Buffer;
        mimeType?: string;
        fileId?: string; // ID в нашем хранилище (MinIO)
    }>;
    timestamp: Date;
    metadata?: Record<string, any>;
}

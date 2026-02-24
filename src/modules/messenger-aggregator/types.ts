export interface UnifiedMessage {
    user_id: string;
    button: string;
    place: {
        chat_id: Int16Array;
        message_id: Int16Array;
    };
    attachments_base64: string;
    date_time: Date;
    name: string; //команда
    text: string; //сообщение
}

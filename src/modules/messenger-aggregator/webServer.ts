import express, { type Express, type Request, type Response } from 'express';
import http from 'http';

import MainBotController from '../../controllers/MainBotController.js';
import { MessengerAggregator } from './MessengerAggregator.js';

export class WebServer {
    private app: Express;
    private server: http.Server;
    private messengerAggregator: MessengerAggregator;
    private mainBotController: MainBotController;
    public isMessageReceived: boolean = false;
    private messageReceivedPromise: Promise<void>;
    private resolveMessageReceived: (() => void) | null = null;

    constructor(messengerAggregator: MessengerAggregator) {
        this.messengerAggregator = messengerAggregator;
        this.mainBotController = new MainBotController(messengerAggregator);
        this.app = express();
        this.server = http.createServer(this.app);
        this.messageReceivedPromise = new Promise((resolve) => {
            this.resolveMessageReceived = resolve;
        });
        this.setupMiddlewares();
        this.setupRoutes();
    }

    private setupMiddlewares(): void {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
    }

    private setupRoutes(): void {
        this.app.post('/user_message', this.handleUserMessage.bind(this));
    }

    private async handleUserMessage(
        req: Request,
        res: Response,
    ): Promise<void> {
        console.log('📨 Получено сообщение от пользователя:', req.body);

        try {
            // Делегировать MainBotController для полной обработки
            await this.mainBotController.handleWebhook(req, res);
            this.isMessageReceived = true;

            // Сигнализировать о получении сообщения
            if (this.resolveMessageReceived) {
                this.resolveMessageReceived();
                this.resolveMessageReceived = null;
            }
        } catch (error) {
            console.error('❌ Ошибка обработки сообщения:', error);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }

    public start(port: number): void {
        this.server.listen(port, () => {
            console.log('Веб-сервер запущен на порту ' + port);
        });
    }

    // Ожидание первого сообщения
    public async waitForFirstMessage(): Promise<void> {
        return this.messageReceivedPromise;
    }
}
# Support_Bot_IST

Репозиторий для проекта Бот Поддержки<br/>

## 🚀 Быстрый старт

### 1. Клонируйте репозиторий<br/>
```bash
git clone https://github.com/ZeneZ0/Support_Bot_IST.git
cd Support_Bot_IST
```
### 2. Установите зависимости<br/> 
```bash
npm install
```
Если не сработает, попробуйте через yarn:<br/>
```bash
yarn install
```
### ВАЖНО!<br/> 
Устанавливаем через yarn всё, лучше всего прописать:<br/>
```bash
yarn install --ignore-engines --ignore-optional
```
После уже можно хоть через yarn, хоть через npm работать<br/> 
### 3. Настройте окружение<br/>
```bash
notepad .env
```
Пропишите в файл:<br/>
```bash
# JWT Secret Key for authentication
JWT_SECRET=super_secret_jwt_key_for_development_12345

# Server Port
PORT=3007

# Node Environment
NODE_ENV=development

# DynamoDB Configuration
DYNAMODB_TABLE=support-bot-table
DYNAMODB_ENDPOINT=http://localhost:8000
DYNAMODB_REGION=us-east-1
AWS_ACCESS_KEY_ID=fake
AWS_SECRET_ACCESS_KEY=fake

# Optional: AWS Configuration for production
# AWS_REGION=us-east-1
# AWS_ACCESS_KEY_ID=your_real_access_key
# AWS_SECRET_ACCESS_KEY=your_real_secret_key
```
### 4. Запустите базу данных<br/>
```bash
npm run db:start
```
### 5. Запустите сервер<br/>
```bash
npm run dev
```
### 🧪 Проверка работы<br/>
После запуска откройте новое окно терминала и проверьте:<br/>
Проверить Repair Bot API:<br/>
```bash
curl -X POST http://localhost:3007/api/v1/repair-bot/sessions/test123/start
```
Проверить работу с базой данных:<br/>
```bash
# Получить значение счётчика из БД
curl http://localhost:3007/api/v1/counter

# Увеличить счётчик в БД
curl -X POST http://localhost:3007/api/v1/counter/increment
```
### 🔧 Полезные команды<br/>
```bash
# Запустить базу данных и сервер вместе
npm run dev:full

# Проверить статус базы данных
npm run db:status

# Остановить базу данных
npm run db:stop

# Запустить тесты
npm test
```
## И всё заработает! 🎉<br/>

##Теперь работаем с MinIO<br/>
###1. Запускаем MinIO<br/>
```bash
npm run minio:start
```
###2. Открываем в вебе<br/>
Открываем http://localhost:9001/ в браузере<br/>
Логин: minioadmin <br/>
Пароль: minioadmin<br/>

###3. Проверка статуса<br/>
```bash
npm run minio:status
```
###4. Стоп MinIO<br/>
```bash
npm run minio:stop
```

###Полезные команды<br/>
```bash
#Старт обеих баз данных
npm run storage:start

#Запустите сервер с хранилищем
npm run dev:with-storage

#Просмотр логов
npm run minio:logs
```
###Установка корзины<br/>
1.Go to http://localhost:9001<br/>

2.Click "Create Bucket"<br/>

3.Name: support-bot-files<br/>

4.Create bucket<br/>

###Доступ к API<br/>
1.Endpoint: http://localhost:9000<br/>

2.Access Key: minioadmin<br/>

3.Secret Key: minioadmin<br/>

4.Region: us-east-1<br/>


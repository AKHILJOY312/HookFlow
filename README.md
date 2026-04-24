# 🚀 HookFlow

A minimal, production-inspired webhook delivery system built with Node.js, TypeScript, MongoDB, Redis, and BullMQ.

---

## 🧠 Overview

HookFlow allows external systems to subscribe to events and receive real-time updates via HTTP webhooks.

This project demonstrates core backend concepts like:

- Event-driven architecture
- Asynchronous processing with queues
- Worker-based job execution
- Webhook delivery mechanisms

---

## ⚙️ Tech Stack

- Node.js + Express
- TypeScript
- MongoDB (Mongoose)
- Redis
- BullMQ (Queue system)
- Axios

---

## 🏗️ Architecture

Client registers webhook
↓
Event triggered (API)
↓
Job added to Redis queue
↓
Worker processes job
↓
HTTP POST sent to external URL

---

## 📦 Features (Current)

- Register webhook endpoints
- Trigger events manually
- Queue-based async processing
- Worker for webhook delivery
- Basic signature generation

---

## 🧪 Testing

You can test webhooks using:

👉 https://webhook.site

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
pnpm install
```

---

### 2. Setup environment

Copy `.env.example` to `.env` and adjust values:

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/webhook-simple
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

---

### 3. Start Redis (Docker)

```bash
docker run -p 6379:6379 redis
```

---

### 4. Run server

```bash
pnpm dev
```

---

### 5. Run worker

```bash
pnpm worker
```

---

## 🔌 API Endpoints

### Register Webhook

```http
POST /webhook
```

```json
{
  "url": "https://webhook.site/your-id",
  "event": "user.created"
}
```

---

### Trigger Event

```http
POST /trigger
```

```json
{
  "event": "user.created",
  "data": {
    "name": "AJ"
  }
}
```

---

## ⚠️ Current Limitations

- No idempotency handling
- No rate limiting
- Single worker process in local setup
- No authentication/authorization on endpoints
- No automated tests yet

---

## 🚧 Roadmap

- [ ] Retry mechanism with exponential backoff
- [ ] Webhook delivery logs
- [ ] Replay failed webhooks
- [ ] Idempotency support
- [ ] Multi-worker scaling
- [ ] Dashboard UI

---

## 🎯 Learning Goals

This project is designed to help understand:

- How real webhook systems work (Stripe, GitHub)
- Queue-based architectures
- Background job processing
- System design fundamentals

---

## 📌 Author

Built as a backend engineering learning project.

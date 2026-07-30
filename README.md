<div align="center">

# Jaryn Mail

**A full-stack email application with real-time notifications, smart filtering, and a rich set of software design patterns.**

![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

</div>

---

## Overview

Jaryn is a full-stack email application built with Spring Boot and Angular. It covers the core email workflow — sending, receiving, drafts, trash, attachments, contacts, and automated filtering — with stateless JWT authentication and real-time inbox updates via Server-Sent Events.

The project was built as a deep exploration of software design patterns, applying seven distinct patterns across the backend.

---

## Demo

[Watch the demo video](Demo/JarynDemo.mp4)

---

## Features

**Email**
- Send, receive, reply, and forward emails
- Draft saving and trash management
- File attachments with time-bound IDs and expiry enforcement
- Real-time inbox updates via SSE

**Filtering**
- User-defined rules that automatically move, delete, star, or forward incoming emails
- Composable search with AND/OR logic across subject, sender, and content

**Contacts**
- Contact book with strategy-based search (by name, email, or all)
- Sorting by name or date

**Authentication**
- Stateless JWT-based login and registration

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Java 17, Spring Boot 4, Maven |
| Database | PostgreSQL (users), File System JSON (emails/attachments) |
| Security | JWT (JJWT) |
| Frontend | Angular 21, TypeScript, Tailwind CSS v4 |
| Real-time | Server-Sent Events (SSE) |

---

## Design Patterns

| Pattern | Where |
|---------|-------|
| Command | Filter actions — Move, Delete, Star, Forward executed dynamically |
| Strategy | Contact search (by name / email / all) and contact sorting |
| Factory | FilterFactory generates matching logic from filter rule definitions |
| Builder | EmailBuilder — fluent API for constructing and cloning email objects |
| Observer | SSE event publishing on email receipt and draft save |
| Filter | Composable search criteria — AndFilter, OrFilter, SubjectFilter, SenderFilter |
| Proxy | AttachmentService manages lifecycle, expiry, and encryption of stored files |

---

## Running Locally

**Prerequisites:** Java 17+, Maven, Node.js 18+, PostgreSQL

**Backend**

Configure `backend/src/main/resources/application.properties` with your DB credentials, then:
```bash
cd backend
./mvnw spring-boot:run
```

**Frontend**
```bash
cd frontend
npm install
ng serve
```
App available at `http://localhost:4200`

---

## Authors

Jana Rashed · Ahmed Sherif Abd El-Moniem · Mohamed Radwan · Yousef Walid · Nour El Atawy

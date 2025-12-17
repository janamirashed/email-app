# 📧 Jaryn

A full-stack web-based email application designed to simulate core email functionalities with a focus on design patterns.

## 📋 Project Overview

**Purpose** This project is an application of some of the learned design patterns.

**High-Level Architecture**
The system follows a **Client-Server Architecture**:
*   **Frontend:** Angular for a responsive user interface.
*   **Backend:** Spring Boot (REST API) for business logic and data persistence.
*   **Database:** PostgreSQL for saving user data and a custom **File System Storage** for emails, attachments, contacts, and filters.

**Key Design Decisions**
*   **Separation of Concerns:** Strict division between Controller, Service, and Repository layers.
*   **Design Patterns:** Use of **Command**, **Strategy**, **Factory**, **Observer**, **Filter**, **Proxy**, and **Builder** patterns to decouple logic.
*   **Security:** Stateless authentication using **JWT** (JSON Web Tokens).

---

## 🛠️ Technology Stack

### Backend
*   **Language:** Java 17
*   **Framework:** Spring Boot 4 (Web, Data JPA, Security)
*   **Build Tool:** Maven
*   **Database:** PostgreSQL (Users), File System (Content)
*   **Utilities:** Lombok, Jackson, JJWT, Jsoup

### Frontend
*   **Framework:** Angular (v21)
*   **Styling:** Tailwind CSS v4
*   **Editor:** CodeMirror / Ngx-Editor

---

## 📂 Project Structure

### Backend (`/backend`)
```text
src/main/java/com/mail/backend
├── config/           # Security and App configurations
├── controller/       # REST API Endpoints
├── dps/              # Design Patterns & Strategies
│   ├── builder/      # Builder pattern (EmailBuilder)
│   ├── command/      # Command pattern (Filter Actions)
│   ├── contactStrategy/ # Strategy pattern (Contact Search/Sort)
│   ├── factory/      # Factory pattern (Filters/Folders)
│   ├── SearchFilter/ # Filter pattern (Search Criteria)
│   └── strategy/     # General strategies
├── dto/              # Data Transfer Objects
├── model/            # JPA Entities & Domain Models
├── repository/       # Data Access Layer (File I/O & JPA)
└── service/          # Business Logic Layer
```

### Frontend (`/frontend`)
```text
src/app
├── components/       # Shared reusable UI components
├── core/             # Core services and guards
├── features/         # Feature-specific modules (Auth, Email)
└── shared/           # Shared utilities and pipes
```

---

## 🏗️ Architecture & Design

**Architectural Pattern:** **Layered Architecture (MVC)**

**Design Patterns Implementation:**

1.  **Command Pattern:**
    *   **Usage:** Decouples the request for an action from the object that performs it. Used for **Filter Actions**.
    *   **Implementation:** The `Action` interface is implemented by classes like `Move`, `Delete`, `Star`, and `Forward`. This allows the `FilterService` to execute user-defined rules dynamically without hardcoding logic.

2.  **Strategy Pattern:**
    *   **Usage:** Enables selecting an algorithm at runtime.
    *   **Implementation:**
        *   **Contact Search:** `ContactSearchStrategy` interface has implementations like `SearchContactsByName`, `SearchContactsByEmail`, and `SearchContactsAll`.
        *   **Sorting:** `SortStrategy` allows switching between `SortContactsByName` and `SortContactsByDate`.

3.  **Factory Pattern:**
    *   **Usage:** Creates objects without specifying the exact class of object that will be created.
    *   **Implementation:** `FilterFactory` generates the appropriate matching logic (e.g., "contains", "starts with") based on the filter rule definition.

4.  **Builder Pattern:**
    *   **Usage:** Constructs complex objects step by step.
    *   **Implementation:** `EmailBuilder` provides a fluent API (`Email.builder().subject(...).build()`) for creating immutable `Email` instances, used extensively in `EmailService` for cloning and modifying emails.

5.  **Observer Pattern:**
    *   **Usage:** Defines a subscription mechanism to notify multiple objects about events.
    *   **Implementation:** `EmailService` uses `EventService` to publish `SSE` (Server-Sent Events). When an email is received or a draft is saved, an event is published to notify connected frontend clients in real-time.

6.  **Filter Pattern (Structural):**
    *   **Usage:** Allows developers to filter a set of objects using different criteria and chaining them.
    *   **Implementation:** The `SearchFilter` interface allows for composable search criteria. Implementations like `AndFilter`, `OrFilter`, `SubjectFilter`, and `SenderFilter` are chained together in `EmailService.searchEmails` to build complex, dynamic search queries.

7.  **Proxy Pattern:**
    *   **Usage:** Controls access to the original object, allowing for additional operations like validation or security.
    *   **Implementation:** `AttachmentService` acts as a proxy for `AttachmentRepository`. It manages the lifecycle of attachments by generating time-bound IDs, enforcing expiration policies (5-minute validity), and requiring explicit acknowledgement before finalizing persistence. It also proxies the encryption/decryption responsibilities for secure storage.

**Data Persistence:**
The application uses a hybrid persistence approach:
*   **PostgreSQL:** Stores User accounts and authentication data.
*   **File System Storage:**
    *   **Emails:** Stored as JSON files in a structured directory format: `data/emails/{username}/{folder}/{messageId}.json`.
    *   **Attachments:** Stored as binary files (`.bin`) in `data/attachment/`, paired with metadata JSON files.
    *   **Repositories:** Custom implementations (`EmailRepository`, `AttachmentRepository`) use Java NIO (`java.nio.file`) to manage these file operations, providing a database-like abstraction over the file system.

**Data Flow:**
1.  **Request:** User action triggers Angular HTTP request.
2.  **Controller:** Receives DTO, validates input.
3.  **Service:** Executes business logic (e.g., applying filters, publishing events).
4.  **Persistence:** Repository saves state to PostgreSQL (Users) or File System (Emails/Attachments).

---

## 🧩 Core Modules

| Module | Responsibility | Key Endpoints |
| :--- | :--- | :--- |
| **Email** | Sending, receiving, drafts, trash. | `/api/email/send`, `/api/email/inbox` |
| **Filter** | Automating email organization using Command pattern. | Triggered internally on email receipt. |
| **Contact** | Managing contact book with Strategy-based search. | `/api/contacts` |
| **Attachment** | File upload/download via Proxy service. | `/api/attachments` |

---

## 📖 Class & Function Documentation

### `EmailController`
Exposes REST endpoints for email operations.
*   `sendEmail(Email email)`: Sends a new email.
*   `getInbox(int page, int limit)`: Retrieves paginated inbox.
*   `searchEmails(String keyword, ...)`: Advanced search functionality using Filter pattern chaining.

### `FilterService`
Manages user-defined filtering rules.
*   `applyFilters(User user, Email email)`: Iterates through user filters and executes matching actions.
*   `addFilter(User user, Filter filter)`: Validates and persists new rules.

### `Email` (Model)
Represents the core email entity.
*   **Fields:** `messageId`, `subject`, `body`, `attachments`, `priority`.
*   **Methods:** `builder()` for fluent construction.

---

## ⚙️ Setup & Execution

### Prerequisites
*   Java JDK 17+
*   Node.js 18+
*   PostgreSQL

### Backend Setup
1.  Navigate to `backend/`.
2.  Configure `src/main/resources/application.properties` with your DB credentials.
3.  Run the application:
    ```bash
    ./mvnw spring-boot:run
    ```

### Frontend Setup
1.  Navigate to `frontend/`.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    ng serve
    ```
4.  Open `http://localhost:4200` in your browser.

---

## 🚀 Extensibility

**Adding a New Filter Action:**
1.  Implement `com.mail.backend.dps.command.Action`.
2.  Register the action in `FilterService.ACTIONS`.

**Adding a New Search Strategy:**
1.  Implement `ContactSearchStrategy`.
2.  Add logic in `com.mail.backend.dps.contactStrategy`.

---

## 📚 Glossary

*   **DTO:** Data Transfer Object.
*   **JWT:** JSON Web Token (Authentication).
*   **DPS:** Design Patterns package.
*   **SSE:** Server-Sent Events (Real-time updates).

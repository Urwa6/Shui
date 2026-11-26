# Shui – Serverless Bulletin Board API

## Overview

Shui is a serverless REST API for a digital bulletin board. It allows users to register, authenticate, create posts, retrieve posts, update and delete their own posts, and interact through comments.

The API also supports guest posting, allowing visitors to create posts without creating an account. Each guest post receives an automatically generated username.

The application uses AWS Lambda to handle requests, Amazon API Gateway to expose REST endpoints, and Amazon DynamoDB to store application data.

## Features

- User registration and login.
- Secure password hashing using bcrypt.
- JWT-based authentication.
- Create, retrieve, update and delete posts.
- Retrieve all posts or filter posts by username.
- Post ownership verification before updates and deletion.
- Guest posting with automatically generated usernames.
- Create and retrieve comments.
- Automatic deletion of associated comments when a post is deleted.
- Request validation using Zod.
- Reusable authentication middleware using Middy.
- Centralized HTTP response handling and error handling.

## Technologies

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| JavaScript (ES Modules) | Application development |
| AWS Lambda | Serverless function execution |
| Amazon API Gateway | HTTP API endpoints |
| Amazon DynamoDB | NoSQL database |
| Serverless Framework | Infrastructure configuration and deployment |
| Middy | Middleware for Lambda handlers |
| bcrypt | Password hashing |
| JSON Web Token | User authentication |
| Zod | Request validation |
| AWS SDK for JavaScript | Communication with DynamoDB |

## Project Structure

```text
src/
├── database/
│   ├── comment.js
│   ├── dynamodb.js
│   ├── post.js
│   └── users.js
├── handlers/
│   ├── auth/
│   │   ├── register.js
│   │   └── login.js
│   ├── comments/
│   │   ├── create.js
│   │   └── getAll.js
│   └── posts/
│       ├── create.js
│       ├── delete.js
│       ├── getAll.js
│       ├── getById.js
│       └── update.js
├── middleware/
│   └── auth.js
├── services/
│   ├── authService.js
│   └── postService.js
└── utils/
    └── response.js

serverless.yml
package.json
```

### Folder Responsibilities

- **database/** – Contains DynamoDB operations for users, posts and comments.
- **handlers/** – Handles incoming HTTP requests and returns API responses.
- **middleware/** – Contains reusable authentication logic.
- **services/** – Handles application logic, including post ownership checks.
- **utils/** – Contains shared response utilities.
- **serverless.yml** – Defines AWS resources, Lambda functions, API routes, permissions and environment variables.

## Installation

### Prerequisites

Before installing the project, make sure you have:

- Node.js 22 or later.
- npm.
- An AWS account.
- AWS CLI installed and configured.
- Appropriate AWS permissions for deploying Lambda, API Gateway, DynamoDB and related resources.

### 1. Clone the Repository

```bash
git clone https://github.com/Urwa6/Shui.git
cd Shui
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
JWT_SECRET=your_secure_secret
```

Generate a strong random secret for JWT signing and verification.

The `.env` file is used for local configuration during deployment. It should never be committed to GitHub.

### 4. Configure AWS Credentials

Configure your AWS credentials using the AWS CLI.

For example, if your AWS profile is named `shui`:

```bash
aws configure --profile shui
```

Enter your AWS access key, secret access key and preferred region (`eu-north-1`).

## Deployment

The project uses the Serverless Framework to deploy its infrastructure and Lambda functions to AWS.

Deploy the application using:

```bash
npx serverless deploy --aws-profile shui
```

After deployment, the Serverless Framework displays the API Gateway URL.

## API Documentation

### Base URL

```text
https://s8pj74gbng.execute-api.eu-north-1.amazonaws.com
```

### Authentication Endpoints

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| POST | `/auth/register` | Register a new user | Not required |
| POST | `/auth/login` | Authenticate a user and receive a JWT | Not required |

### Post Endpoints

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| GET | `/posts` | Retrieve all posts | Not required |
| GET | `/posts?username={username}` | Retrieve posts by username | Not required |
| GET | `/posts/{postId}` | Retrieve a specific post | Not required |
| POST | `/posts` | Create a post | Optional |
| PUT | `/posts/{postId}` | Update an existing post | Required; owner only |
| DELETE | `/posts/{postId}` | Delete a post | Required; owner only |

### Comment Endpoints

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| GET | `/posts/{postId}/comments` | Retrieve comments for a post | Not required |
| POST | `/posts/{postId}/comments` | Create a comment | Required |

## Example Requests

### Register a User

**POST** `/auth/register`

```json
{
  "username": "exampleuser",
  "password": "yourpassword"
}
```

### Log In

**POST** `/auth/login`

```json
{
  "username": "exampleuser",
  "password": "yourpassword"
}
```

A successful login returns a JWT token.

### Create a Post

**POST** `/posts`

```json
{
  "title": "My First Post",
  "content": "Hello from Shui!"
}
```

For an authenticated request, include the token in the request header:

```text
Authorization: Bearer YOUR_JWT_TOKEN
```

If no token is provided, the API creates a guest post with an automatically generated username.

### Update a Post

**PUT** `/posts/{postId}`

```json
{
  "title": "Updated title",
  "content": "Updated post content"
}
```

Only the authenticated owner of a registered user's post can update it.

### Create a Comment

**POST** `/posts/{postId}/comments`

```json
{
  "content": "Thanks for sharing!"
}
```

A valid JWT is required to create a comment.

## Database Design

The application uses Amazon DynamoDB with three tables:

### Users Table
Stores registered user information, including usernames and hashed passwords.

### Posts Table
Stores posts created by registered users and guests. Each post includes information such as its ID, username, title, content, creation timestamp and update timestamp.

The posts table also uses secondary indexes to support retrieving posts by date and filtering posts by username.

### Comments Table
Stores comments associated with posts. Each comment contains its associated post ID, comment ID, username, content and creation timestamp.

When a post is deleted, its associated comments are also deleted.

## Authentication and Security

Passwords are hashed using bcrypt before being stored in DynamoDB.

JWT tokens are generated after successful login and verified by authentication middleware when accessing protected endpoints.

The API checks post ownership before allowing updates or deletion. Guest posts cannot be updated or deleted by registered users.

Request data is validated using Zod to reject invalid input.

## Error Handling

The API uses standard HTTP status codes:

| Status Code | Description |
|---|---|
| 200 | Request successful |
| 201 | Resource created |
| 204 | Resource deleted |
| 400 | Invalid request |
| 401 | Authentication required or invalid token |
| 403 | Access forbidden |
| 404 | Resource not found |
| 409 | Resource conflict |
| 500 | Internal server error |

## Author

Developed by Urwah as an individual project for the course Apputveckling mot molnet.
# Notification System Design

## Architecture Overview
The system is composed of a frontend application for user interaction, a backend service for processing notifications, and a shared logging middleware for tracking application behavior.

## Components
1. **Frontend (React)**: Handles user interface and triggers notification requests.
2. **Backend (Express)**: Exposes APIs to send notifications and processes business logic.
3. **Logging Middleware**: Captures lifecycle events and logs them to the central evaluation server securely.

## Data Flow
User -> Frontend -> Backend -> Notification Service
All significant state changes and errors use the logging middleware to record events.

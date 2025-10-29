# **App Name**: Feedback Fortress

## Core Features:

- Token Generation and Management: Generate and manage single-use tokens for students to access the feedback form, including CSV upload functionality.
- Anonymous Feedback Submission: Allow students to submit feedback anonymously using a valid token, including faculty selection, ratings, and comments.
- Admin Authentication: Secure admin login with bcrypt password hashing to protect access to the dashboard.
- Feedback Analytics Dashboard: Display feedback analytics through Chart.js graphs, with options to export data in CSV or PDF format.
- Abuse Prevention: Implement CAPTCHA and rate-limiting to prevent abuse and ensure the integrity of the feedback system.
- Sensitive Data Redaction: Use an LLM as a tool to verify that user submissions contain no identifying information, such as student names or emails. If the tool identifies PII, the comment will be redacted to preserve anonymity.

## Style Guidelines:

- Primary color: Soft blue (#A0D2EB) to create a calm and trustworthy environment.
- Background color: Very light blue (#F0F8FF) to ensure readability and reduce eye strain.
- Accent color: Pale orange (#F2BE22) for key actions and highlights, drawing attention without overwhelming the user.
- Font pairing: 'Inter' (sans-serif) for both headlines and body text, offering a clean and modern aesthetic.
- Use simple, clear icons for navigation and data visualization.
- Maintain a clean, intuitive layout with clear visual hierarchy for easy navigation.
- Use subtle animations to provide feedback on user interactions and enhance user experience.
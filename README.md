# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Building and Deploying

Follow these instructions to get your application built and ready for deployment.

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (version 18 or newer) and npm installed on your system.

### Local Development

To run the application on your local machine for development and testing, follow these steps:

1.  **Install Dependencies:** Open your terminal, navigate to the project's root directory, and run the following command to install the necessary packages:
    ```bash
    npm install
    ```

2.  **Run the Development Server:** After the installation is complete, start the development server:
    ```bash
    npm run dev
    ```
    Your application will be available at `http://localhost:9002`.

### Building for Production

When you are ready to deploy your application, you need to create a production-optimized build.

1.  **Create a Production Build:** Run the following command in your terminal:
    ```bash
    npm run build
    ```
    This will compile and optimize your code, creating a `.next` folder with the production-ready assets.

2.  **Start the Production Server:** To run the production build locally, use:
    ```bash
    npm run start
    ```
    This will start a server with the optimized code, which is how your application will run when deployed.

### Deployment

You can deploy this Next.js application to any hosting platform that supports Node.js. Popular choices include:

*   **Firebase App Hosting:** This project is pre-configured for Firebase App Hosting. You can deploy it by connecting your repository to a Firebase project.
*   **Vercel:** As the creators of Next.js, Vercel offers seamless deployment for Next.js applications.
*   **Other Cloud Providers:** You can also deploy to services like AWS, Google Cloud, or Azure.
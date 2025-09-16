# HeyChat 

HeyChat is a modern, real-time social media web application inspired by X (formerly Twitter). It's built with a focus on performance, security, and a polished user experience, featuring a dynamic "For you" feed, live trending topics, and a responsive, themeable interface. 

--- 

## Key Features

* **Real-Time Feed:** View posts from followed accounts or discover new content through an intelligent "For you" feed. 
* **Dynamic Trending Topics:** A time-decaying algorithm ensures the "Trends" section always reflects what's happening *now*.
* **Full Social Interactions:** Create posts with images, reply, repost, like, and bookmark content.
* **User Profiles:** Customizable user profiles with display names, bios, banners, and follower/following counts.
* **PWA Ready:** Optimized as a Progressive Web App, allowing users to "install" it on their mobile devices for a native-like experience.
* **Themeable UI:** Seamlessly switch between light and dark modes, with the browser theme adapting automatically.
* **Secure Authentication:** Robust and secure user authentication system powered by Firebase.
* **Admin Panel:** A secure, dedicated dashboard for administrators to manage users and content.
* **Premium Subscriptions:** A fully integrated payment system for users to subscribe to premium features.

---

## Tech Stack

* **Frontend:** React, Vite, Tailwind CSS
* **Backend & Database:** Firebase (Firestore, Authentication, Storage)
* **Deployment:** Vercel

--- 

## Setup and Installation 

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/254cloudke/heychat-pvt.git](https://github.com/254cloudke/heychat-pvt.git)
    cd heychat
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    * Create a file named `.env.local` in the root of the project.
    * Copy the contents of `.env.example` (or your provided environment variables) into this new file.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:3000`.

---

## Environment Variables

Your `.env.local` file should contain the following Firebase configuration keys:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_ADMIN_EMAIL=your_admin_email@example.com
```

---

## Contributing 

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/254cloudke/heychat-pvt/issues).

🎵 Music Player

A modern and responsive web-based music player designed to provide an interactive and personalized music experience.

The application supports standard music-player controls, music search through an external API, user authentication, favorite songs, personal playlists, and locally added songs.

The project currently uses Firebase Authentication for user accounts and Cloud Firestore for storing user-specific data such as liked songs and playlists. Users can also add their own personal songs, which are currently stored locally in the browser.

⸻

✨ Features

🎧 Music Player

The application provides standard music playback functionality:

* ▶️ Play / Pause
* ⏭️ Next Song
* ⏮️ Previous Song
* 🔊 Volume Control
* 🔇 Mute / Unmute
* ⏱️ Current Playback Time
* 🕒 Song Duration
* 📊 Interactive Progress Bar
* 🎯 Seek Functionality
* 🎵 Song Title
* 🎤 Artist Name
* 🖼️ Album Artwork

⸻

🎵 Default Songs

The application comes with 3 default songs added by the developer so that users can immediately test the music player without searching for a song first.

These default songs are available directly in the application and can be played using the standard player controls.

Users can also search for additional songs through the integrated music API.

⸻

🔎 Music Search

Users can search for a large number of songs using an integrated Music API.

The application can retrieve information such as:

* 🎵 Song title
* 🎤 Artist name
* 💿 Album information
* 🖼️ Album artwork
* ▶️ Audio preview

Due to copyright and licensing restrictions, API-provided tracks may be available only as short previews, such as approximately 30 seconds, depending on the API and availability of the particular track.

The project does not intend to host or distribute copyrighted music without authorization.

⸻

👤 User Authentication

The application includes a user authentication system powered by Firebase Authentication.

Users can:

* 📝 Create an account
* 🔑 Log in
* 🚪 Log out
* 👤 Access their personal account

Authentication Flow

User
 │
 ├── Sign Up
 │
 ├── Login
 │
 └── Logout
       │
       ↓
Firebase Authentication
       │
       ↓
Authenticated User

⸻

❤️ Favorite Songs

Authenticated users can like songs and save them to their personal favorites.

Users can:

* ❤️ Like songs
* 💔 Unlike songs
* 📋 View favorite songs
* ▶️ Play favorite songs

Favorite song data is stored in Cloud Firestore and associated with the authenticated user’s account.

⸻

🎶 Personal Playlists

Users can create and manage their own playlists.

Playlist functionality includes:

* ➕ Create playlists
* 🎵 Add songs to playlists
* 🗑️ Remove songs from playlists
* 📋 View personal playlists
* ▶️ Play songs from playlists

Playlist data is stored using Cloud Firestore.

Playlist Structure

User Account
     │
     ↓
Cloud Firestore
     │
     ├── ❤️ Favorite Songs
     │
     ├── 🎶 Playlist 1
     │      ├── Song A
     │      ├── Song B
     │      └── Song C
     │
     └── 🎶 Playlist 2
            ├── Song D
            └── Song E

⸻

🔀 Shuffle, Repeat & Autoplay

The music player includes additional playback functionality:

* 🔀 Shuffle Mode — Plays songs in a random order
* 🔁 Repeat Mode — Repeats the current song or playlist
* ▶️ Autoplay — Automatically continues with the next available song

These features provide a smoother and more interactive listening experience.

⸻

💾 Personal Songs & Local Storage

Users can add their own personal music files to the application.

Currently, these locally added songs are stored using the browser’s Local Storage.

User adds personal song
          ↓
     Local Storage
          ↓
 Same Browser / Device

This means locally added songs are currently available only in the browser/device where they were stored.

A permanent cloud-storage solution is planned for future development.

⸻

☁️ Data Storage Architecture

Different types of data are handled using different technologies:

Data	Technology
User Sign Up / Login	Firebase Authentication
User Authentication	Firebase Authentication
Liked Songs	Cloud Firestore
Personal Playlists	Cloud Firestore
Playlist Data	Cloud Firestore
Default Songs	Application Data
Personal Uploaded Songs	Browser Local Storage
Music Search	Music API
Music Metadata	Music API
Audio Preview	Music API

⸻

👤 Personalized Music Experience

Each authenticated user can have their own personalized music experience.

                  User
                   │
          Firebase Authentication
                   │
                 User ID
                   │
                   ↓
            Cloud Firestore
              /          \
             ↓            ↓
        ❤️ Favorites   🎶 Playlists

This keeps user-specific favorites and playlists separate between accounts.

⸻

📱 Responsive Design

The application is designed to work across different screen sizes.

Supported Devices

* 💻 Desktop
* 💻 Laptop
* 📱 Mobile
* 📲 Tablet

The layout automatically adapts to different screen sizes for a better user experience.

⸻

🎨 Modern User Interface

The application focuses on a clean and modern interface with:

* 🎵 Modern music-player layout
* 🖼️ Album artwork
* 🎮 Interactive media controls
* 📊 Progress bar
* 🔊 Volume controls
* 🔎 Search interface
* 👤 User account section
* ❤️ Favorites section
* 🎶 Playlist management
* 📱 Responsive mobile layout
* ✨ Smooth interactions

⸻

🛠️ Technologies Used

Frontend

* HTML5
* CSS3
* JavaScript

Authentication

* Firebase Authentication

Database

* Cloud Firestore

Storage

* Browser Local Storage

Music & Audio

* Music API
* HTML5 Audio API

⸻

📂 Project Structure

music-player/
│
├── index.html          # Main application structure
├── style.css           # Styling and responsive design
├── script.js           # Music player functionality
├── assets/             # Images and static assets
└── README.md           # Project documentation

The exact structure may vary depending on the final implementation.

⸻

🚀 How to Run

1. Clone the Repository

git clone https://github.com/your-username/music-player.git

2. Open the Project

cd music-player

3. Run the Application

Open index.html in your browser.

For development, VS Code Live Server can be used.

⸻

🔥 Firebase Configuration

This project uses Firebase for authentication and Cloud Firestore.

To run the project with Firebase functionality, configure:

* Firebase Authentication
* Cloud Firestore
* Firebase project configuration

Firebase Authentication handles user accounts and login states, while Cloud Firestore stores user-specific information such as favorites and playlists.

Firestore security rules should be configured properly so that users can access only the data they are authorized to access.

⸻

🎮 How to Use

Create an Account

1. Open the Music Player.
2. Go to the Sign Up section.
3. Create your account.
4. Log in using your credentials.

Search for Music

1. Enter a song name in the search bar.
2. Search results are retrieved through the music API.
3. Select a song to start playback.

Play Music

Use the playback controls:

⏮️ Previous     ▶️ / ⏸️ Play/Pause     ⏭️ Next

Seek Through a Song

Drag the progress bar to move to a different position in the currently playing track.

Control Volume

Use the volume slider to adjust the audio level.

Use the mute button to quickly mute or restore the sound.

Like a Song

Click the ❤️ button to add a song to your personal favorites.

Create a Playlist

Create a playlist and add songs to organize your personal music collection.

Add Personal Songs

Users can add their own music files to the application.

Currently, these personal songs are stored locally using the browser’s Local Storage.

⸻

📊 Current Data Flow

                         Music Player
                              │
             ┌────────────────┼────────────────┐
             │                │                │
             ↓                ↓                ↓
         Music API      Firebase Auth    Local Storage
             │                │                │
             ↓                ↓                ↓
       Search & Preview   User Account    Personal Songs
                              │
                              ↓
                       Cloud Firestore
                         /          \
                        ↓            ↓
                   Favorites     Playlists

⸻

⚖️ Copyright & Content

This project is developed primarily for educational and development purposes.

The application does not intend to host, reproduce, or distribute copyrighted music without proper authorization.

Music previews, metadata, artwork, and other content obtained through external APIs are subject to the respective API provider’s terms, licenses, and restrictions.

Users should only upload music files that they own or have permission to use.

The 3 default songs included in the application are provided as part of the project’s initial/demo content.

⸻

🔮 Future Improvements

The current version provides a personalized music-player experience, but several improvements are planned.

☁️ Permanent Cloud Storage for Personal Songs

Currently, user-added personal songs are stored locally:

Personal Song
      ↓
 Local Storage
      ↓
Same Browser / Device

In the future, a cloud storage system will be implemented:

Personal Song
      ↓
 Cloud Storage
      ↓
 Database
      ↓
 User Account

This will allow users to access their uploaded songs from different devices.

⸻

📱 Cross-Device Synchronization

A future version will allow users to log in from any device and access their complete personal music data.

For example:

              Cloud
             /     \
            ↓       ↓
         Laptop   Mobile
            \       /
             \     /
              Login
                │
                ↓
          Same User Data

Users will eventually be able to access:

* ❤️ Favorite songs
* 🎶 Personal playlists
* 🎵 Uploaded personal songs
* 🕘 Listening history
* ⚙️ User preferences

from different devices.

⸻

🎵 Permanent Personal Music Library

Future versions will provide permanent cloud storage for user-uploaded songs.

Planned functionality:

* Upload personal songs
* Cloud storage
* Permanent music library
* Access songs from different devices
* Manage uploaded songs
* Delete uploaded songs

⸻

📈 Additional Planned Features

Future improvements may include:

* 🕘 Recently Played
* 📊 Listening History
* 🎯 Personalized Recommendations
* 🎤 Artist Pages
* 💿 Album Pages
* 🔎 Advanced Search
* 🎵 Music Categories
* 📱 Improved Mobile Experience
* 🌙 Dark / Light Theme
* 🔔 Notifications
* ☁️ Cloud Storage
* 🔄 Cross-Device Synchronization
* 🔒 Improved Security
* 🚀 Scalable Backend Architecture

⸻

🎯 Project Objective

The main objective of this project is to develop a modern and personalized music-player application while learning and implementing:

* 🎧 Audio playback
* 🎮 Media controls
* 🔎 API integration
* 🔐 Firebase Authentication
* ☁️ Cloud Firestore
* 💾 Local Storage
* ❤️ Favorite management
* 🎶 Playlist management
* 🔄 CRUD operations
* 📱 Responsive web design
* ⚡ Dynamic UI updates
* 👤 User personalization

⸻

🚧 Project Status

Status: 🚀 Active Development

Currently Available

* ✅ Modern music-player interface
* ✅ 3 default songs
* ✅ Play / Pause
* ✅ Next / Previous
* ✅ Progress bar
* ✅ Seek functionality
* ✅ Volume control
* ✅ Mute / Unmute
* ✅ Current playback time
* ✅ Song duration
* ✅ Music search through API
* ✅ User Sign Up
* ✅ User Login
* ✅ Firebase Authentication
* ✅ Favorite songs
* ✅ Cloud Firestore
* ✅ Personal playlists
* ✅ Shuffle mode
* ✅ Repeat mode
* ✅ Autoplay
* ✅ Personal/local song support
* ✅ Local Storage
* ✅ Responsive design

🚀 Planned

* 🔜 Permanent cloud storage for personal songs
* 🔜 Cross-device synchronization
* 🔜 Complete personal music library
* 🔜 Listening history
* 🔜 Recently played songs
* 🔜 Personalized recommendations
* 🔜 More advanced music discovery

⸻

👩‍💻 Author

Sonal Suryvanshi

B.Tech Computer Science & Engineering

⸻

⭐ If you like this project, consider giving the repository a star!

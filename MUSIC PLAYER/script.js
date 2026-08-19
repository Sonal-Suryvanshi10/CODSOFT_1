import {
  db,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "./firebase.js";


const tracks = [
    {
        id: 'midnight-bloom',
        title: 'Midnight Bloom',
        artist: 'Elara Voss',
        album: 'In The Stillness',
        art: 'art-aurora',
        cover: 'linear-gradient(135deg,#28315a,#c46772,#f3bb78)',
        audio: 'music/song1.mp3',
        duration: '2:44'
    },
    {
        id: 'afterglow',
        title: 'Afterglow',
        artist: 'The Velvet Sky',
        album: 'Night Visions',
        art: 'art-afterglow',
        cover: 'linear-gradient(135deg,#e77765,#943f70,#24244b)',
        audio: 'music/song2.mp3',
        duration: '3:19'
    },
    {    
        id: 'half-awake',
        title: 'Half Awake',
        artist: 'Celeste Lane',
        album: 'Daydreamer',
        art: 'art-awake',
        cover: 'linear-gradient(135deg,#c98068,#d9b68c,#6173a1)',
        audio: 'music/song3.mp3',
        duration: '2:37'
    }
];

const builtInTrackCount = tracks.length;

const $ = (selector) => document.querySelector(selector);

const audio = $('#audio'),
      progress = $('#progress'),
      volume = $('#volume'),
      playButton = $('#play'),
      list = $('#track-list');

let currentIndex = 0,
    shuffled = false,
    repeat = false,
    authMode = 'signup',
    toastTimer;

let activePlaylistId = null;

// let currentUser = JSON.parse(
//     localStorage.getItem('sonora-current-user') || 'null'
// );

let currentUser = window.currentUser || null;

// function makeDemoAudio(seed) {
//   const rate=22050, samples=rate*28, buffer=new ArrayBuffer(44+samples*2), view=new DataView(buffer), put=(pos,text)=>[...text].forEach((c,i)=>view.setUint8(pos+i,c.charCodeAt(0)));
//   put(0,'RIFF');view.setUint32(4,36+samples*2,true);put(8,'WAVE');put(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,rate,true);view.setUint32(28,rate*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);put(36,'data');view.setUint32(40,samples*2,true);
//   const root=[196,220,174.61,246.94,164.81][seed%5]; for(let i=0;i<samples;i++){const t=i/rate,b=t%2,n=Math.floor(t/2)%4,f=Math.min(1,b*5,(2-b)*3),p=root*[1,1.25,1.5,1.25][n],v=(Math.sin(2*Math.PI*p*t)*.26+Math.sin(2*Math.PI*p*1.5*t)*.12+Math.sin(2*Math.PI*p*2*t)*.07)*f+Math.sin(2*Math.PI*p*2*t)*Math.exp(-(t%.5)*10)*.19;view.setInt16(44+i*2,Math.max(-1,Math.min(1,v*.7))*32767,true)}
//   return URL.createObjectURL(new Blob([buffer],{type:'audio/wav'}));
// }


function sourceFor(track) {
    return track.audio || track.previewUrl || track.userAudio;
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = String(
        Math.floor(seconds % 60)
    ).padStart(2, '0');

    return `${minutes}:${remainingSeconds}`;
}

function setRange(input) {
    const percent =
        ((input.value - input.min) /
            (input.max - input.min)) * 100;

    input.style.setProperty(
        '--range-progress',
        `${percent}%`
    );
}

function escapeHtml(value) {

    return String(value).replace(
        /[&<>'"]/g,

        (char) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[char])
    );
}


function userStorageId() { return currentUser?.uid || 'guest'; }
function libraryStorageKey() { return `sonora-library-${userStorageId()}`; }

function emptyLibrary() {
    return { likedIds: [], playlists: [], trackCatalog: [] };
}

let library = emptyLibrary();
let cloudErrorNotified = false;
const LOCAL_AUDIO_DATABASE = 'sonora-local-audio';
const LOCAL_AUDIO_STORE = 'songs';

function openLocalAudioDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(LOCAL_AUDIO_DATABASE, 1);
        request.onupgradeneeded = () => request.result.createObjectStore(LOCAL_AUDIO_STORE, { keyPath: 'key' });
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function saveLocalAudio(track, file) {
    const database = await openLocalAudioDatabase();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(LOCAL_AUDIO_STORE, 'readwrite');
        transaction.objectStore(LOCAL_AUDIO_STORE).put({
            key: `${currentUser.uid}:${track.id}`,
            userId: currentUser.uid,
            track: trackForStorage(track),
            file
        });
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error);
    });
}

async function getLocalAudioTracks(userId) {
    const database = await openLocalAudioDatabase();
    return new Promise((resolve, reject) => {
        const request = database.transaction(LOCAL_AUDIO_STORE, 'readonly')
            .objectStore(LOCAL_AUDIO_STORE).getAll();
        request.onsuccess = () => resolve(request.result
            .filter(item => item.userId === userId)
            .map(item => ({ ...item.track, localOnly: true, userAudio: URL.createObjectURL(item.file) })));
        request.onerror = () => reject(request.error);
    });
}

function readLocalLibrary() {
    try {
        const saved = JSON.parse(localStorage.getItem(libraryStorageKey()) || 'null');
        return saved && typeof saved === 'object'
            ? { ...emptyLibrary(), ...saved }
            : emptyLibrary();
    } catch {
        return emptyLibrary();
    }
}

function trackForStorage(track) {
    const { id, title, artist, album, duration, art, cover, audio, previewUrl } = track;
    const storedTrack = {
        id, title, artist, album, duration, art, cover, audio, previewUrl,
        ...(track.localOnly ? { localOnly: true } : {})
    };
    // Firestore rejects undefined values, while API tracks often omit `audio`.
    return Object.fromEntries(
        Object.entries(storedTrack).filter(([, value]) => value !== undefined)
    );
}

function rememberTrack(track) {
    if (!track || tracks.indexOf(track) < builtInTrackCount) return;
    const savedTrack = trackForStorage(track);
    const index = library.trackCatalog.findIndex(item => item.id === track.id);
    if (index >= 0) library.trackCatalog[index] = savedTrack;
    else library.trackCatalog.push(savedTrack);
}

function saveLibrary() {
    localStorage.setItem(libraryStorageKey(), JSON.stringify(library));

    if (!currentUser?.uid) return;

    setDoc(doc(db, 'users', currentUser.uid, 'library', 'music'), {
        likedIds: library.likedIds,
        playlists: library.playlists,
        // Audio blobs stay only in IndexedDB; Firestore keeps cloud-safe music data.
        trackCatalog: library.trackCatalog.filter(track => !track.localOnly),
        updatedAt: serverTimestamp()
    }, { merge: true }).catch((error) => {
        console.error('Could not save library to Firebase:', error);
        if (!cloudErrorNotified) {
            cloudErrorNotified = true;
            showToast('Cloud sync failed. Publish Firestore rules first.');
        }
    });
}

async function loadUserLibrary() {
    tracks.splice(builtInTrackCount);
    currentIndex = Math.min(currentIndex, tracks.length - 1);
    const localLibrary = readLocalLibrary();
    library = localLibrary;

    if (currentUser?.uid) {
        try {
            const snapshot = await getDoc(
                doc(db, 'users', currentUser.uid, 'library', 'music')
            );
            if (snapshot.exists()) {
                library = { ...emptyLibrary(), ...snapshot.data() };
                const localOnlyTracks = localLibrary.trackCatalog.filter(track => track.localOnly);
                library.trackCatalog = [
                    ...library.trackCatalog.filter(track => !track.localOnly),
                    ...localOnlyTracks
                ];
            }
        } catch (error) {
            console.warn('Using local library cache because Firebase is unavailable.', error);
        }
    }

    if (currentUser?.uid) {
        try {
            const localTracks = await getLocalAudioTracks(currentUser.uid);
            library.trackCatalog = [
                ...library.trackCatalog.filter(track => !track.localOnly),
                ...localTracks
            ];
        } catch (error) {
            console.warn('Could not load local audio library.', error);
        }
    }

    localStorage.setItem(libraryStorageKey(), JSON.stringify(library));

    library.trackCatalog.forEach((track) => {
        if (!tracks.some(item => item.id === track.id)) tracks.push(track);
    });

    renderList();
    renderPlaylists();
    syncLike();
}

function likedIds(){ return library.likedIds; }
function isLiked(track){ return likedIds().includes(track.id); }
function saveLiked(ids){ library.likedIds = ids; saveLibrary(); }

function row(track, index, kind = 'queue') {

    return `
        <article
            class="track-row ${
                kind === 'queue' &&
                track.id === tracks[currentIndex]?.id
                    ? 'current'
                    : ''
            }"

            data-id="${track.id}"
            role="listitem">

            <span class="track-number">
                ${String(index + 1).padStart(2, '0')}
            </span>

            <span class="mini-art" style="${track.cover.startsWith('http')
                ? `background-image:url('${track.cover}')`
                : `--cover:${track.cover}`}"> </span>

            <div>

                <div class="track-name">
                    ${escapeHtml(track.title)}
                </div>

                <div class="track-artist">
                    ${escapeHtml(track.artist)}
                </div>

            </div>

            <button
                class="row-heart ${
                    isLiked(track)
                        ? 'liked'
                        : ''
                }"

                data-like="${track.id}">

                <svg>
                    <use href="#icon-heart"/>
                </svg>

            </button>

            <span class="row-duration">
                ${track.duration || '2:30'}
            </span>

        </article>
    `;
}


function activePlaylistTracks() {
    if (!activePlaylistId) return tracks;
    const item = playlists().find(entry => entry.id === activePlaylistId);
    return item
        ? item.trackIds.map(indexFor).filter(index => index >= 0).map(index => tracks[index])
        : tracks;
}

function renderList() {
    const visibleTracks = activePlaylistTracks();
    list.innerHTML = visibleTracks.length
        ? visibleTracks.map((track, index) => row(track, index)).join('')
        : '<p class="playlist-message">This playlist is empty. Add songs from the profile menu.</p>';
    renderLiked();
    renderUploads();
    $('#liked-count').textContent = likedIds().length;
}

function renderLiked() {
    const saved = likedIds();
    const likedTracks = tracks.filter(track => saved.includes(track.id));
    $('#liked-list').innerHTML = likedTracks.map((track, index) => row(track, index, 'liked')).join('');
    $('#liked-empty').hidden = likedTracks.length > 0;
    $('#play-liked').disabled = !likedTracks.length;
}

function renderUploads() {
    const uploads = library.trackCatalog.filter(track => track.album === 'My uploads');
    $('#uploads-list').innerHTML = uploads.map((track, index) => row(track, index, 'uploads')).join('');
    $('#uploads-empty').hidden = uploads.length > 0;
}

window.showToast = function(message){

    const toast = document.querySelector('#toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 2200);

};

function updateGreeting() {

    const hour = new Date().getHours();

    const phrase =
        hour < 12
            ? 'Good morning'
            : hour < 17
            ? 'Good afternoon'
            : 'Good evening';

    const name =
        currentUser?.name || 'Listener';

    $('#greeting-text').textContent =
        `${phrase}, ${name}`;

    $('#profile-name').textContent = name;

    $('#avatar').textContent =
        name.charAt(0).toUpperCase();
}


function loadTrack(index, autoplay = false) {

    currentIndex = (index + tracks.length) % tracks.length;

    const track = tracks[currentIndex];

    // Song title update
    $('#track-title').textContent = track.title;

    // Artist aur album update
    $('#track-artist').innerHTML = `
        ${escapeHtml(track.artist)}
        <span>·</span>
        ${escapeHtml(track.album)}
    `;

    // Duration aur current time reset
    $('#duration').textContent = track.duration;
    $('#current-time').textContent = '0:00';

    // Progress bar reset
    progress.value = 0;
    setRange(progress);

    // Album art update
    const art = $('#album-art');

    if(track.cover.startsWith('http')){
        art.style.backgroundImage = `url('${track.cover}')`;
    }
    else{
        art.style.backgroundImage = track.cover;
    }

art.className = `album-art ${track.art}`;

    art.innerHTML = `
        <span class="art-shine"></span>

        <span class="art-title">
            ${escapeHtml(track.album.toUpperCase())}
        </span>

        <span class="art-subtitle">
            ${escapeHtml(track.artist)}
        </span>
    `;

    audio.src = sourceFor(track);
    audio.load();
    renderList();
    syncLike();
    if (autoplay) {

        audio.play().catch(() => {

            showToast(
                'Play button dabakar track start karein.'
            );
        });
    }
}


function syncLike(){const liked=isLiked(tracks[currentIndex]);$('#like-button').classList.toggle('liked',liked);$('#like-button span').textContent=liked?'Saved to liked songs':'Save to liked songs';}
function updatePlayIcon(playing){playButton.classList.toggle('playing',playing);playButton.setAttribute('aria-label',playing?'Pause':'Play');playButton.innerHTML=`<svg><use href="#icon-${playing?'pause':'play'}" /></svg>`;}
function toggleLike(id=tracks[currentIndex].id){
    const ids = [...likedIds()];
    const position = ids.indexOf(id);
    const track = tracks[indexFor(id)];
    if (position >= 0) ids.splice(position, 1);
    else { ids.push(id); rememberTrack(track); }
    saveLiked(ids);
    renderList();
    syncLike();
    showToast(position >= 0 ? 'Removed from liked songs' : 'Saved to liked songs');
}
function indexFor(id){return tracks.findIndex(track=>track.id===id);}

function adjacentTrackIndex(direction) {
    const queue = activePlaylistTracks();
    if (!queue.length) return currentIndex;
    if (shuffled) {
        return indexFor(queue[Math.floor(Math.random() * queue.length)].id);
    }
    const position = queue.findIndex(track => track.id === tracks[currentIndex]?.id);
    const nextPosition = (Math.max(position, 0) + direction + queue.length) % queue.length;
    return indexFor(queue[nextPosition].id);
}

function playlists() { return library.playlists; }

// ===================create play list ==================

function createPlaylist() {

    const name = prompt("Enter playlist name:");

    if (!name || !name.trim()) {
        return;
    }

    const items = playlists();

    const newPlaylist = {
        id: `playlist-${Date.now()}`,
        name: name.trim(),
        trackIds: []
    };

    items.push(newPlaylist);
    savePlaylists(items);
    renderPlaylists();
    showToast("Playlist created successfully");

}

$('.create-playlist').addEventListener('click', createPlaylist);

$('#add-current-to-playlist').addEventListener('click', () => {
    const items = playlists();

    if (!items.length) {
        showToast('Pehle apni playlist create karein.');
        profileMenu.hidden = true;
        return;
    }

    const choices = items
        .map((item, index) => `${index + 1}. ${item.name}`)
        .join('\n');
    const selected = Number(prompt(`Playlist select karein:\n${choices}`));
    const item = items[selected - 1];

    if (!item) return;

    const trackId = tracks[currentIndex].id;
    if (item.trackIds.includes(trackId)) {
        showToast('Yeh song is playlist mein already hai.');
    } else {
        item.trackIds.push(trackId);
        rememberTrack(tracks[currentIndex]);
        savePlaylists(items);
        renderPlaylists();
        showToast(`Added to ${item.name}`);
    }

    profileMenu.hidden = true;
});

// ============================


function savePlaylists(items) {
    library.playlists = items;
    saveLibrary();
}


function renderPlaylists() {
    const items = playlists();
    $('#custom-playlists').innerHTML = items
        .map(item => `
            <button
                class="custom-playlist"
                data-playlist="${escapeHtml(item.id)}">

                ${escapeHtml(item.name)}
                <small>(${item.trackIds.length})</small>

            </button>
        `).join('');
}

$('#custom-playlists').addEventListener('click', (event) => {
    const playlist = event.target.closest('[data-playlist]');
    if (playlist) openPlaylist(playlist.dataset.playlist);
});


function openPlaylist(id) {

    const item = playlists().find(
        entry => entry.id === id
    );

    if (!item) {
        return;
    }

    activePlaylistId = id;

    $('#playlist .section-heading h2').textContent =
        item.name;

    renderList();

    $('#playlist').scrollIntoView({
        behavior: 'smooth'
    });

}

function openDefaultPlaylist() {
    activePlaylistId = null;
    $('#playlist .section-heading h2').textContent = 'Late Night Drive';
    renderList();
    $('#playlist').scrollIntoView({ behavior: 'smooth' });
}


// INITIAL SETUP

audio.volume = volume.value;

setRange(volume);

updateGreeting();
library = readLocalLibrary();
renderPlaylists();

if (currentUser) {
    $('#auth-modal').hidden = true;
}

window.addEventListener('sonora-auth-changed', async (event) => {
    currentUser = event.detail;
    updateGreeting();
    await loadUserLibrary();
});

if (currentUser) loadUserLibrary();

loadTrack(0);


// ==========================
// AUDIO EVENTS
// ==========================

// Song play
audio.addEventListener('play', () => {
    updatePlayIcon(true);
});

// Song pause
audio.addEventListener('pause', () => {
    updatePlayIcon(false);
});

// Audio loaded
audio.addEventListener('loadedmetadata', () => {

    if (Number.isFinite(audio.duration)) {

        tracks[currentIndex].duration =
            formatTime(audio.duration);

        $('#duration').textContent =
            tracks[currentIndex].duration;

        renderList();
    }

});


// Progress update
audio.addEventListener('timeupdate', () => {

    if (!audio.duration) {
        return;
    }
    progress.value =
        (audio.currentTime / audio.duration) * 100;

    setRange(progress);

    $('#current-time').textContent =
        formatTime(audio.currentTime);

});


// Song finished
audio.addEventListener('ended', () => {

    if (repeat) {
        audio.currentTime = 0;
        audio.play();

    } else {

        loadTrack(
            adjacentTrackIndex(1),
            true
        );
    }
});

// PLAYER CONTROLS

// Play / Pause
playButton.addEventListener('click', () => {

    if (audio.paused) {
        audio.play().catch(() => {
            showToast(
                'Audio playback is unavailable.'
            );
        });
    } else {
        audio.pause();
    }
});

// Next
$('#next').addEventListener('click', () => {
    loadTrack(
        adjacentTrackIndex(1),
        !audio.paused
    );
});

// Previous
$('#previous').addEventListener('click', () => {
    if (audio.currentTime > 3) {
        audio.currentTime = 0;
    } else {
        loadTrack(
            adjacentTrackIndex(-1),
            !audio.paused
        );
    }
});

// Progress Bar
progress.addEventListener('input', () => {
    if (audio.duration) {
        audio.currentTime =
            (progress.value / 100) * audio.duration;
    }
    setRange(progress);
});

// Volume
volume.addEventListener('input', () => {
    audio.volume = volume.value;
    audio.muted = false;
    setRange(volume);
});

// Mute
$('#mute').addEventListener('click', () => {
    audio.muted = !audio.muted;
});

// Shuffle
$('#shuffle').addEventListener('click', (event) => {
    shuffled = !shuffled;
    event.currentTarget.classList.toggle(
        'active',
        shuffled
    );
});

// Repeat
$('#repeat').addEventListener('click', (event) => {
    repeat = !repeat;
    event.currentTarget.classList.toggle(
        'active',
        repeat
    );
});

// Like
$('#like-button').addEventListener('click', () => {
    toggleLike();
});

// Play All
$('#play-all').addEventListener('click', () => {
    const first = activePlaylistTracks()[0];
    if (first) loadTrack(indexFor(first.id), true);

});

function chooseTrack(event) {

    // Check if heart button was clicked
    const heart = event.target.closest('[data-like]');

    if (heart) {
        toggleLike(heart.dataset.like);
        return;
    }

    // Check if any song row was clicked
    const target = event.target.closest('[data-id]');

    if (target) {

        const index = indexFor(target.dataset.id);

        if (index >= 0) {
            loadTrack(index, true);
        }
    }
}


// Queue songs click
list.addEventListener('click', chooseTrack);


// Liked songs click
$('#liked-list').addEventListener('click', chooseTrack);

$('#uploads-list').addEventListener('click', chooseTrack);


// Play first liked song
$('#play-liked').addEventListener('click', () => {

    const first = indexFor(likedIds()[0]);

    if (first >= 0) {
        loadTrack(first, true);
    }

});

// Music Search

$('#music-search').addEventListener('submit', async (event) => {

    event.preventDefault();
    const query = $('#search-query').value.trim();
    if (!query) return;
    const results = $('#search-results');
    results.innerHTML ='<p class="empty-state">Searching preview catalog...</p>';

    try {
        const response = await fetch(
            `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=12`
        );

        if (!response.ok) {
            throw new Error();
        }

        const data = await response.json();

        const found = data.results
            .filter(item => item.previewUrl)
            .map(item => ({
                id: `itunes-${item.trackId}`,
                title: item.trackName,
                artist: item.artistName,
                album: item.collectionName || 'iTunes Preview',
                duration: formatTime(item.trackTimeMillis / 1000),
                art: 'api-art',
                cover: item.artworkUrl100.replace('100x100','600x600'),
                previewUrl: item.previewUrl
            }));


        results.innerHTML = found.length
            ? found.map((track, index) =>
                row(track, index, 'search')
              ).join('')
            : '<p class="empty-state">No playable previews found.</p>';
        results.dataset.tracks = JSON.stringify(found);
    }

    catch {

        results.innerHTML =
            '<p class="empty-state">Music API is unavailable right now. Try again later.</p>';
    }
});

// Search Result Click

$('#search-results').addEventListener('click', (event) => {

    const id =
        event.target.closest('[data-id]')?.dataset.id ||
        event.target.closest('[data-like]')?.dataset.like;

    let found = [];

    try {
        found = JSON.parse(
            $('#search-results').dataset.tracks || '[]'
        );
    }

    catch {}
    const track = found.find(item => item.id === id);
    if (!track) return;
    if (!tracks.some(item => item.id === track.id)) {
        tracks.push(track);
    }

    const index = indexFor(track.id);
    if (event.target.closest('[data-like]')) {
        toggleLike(track.id);
        event.target.closest('[data-like]').classList.toggle('liked', isLiked(track));
    }

    else {
        loadTrack(index, true);
    }
});

// Navigation Buttons

$('#liked-link').addEventListener('click', () => {

    $('#liked').scrollIntoView({
        behavior: 'smooth'
    });

});

$('#library-link').addEventListener('click', () => {

    $('#library').scrollIntoView({
        behavior: 'smooth'
    });

});

$('#uploads-link').addEventListener('click', () => {
    $('#uploads').scrollIntoView({ behavior: 'smooth' });
});

$('#default-playlist-link').addEventListener('click', (event) => {
    event.preventDefault();
    openDefaultPlaylist();
});

$('#mobile-menu').addEventListener('click', () => {
    const sidebar = document.querySelector('.sidebar');
    const isOpen = sidebar.classList.toggle('is-open');
    document.body.classList.toggle('menu-open', isOpen);
    $('#mobile-menu').setAttribute('aria-expanded', String(isOpen));

});

document.querySelector('.sidebar').addEventListener('click', (event) => {
    if (window.matchMedia('(max-width: 840px)').matches &&
        event.target.closest('a, .nav-link, .create-playlist, .custom-playlist')) {
        document.querySelector('.sidebar').classList.remove('is-open');
        document.body.classList.remove('menu-open');
        $('#mobile-menu').setAttribute('aria-expanded', 'false');
    }
});

// Profile Menu

const profileMenu = $('#profile-menu');
const profileButton = $('#profile-menu-button');
const filePicker = $('#file-picker');

profileButton.addEventListener('click', () => {
    profileMenu.hidden = !profileMenu.hidden;
    profileButton.setAttribute(
        'aria-expanded',
        String(!profileMenu.hidden)
    );

});

// Upload Song

$('#upload-song').addEventListener('click', () => {

    filePicker.click();

});

filePicker.addEventListener('change', async () => {

    const file = filePicker.files[0];

    if (!file) return;

    if (!currentUser?.uid) {
        showToast('Song upload karne ke liye login karein.');
        filePicker.value = '';
        return;
    }

    if (!file.type.startsWith('audio/')) {
        showToast('Please select an audio file.');
        filePicker.value = '';
        return;
    }

    if (file.size > 20 * 1024 * 1024) {
        showToast('Please choose an audio file smaller than 20 MB.');
        filePicker.value = '';
        return;
    }

    const title = file.name.replace(/\.[^.]+$/, '');

    try {
        showToast('Saving song on this device...');
        const trackId = `local-${Date.now()}`;
        const track = {
            id: trackId,
            title,
            artist: currentUser.name || 'My upload',
            album: 'My uploads',
            duration: '0:00',
            art: 'art-awake',
            cover: 'linear-gradient(135deg,#6c5a9f,#cf8b75,#e6c976)',
            localOnly: true,
            userAudio: URL.createObjectURL(file)
        };

        await saveLocalAudio(track, file);
        tracks.push(track);
        rememberTrack(track);
        saveLibrary();
        loadTrack(tracks.length - 1, true);
        showToast('Song saved in My uploads.');
    } catch (error) {
        console.error('Local song save failed:', error);
        showToast('Song save failed. Browser storage may be full.');
    } finally {
        filePicker.value = '';
        profileMenu.hidden = true;
    }

});

// Theme

$('#theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('high-contrast');
    profileMenu.hidden = true;

});

// Clear Likes

$('#clear-likes').addEventListener('click', () => {

    saveLiked([]);
    renderList();
    syncLike();
    profileMenu.hidden = true;

});


// Close Profile Menu

document.addEventListener('click', (event) => {

    if (!event.target.closest('.sidebar-profile')) {

        profileMenu.hidden = true;

    }

});

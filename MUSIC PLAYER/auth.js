import { 
    auth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    onAuthStateChanged 
} from "./firebase.js";

// ==========================
// SIGN UP / LOGIN

let currentUser = null;

const $ = (selector) => document.querySelector(selector);

function setCurrentUser(user) {
    currentUser = user ? {
        name: user.displayName || user.email.split('@')[0],
        email: user.email,
        uid: user.uid
    } : null;

    window.currentUser = currentUser;

    // script.js is a separate ES module, so notify it whenever Firebase auth changes.
    window.dispatchEvent(new CustomEvent('sonora-auth-changed', {
        detail: currentUser
    }));

    return currentUser;
}

$('#auth-form').addEventListener('submit', async (event) => {

    event.preventDefault();

    const name = $('#auth-name').value.trim();
    const email = $('#auth-email').value.trim().toLowerCase();
    const password = $('#auth-password').value;


    try {

        let userCredential;

        if (authMode === 'signup') {
            userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            await updateProfile(userCredential.user, {
                displayName: name
            });

            setCurrentUser({
                uid: userCredential.user.uid,
                email: userCredential.user.email,
                displayName: name
            });

        }

        // ======================
        // LOGIN
    
        else {
            userCredential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            setCurrentUser(userCredential.user);

        }

        $('#auth-modal').hidden = true;

        window.showToast?.(
            `Welcome, ${currentUser.name}`
        );

    }

    catch(error) {
    let message = "";
    switch(error.code) {

        case "auth/invalid-email":
            message = "Please enter a valid email address.";
            break;

        case "auth/email-already-in-use":
            message = "This email is already registered. Please login.";
            break;

        case "auth/weak-password":
            message = "Password should be at least 6 characters.";
            break;

        case "auth/user-not-found":
            message = "No account found with this email.";
            break;

        case "auth/wrong-password":
        case "auth/invalid-credential":
            message = "Incorrect password.";
            break;

        default:
            message = "Something went wrong. Please try again.";
    }

    alert(message);
}


});

// =========login signup switch=============

let authMode = "signup";

const authToggle = document.querySelector("#auth-toggle");
const authTitle = document.querySelector("#auth-title");
const authSubmit = document.querySelector("#auth-submit");
const authName = document.querySelector("#auth-name");


authToggle.addEventListener("click", function () {

    if (authMode === "signup") {

        authMode = "login";

        authTitle.textContent = "Welcome back";
        authSubmit.textContent = "Log in";
        authToggle.textContent = "New here? Create account";

        authName.style.display = "none";
        authName.required = false;

    } 
    
    else {

        authMode = "signup";

        authTitle.textContent = "Create your listening space";
        authSubmit.textContent = "Create account";
        authToggle.textContent = "Already have an account? Log in";

        authName.style.display = "block";
        authName.required = true;

    }

});


onAuthStateChanged(auth, (user)=>{
    setCurrentUser(user);
    $('#auth-modal').hidden = !user;
});


// ==============logout===========
$('#logout').addEventListener('click', logout);
async function logout() {

    await signOut(auth);
    setCurrentUser(null);

    $('#auth-form').reset();
    $('#auth-modal').hidden = false;
    $('#profile-menu').hidden = true;

}

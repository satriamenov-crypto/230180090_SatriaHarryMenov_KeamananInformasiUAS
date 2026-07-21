// Initialize Lucide Icons
lucide.createIcons();

// Konfigurasi Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCzK3vNyfYEzwsy2uMewCHVzOtsKQKUaec",
    authDomain: "keamanan-satria.firebaseapp.com",
    databaseURL: "https://keamanan-satria-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "keamanan-satria",
    storageBucket: "keamanan-satria.firebasestorage.app",
    messagingSenderId: "617561225556",
    appId: "1:617561225556:web:3ac65ff64abb287c71f0c1",
    measurementId: "G-L9DGVX8020"
};

firebase.initializeApp(firebaseConfig);

// Redirect jika sudah login
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        window.location.href = 'index.html';
    }
});

let isLoginMode = true;

function toggleMode() {
    isLoginMode = !isLoginMode;
    const title = document.getElementById('form-title');
    const subtitle = document.getElementById('form-subtitle');
    const btnText = document.getElementById('btn-text');
    const toggleText = document.getElementById('toggle-text');
    const toggleLink = document.getElementById('toggle-link');
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    
    if (isLoginMode) {
        title.innerText = "Welcome Back";
        subtitle.innerText = "Enter your credentials to access the dashboard";
        btnText.innerText = "Sign In";
        toggleText.innerText = "Don't have an account?";
        toggleLink.innerText = "Sign Up";
        forgotPasswordLink.style.display = "block";
    } else {
        title.innerText = "Create Account";
        subtitle.innerText = "Register a new account to access the dashboard";
        btnText.innerText = "Sign Up";
        toggleText.innerText = "Already have an account?";
        toggleLink.innerText = "Sign In";
        forgotPasswordLink.style.display = "none";
    }
}

async function authenticateFirebase() {
    const email = document.getElementById('fb-email').value;
    const password = document.getElementById('fb-password').value;
    const btn = document.getElementById('login-btn');

    if (!email || !password) {
        alert("Email dan password wajib diisi!");
        return;
    }

    // Loading state
    const originalContent = btn.innerHTML;
    btn.innerHTML = `<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i><span>${isLoginMode ? 'Authenticating...' : 'Registering...'}</span>`;
    btn.disabled = true;
    lucide.createIcons();

    try {
        if (isLoginMode) {
            await firebase.auth().signInWithEmailAndPassword(email, password);
            window.location.href = 'index.html';
        } else {
            await firebase.auth().createUserWithEmailAndPassword(email, password);
            alert("Akun berhasil dibuat! Silakan masuk dengan akun baru Anda.");
            btn.innerHTML = originalContent;
            btn.disabled = false;
            toggleMode();
            lucide.createIcons();
            document.getElementById('fb-password').value = '';
        }
    } catch (error) {
        // Reset button on error
        btn.innerHTML = originalContent;
        btn.disabled = false;
        lucide.createIcons();

        alert("Error: " + error.message);
    }
}

async function resetPassword() {
    const email = document.getElementById('fb-email').value;
    if (!email) {
        alert("Silakan ketik alamat email Anda terlebih dahulu di kolom email, lalu klik 'Forgot password?' lagi.");
        return;
    }
    
    try {
        await firebase.auth().sendPasswordResetEmail(email);
        alert(`Pesan berisi link/kode reset password telah BERHASIL dikirim oleh sistem ke email: ${email}\n\nSilakan buka aplikasi Gmail/Email Anda dan periksa Kotak Masuk (Inbox) atau folder Spam.`);
    } catch (error) {
        alert("Error: " + error.message);
    }
}

// Enter key to submit
document.getElementById('fb-password').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        authenticateFirebase();
    }
});

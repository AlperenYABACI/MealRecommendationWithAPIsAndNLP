// giris.js

// Panel geçişleri için event listener'lar
const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

signUpButton.addEventListener('click', () => {
    container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
    container.classList.remove("right-panel-active");
});

// Kayıt Olma ve Giriş Yapma İşlemleri
const signupForm = document.getElementById('signup-form');
const signupUsername = document.getElementById('signup-username');
const signupEmail = document.getElementById('signup-email');
const signupPassword = document.getElementById('signup-password');
const signupButton = document.getElementById('signup-button');

const signinForm = document.getElementById('signin-form');
const signinEmail = document.getElementById('signin-email');
const signinPassword = document.getElementById('signin-password');
const signinButton = document.getElementById('signin-button');

signupButton.addEventListener('click', async () => {
    const response = await fetch('/kullanici-ekle', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            kullaniciAdi: signupUsername.value,
            email: signupEmail.value,
            sifre: signupPassword.value,
        }),
    });

    const data = await response.json();
    console.log(data);
});

signinButton.addEventListener('click', async () => {
    const response = await fetch('/giris-yap', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            kullaniciAdi: '', // Eğer kullanıcı adıyla giriş yapma varsa buraya kullanıcı adını ekleyin
            email: signinEmail.value,
            sifre: signinPassword.value,
        }),
    });

    const data = await response.json();
    console.log(data);
});

document.addEventListener('DOMContentLoaded', () => {
    const instagramScript = document.createElement('script');
    instagramScript.async = true;
    instagramScript.src = 'https://www.instagram.com/embed.js';
    document.body.appendChild(instagramScript);
});

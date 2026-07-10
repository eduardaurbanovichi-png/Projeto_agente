// Renderização, Feedbacks, Toasts e Manipulação Visual do DOM
const UI = {
    showToast(message, type = "success") {
        const toastContainer = document.getElementById("toastContainer");
        const toastId = `toast-${Date.now()}`;
        const bgClass = type === "success" ? "bg-success" : "bg-danger";
        
        const toastHtml = `
            <div id="${toastId}" class="toast align-items-center text-white ${bgClass} border-0 anim-fade-in-up" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body fw-medium">
                        <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'} me-2"></i>${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white m-auto me-2" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;
        
        toastContainer.insertAdjacentHTML("beforeend", toastHtml);
        const toastEl = document.getElementById(toastId);
        const bsToast = new bootstrap.Toast(toastEl, { delay: 4000 });
        bsToast.show();
        
        toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
    },

    toggleTheme(forceTheme = null) {
        const currentTheme = forceTheme || document.documentElement.getAttribute("data-bs-theme");
        const nextTheme = forceTheme ? forceTheme : (currentTheme === "dark" ? "light" : "dark");
        
        document.documentElement.setAttribute("data-bs-theme", nextTheme);
        Config.updateKey("theme", nextTheme);
        
        const themeBtnIcon = document.querySelector("#themeToggleBtn i");
        if (nextTheme === "dark") {
            themeBtnIcon.className = "fa-solid fa-sun";
        } else {
            themeBtnIcon.className = "fa-solid fa-moon";
        }
    },

    updateClinicName(name) {
        document.querySelectorAll(".dynamic-clinic-name").forEach(el => {
            el.textContent = name;
        });
    },

    showTypingIndicator() {
        document.getElementById("typingIndicator").classList.remove("data-none", "d-none");
        this.scrollToBottom();
    },

    hideTypingIndicator() {
        document.getElementById("typingIndicator").classList.add("d-none");
    },

    scrollToBottom() {
        const chatBody = document.getElementById("chatBody");
        chatBody.scrollTop = chatBody.scrollHeight;
    },

    renderMessage(message, type, onComplete = null) {
        const chatBody = document.getElementById("chatBody");
        const msgWrapper = document.createElement("div");
        msgWrapper.className = `chat-message-wrapper ${type} anim-fade-in-up`;
        
        const timestamp = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        const avatarHtml = type === "ai" 
            ? `<div class="avatar-ai-small"><i class="fa-solid fa-robot text-white"></i></div>`
            : `<div class="avatar-user-small"><i class="fa-solid fa-user"></i></div>`;

        let voiceControlsHtml = type === "ai"
            ? `<div class="bubble-voice-controls">
                <button class="btn-bubble-voice btn-speak" title="Ouvir Resposta"><i class="fa-solid fa-volume-high"></i></button>
               </div>`
            : '';

        msgWrapper.innerHTML = `
            ${avatarHtml}
            <div>
                <div class="message-bubble">
                    <div class="message-text"></div>
                    ${voiceControlsHtml}
                </div>
                <span class="message-time">${timestamp}</span>
            </div>
        `;

        chatBody.appendChild(msgWrapper);
        const textContainer = msgWrapper.querySelector(".message-text");

        if (type === "ai" && onComplete === null) {
            // Efeito máquina de escrever (letra por letra) para respostas em tempo real
            let i = 0;
            textContainer.classList.add("typing-cursor");
            function typeWriter() {
                if (i < message.length) {
                    textContainer.innerHTML += message.charAt(i);
                    i++;
                    UI.scrollToBottom();
                    setTimeout(typeWriter, 12);
                } else {
                    textContainer.classList.remove("typing-cursor");
                    if (onComplete) onComplete();
                }
            }
            typeWriter();
        } else {
            textContainer.textContent = message;
            UI.scrollToBottom();
            if (onComplete) onComplete();
        }

        // Event listener dinâmico para leitura por voz
        if (type === "ai") {
            msgWrapper.querySelector(".btn-speak")?.addEventListener("click", () => {
                Chat.speakText(message);
            });
        }
    }
};
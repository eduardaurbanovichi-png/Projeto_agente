// Motor de Estado da Conversa, Histórico e Reconhecimento de Voz
const Chat = {
    history: [],

    init() {
        this.loadHistory();
        if (this.history.length === 0) {
            this.sendWelcomeMessage();
        } else {
            this.renderFullHistory();
        }
        this.initVoiceRecognition();
    },

    loadHistory() {
        try {
            this.history = JSON.parse(localStorage.getItem("urbanovichi_history")) || [];
        } catch (e) {
            this.history = [];
        }
    },

    saveHistory() {
        localStorage.setItem("urbanovichi_history", JSON.stringify(this.history));
    },

    clearHistory() {
        this.history = [];
        this.saveHistory();
        document.getElementById("chatBody").innerHTML = "";
        this.sendWelcomeMessage();
        UI.showToast("Histórico de conversa redefinido.", "success");
    },

    sendWelcomeMessage() {
        const welcomeText = "Olá! Seja bem-vindo à nossa central de atendimento. Sou o Urbanovichi, seu assistente virtual. Como posso ajudar você hoje?";
        UI.renderMessage(welcomeText, "ai", true); // Passa true para renderizar de forma instantânea na inicialização
    },

    renderFullHistory() {
        document.getElementById("chatBody").innerHTML = "";
        this.history.forEach(msg => {
            UI.renderMessage(msg.content, msg.role === "user" ? "user" : "ai", true);
        });
    },

    async processUserMessage(text) {
        if (!text.trim()) return;

        // Adiciona e renderiza mensagem do usuário
        this.history.push({ role: "user", content: text });
        UI.renderMessage(text, "user");
        this.saveHistory();

        UI.showTypingIndicator();
        document.getElementById("chatStatusText").textContent = "Urbanovichi está digitando...";

        try {
            const aiResponse = await ApiService.sendMessage(this.history);
            
            UI.hideTypingIndicator();
            this.history.push({ role: "assistant", content: aiResponse });
            UI.renderMessage(aiResponse, "ai");
            this.saveHistory();

        } catch (error) {
            UI.hideTypingIndicator();
            UI.showToast(error.message, "danger");
            UI.renderMessage("Desculpe, encontrei uma instabilidade temporária ao processar sua solicitação. Poderia repetir ou tentar novamente em instantes?", "ai");
        } finally {
            document.getElementById("chatStatusText").textContent = "Pronto para conversar";
        }
    },

    initVoiceRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            document.getElementById("micBtn").style.display = "none";
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = "pt-BR";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        const micBtn = document.getElementById("micBtn");
        let isRecording = false;

        micBtn.addEventListener("click", () => {
            if (!isRecording) {
                recognition.start();
            } else {
                recognition.stop();
            }
        });

        recognition.onstart = () => {
            isRecording = true;
            micBtn.classList.add("active-mic");
            UI.showToast("Microfone ativado, pode falar...", "success");
        };

        recognition.onend = () => {
            isRecording = false;
            micBtn.classList.remove("active-mic");
        };

        recognition.onerror = () => {
            isRecording = false;
            micBtn.classList.remove("active-mic");
            UI.showToast("Não consegui processar o áudio do microfone.", "danger");
        };

        recognition.onresult = (event) => {
            const speechToText = event.results[0][0].transcript;
            document.getElementById("userInput").value = speechToText;
            this.processUserMessage(speechToText);
            document.getElementById("userInput").value = "";
        };
    },

    speakText(text) {
        if (!('speechSynthesis' in window)) {
            UI.showToast("Leitura de voz indisponível no seu navegador.", "danger");
            return;
        }

        // Cancela leituras anteriores em andamento
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "pt-BR";
        
        // Tentativa de obter vozes nativas em PT-BR para maior naturalidade
        const voices = window.speechSynthesis.getVoices();
        const ptVoice = voices.find(v => v.lang.includes("pt-BR") || v.lang.includes("pt_BR"));
        if (ptVoice) utterance.voice = ptVoice;

        window.speechSynthesis.speak(utterance);
    }
};
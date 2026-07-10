// Arquivo Centralizador de Inicialização e Event Listeners Globais
document.addEventListener("DOMContentLoaded", () => {
    // Inicializa as animações AOS
    AOS.init({
        duration: 800,
        once: true
    });

    // Configurações e UI iniciais
    const currentSettings = Config.get();
    UI.toggleTheme(currentSettings.theme);
    UI.updateClinicName(currentSettings.clinicName);

    // Inicializa o motor de chat
    Chat.init();

    // Event Listener do Formulário de Chat
    const chatForm = document.getElementById("chatForm");
    const userInput = document.getElementById("userInput");

    chatForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const message = userInput.value.trim();
        if (message) {
            Chat.processUserMessage(message);
            userInput.value = "";
        }
    });

    // Event Listeners para botões da Navbar
    document.getElementById("themeToggleBtn").addEventListener("click", () => UI.toggleTheme());
    document.getElementById("clearChatBtn").addEventListener("click", () => {
        if (confirm("Deseja realmente apagar todo o histórico de mensagens desta conversa?")) {
            Chat.clearHistory();
        }
    });

    // Event Listeners para os Cards de Ações Rápidas
    document.querySelectorAll(".quick-action-card").forEach(card => {
        card.addEventListener("click", () => {
            const prompt = card.getAttribute("data-prompt");
            if (prompt) {
                Chat.processUserMessage(prompt);
            }
        });
    });

    // Alimentar e preencher inputs do Modal de Configurações ao abrir
    const configModalEl = document.getElementById("configModal");
    configModalEl.addEventListener("show.bs.modal", () => {
        const settings = Config.get();
        document.getElementById("cfgClinicName").value = settings.clinicName;
        document.getElementById("cfgApiKey").value = settings.openRouterKey;
        document.getElementById("cfgModel").value = settings.aiModel;
    });

    // Salvar dados do Formulário de Configurações
    document.getElementById("configForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const updatedConfig = {
            clinicName: document.getElementById("cfgClinicName").value.trim() || "Clínica Urbanovichi",
            openRouterKey: document.getElementById("cfgApiKey").value.trim(),
            aiModel: document.getElementById("cfgModel").value,
            theme: Config.get().theme
        };

        Config.save(updatedConfig);
        UI.updateClinicName(updatedConfig.clinicName);
        
        // Fecha o Modal
        const modalInstance = bootstrap.Modal.getInstance(configModalEl);
        modalInstance.hide();
        
        UI.showToast("Configurações atualizadas e salvas!", "success");
    });

    // Limpar histórico por dentro do modal
    document.getElementById("cfgClearHistory").addEventListener("click", () => {
        if (confirm("Tem certeza que deseja apagar todo o histórico?")) {
            Chat.clearHistory();
            const modalInstance = bootstrap.Modal.getInstance(configModalEl);
            modalInstance.hide();
        }
    });
});
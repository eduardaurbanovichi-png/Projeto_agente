// Gerenciamento e Persistência de Configurações no localStorage
const Config = {
    defaults: {
        clinicName: "Clínica Urbanovichi",
        // Tenta ler primeiro a chave injetada pelo Render. Se não houver, fica em branco.
        openRouterKey: window.GROQ_API_KEY || "", 
        aiModel: "llama-3.3-70b-versatile", // Modelo padrão de altíssima performance no Groq
        theme: "light"
    },

    init() {
        // Se a chave veio injetada pelo Render (nuvem), força ela nas configurações ativos
        if (window.GROQ_API_KEY) {
            let current = {};
            try {
                current = JSON.parse(localStorage.getItem("urbanovichi_cfg")) || {};
            } catch(e) {
                current = {};
            }
            current.openRouterKey = window.GROQ_API_KEY;
            current.clinicName = current.clinicName || this.defaults.clinicName;
            current.aiModel = current.aiModel || this.defaults.aiModel;
            current.theme = current.theme || this.defaults.theme;
            localStorage.setItem("urbanovichi_cfg", JSON.stringify(current));
            return;
        }

        if (!localStorage.getItem("urbanovichi_cfg")) {
            this.save(this.defaults);
        }
    },

    get() {
        this.init();
        try {
            return JSON.parse(localStorage.getItem("urbanovichi_cfg"));
        } catch (e) {
            return this.defaults;
        }
    },

    save(newConfig) {
        localStorage.setItem("urbanovichi_cfg", JSON.stringify(newConfig));
    },

    updateKey(key, value) {
        const current = this.get();
        current[key] = value;
        this.save(current);
    }
};

// Inicialização imediata
Config.init();

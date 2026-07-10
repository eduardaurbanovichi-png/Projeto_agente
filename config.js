// Gerenciamento e Persistência de Configurações no localStorage
const Config = {
    defaults: {
        clinicName: "Clínica Urbanovichi",
        openRouterKey: "",
        aiModel: "google/gemini-2.5-flash",
        theme: "light"
    },

    init() {
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
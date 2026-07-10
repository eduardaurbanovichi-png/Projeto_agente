// Conexão e Regras de Negócio com a API do Groq
const ApiService = {
    // Prompt de Sistema rígido, atuando na governança clínica do Agente
    systemPrompt: `Você é Urbanovichi. Você trabalha na Clínica Urbanovichi. Seu objetivo é oferecer atendimento acolhedor, educado, humanizado e profissional.
Você pode: orientar pacientes; explicar exames; explicar convênios; informar horários; informar localização; explicar especialidades; responder dúvidas gerais; orientar preparo para exames; ajudar no processo de agendamento.
Você NÃO pode: fornecer diagnósticos definitivos; receitar medicamentos; substituir um médico; afirmar que alguém possui uma doença.
Sempre que houver dúvida médica importante, oriente o paciente a procurar atendimento presencial.
Sempre fale em português do Brasil. Utilize linguagem humanizada, clara, acolhedora e direta. Seja simpático. Seja profissional. Nunca invente informações. Caso não saiba algo, informe isso explicitamente.`,

    async sendMessage(chatHistory) {
        const settings = Config.get();
        
        if (!settings.openRouterKey) {
            throw new Error("Chave de API do Groq ausente. Por favor, adicione-a nas configurações do sistema.");
        }

        // Montagem do payload incluindo histórico para manutenção de contexto
        const messages = [
            { role: "system", content: this.systemPrompt },
            ...chatHistory
        ];

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // Timeout de 20 segundos para o Groq

        try {
            // Alterado para o endpoint oficial do Groq
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${settings.openRouterKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    // Força um modelo rápido do Groq caso o usuário não mude nas configurações
                    model: settings.aiModel.includes("/") ? "llama-3.3-70b-versatile" : settings.aiModel,
                    messages: messages,
                    temperature: 0.5
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData?.error?.message || `Erro na API HTTP: ${response.status}`);
            }

            const data = await response.json();
            if (data?.choices?.[0]?.message?.content) {
                return data.choices[0].message.content;
            } else {
                throw new Error("Resposta inválida recebida da inteligência artificial.");
            }

        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error("O servidor da Groq demorou para responder. Tente novamente.");
            }
            throw error;
        }
    }
};

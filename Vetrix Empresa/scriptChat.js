
const formChat = document.getElementById("formChat");
const apiKeyInput = document.getElementById("apiKey");
const mensagemInput = document.getElementById("mensagem");
const conversa = document.getElementById("conversa");
const botaoEnviar = document.getElementById("botaoEnviar");
const statusMensagem = document.getElementById("statusMensagem");

// Histórico da conversa
let historico = [];

// Função para mostrar mensagens na tela
function adicionarMensagem(texto, tipo) {
    const mensagem = document.createElement("div");

    mensagem.classList.add("mensagem", tipo);
    mensagem.textContent = texto;

    conversa.appendChild(mensagem);
    conversa.scrollTop = conversa.scrollHeight;
}

// Envio da mensagem
formChat.addEventListener("submit", async function(evento) {

    evento.preventDefault();

    const apiKey = apiKeyInput.value.trim();
    const mensagem = mensagemInput.value.trim();

    if (!apiKey) {
        statusMensagem.textContent = "Digite sua chave da API.";
        return;
    }

    if (!mensagem) {
        statusMensagem.textContent = "Digite uma mensagem.";
        return;
    }

    // Mostra a mensagem do usuário
    adicionarMensagem(mensagem, "usuario");

    historico.push({
        role: "user",
        content: mensagem
    });

    mensagemInput.value = "";

    botaoEnviar.disabled = true;
    botaoEnviar.textContent = "Enviando...";
    statusMensagem.textContent =
        "A VETRIX está preparando sua resposta...";

    try {

        const resposta = await fetch(
            "https://api.openai.com/v1/responses",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },

                body: JSON.stringify({
                    model: "gpt-5.4-nano",

                    instructions:
                        "Você é o assistente virtual da VETRIX, um hospital veterinário moderno. " +
                        "Responda em português brasileiro, com educação, clareza e simpatia. " +
                        "Ajude com informações gerais sobre cuidados com animais e serviços veterinários. " +
                        "Não dê diagnósticos nem substitua a avaliação de um médico-veterinário. " +
                        "Quando houver preocupação com a saúde do animal, recomende procurar um veterinário.",

                    input: historico
                })
            }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                dados.error?.message ||
                "Não foi possível acessar a API."
            );
        }

        // Extrai o texto da resposta
        const textoResposta = (dados.output || [])
            .filter(item => item.type === "message")
            .flatMap(item => item.content || [])
            .filter(item => item.type === "output_text")
            .map(item => item.text)
            .join("\n");

        if (!textoResposta) {
            throw new Error(
                "A API não retornou uma resposta de texto."
            );
        }

        // Mostra a resposta do chatbot
        adicionarMensagem(textoResposta, "bot");

        // Salva a resposta no histórico
        historico.push({
            role: "assistant",
            content: textoResposta
        });

        statusMensagem.textContent =
            "Resposta recebida com sucesso! 🐾";

    } catch (erro) {

        adicionarMensagem(
            "Não foi possível obter uma resposta. Verifique sua chave e tente novamente.",
            "bot"
        );

        statusMensagem.textContent = "Erro: " + erro.message;

    } finally {

        botaoEnviar.disabled = false;
        botaoEnviar.textContent = "Enviar mensagem 🐾";

    }

});






const canvas = document.getElementById('notebookCanvas');
const ctx = canvas.getContext('2d');
const container = document.querySelector('.canvas-container');
const infoTexto = document.getElementById('info-texto');

let desenhando = false;
let frasesAtuais = [];
let textoSelecionado = "";

const linhaAltura = 150; // Espaço entre os blocos de frases
const margemSuperior = 80;
const paddingEsquerdo = 50;

function carregarNovoTexto() {
    const chaves = Object.keys(basededados);
    // Escolhe um texto aleatório
    textoSelecionado = chaves[Math.floor(Math.random() * chaves.length)];
    // Pega as frases na sequência (sem embaralhar)
    frasesAtuais = basededados[textoSelecionado];
    
    infoTexto.innerText = `Praticando: ${textoSelecionado.toUpperCase()}`;
    
    ajustarTamanhoCanvas();
}

function ajustarTamanhoCanvas() {
    canvas.width = container.clientWidth;
    // O tamanho do canvas depende do número de frases no texto
    canvas.height = (frasesAtuais.length * linhaAltura) + margemSuperior;
    desenharTemplate();
}

function desenharTemplate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 1. Linhas de Caderno (Fundo)
    ctx.strokeStyle = "#e8eef2";
    for (let i = 0; i < canvas.height; i += 35) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }

    // 2. Margem Lateral
    ctx.strokeStyle = "#fab1a0";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(paddingEsquerdo - 15, 0);
    ctx.lineTo(paddingEsquerdo - 15, canvas.height);
    ctx.stroke();

    // 3. Renderizar frases do texto em sequência
    frasesAtuais.forEach((item, index) => {
        const yBase = margemSuperior + (index * linhaAltura);

        // Tradução em Português (menor e cinza)
        ctx.font = "italic 16px Arial";
        ctx.fillStyle = "#95a5a6";
        ctx.fillText(`${index + 1}. ${item.frase_pt}`, paddingEsquerdo, yBase - 45);

        // Frase em Inglês (Transparente para traçar)
        ctx.font = "bold 28px 'Courier New', monospace";
        ctx.fillStyle = "rgba(0, 0, 0, 0.09)"; // Opacidade bem baixa
        ctx.fillText(item.frase_en, paddingEsquerdo, yBase);
        
        // Linha de escrita
        ctx.strokeStyle = "#34495e";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(paddingEsquerdo, yBase + 10);
        ctx.lineTo(canvas.width - 40, yBase + 10);
        ctx.stroke();
    });
}

function limparEscrita() {
    desenharTemplate(); // Redesenha o fundo por cima dos riscos
}

// Lógica de Escrita
function obterPosicao(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    return { x, y };
}

function iniciar(e) {
    desenhando = true;
    const { x, y } = obterPosicao(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function riscar(e) {
    if (!desenhando) return;
    if (e.touches) e.preventDefault();
    const { x, y } = obterPosicao(e);
    
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#2980b9';
    ctx.lineTo(x, y);
    ctx.stroke();
}

canvas.addEventListener('mousedown', iniciar);
canvas.addEventListener('mousemove', riscar);
window.addEventListener('mouseup', () => desenhando = false);

canvas.addEventListener('touchstart', iniciar);
canvas.addEventListener('touchmove', riscar);
canvas.addEventListener('touchend', () => desenhando = false);

window.onload = carregarNovoTexto;
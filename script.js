const canvas = document.getElementById('notebookCanvas');
const ctx = canvas.getContext('2d');
const infoTexto = document.getElementById('info-texto');

let desenhando = false;
let frasesAtuais = [];
let indiceTextoAtual = 0; // Começa no primeiro (índice 0)

const paddingEsquerdo = 60;
const paddingDireito = 40;
const espacamentoEntreBlocos = 80;
const alturaLinhaEscrita = 55;

// Função para iniciar o app
function iniciarApp() {
    const chaves = Object.keys(basededados);
    const textoChave = chaves[indiceTextoAtual];
    frasesAtuais = basededados[textoChave];
    
    infoTexto.innerText = `TEXTO: ${indiceTextoAtual + 1} de ${chaves.length} (${textoChave.toUpperCase()})`;
    
    ajustarTela();
}

// Função para o botão "Próximo Texto"
function carregarProximoTexto() {
    const chaves = Object.keys(basededados);
    
    // Incrementa o índice
    indiceTextoAtual++;
    
    // Se passar do limite, volta para o primeiro (0)
    if (indiceTextoAtual >= chaves.length) {
        indiceTextoAtual = 0;
    }
    
    const textoChave = chaves[indiceTextoAtual];
    frasesAtuais = basededados[textoChave];
    
    infoTexto.innerText = `TEXTO: ${indiceTextoAtual + 1} de ${chaves.length} (${textoChave.toUpperCase()})`;
    
    // Rola a página para o topo automaticamente ao trocar de texto
    window.scrollTo(0, 0);
    
    ajustarTela();
}

// --- Mantenha a função ajustarTela(), desenharTemplate() e desenharTextoComQuebra() anteriores ---
// ...

// Atualize o window.onload para chamar a nova função inicial
window.onload = iniciarApp;
window.onresize = ajustarTela;

// --- Mantenha o restante da lógica de desenho (obterXY, iniciar, desenhar) ---


// Função para desenhar texto com quebra de linha e retornar a posição Y final
function desenharTextoComQuebra(ctx, text, x, y, maxWidth, lineHeight, isEnglish) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        let metrics = ctx.measureText(testLine);
        let testWidth = metrics.width;

        if (testWidth > maxWidth && n > 0) {
            // Desenha a linha atual
            ctx.fillText(line, x, currentY);
            
            // Se for inglês, desenha a linha de caderno embaixo desta quebra
            if (isEnglish) {
                desenharLinhaGuia(currentY + 12);
            }

            line = words[n] + ' ';
            currentY += lineHeight;
        } else {
            line = testLine;
        }
    }
    
    // Desenha a última linha restante
    ctx.fillText(line, x, currentY);
    if (isEnglish) {
        desenharLinhaGuia(currentY + 12);
    }

    return currentY; // Retorna onde o bloco de texto terminou
}

function desenharLinhaGuia(y) {
    ctx.save();
    ctx.strokeStyle = "#34495e";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(paddingEsquerdo, y);
    ctx.lineTo(canvas.width - paddingDireito, y);
    ctx.stroke();
    ctx.restore();
}

function ajustarTela() {
    canvas.width = window.innerWidth > 900 ? 900 : window.innerWidth;
    
    // Simulação rápida para calcular a altura total do canvas antes de desenhar
    // Isso evita que o caderno fique curto demais
    let alturaCalculada = 100;
    const larguraMax = canvas.width - paddingEsquerdo - paddingDireito;
    
    frasesAtuais.forEach(item => {
        ctx.font = "bold 40px 'Courier New', monospace";
        // Medimos quantas linhas o texto em inglês ocupará
        const words = item.frase_en.split(' ');
        let line = '';
        let linhasCount = 1;
        for (let n = 0; n < words.length; n++) {
            let testLine = line + words[n] + ' ';
            if (ctx.measureText(testLine).width > larguraMax && n > 0) {
                line = words[n] + ' ';
                linhasCount++;
            } else { line = testLine; }
        }
        alturaCalculada += (linhasCount * alturaLinhaEscrita) + espacamentoEntreBlocos;
    });

    canvas.height = alturaCalculada;
    desenharTemplate();
}

function desenharTemplate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 1. Linhas de Fundo (Estética de caderno)
    ctx.strokeStyle = "#e8eef2";
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.height; i += 37) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
    }

    // 2. Margem Lateral Vermelha
    ctx.strokeStyle = "#fab1a0";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(paddingEsquerdo - 20, 0); ctx.lineTo(paddingEsquerdo - 20, canvas.height);
    ctx.stroke();

    // 3. Renderizar Frases
    let yAtual = 100;
    const larguraMax = canvas.width - paddingEsquerdo - paddingDireito;

    frasesAtuais.forEach((item, index) => {
        // Desenha Português (Referência)
        ctx.font = "italic 16px Arial";
        ctx.fillStyle = "#95a5a6";
        ctx.fillText(`${index + 1}. ${item.frase_pt}`, paddingEsquerdo, yAtual - 55);

        // Desenha Inglês com quebra automática
        ctx.font = "bold 40px 'Courier New', monospace";
        ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
        
        // A função desenharTextoComQuebra agora faz o trabalho pesado
        yAtual = desenharTextoComQuebra(ctx, item.frase_en, paddingEsquerdo, yAtual, larguraMax, alturaLinhaEscrita, true);

        // Pula para o próximo bloco de frase
        yAtual += espacamentoEntreBlocos;
    });
}

// --- LÓGICA DE DESENHO (MANTIDA) ---
function obterXY(e) {
    const rect = canvas.getBoundingClientRect();
    const cX = e.touches ? e.touches[0].clientX : e.clientX;
    const cY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: cX - rect.left, y: cY - rect.top };
}

function iniciar(e) {
    desenhando = true;
    const pos = obterXY(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
}

function desenhar(e) {
    if (!desenhando) return;
    if (e.touches) e.preventDefault(); 
    const pos = obterXY(e);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#2980b9';
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
}

function limparEscrita() { desenharTemplate(); }

canvas.addEventListener('mousedown', iniciar);
canvas.addEventListener('mousemove', desenhar);
window.addEventListener('mouseup', () => desenhando = false);
canvas.addEventListener('touchstart', (e) => { iniciar(e); }, {passive: false});
canvas.addEventListener('touchmove', (e) => { desenhar(e); }, {passive: false});
canvas.addEventListener('touchend', () => desenhando = false);

window.onload = carregarNovoTexto;
window.onresize = ajustarTela;
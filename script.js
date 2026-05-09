/* =========================
   KEYS.JSON
========================= */

const keys = await fetch("keys.json")
.then(res => res.json());

const apiKey = keys.apiKey;

const geminiKey = keys.geminiKey;

const apisppechkey = keys.apisppechkey;

const AZURE_SPEECH_REGION =
keys.AZURE_SPEECH_REGION;

/* ========================= */

let IA_ATUAL = "openai";

const endpoint =
"https://georg-ml7854jc-swedencentral.cognitiveservices.azure.com/openai/responses?api-version=2025-04-01-preview";

const geminiEndpoint =
"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

const ttsEndpoint =
`https://${AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;

/* TOGGLE IA */

const iaToggle =
document.getElementById("iaToggle");

const iaLabel =
document.querySelector("label[for='iaToggle']");

iaToggle.addEventListener("change", ()=>{

if(iaToggle.checked){

IA_ATUAL = "gemini";

iaLabel.textContent = "🔥 Gemini";

}else{

IA_ATUAL = "openai";

iaLabel.textContent = "🤖 OpenAI";

}

});

/* ENVIAR */

async function enviarPergunta(){

const input =
document.getElementById("userInput");

const pergunta =
input.value.trim();

if(!pergunta) return;

const chat =
document.getElementById("chat");

chat.innerHTML +=
`<div class="message">${pergunta}</div>`;

chat.innerHTML +=
`<div id="thinking" class="message">🤖 Pensando...</div>`;

input.value = "";

try{

let resposta = "";

/* OPENAI */

if(IA_ATUAL === "openai"){

const res = await fetch(endpoint,{

method:"POST",

headers:{
"Content-Type":"application/json",
"api-key":apiKey
},

body:JSON.stringify({

model:"gpt-5.2-chat",

input:pergunta,

max_output_tokens:300

})

});

const data = await res.json();

const msg =
data.output.find(i=>i.type==="message");

resposta =
msg.content[0].text;

}

/* GEMINI */

else{

const res = await fetch(geminiEndpoint,{

method:"POST",

headers:{
"Content-Type":"application/json",
"X-goog-api-key":geminiKey
},

body:JSON.stringify({

contents:[
{
parts:[{ text: pergunta }]
}
]

})

});

const data = await res.json();

resposta =
data.candidates[0].content.parts[0].text;

}

/* REMOVE THINKING */

document.getElementById("thinking").remove();

/* MOSTRA RESPOSTA */

chat.innerHTML +=
`<div class="message">${resposta}</div>`;

/* ==================================
   LIMPA MARKDOWN
================================== */

const respostaAudio = resposta
.replace(/\*\*/g,"")
.replace(/\*/g,"")
.replace(/#/g,"")
.replace(/`/g,"")
.replace(/\n/g," ");

/* ==================================
   TTS AZURE
================================== */

try{

const audioResponse =
await fetch(ttsEndpoint,{

method:"POST",

headers:{
"Ocp-Apim-Subscription-Key": apisppechkey,
"Content-Type":"application/ssml+xml",
"X-Microsoft-OutputFormat":"audio-16khz-128kbitrate-mono-mp3"
},

body:`

<speak version='1.0' xml:lang='pt-BR'>

<voice
xml:lang='pt-BR'
xml:gender='Female'
name='pt-BR-FranciscaNeural'>

${respostaAudio}

</voice>

</speak>

`

});

if(audioResponse.ok){

const audioBlob =
await audioResponse.blob();

const audioUrl =
URL.createObjectURL(audioBlob);

/* ÁUDIO GLOBAL */

window.audioAtual =
new Audio(audioUrl);
window.audioAtual.volume = 1;

await window.audioAtual.play();

/* QUANDO TERMINAR */

window.audioAtual.onended = ()=>{

/* BIP */

tocarBip();

/* VOLTA ESCUTA */

iaFalando = false;

ouvindo = true;

recognition.start();


};

}

}catch(erroAudio){

console.log("Erro áudio");

console.log(erroAudio);

}

}catch(e){

document.getElementById("thinking").innerHTML =
"Erro na IA";

console.error(e);

}

}

/* DARK MODE */

const themeBtn =
document.getElementById("themeBtn");

themeBtn.addEventListener("click", ()=>{

document.body.classList.toggle("dark");

themeBtn.textContent =

document.body.classList.contains("dark")
? "☀️"
: "🌙";

});

/* ENTER */

document.getElementById("userInput")
.addEventListener("keypress",(e)=>{

if(e.key==="Enter"){

enviarPergunta();

}

});

/* ==================================
   SOM BIP
================================== */

function tocarBip(){

const audioCtx =
new(window.AudioContext ||
window.webkitAudioContext)();

const oscillator =
audioCtx.createOscillator();

const gainNode =
audioCtx.createGain();

oscillator.connect(gainNode);

gainNode.connect(audioCtx.destination);

oscillator.frequency.value = 800;

oscillator.type = "sine";

gainNode.gain.value = 0.1;

oscillator.start();

setTimeout(()=>{

oscillator.stop();

},150);

}


/* ==================================
   MODO ALEXA REFINADO
================================== */

const voiceBtn =
document.getElementById("voiceBtn");

const recognition =
new(window.SpeechRecognition ||
window.webkitSpeechRecognition)();

/* CONFIG */

recognition.lang = "pt-BR";

recognition.continuous = true;

recognition.interimResults = false;

recognition.maxAlternatives = 1;

/* WAKE WORD */

const wakeWord = "alexa";

/* CONTROLE */

let ouvindo = true;

let iaFalando = false;

let ultimoComando = "";

/* VISUAL */

voiceBtn.innerHTML =
'<i class="bi bi-mic-fill" style="font-size:1.5rem;"></i>';

/* INICIAR */

setTimeout(()=>{

recognition.start();

console.log("Alexa online");

},1500);

/* REINICIAR */

recognition.onend = ()=>{

if(ouvindo && !iaFalando){

recognition.start();

}

};

/* RESULTADO */

recognition.onresult = async(event)=>{


/* INTERROMPE FALA */

if(window.audioAtual){

window.audioAtual.pause();

window.audioAtual.currentTime = 0;

}

if(iaFalando) return;

const texto =
event.results[event.results.length - 1][0]
.transcript
.toLowerCase()
.trim();

console.log("Você disse:", texto);

/* IGNORA RUÍDOS */

if(texto.length < 5) return;

/* EVITA REPETIÇÃO */

if(texto === ultimoComando) return;

ultimoComando = texto;

/* VISUAL */

voiceBtn.innerHTML =
'<i class="bi bi-mic-mute-fill" style="font-size:1.5rem;"></i>';

/* WAKE WORD */

if(texto.startsWith(wakeWord)){

const pergunta = texto
.replace(wakeWord,"")
.trim();

/* EVITA FRASE VAZIA */

if(pergunta.length < 3){

voiceBtn.innerHTML =
'<i class="bi bi-mic-fill" style="font-size:1.5rem;"></i>';

return;

}

/* PAUSA ESCUTA */

iaFalando = true;

ouvindo = false;

recognition.stop();

/* INPUT */

document.getElementById("userInput").value =
pergunta;

/* ENVIA */

await enviarPergunta();

/* RETORNA ESCUTA */



}else{

voiceBtn.innerHTML =
'<i class="bi bi-mic-fill" style="font-size:1.5rem;"></i>';

}

};

/* ERROS */

recognition.onerror = (event)=>{

console.log("Erro microfone");

console.log(event.error);

setTimeout(()=>{

if(!iaFalando){

recognition.start();

}

},2000);

};
/* =========================
   KEYS.JSON
========================= */

const keys = await fetch("keys.json")
.then(res => res.json());

const apiKey = keys.apiKey;

const geminiKey = keys.geminiKey;

const apisppechkey = keys.apisppechkey;

const AZURE_SPEECH_REGION = keys.AZURE_SPEECH_REGION;


let IA_ATUAL = "openai";

const endpoint =
"https://georg-ml7854jc-swedencentral.cognitiveservices.azure.com/openai/responses?api-version=2025-04-01-preview";

const geminiEndpoint =
"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

const ttsEndpoint =
"https://swedencentral.tts.speech.microsoft.com/cognitiveservices/v1";


/* TOGGLE IA */
const iaToggle = document.getElementById("iaToggle");
const iaLabel = document.querySelector("label[for='iaToggle']");

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

const input = document.getElementById("userInput");
const pergunta = input.value.trim();

if(!pergunta) return;

const chat = document.getElementById("chat");

chat.innerHTML += `<div class="message">${pergunta}</div>`;

chat.innerHTML += `<div id="thinking" class="message">🤖 Pensando...</div>`;

input.value = "";

try{

let resposta = "";

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

const msg = data.output.find(i=>i.type==="message");

resposta = msg.content[0].text;

}else{

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

document.getElementById("thinking").remove();

chat.innerHTML += `<div class="message">${resposta}</div>`;

/* ==================================
   TEXT TO SPEECH
================================== */

/* ==================================
   IA VOICE (OPENAI TTS)
================================== */

const audioResponse = await fetch(ttsEndpoint,{
method:"POST",
headers:{
"Content-Type":"application/json",
"api-key":apiKey
},
body:JSON.stringify({

input:resposta,

voice:"nova",

response_format:"mp3"

})
});

if(!audioResponse.ok){

console.error("Erro TTS");

const erroTexto = await audioResponse.text();

console.log(erroTexto);

return;

}

const audioBlob = await audioResponse.blob();

const audioUrl = URL.createObjectURL(audioBlob);

const audio = new Audio(audioUrl);

audio.volume = 1;

await audio.play();

}catch(e){

document.getElementById("thinking").innerHTML =
"Erro na IA";

console.error(e);

}

}

/* DARK MODE */
const themeBtn = document.getElementById("themeBtn");

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

/* VOZ */
const voiceBtn = document.getElementById("voiceBtn");

const recognition =
new(window.SpeechRecognition || window.webkitSpeechRecognition)();

recognition.lang = "pt-BR";

voiceBtn.addEventListener("click", ()=>{

recognition.start();

voiceBtn.innerHTML =
'<i class="bi bi-mic-mute-fill" style="font-size:1.5rem;"></i>';

});

recognition.onresult = (event)=>{

const texto =
event.results[0][0].transcript;

document.getElementById("userInput").value = texto;

voiceBtn.innerHTML =
'<i class="bi bi-mic-fill" style="font-size:1.5rem;"></i>';

enviarPergunta();

};

recognition.onerror = ()=>{

voiceBtn.innerHTML =
'<i class="bi bi-mic-fill" style="font-size:1.5rem;"></i>';

};
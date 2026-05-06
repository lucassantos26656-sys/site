let IA_ATUAL = "openai";

const apiKey = "6ot2P04HMJwFGlDTQ";
const geminiKey = "0";

const endpoint =
"https://georg-ml7854jc-swedencentral.cognitiveservices.azure.com/openai/responses?api-version=2025-04-01-preview";

const geminiEndpoint =
"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

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
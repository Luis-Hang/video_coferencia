const {funcaoStats}  = require('./public/js/func/funcao')
const {armazenaMensagem} = require('./public/js/func/funcao');
const express = require('express');
const server = express();
const app = express();
const http = require('http').Server(server);
const io = require('socket.io')(http);
//const ngrok = require('ngrok'); 
let dados;

let dadosStats =[];

var peers = 0;
var stats = new Map();

let testeMap = new Map();

var usuarios =[]
let ultimas_mensagens = [];

const HOST = '0.0.0.0'

/*
ngrok.connect({
    proto : 'http',
    addr : process.env.PORT,
}, (err, url) => {
    if (err) {
        console.error('Error while connecting Ngrok',err);
        return new Error('Ngrok Failed');
    }
});
*/
server.use(express.static('public'));
app.use(express.json());

server.get("/stats", function(req,res){	
    let obj = funcaoStats(stats)
	if(obj == 0) return res.status(204).json();
	res.json(obj);
});

//http.listen(3000,HOST, () => {  //cria o servidor com docker
http.listen(3000, () => {  //cria o servidor sem docker

    console.log('Server started at: 3000');
});

server.get('/', function(req, res){ //Pega o html e coloca no servidor
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    
	io.sockets.emit('user-joined', { clients:  Object.keys(io.sockets.clients().sockets), count: io.engine.clientsCount, joinedUserId: socket.id});
	socket.on('candidate', function(data) {
        io.to(data.toId).emit('candidate', { fromId: socket.id, ...data });
    });

    socket.on('sdp', function(data) {
        io.to(data.toId).emit('sdp', { fromId: socket.id, ...data });
    });

    
    socket.on('offer', function(data) {
        io.to(data.toId).emit('offer', { fromId: socket.id, ...data });
    });

    socket.on("answer" , function(data){
        io.to(data.toId).emit('answer', { fromId: socket.id, ...data });
	})

    //  chat

    socket.on("entrar", function(apelido, callback){
        if(!(apelido in usuarios)){
            socket.apelido = apelido; 
            usuarios[apelido] = socket;
  

            
            io.sockets.emit("atualizar usuarios", Object.keys(usuarios));  //atualiza o select para mostra o usurios
            io.sockets.emit("atualizar mensagens", " " + pegarDataAtual() + " " + apelido + " acabou de entrar na sala"); //mostra no historio a chegado do usurario
            io.sockets.emit("desc", " " + pegarDataAtual() + " " + apelido);
            callback(true);
        }else{
            callback(false);
        }
        });
    socket.on("enviar mensagem", function(mensagem_enviada, callback){  //envia a msg que irá pro historico de msg
        mensagem_enviada = " " + pegarDataAtual() + " " + socket.apelido+ ": " +  mensagem_enviada;
        io.sockets.emit("atualizar mensagens", mensagem_enviada);
        callback();
    });
    socket.on("disconnect", function(){ 
        io.sockets.emit('user-left', socket.id)   //quando o usuario sai da pagina
        delete usuarios[socket.apelido];
        stats.delete(socket.id); 
        
        io.sockets.emit("atualizar usuarios", Object.keys(usuarios));
        io.sockets.emit("atualizar mensagens", " " + pegarDataAtual() + " " + socket.apelido + " saiu da sala");
      });
      socket.on('estatisticas', function(dados, userId) {
		peers = userId
		//dadosStats = dados
		stats.set(userId, dados)
		//funcaoStats(dadosStats, peers)
	})
});
  
  function pegarDataAtual(){
    var dataAtual = new Date();
    var hora = (dataAtual.getHours()<10 ? '0' : '') + dataAtual.getHours();
    var minuto = (dataAtual.getMinutes()<10 ? '0' : '') + dataAtual.getMinutes();
    
   
    var dataFormatada =  hora + ":" + minuto;
    return dataFormatada;
   }

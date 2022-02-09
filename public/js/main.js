const mediaStreamConstraints = {
    video: true
    
};
const offerOptions = {
    offerToReceiveVideo: 1,
};
const localVideo = document.getElementById('localVideo');
let localStream;
let localUserId;
let connections = new Map();


function gotRemoteStream(event, userId) {

    let remoteVideo  = document.createElement('video');

    remoteVideo.setAttribute('data-socket', userId);
    remoteVideo.srcObject   = event.stream;
    remoteVideo.autoplay    = true;
    remoteVideo.muted       = false;
    remoteVideo.playsinline = true;
    document.querySelector('.videos').appendChild(remoteVideo);
}

function gotIceCandidate(fromId, candidate) {
    connections.get(fromId).addIceCandidate(new RTCIceCandidate(candidate)).catch(handleError); //cria um cadidato
}


function startLocalStream() {
    navigator.mediaDevices.getUserMedia(({
        audio: true,
        video: true
      })) //autorização ao acesso de camera e mic
        .then(getUserMediaSuccess)
        .then(connectSocketToSignaling).catch(handleError);
}

async function creatingOfferFunction(pc, joinedUserId, socket){
    let description = await pc.createOffer();

    await pc.setLocalDescription(description);
    
    console.log(socket.id, " Send offer to ", joinedUserId);
    socket.emit("offer", {
      type: "offer",
      toId: joinedUserId,
      description: pc.localDescription,  
    });
  };

//const link = 'http://localhost:3000/'
//const link = ' http://e042-150-162-83-224.ngrok.io'

function connectSocketToSignaling() {
    //const socket = io.connect(link, { secure: true });
    var socket = io();

    $("form#chat").submit(function(e){     
        e.preventDefault();
        socket.emit("enviar mensagem", $(this).find("#texto_mensagem").val(), function(){ //vai mandar para o index.js
            $("form#chat #texto_mensagem").val("");
        });
         
      });
      
      socket.on("atualizar_mensagens", (dados) => {
        //Mandando atualizar la no client.
        emit("atualizar_mensagens", dados);
      });

      socket.on("atualizar mensagens", function(mensagem){    //Pega a msg escrita e mandar para o idex.js para madar pro historico
        var mensagem_formatada = $("<p />").text(mensagem);
        $("#historico_mensagens").append(mensagem_formatada); //Coloca a msg no historico
      });
      
      $("form#login").submit(function(e){  //pagina antes do chat para colocar usuriario
        e.preventDefault();
      
        socket.emit("entrar", $(this).find("#apelido").val(), function(valido){ //Verifica se o usuario é valido
            if(valido){
                $("#acesso_usuario").hide();  // se for ele esconde a pagina de acesso
                $("#sala_chat").show();         // e mostra o chat
            }else{
                $("#acesso_usuario").val("");
                alert("Nome já utilizado nesta sala");
            }
        });
      });
      
      socket.on("atualizar usuarios", function(usuarios){ //manda na section os usuarios 
        $("#lista_usuarios").empty();  
        $("#lista_usuarios").append("<option value=''>Todos</option>");
        $.each(usuarios, function(indice){
            var opcao_usuario = $("<option />").text(usuarios[indice]);
            $("#lista_usuarios").append(opcao_usuario);
        });
      });
    socket.on('connect', () => {
        localUserId = socket.id;
        console.log('localUser', localUserId);  //cria um user
        socket.on('user-joined', (data) => {
            const clients = data.clients;
            const joinedUserId = data.joinedUserId;
            console.log(joinedUserId, ' joined');    //mostra o user que se juntou 
            const fromId = data.fromId;

            userId = joinedUserId
            if(joinedUserId != localUserId){
                
                const pc = createPC(socket, joinedUserId, localStream)

                connections.set(userId,pc)

              //  connections.get(userId) = createPC(socket, localStream, joinedUserId)


                creatingOfferFunction(connections.get(userId) , joinedUserId, socket);
                
            }
        });

        socket.on('user-left', user => {
            console.log("U: ",user)
            console.log("U1: ",userId)
            if(document.querySelector('[data-socket="'+ userId +'"]')){
                let video = document.querySelector('[data-socket="'+ userId +'"]');
                video.parentNode.removeChild(video);
            }
            //printa connection
            console.log(userId + ' left')
            //remove o connection
            delete connections.get(userId);
        });
        ////////////////////////
        socket.on('candidate', (data) => {
            const fromId = data.fromId;
            console.log(socket.id, ' Receive Candidate from ', fromId);
            if (data.candidate) {
                gotIceCandidate(fromId, data.candidate);
            }
        });
        
        socket.on('offer', (data) => {
            const fromId = data.fromId;
            if (data.description) {
                
                connections.set(fromId, createPC(socket,  fromId, localStream))
                const connection = connections.get(fromId)

               // connections.get(fromId) = createPC(socket, localStream, userId)
                console.log(socket.id, ' Receive offer from ', fromId);

                connection.setRemoteDescription(new RTCSessionDescription(data.description))

                //connections.get(fromId).setRemoteDescription(new RTCSessionDescription(data.description))
                connection.createAnswer()
                .then((description) => {
                        return connection.setLocalDescription(description)
                })
                .then(() => {
                    console.log(socket.id, ' Send answer to ', fromId);
                    socket.emit('answer', {
                        toId: fromId,
                         description: connection.localDescription
                    });
                })
                .catch(handleError2);
            }
        });

        socket.on('answer', (data) => {

            const fromId = data.fromId;
            console.log(socket.id, ' Receive answer from ', fromId);
            const connection = connections.get(fromId)

            connection.setRemoteDescription(new RTCSessionDescription(data.description))
            .catch(handleError);
        });

    })

}

function candidate(socket, data){
    const fromId = data.fromId;  // ?colocar fromId fora
    if (fromId !== localUserId){
        console.log(socket.id,'Receive candidate from ', fromId);
        if(data.candidate){
            gotIceCandidate(fromId, data.candidate);
        }
    }
}

function sdp(socket, data){
    const fromId = data.fromId;
    if (fromId !== localUserId){
        if (data.description) {
            receivesdp(socket, fromId, connections, data)
        }
    }
}

function sendCandidate( userId,socket, localStream, connections
    ){
        connections.get(userId) = new RTCPeerConnection(mediaStreamConstraints);
        connections.get(userId).onicecandidate = () => {
        if (event.candidate) {
            console.log(socket.id, ' Send candidate to ', userId); //Manda candidato para o user que entrou
            socket.emit('candidate',{ candidate: event.candidate, toId: userId}) //novo
        }
    };
    connections.get(userId).onaddstream = () => {
        gotRemoteStream(event, userId);
    };
    connections.get(userId).addStream(localStream);
}

function receivesdp(socket, fromId, connections, data){
    console.log(socket.id, ' Receive sdp from ', fromId); //Recebe sdp? do user
        connections.get(fromId).setRemoteDescription(new RTCSessionDescription(data.description))
            .then(() => {
                if (data.description.type === 'offer') {
                    connections.get(fromId).createAnswer()
                        .then((description) => {
                            connections.get(fromId).setLocalDescription(description).then(() => {
                                console.log(socket.id, ' Send answer to ', fromId);
                                socket.emit('sdp',{toId: fromId, description: connections.get(fromId).localDescription}) //novo
                            });
                        })
                        .catch(handleError);
                }
            })
            .catch(handleError);
}


///

///chat

//var socket = io.connect();



///

function createPC(socket, userId, mediaStream){
    const pc = new RTCPeerConnection(mediaStreamConstraints);
    pc.onicecandidate = () => {
        if (event.candidate && (socket.id != userId)) {
            console.log(socket.id, ' Send Candidate to ', userId);
            socket.emit('candidate', { 
                toId: userId,
                candidate: event.candidate, 
            });
        }
    }

    pc.onaddstream = () => {
        gotRemoteStream(event, userId);
    };
    pc.addStream(mediaStream);

    connections.set(userId, pc);

    
    setInterval(() => {
        this.estatisticas(socket, pc);
      },1000)
    
    return pc;

}

function getUserMediaSuccess(mediaStream) {
    localStream = mediaStream;
    localVideo.srcObject = mediaStream;
}

function handleError(e) {
    console.log(e);
    alert('Something went wrong');
}

function handleError2(e) {
    console.log(e);
    alert('Something went wrong 2');
}


function estatisticas(socket, pc){

    pc.getStats(null).then(stats => {
        var statusOut = new Object;
        var statusIn = {
            packetsLost: 0,
            packetsReceived: 0, 
            packetsSent: 0,
            bytesSent: 0,
            bytesReceived: 0,
            totalEncodeTime: 0, 
      
        };

        stats.forEach(report => {
            if(report.type === "inbound-rtp"){
                statusOut.packetsLost = report.packetsLost - statusIn.packetsLost
                statusIn.packetsLost = report.packetsLost
            }
            if ( report.type == "transport" ){
                let rpr = report.packetsReceived;
                let rps = report.packetsSent;
                let rbs = report.bytesSent;
                let rbr = report.bytesReceived;
                
                statusOut.packetsReceived = rpr - statusIn.packetsReceived;
                statusOut.packetsSent = rps - statusIn.packetsSent;
                statusOut.bytesSent = rbs - statusIn.bytesSent;
                statusOut.bytesReceived =rbr - statusIn.bytesReceived;

                statusIn.packetsReceived = rpr;
                statusIn.packetsSent = rps;
                statusIn.bytesSent = rbs;
                statusIn.bytesReceived = rbr;
            } 
          
            
        })
        
        socket.emit('estatisticas', statusOut, socket.id)
    })
}

startLocalStream();


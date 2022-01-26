function armazenaMensagem(mensagem, ultimas_mensagens){
	if(ultimas_mensagens.length > 5){
		ultimas_mensagens.shift();
	}
	ultimas_mensagens.push(mensagem);

	return ultimas_mensagens
};
exports.armazenaMensagem = armazenaMensagem;

function funcaoStats(stats){

	let temp = new Map();
	//console.log(stats)
	stats.forEach((stat, userId)=>{
		if (userId == 'socket_test')	temp.set(userId, stat)
		else temp[userId] = stat;
	})

	let obj = {
		'As estatísticas dos users são ': temp
	}

	if (!temp) return obj = 0;
	//console.log(temp)
	return temp
}

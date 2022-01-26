const {funcaoStats} = require('./funcao')

describe('Teste da função de estatística', ()=>{

	it('Testando funcStats.', ()=>{

		temp = new Map ()
		temp.set("socket_test", {"packetsLost":0,"framesPerSecond":17,
        "packetsSent":1151,"packetsReceived":2028,"bytesSent":843346,
        "bytesReceived":1906184})
		expect(funcaoStats(temp)).toEqual(temp)
		
		//expect(funcaoStats(temp).has('socket_test')).toEqual(true)

	})
})

describe('Teste da função de estatística de outra forma', ()=>{

	it('Testando funcStats. 2', ()=>{

		temp = new Map ()
		temp.set("socket_test", {"packetsLost":0,"framesPerSecond":17,
        "packetsSent":1151,"packetsReceived":2028,"bytesSent":843346,
        "bytesReceived":1906184})
		expect(funcaoStats(temp).has('socket_test')).toEqual(true)

	})
})

const {armazenaMensagem} = require('./funcao')

describe('Teste da função de armazenar mensagens', ()=>{

	it('Testando funcionamento de armazenaMensagem.', ()=>{
		let mensagem = 'mensagem2';
		let ultimas_mensagens = ['Mensagem0', 'mensagem1'];
		expect(armazenaMensagem(mensagem, ultimas_mensagens)).toEqual(["Mensagem0", "mensagem1", "mensagem2"])
	})
})

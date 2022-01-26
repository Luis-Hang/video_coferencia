#Contem as informações que terei no container docker

#pega a imagem no dockcer, neste caso o node na versão alpine
FROM node:alpine 

#diretorio dentro da maquina que gostaria de se utilizar
WORKDIR /usr/app

#irá copiar todos os arquivos que inician com package e terminam com .json, esses arquivos irão para o diretorio indicado acima
COPY package*.json ./

RUN npm install

#copia todos os arquivos restantes da pasta
COPY . . 

#Porta do servidor 
EXPOSE 3000

#comandos para inicializar o programa, start definido no package.json
CMD ["npm","start"]
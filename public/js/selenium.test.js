
//const fetch = require("node-fetch");
//import fetch from 'node-fetch'



async function load_stats() {

    let url = 'http://localhost:3000/stats';
  
    //let obj = await (await fetch(url)).json();
    //return obj
  
  }


const {Builder, By, Key, Util} = require('selenium-webdriver');
//require('chromedriver');
var webdriver = require('selenium-webdriver');
var driver = new webdriver.Builder()

let driver1, driver2, driver3;

const getCapabilities = (browserName) => {
    switch (browserName) {
      case "chrome":
        return {
          browserName: "chrome",
          acceptInsecureCerts: true,
          "goog:chromeOptions": {
            args: [
              "--use-fake-ui-for-media-stream",
              "--use-fake-device-for-media-stream",
              //"--headless",
            ],
          },
        };
    }
}



const sleep = ms => new Promise(res => setTimeout(res, ms));

async function example(){
    //Abrindo chrome 
    
    driver1 = await new Builder().withCapabilities(getCapabilities('chrome')).build();
    await driver1.get('http://localhost:3000/');
    await sleep(700);
    await driver1.findElement(By.name('apelido')).sendKeys('Usuario 1', Key.RETURN);
    await sleep(700);



    driver2 = await new Builder().withCapabilities(getCapabilities('chrome')).build();
    await driver2.get('http://localhost:3000/');
    await sleep(700);

    await driver2.findElement(By.name('apelido')).sendKeys('Usuario 2 ', Key.RETURN);

    await sleep(500);
    await driver1.findElement(By.name('texto_mensagem')).sendKeys('Teste mensagem 1', Key.RETURN);
    await sleep(500);
    await driver2.findElement(By.name('texto_mensagem')).sendKeys('Teste mensagem do usuario 2', Key.RETURN);

    await sleep(3000);
    driver3 = await new Builder().withCapabilities(getCapabilities('chrome')).build();
    await driver3.get('http://localhost:3000/stats');
    
    //return [driver1, driver2]
    return [driver1, driver2, driver3]

}


describe('Testes do selenium', ()=>{

  //Aumentando o valor máximo de simulação
  jest.setTimeout(35000);


  it('Abrir dois usuarios e o stats', async ()=>{

      [driver1, driver2, driver3] = await example();
      expect(driver1).toBeDefined()
      expect(driver2).toBeDefined()
      expect(driver3).toBeDefined()
      

  })

  
  it('Chat', async ()=>{

    await driver1.findElement(By.name('texto_mensagem')).sendKeys('Teste automatizado de mensagem 1', Key.RETURN);
    const mensagem = await driver2.findElement(By.id('historico_mensagens')).getText();

    expect(mensagem).toMatch('Usuario 1: Teste automatizado de mensagem 1');
  
  }, 1000)
  /*
  it('Stats', async ()=>{

    
    let map1 = new Map();
    const stats = await driver3.findElement(By.tagName("pre")).getText();
    map1.set(stats)
    
    var PKTL = map1.get("packetsReceived")

    console.log("M: ",stats)
    console.log("PKTL: ",PKTL)
    

    let url = 'http://localhost:3000/latencia';

    let obj = await (await fetch(url)).json();
    console.log("M: ",obj)
    return obj
  
  }, 1000)
  */
 /*
  it('Testando estatísticas dos peers', async ()=>{

    //ATENÇÃO: Os stats só podem ser medidos no chrome
    await sleep(6000)
    let stats =  await load_stats();
    
    await driver1.quit();
    await driver2.quit();


    //Testando dados do primeiro peer
    let peer1 = Object.values(stats)[0];
    expect(peer1.packetsLost).toBeLessThan(100);
    expect(peer1.dataChannelsOpened).toEqual(1);
    expect(peer1.dataChannelsClosed).toEqual(0);
    expect(peer1.packetsReceived).toBeGreaterThan(90);
    expect(peer1.bytesReceived).toBeGreaterThan(10000);
    expect(peer1.bytesSent).toBeGreaterThan(10000);

    //Testando dados do segundo peer
    let peer2 = Object.values(stats)[0];
    expect(peer2.packetsLost).toBeLessThan(100);
    expect(peer2.dataChannelsOpened).toEqual(1);
    expect(peer2.dataChannelsClosed).toEqual(0);
    expect(peer2.packetsReceived).toBeGreaterThan(90);
    expect(peer2.bytesReceived).toBeGreaterThan(10000);
    expect(peer2.bytesSent).toBeGreaterThan(10000);

})
*/
});
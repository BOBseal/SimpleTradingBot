require('dotenv').config;
const ccxt = require('ccxt');
const axios = require ('axios');

const tick = async()=> {
    const {asset, base , spread, allocation}= config ;
    const market ='${asset}/${base}';

    const orders = await gateClient.fetchOpenOrders(market);
    orders.forEach(async order =>{
        await gateClient.cancelOrder(order.id);
    });

    const results = await Promise.all(
   [
       axios.get('https://api.coingecko.com/api/v3/simple/price?ids=eth&vs_currencies=usd'),
       axios.get('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=usd')
    ]);
    const marketPrice = results[0].data.ethereum.usd / results [1].data.tether.usd;

    const sellPrice = marketPrice*(1+ spread);
    const buyPrice = marketPrice*(1-spread);
    const balances = await gateClient.fetchBalance();
    const assetBalance = balances.free[asset];
    const baseBalance = balances.free[base];
    const sellVolume = assetBalance*allocation;
    const buyVolume = (baseBalance* allocation)/marketPrice;
    await gateioClient.createLimitSellOrder(market, sellVolume ,sellPrice);
    await gateioClient.createLimitBuyOrder(market, buyVolume, buyPrice);
    console.log(
       
       ' New tick for ${market}Created Limit sell order for ${sellVolume}@ ${sellPrice}Create Limit buy order for ${buyVolume}@ ${buyPrice}'
        
    );
}

const run = ()=> {
    const config ={
        asset : 'ETH',// your currency to trade
        base : 'USDT',// base trade pair
        allocation : 0.05, // percentage of total funds the bot will use for each trade -- currently set by me at 5%
        spread : 0.008,// buy and sell  order difference in percentage from marketprice -- current at 0.7%
        tickInterval : 3000 // frequency of trade order place and cancelling by bot
    };
    const gateClient = new ccxt.gate({
        apiKey: process.env.API_KEY,
        secret : process.env.API_SECRET
    });

    tick(config, gateClient);
    setInterval(tick, config.tickInterval, config, binanceClient);

};
run ();
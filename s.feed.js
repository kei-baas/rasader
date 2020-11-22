// GET SOME LIBS
const ax = require('axios')
var play = require('play')
var keypress = require('keypress')


// USE A SIMPLE GLOBAL VARIABLE
same = false

// wallet TARGET GOAL


// BETTER TO READ THIS SECTION FROM THE FILE 


let wallet = {
    //768
    buy: {
        base: 7300,
        top: 7450,
        state: 'on'
    },
    sell: {
        base: 7680,
        top: 7780,
        state: 'off'
    },
    idealBuy: {
        base: 6000,
        top: 6400
    },
    idealSell: {
        base: 8000,
        top: 8550
    },
    whatYouPick:null

}



function checkForOffState(wal) { 
    let offs = []
    for (item in wal) { 
        if (typeof(wal[item]) == 'object'){
            
        if(wal[item] != null){
        if (wal[item].hasOwnProperty('state')) { 
            if(wal[item].state =='off') { 
                offs.push(item)
            }
        }
    }
    }
}
    if(offs.length == 1) return offs[0]
    return offs
}





// not work in the deamon process

var mute = false

var buyCounter = 0
var sellCounter = 0
var ideaBuyCounter = 0
var idealSellCounter = 0


keypress(process.stdin);

// listen for the "keypress" event

//we press s for stop
// AFTER YOU PRESS THE ENTER YOU STOP THE VOICES
process.stdin.on('keypress', function(ch, key) {
    console.log('got "keypress"', key);
    if (key && key.name == 'enter') {
        console.log("you hit the s on keyboard")
        mute = true
    } else if (key && key.name == 'space') {
        mute = false
    }
});



// DELAY
function sleep(time) {
    setTimeout(() => {}, time)
}




function renderDefault(sameVal,data,wl) {


    let observeFas = `############################## OBSERVE FAZE ####################`;
    let notchange = `############################## NO CHANGES ####################`;

    if (sameVal) {
        console.log(notchange)
    } else {

        console.log(observeFas)
        renderPresetThings(wl)
    }
    
    render(data)

}



function renderPresetThings(wallet) {
    let offThings = checkForOffState(wallet)
    if (offThings) { 
        if(typeof(offThings != 'object')) { 
            //means string
            console.log(`${offThings} is off `) 
        }else {
            // means array
            for (item in offThings) { 
                console.log(`${item} is off`)
            }
        }
    }

    if (wallet.whatYouPick !== undefined) { 
        
        if(wallet.whatYouPick != null) { 
            console.log(`your pick : ${wallet.whatYouPick}`)
        } else { 
            console.log(`your pick  : nothing`)
        }
    }


}


function delay(time, flag) {
    setTimeout(() => {
        switch (flag) {
            case 'sell':
                sellCounter = 0
                mute = false
                break;
            case 'buy':
                buyCounter = 0
                mute = false
                break;
            case 'id_buy':
                ideaBuyCounter = 0
                mute = false
                break;
            case 'id_sell':
                idealSellCounter = 0

        }
    }, time)
}

// API TRIGGER FOR THE APPROPERIATE CURRENCY 
function nobi(currency, vsCurrency, cb) {
    ax.post('https://api.nobitex.ir/market/stats', {
        srcCurrency: currency,
        dstCurrency: vsCurrency
    }).then(response => {

        cb(response)

    });
}


// TRIMER FOR IMPRECISION
function trimer(value) {
    val = value.split('.')
    return val[0]
}

//HTTP POOLING

function main() {
setInterval(() => {
    nobi('trx', 'rls', (data) => {

        buyVal = data.data.stats['trx-rls'].bestBuy;
        sellVal = data.data.stats['trx-rls'].bestSell;
        // we have the value then we have  to check bewtween 

        if (wallet.sell.state == 'on') {
            if (isBetween(wallet.sell, sellVal)) {


                console.log(`############${sellVal}#############${sellVal}########## MUST SELLLLLL #############${sellVal}###########`)

                if (!mute) {
                    console.log(sellCounter)
                    if (sellCounter == 5) {
                        mute = true
                        delay(50000, 'sell')


                    } else {
                        play.sound('./sell.mp3');
                        sellCounter++
                    }




                    //sleep(10000)
                    console.log("waiting to sell ....")
                    // we need to sleep for couple of seconds and then resume the interval again


                }
            } else {


                renderDefault(same, data.data.stats['trx-rls'],wallet)

            }

        } else if (wallet.buy.state = 'on') {
            if ((isBetween(wallet.buy, buyVal))) {
                console.log(`############${buyVal}#############${buyVal}########## MUST BUY #############${buyVal}###########`)

                if (!mute) {
                    if (buyCounter == 5) {
                        mute = true
                        delay(50000, 'buy')

                    } else {
                        play.sound('./buy.mp3');
                        sellCounter++
                    }


                }

                sleep(10000)
                console.log("waiting to buy...... ")

            } else {

                renderDefault(same, data.data.stats['trx-rls'],wallet)
            }

        } else if (isBetween(wallet.idealBuy, buyVal)) {
            console.log("!!!!!!!!!!!!!!!!!!!!!!!!! JUST FUCKING BUY AS FAST AS POSSIBLE")
            if (!mute) {
                if (ideaBuyCounter == 5) {
                    mute = true
                    delay(50000, 'id_buy')
                } else {
                    play.sound('./idealBuy.mp3');
                    ideaBuyCounter++
                }

            }

        } else if (isBetween(wallet.idealSell, sellVal)) {
            if (!mute) {
                if (idealSellCounter == 5) {
                    mute = true
                    delay(50000, 'id_sell')

                } else {
                    play.sound('./ideaSell.mp3')
                    idealSellCounter++
                }

            }
            console.log("!!!!!!!!!!!!!!!!!!!!!!!!! JUST SELL AS FAST AS POSSIBLE")
        } else {
            renderDefault(same, data.data.stats['trx-rls'],wallet)


        }

    });
}, 3000)
}

// DATE SHOWN TO THE CONSOLE
function render(object) {
    latest = trimer(object.latest)
    let {
        bestBuy,
        bestSell
    } = object;

    if (render.cache != undefined) {
        if (render.latest == object.latest && render.bestBuy == bestBuy && render.bestSell == bestSell) {
            same = true
            return
            // this means avoid exesive result for showing 
        } else {

            console.log(`# latest: ${latest} #\n# bestBuy: ${bestBuy} # \n# bestSell: ${bestSell} #\n# ${calculateTime()} #\n`)
            same = false
        }

    } else {
        same = false
        render.cache = {}
        render.latest = object.latest;
        render.bestBuy = bestBuy
        render.bestSell = bestSell
        
        console.log(`# latest: ${latest} #\n# bestBuy: ${bestBuy} # \n# bestSell: ${bestSell} #\n# time : ${calculateTime()} #\n`)

    }
    //just for caching and avoid rendering 

}

//CALCULATE 
function calculateTime() {
    time = new Date()
    return `${time.getHours()}: ${time.getMinutes()}: ${time.getSeconds()}`
}


function isBetween(obj, value) {
    if (value >= obj.base && value <= obj.top) {
        return true
    } else {
        return false
    }
}



main()


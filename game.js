// Inspired by Cookie Clicker's source code, that I know way too well

// Helper functions
function l (element) { return document.getElementById(element);};

// The weird game loop timing shit
var Time = {}
Time.deltaTime=0;
Time.totalTime=0;
Time.curTime = 0;
Time.lastTime = null;

Time.updateDeltaTime = function() {
    Time.curTime = performance.now();
    if (Time.lastTime === null) Time.lastTime = Time.curTime;
    Time.deltaTime = (Time.curTime - Time.lastTime) /1000;
    Time.totalTime += Time.deltaTime;
    Time.lastTime = Time.curTime;
}

// Initialize the main game object
var Game = {};

Game.SaveGame = function() {
    var save = {
        titles: Game.titles,
        lastTime: Time.lastTime,
        objects: ['a'],
    }

    var builds = [];
    for(bus in Game.things) {
        var build = Game.things[bus];
        var buildObj = {
            name: build.name,
            price: build.price,
            amount: build.amount,
            gain: build.gain
        }
        builds[build.name] = buildObj;
    }

    for(b in builds) {
        var buck = builds[b]
        console.table(buck);
        save.things[buck.name] = buck;
    }
    console.log(JSON.stringify(save));
    
}

Game.Init = function() {
    
    Game.FPS = 60;
    Game.titles = 0;
    Game.ready = 0;

    Game.visible = true;

    Game.Things = [];
    Game.ThingsAmount = 0;
    Game.Thing = function(name, desc, basePrice, baseGain, visible = false) {
        this.name = name;
        this.desc = desc;
        this.amount = 0;
    
        this.basePrice = basePrice;
        this.price = basePrice;

        this.visible = visible;
    
        this.baseGain = baseGain;
        this.gain = baseGain;
    
        this.id = Game.ThingsAmount;
        Game.ThingsAmount++;
        Game.Things[name] = this;

        this.buy = function() {
            if(Game.titles < this.price) return;

            Game.titles -= this.price;
            this.amount += 1;
            this.price = this.basePrice * Math.pow(1.25, this.amount);

            Game.UpdateMarketPrices();
        }
    }

    Game.ClickBuyThing = function(thing) {
        Game.Things[thing].buy();
    }

    new Game.Thing('Thinker', 'Thinks of titles for you', 15, 0.1, true);
    new Game.Thing('"Friends"', "Let your new buddies think for you", 150, 1);

    Game.BuildMarket();

    l('clickButton').addEventListener("click", Game.Click);
    l('clickButton').addEventListener("keydown", function(ev) {if(ev) ev.preventDefault()});

    document.addEventListener("visibilitychange", function(ev) {
        if(document.visibilityState==='hidden') Game.visible=false; 
        else Game.visible=true;
    })
}

Game.Click = function(e) {
    if (e) e.preventDefault();
    Game.EarnTitle(1);
}

Game.EarnTitle = function(amount) {
    Game.titles += amount;
}

Game.BuildMarket = function() {
    l('marketThings').innerHTML = '';
    for (t in Game.Things) {
        var thing = Game.Things[t];
        var thingDiv = document.createElement('div')

        var title = document.createElement('div');
        title.classList.add("title");
        title.textContent = thing.name;

        var desc = document.createElement('div');
        desc.textContent = thing.desc;

        var price = document.createElement('div');
        price.textContent = "Price: " + thing.price.toFixed(2);
        price.id = thing.name+'Price';

        var owned = document.createElement('div');
        owned.textContent = "Owned: " + thing.amount;
        owned.id = thing.name+'Amount';

        var buyBtn = document.createElement('button');
        buyBtn.textContent = "Buy";
        buyBtn.id = thing.name+'BuyBtn';

        thingDiv.appendChild(title);
        thingDiv.appendChild(desc);
        thingDiv.appendChild(price);
        thingDiv.appendChild(owned);
        thingDiv.appendChild(buyBtn);

        thingDiv.classList.add("thing");
        thingDiv.id = "thing"+thing.id;
        thingDiv.classList.add("locked");

        l('marketThings').appendChild(thingDiv);
        l('marketThings').appendChild(document.createElement('br'));
    }

    for (var i in Game.Things) {
        var thing = Game.Things[i];
        thing.l = l("thing"+thing.id);
        var thingl = l(thing.name+'BuyBtn');

        // idfk orteil is a genius
        thingl.addEventListener("click", function(b){return function(e){Game.ClickBuyThing(b);e.preventDefault();};}(thing.name));
    }
}

Game.UpdateMarketPrices = function() {
    for(i in Game.Things) {
        var thing = Game.Things[i];
        l(thing.name+'Price').textContent = "Price: " + thing.price.toFixed(2);
        l(thing.name+'Amount').textContent = "Owned: " + thing.amount;
    }
}

Game.Load = function() {

    Game.Init();

    Game.Draw = function() {
        document.getElementById("clickCounter").innerHTML = 'Titles' + '<br>' + Game.titles.toFixed(2);

        for (t in Game.Things) {
            var thing = Game.Things[t];
            var classes = "thing";
            if(Game.titles >= thing.basePrice || thing.amount >= 1 || thing.visible) {
                classes += " unlocked";
                thing.visible = true;
            }
            else {
                classes += " locked";
                thing.visible = false;
            }
            thing.l.className = classes;
        }
    }

    var profit = 0;
    Game.Loop = function() {
        if(document.hidden) Game.visible = false;
        else Game.visible = true;

        Time.updateDeltaTime();

        if (Game.visible) Game.Draw();

        // Calculate Profit
        profit = 0;
        for(i in Game.Things) {
            var thing = Game.Things[i];
            profit += thing.gain * thing.amount;
        }

        Game.EarnTitle(profit * Time.deltaTime);

        setInterval(Game.Loop, 1000/Game.FPS);
    }

    Game.ready = 1;

    Game.Loop();
}
window.onload = function() {
    if (!Game.ready) {
        Game.Load();
    }
}

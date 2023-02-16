// Helper functions
function l(element) { return document.getElementById(element); };

// Initialize Objects
var Meta = {};
var Economy = {};
var Market = {};
var Time = {};
var Things = {};
var Game = {};

/*---------
META
---------*/

Meta.UI = {};
Meta.UI.InfoMenuOn = false;
Meta.UI.ToggleInfoMenu = function() {
    Meta.InfoMenuOn = !Meta.InfoMenuOn;
    l('infoMenu').style.display = (Meta.InfoMenuOn ? "block" : "none");
}

Meta.UI.Init = function() {
    l('infoMenu').style.display = "none";
}

/*---------
ECONOMY
---------*/
Economy.titles = 0;

Economy.Earn = function (amount) {
    Economy.titles += amount;
}

Economy.Lose = function (amount) {
    Economy.titles -= amount;
}

/*---------
MARKET
---------*/

Market.ClickBuyThing = function (thing) {
    Things.things[thing].buy();
}

Market.Create = function () {
    l('marketThings').innerHTML = '';
    for (thing of Things.things) {
        var thingDiv = document.createElement('div')

        var title = document.createElement('div');
        title.classList.add("title");
        title.textContent = thing.name;

        var desc = document.createElement('div');
        desc.textContent = thing.desc;

        var seperator = document.createElement('hr');
        seperator.classList.add("marketSeperator");

        var price = document.createElement('div');
        price.textContent = "Price: " + thing.price.toFixed(2);
        price.id = thing.name + 'Price';

        var owned = document.createElement('div');
        owned.textContent = "Owned: " + thing.amount;
        owned.id = thing.name + 'Amount';

        var buyBtn = document.createElement('button');
        buyBtn.textContent = "Buy";
        buyBtn.id = thing.name + 'BuyBtn';

        thingDiv.appendChild(title);
        thingDiv.appendChild(desc);
        thingDiv.appendChild(seperator);
        thingDiv.appendChild(price);
        thingDiv.appendChild(owned);
        thingDiv.appendChild(buyBtn);

        thingDiv.classList.add("thing");
        thingDiv.id = "thing" + thing.id;
        thingDiv.classList.add("locked");

        l('marketThings').appendChild(thingDiv);
        l('marketThings').appendChild(document.createElement('br'));
    }

    for (var thing of Things.things) {
        thing.l = l("thing" + thing.id);
        var thingl = l(thing.name + 'BuyBtn');

        // idfk orteil is a genius
        thingl.addEventListener("click", function (b) { return function (e) { Market.ClickBuyThing(b); e.preventDefault(); }; }(thing.id));
    }
}

Market.UpdatePrices = function () {
    for (thing of Things.things) {
        l(thing.name + 'Price').textContent = "Price: " + thing.price.toFixed(2);
        l(thing.name + 'Amount').textContent = "Owned: " + thing.amount;
    }
}

/*---------
TIME
---------*/

Time.deltaTime = 0;
Time.totalTime = 0;
Time.curTime = 0;
Time.lastTime = null;

Time.updateDeltaTime = function () {
    Time.curTime = performance.now();
    if (Time.lastTime === null) Time.lastTime = Time.curTime;
    Time.deltaTime = (Time.curTime - Time.lastTime) / 1000;
    Time.totalTime += Time.deltaTime;
    Time.lastTime = Time.curTime;
}

/*---------
UPGRADES
---------*/

/*
Not yet implemented ;)

List of ones I want to add:
- Thinker 2 - Speeds up Thinkers in 2 times (idea by crapbass)
- Sheet of 100 existing titles - Makes clicking 3 times as effective
*/


/*---------
THINGS
---------*/
Things.things = [];
Things.amount = 0;

Things.Thing = function (name, desc, basePrice, baseGain, visible = false) {
    this.name = name;
    this.desc = desc;
    this.amount = 0;

    this.basePrice = basePrice;
    this.price = basePrice;

    this.visible = visible;

    this.baseGain = baseGain;
    this.gain = baseGain;

    this.id = Things.amount;
    Things.amount++;
    Things.things.push(this);

    this.l = undefined;

    this.buy = function () {
        if (Economy.titles < this.price) return;

        Economy.titles -= this.price;
        this.amount += 1;
        this.price = this.basePrice * Math.pow(1.25, this.amount);

        Market.UpdatePrices();
    }
}

/*
Credits for direct/indirect building ideas:
zTags - Artificial Intelligence
*/
Things.Create = function() {
    new Things.Thing('Thinker', 'Thinks of titles for you', 15, 0.1, true);
    new Things.Thing('"Friends"', "Let your contrac-... buddies think for you", 150, 1);
    new Things.Thing('Office', 'Make a bunch of office clerk think of new titles', 1000, 15);
    new Things.Thing('Artificial Intelligence', 'Ask a highly intelligent AI to think of new titles', 100000, 100);
}

Game.Init = function () {
    Game.FPS = 60;
    Game.visible = true;
    Game.ready = 0;

    Meta.UI.Init();
    Things.Create();
    Market.Create();

    l('clickButton').addEventListener("click", function(ev) { Game.Click(ev); });
    l('clickButton').addEventListener("keydown", function (ev) { if (ev) ev.preventDefault() });

    document.addEventListener("visibilitychange", function (ev) {
        if (document.visibilityState === 'hidden') Game.visible = false;
        else Game.visible = true;
    })
}

Game.Load = function () {

    Game.Init();

    Game.Click = function (e) {
        if (e) e.preventDefault();
        Economy.Earn(1);
    }

    Game.Draw = function () {
        document.getElementById("clickCounter").innerHTML = Economy.titles.toFixed(2);

        for (var thing of Things.things) {
            var classes = "thing";
            if (Economy.titles >= thing.basePrice || thing.amount >= 1 || thing.visible) {
                classes += " unlocked";
                thing.visible = true;
            }
            else if (Things.things[thing.id - 1].visible) {
                classes += " next";
            }
            else {
                classes += " locked";
                thing.visible = false;
            }
            thing.l.className = classes;
        }
    }

    var profit = 0;
    Game.Loop = function () {
        if (document.hidden) Game.visible = false;
        else Game.visible = true;

        Time.updateDeltaTime();

        if (Game.visible) Game.Draw();

        // Calculate Profit
        profit = 0;
        for (thing of Things.things) {
            profit += thing.gain * thing.amount;
        }

        Economy.Earn(profit * Time.deltaTime);
    }

    Game.ready = 1;

    setInterval(function () { Game.Loop() }, 1000 / Game.FPS);
}
window.onload = function () {
    if (!Game.ready) {
        Game.Load();
    }
}

// Helper functions
function l(element) { return document.getElementById(element); };

function returnByName(list, name) {
    let res=[]
    list.filter(function (t) {
        if(t.name === name) res.push(t);
    });
    return res;
}

function returnById(list, id) {
    let res=[]
    list.filter(function (t) {
        if(t.id === id) res.push(t);
    });
    return res;
}

// i stole this from somewhere (http://www.webtoolkit.info/)
let Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(r){var e,t,o,a,h,d,C,c="",f=0;for(r=Base64._utf8_encode(r);f<r.length;)e=r.charCodeAt(f++),t=r.charCodeAt(f++),o=r.charCodeAt(f++),a=e>>2,h=(3&e)<<4|t>>4,d=(15&t)<<2|o>>6,C=63&o,isNaN(t)?d=C=64:isNaN(o)&&(C=64),c=c+this._keyStr.charAt(a)+this._keyStr.charAt(h)+this._keyStr.charAt(d)+this._keyStr.charAt(C);return c},decode:function(r){var e,t,o,a,h,d,C,c="",f=0;for(r=r.replace(/[^A-Za-z0-9\+\/\=]/g,"");f<r.length;)a=this._keyStr.indexOf(r.charAt(f++)),h=this._keyStr.indexOf(r.charAt(f++)),d=this._keyStr.indexOf(r.charAt(f++)),C=this._keyStr.indexOf(r.charAt(f++)),e=a<<2|h>>4,t=(15&h)<<4|d>>2,o=(3&d)<<6|C,c+=String.fromCharCode(e),64!=d&&(c+=String.fromCharCode(t)),64!=C&&(c+=String.fromCharCode(o));return Base64._utf8_decode(c)},_utf8_encode:function(r){r=r.replace(/\r\n/g,"\n");for(var e="",t=0;t<r.length;t++){var o=r.charCodeAt(t);o<128?e+=String.fromCharCode(o):o>127&&o<2048?(e+=String.fromCharCode(o>>6|192),e+=String.fromCharCode(63&o|128)):(e+=String.fromCharCode(o>>12|224),e+=String.fromCharCode(o>>6&63|128),e+=String.fromCharCode(63&o|128))}return e},_utf8_decode:function(r){for(var e="",t=0,o=c1=c2=0;t<r.length;)(o=r.charCodeAt(t))<128?(e+=String.fromCharCode(o),t++):o>191&&o<224?(e+=String.fromCharCode((31&o)<<6|63&(c2=r.charCodeAt(t+1))),t+=2):(e+=String.fromCharCode((15&o)<<12|(63&(c2=r.charCodeAt(t+1)))<<6|63&(c3=r.charCodeAt(t+2))),t+=3);return e}};

// Initialize Objects
let Save = {};
let UI = {};
let Time = {};
let Economy = {};
let Upgrades = {};
let Things = {};
let Market = {};
let Game = {};

/*---------
SAVE
---------*/
Save.getThings = function() {
    let things = [];
    for (thing of Things.things) {
        let thingie = {
            name: thing.name,
            amount: thing.amount,
            price: thing.price,
            visible: thing.visible
        }
        things.push(thingie);
    }
    return things;
}

Save.getUpgrades = function() {
    let upgrades = [];
    for (upgrade of Upgrades.upgrades) {
        let upgradey = {
            name: upgrade.name,
            owned: upgrade.owned,
            visible: upgrade.visible
        }
        upgrades.push(upgradey);
    }
    return upgrades;
}

Save.getEconomy = function() {
    let economy = {
        titles: Economy.titles,
        totalTitles: Economy.totalTitles
    }
    return economy;
}

Save.makeSave = function() {
    let save = {
        things: Save.getThings(),
        upgrades: Save.getUpgrades(),
        economy: Save.getEconomy(),
    };

    return save;
}

Save.init = function() {
    if(localStorage.getItem('save') === null) {
        Save.save();
        return;
    }

    Save.load(localStorage.getItem('save'));
}

Save.save = function() {
    let saveStr = Base64.encode(JSON.stringify(Save.makeSave()));

    localStorage.setItem('save', saveStr);

    UI.Notify("Saved!", "Your progress should be saved :3", true, 1);
}

Save.deleteSave = function() {
    localStorage.removeItem('save');
    window.location.reload();
}

Save.load = function(s) {
    let saveStr;
    if (s === undefined) {
        console.error("Save was not specified!");
        return;
    }

    try {
        saveStr = Base64.decode(s);
    }
    catch (e) {
        console.error("An error occured decoding the specified save: " + e);
        return;
    }

    let save; 
    try {
        save = JSON.parse(saveStr);
    }
    catch (e) {
        console.error("An error occured parsing the specified save: " + e);
        return;
    }

    for (thing of save.things) {
        let t = returnByName(Things.things, thing.name)[0];
        if (t === undefined) return;
        t.amount = thing.amount;
        t.price = thing.price;
        t.visible = thing.visible;
    }

    for (upgrade of save.upgrades) {
        let u = returnByName(Upgrades.upgrades, upgrade.name)[0];
        if (u === undefined) return;
        u.owned = upgrade.owned;
        u.visible = upgrade.visible;
    }

    Economy.titles = save.economy.titles;
    Economy.totalTitles = save.economy.totalTitles;

    Market.Update();

    UI.Notify("Loaded!", "Your progress should be loaded :3", true, 1);
}

Save.UI = {};
Save.UI.exportSave = function() {
    let saveStr = Base64.encode(JSON.stringify(Save.makeSave()));
    l('saveOutput').value = saveStr;
}

Save.UI.importSave = function() {
    let save = l('saveInput').value;
    Save.load(save);
}


/*---------
UI
---------*/

UI.tabs = [];
UI.tabAmount = 0;
UI.Tab = function(name, buttonId, contentId) {
    this.name = name;

    this.id = UI.tabAmount;
    UI.tabAmount++;

    this.button = l(buttonId);
    this.content = l(contentId);

    UI.tabs.push(this);
}

UI.tabGroups = [];
UI.tabGroupAmounts = 0;
UI.TabGroup = function(name, tabs) {
    this.name = name;

    this.id = UI.tabGroupAmounts;
    UI.tabGroupAmounts++;

    this.tabs = [];
    for (tab of tabs) {
        this.tabs.push(tab);
    }

    UI.tabGroups.push(this);
}

UI.TabGroup.prototype.ToggleTab = function(tabContent, ev) {
    let tabEl;
    let tabBut;

    if (tabContent != undefined) tabEl = tabContent;
    else tabEl = this.tabs[0].content;

    for (i of this.tabs) {
        if (i.content == tabEl) {
            tabBut = i.button;
            continue;
        }
        i.content.style.display = "none";
        i.button.classList = "title medium bold menuTitle";
    }

    tabEl.style.display = "block";
    tabBut.classList = "title medium bold menuTitle active";
}

UI.tabByName = function(name) {
    return returnByName(UI.tabs, name)[0];
}

UI.tabByNameFromGroup = function(group, name) {
    return returnByName(group, name)[0];
}

UI.tabGroupByName = function(name) {
    return returnByName(UI.tabGroups, "Main")[0];
}

UI.popups = [];
UI.popupsID = [];
UI.popCount = 0;
UI.Popup = function(title, desc, useLifeTime = true, lifeTime = 3) {
    this.title = title;
    this.desc = desc;
    this.lifetime = lifeTime*Game.FPS;
    this.useLifetime = useLifeTime;

    this.died = false;

    this.popId = UI.popCount;
    UI.popupsID[this.popId] = this;
    UI.popCount++;

    UI.popups.unshift(this);

    let popEl = document.createElement('div');
    popEl.classList.add("popup");
    popEl.popId = this.popId;

    let popTitle = document.createElement('span');
    popTitle.classList.add("title", "bold", "popText");
    popTitle.textContent = this.title;
    popEl.appendChild(popTitle);

    popEl.appendChild(document.createElement('br'));

    let popDesc = document.createElement('div');
    popDesc.textContent = this.desc;
    popDesc.classList.add("popText");
    popEl.appendChild(popDesc);

    let popNotice = document.createElement('span');
    popNotice.textContent = "Click on the popup to close it";
    popNotice.classList.add("popNotice", "popText");
    popEl.appendChild(popNotice);

    this.element = popEl;

    this.element.addEventListener('click', function(ev) {
        UI.popupsID[this.popId].Close();
    })

    l('popups').appendChild(popEl);
}

// Unsuprisingly CC code saves the day once again
UI.Popup.prototype.Close = function() {
    UI.popups.splice(UI.popups.indexOf(this));
    UI.popupsID[this.id] = null;
    l('popups').removeChild(this.element);
    this.lifetime = 0;
}

UI.UpdatePopups = function() {
    
    if(UI.popups.length <= 0) return;

    for (pop of UI.popups) {
        if (pop.useLifetime) pop.lifetime -= 1;

        if(pop.lifetime <= 0 || pop.died) {
            pop.died = true;
            pop.Close();
        }
    }
}

UI.Notify = function(title, desc, useLifeTime = true, lifeTime = 3) {
    new UI.Popup(title, desc, useLifeTime, lifeTime);
}

UI.Init = function () {
    // Main topbar buttons
    let tabGroupMain = new UI.TabGroup("Main", [
        new UI.Tab("Market", "marketTabButton", "marketTabContent"),
        new UI.Tab("Options", "optionsTabButton", "optionsTabContent"),
        new UI.Tab("Info", "infoTabButton", "infoTabContent"),
    ]);

    for(const tab of tabGroupMain.tabs) {
        tab.button.addEventListener("click", function(ev) {
            tabGroupMain.ToggleTab(tab.content, ev);
        });
    }

    tabGroupMain.ToggleTab(); // Make it so all tabs don't get shown at once, and only the first one
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
ECONOMY
---------*/

Economy.titles = 0;
Economy.totalTitles = 0;

Economy.Earn = function (amount) {
    Economy.titles += amount;
    Economy.totalTitles += amount;
}

Economy.Lose = function (amount) {
    Economy.titles -= amount;
}

/*---------
UPGRADES
---------*/

Upgrades.upgrades = [];
Upgrades.amount = 0;
Upgrades.types = {
    Click: "Click",
    Thing: "Thing",
}

Upgrades.Upgrade = function (name, desc, price, type, visible = false) {
    this.name = name;
    this.desc = desc;
    this.price = price;
    this.type = type;

    this.l = undefined;
    this.id = Upgrades.amount;
    this.owned = false;
    this.visible = visible;

    Upgrades.upgrades.push(this);
    Upgrades.amount++;

    this.buy = function () {
        if (Economy.titles < this.price) return;

        Economy.titles -= this.price;
        this.owned = true;
        Market.Update();
    }
}

Upgrades.Create = function () {
    // Things
    new Upgrades.Upgrade('Thinker 2', 'Speeds up Thinkers in 2 times', 250, Upgrades.types.Thing);
    // new Upgrades.Upgrade('Dynamic Duo', 'Increases TPS by 1% for every 10 Thinkers', 1000000, Upgrades.types.Thing);

    // Clicks
    new Upgrades.Upgrade('Sheet of 100 existing titles', 'Makes clicking 3 times as effecient', 500, Upgrades.types.Click);
}



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

    this.baseGain = baseGain;
    this.gain = baseGain;

    this.visible = visible;
    this.id = Things.amount;
    Things.amount++;
    Things.things.push(this);

    this.l = undefined;

    this.buy = function () {
        if (Economy.titles < this.price) return;

        Economy.titles -= this.price;
        this.amount += 1;
        this.price = this.basePrice * Math.pow(1.25, this.amount);

        Market.Update();
    }
}

/*
Credits for direct/indirect building ideas:
zTags - Artificial Intelligence
*/

Things.Create = function () {
    new Things.Thing('Thinker', 'Thinks of titles for you', 15, 0.1, true);
    new Things.Thing('"Friends"', "Let your contrac-... buddies think for you", 150, 1);
    new Things.Thing('Office', 'Make a bunch of office clerk think of new titles', 1000, 15);
    new Things.Thing('Cyber Thinker', 'It\'s like the Thinker, but smarter', 5000, 35);
    new Things.Thing('Title Analysis Center', 'Analyze which titles work the best, and think of new ones', 100000, 50);
    new Things.Thing('Artificial Intelligence', 'Ask a highly intelligent AI to think of new titles', 1500000, 75);
    new Things.Thing('Title Generator', 'Combined force of a machine learning algorithm and an AI generating new titles', 100000000, 125);
}

Things.UpdateGains = function () {
    // Update gains based on upgrades

    for (thing of Things.things) {
        let mult = 1;
        let baseGain = thing.baseGain;
        for (upgrade of Upgrades.upgrades) {
            if (!upgrade.type == Upgrades.types.Thing || !upgrade.owned) continue;

            switch(thing.name) {
                case "Thinker":
                    switch(upgrade.name) {
                        case "Thinker 2": 
                            mult *= 3;
                            break;
                        case "Dynamic Duo":
                            mult += Math.round(thing.amount/10) * 0.1;
                        default:
                            continue;
                    }
            }

        }
        thing.gain = baseGain * mult;
    }

}

/*---------
MARKET
---------*/
Market.InitUI = function() {
    Market.Tabs = new UI.TabGroup("Market", [
        new UI.Tab("Things", "marketThingsTabButton", "marketThingsTabContent"),
        new UI.Tab("Upgrades", "marketUpgradesTabButton", "marketUpgradesTabContent"),
    ]);

    for(const tab of Market.Tabs.tabs) {
        tab.button.addEventListener("click", function(ev) {
            Market.Tabs.ToggleTab(tab.content, ev);
        });
    }

    Market.Tabs.ToggleTab();
}

Market.ClickBuyThing = function (thing) {
    Things.things[thing].buy();
}

Market.ClickBuyUpgrade = function (upgrade) {
    Upgrades.upgrades[upgrade].buy();
    Things.UpdateGains();
}

Market.Create = function () {
    // Things

    l('marketThings').innerHTML = '';
    for (thing of Things.things) {
        let thingDiv = document.createElement('div')

        let title = document.createElement('div');
        title.classList.add("title");
        title.textContent = thing.name;

        let desc = document.createElement('span');
        desc.textContent = thing.desc;

        let seperator = document.createElement('hr');
        seperator.classList.add("marketSeperator");

        let seperator2 = document.createElement('hr');
        seperator2.classList.add("marketSeperator");

        let gain = document.createElement('span');
        gain.id = thing.name + 'Gain';

        let totalGain = document.createElement('span');
        totalGain.id = thing.name + 'TotalGain';

        let price = document.createElement('span');
        price.id = thing.name + 'Price';

        let owned = document.createElement('span');
        owned.id = thing.name + 'Amount';

        let buyBtn = document.createElement('button');
        buyBtn.textContent = "Buy";
        buyBtn.id = thing.name + 'BuyBtn';

        thingDiv.appendChild(title);
        thingDiv.appendChild(desc);
        thingDiv.appendChild(seperator);

        thingDiv.appendChild(gain);
        thingDiv.appendChild(seperator2);
        
        thingDiv.appendChild(totalGain);
        thingDiv.appendChild(document.createElement('br'));
        thingDiv.appendChild(price);
        thingDiv.appendChild(document.createElement('br'));
        thingDiv.appendChild(owned);
        thingDiv.appendChild(document.createElement('br'));
        
        thingDiv.appendChild(buyBtn);

        thingDiv.appendChild(document.createElement('br'));

        thingDiv.id = "thing" + thing.id;

        thingDiv.classList.add("thing");
        thingDiv.classList.add("product");
        thingDiv.classList.add("locked");


        l('marketThings').appendChild(thingDiv);
    }

    for (thing of Things.things) {
        let thingl = l(thing.name + 'BuyBtn');
        thing.l = l("thing" + thing.id);

        // idfk orteil is a genius
        thingl.addEventListener("click", function (b) { return function (e) { Market.ClickBuyThing(b); e.preventDefault(); }; }(thing.id));
    }

    // Upgrades
    l('marketUpgrades').innerHTML = '';
    for (upgrade of Upgrades.upgrades) {
        let upgradeDiv = document.createElement('div');

        let title = document.createElement('div');
        title.classList.add("title");
        title.textContent = upgrade.name;

        let desc = document.createElement('span');
        desc.textContent = upgrade.desc;

        let seperator = document.createElement('hr');
        seperator.classList.add("marketSeperator");

        let price = document.createElement('div');
        price.textContent = "Price: " + upgrade.price.toFixed(2);
        price.id = upgrade.name + 'Price';

        let buyBtn = document.createElement('button');
        buyBtn.textContent = "Buy";
        buyBtn.id = upgrade.name + 'BuyBtn';

        upgradeDiv.appendChild(title);
        upgradeDiv.appendChild(desc);
        upgradeDiv.appendChild(seperator);
        upgradeDiv.appendChild(price);
        upgradeDiv.appendChild(buyBtn);

        upgradeDiv.id = "upgrade" + upgrade.id;

        l('marketUpgrades').appendChild(upgradeDiv);
        l('marketUpgrades').appendChild(document.createElement('br'));
    }

    for (upgrade of Upgrades.upgrades) {
        let upgradel = l(upgrade.name + 'BuyBtn');
        upgrade.l = l("upgrade" + upgrade.id);

        upgradel.addEventListener("click", function (b) { return function (e) { Market.ClickBuyUpgrade(b); e.preventDefault(); }; }(upgrade.id));
    }

    Market.InitUI();
}

Market.Update = function () {
    Things.UpdateGains();
    for (thing of Things.things) {
        l(thing.name + 'Price').textContent = "Price: " + thing.price.toFixed(2);
        l(thing.name + 'Amount').textContent = "Owned: " + thing.amount;
        l(thing.name + 'Gain').textContent = "Thinks of " + thing.gain.toFixed(2) + " titles per second";
        l(thing.name + 'TotalGain').textContent = thing.amount + " of " + thing.name.toLowerCase() + " is thinking of " + (thing.amount * thing.gain).toFixed(2) + " titles per second";
    }
}

/*---------
GAME
---------*/

Game.Init = function () {
    Game.FPS = 60;
    Game.visible = true;
    Game.ready = 0;

    // TESTING STUFF
    Game.doLoop = true;
    Game.doDraw = true;

    UI.Init();
    Upgrades.Create();
    Things.Create();
    Market.Create();

    Market.Update();

    l('clickButton').addEventListener("click", function (ev) { Game.Click(ev); });
    l('clickButton').addEventListener("keydown", function (ev) { if (ev) ev.preventDefault() });

    document.addEventListener("visibilitychange", function (ev) {
        if (document.visibilityState === 'hidden') Game.visible = false;
        else Game.visible = true;
    });

    Save.init();
}

Game.Load = function () {

    Game.Init();

    Game.Click = function (e) {
        if (e) e.preventDefault();
        let clickAmount = 1;
        for (up of Upgrades.upgrades) {
            if (!up.type == Upgrades.types.Click || !up.owned) continue;

            switch (up.name) {
                case "Sheet of 100 existing titles":
                    clickAmount *= 3;
            }
        }
        Economy.Earn(clickAmount);
    }

    Game.Draw = function () {
        l("clickCounter").innerHTML = Economy.titles.toFixed(2);
        Economy.TPS = 0;
        for(thing of Things.things) {
            Economy.TPS += thing.gain * thing.amount;
        }
        l("tpsCounter").textContent = Economy.TPS.toFixed(2) + " TPS";

        for (const thing of Things.things) {
            let classes = "thing product";
            
            if (Things.things[thing.id+1] !== undefined) {
                let nextThing = Things.things[thing.id+1];
                if (nextThing.visible) thing.visible = true;
            }

            if (Economy.titles >= thing.price - (thing.price/100)*25 || thing.amount >= 1 || thing.visible) {
                classes += " unlocked";
                thing.visible = true;
            }
            else {
                classes += " locked";
                thing.visible = false;
            }

            if (Economy.titles >= thing.price) classes += " canBuy";
            if (Economy.titles < thing.price) classes += " cantBuy";
            thing.l.className = classes;
        }

        for (const upgrade of Upgrades.upgrades) {
            let classes = "upgrade";
            if (Economy.titles >= upgrade.price || upgrade.visible) {
                classes += " unlocked";
                upgrade.visible = true;
            }
            else classes += " locked";

            if (upgrade.owned) classes += " owned";
            if(Economy.titles < upgrade.price) classes += " cantBuy";
            if (Economy.titles >= upgrade.price) classes += " canBuy";
            upgrade.l.className = classes;
        }
    }

    let profit = 0;
    Game.Loop = function () {
        if (document.hidden) Game.visible = false;
        else Game.visible = true;

        Time.updateDeltaTime();

        if (Game.visible && Game.doDraw) Game.Draw();

        // Calculate Profit
        profit = 0;
        for (thing of Things.things) {
            profit += thing.gain * thing.amount;
        }

        Economy.Earn(profit * Time.deltaTime);

        UI.UpdatePopups(); // No more popup spam ;3
    }

    Game.ready = 1;

    UI.Notify("Welcome!", "This version of UIG includes saves. The system may get changed in future and your saves might not work in future versions.\n Click on a popup to close it ;)", false);

    setInterval(function () { if(Game.doLoop) Game.Loop() }, 1000 / Game.FPS);
    setInterval(function () {
        Save.save();
    }, 60*1000);
}
window.onload = function () {
    if (!Game.ready) {
        Game.Load();
    }
}

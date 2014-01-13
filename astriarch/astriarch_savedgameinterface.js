/**
 * Saved Game uses the model and HTML5 localStorage to load and save games
 */
Astriarch.SavedGameInterface = {

	Key:"astriarch_save"
};

/**
 * Checks to see if a saved game exists
 */
Astriarch.SavedGameInterface.savedGameExists = function(){

	var savedGameExists=false;
	if(localStorage)
	{
		var savedGame = localStorage.getItem(Astriarch.SavedGameInterface.Key);
		if(savedGame != null)
		{
			//TODO:check for proper version number (for now we need to do this because the google chrome compiler will mess up the members of the saved game interface)
			
			savedGameExists = true;
		}
	}
	return savedGameExists;
};

/**
 * Saves a game to the localStorage
 */
Astriarch.SavedGameInterface.saveGame = function(){

	if(localStorage)
	{
		var newModel = new Astriarch.SerializableModel(Astriarch.GameModel);
		var savedGameJSON = JSON.stringify(newModel);
		if(savedGameJSON != null)
		{
			localStorage.setItem(Astriarch.SavedGameInterface.Key, savedGameJSON);
		}
	}
};

/**
 * Loads a game from the localStorage
 */
Astriarch.SavedGameInterface.loadGame = function(){
	var returnVal = false;
	if(localStorage)
	{
		var savedGameJSON = localStorage.getItem(Astriarch.SavedGameInterface.Key);
		if(savedGameJSON != null)
		{
			try {
				var serializedModel = JSON.parse(savedGameJSON);
				var newModel = Astriarch.SavedGameInterface.getModelFromSerializableModel(serializedModel);
				if(newModel && newModel.MainPlayer) {
					Astriarch.GameModel = newModel;
					returnVal = true;
				}
			} catch(e)
			{
				returnVal = false;
			}
		}
	}
	return returnVal;
};

Astriarch.SavedGameInterface.findCircularReferences = function(obj, keyName, parentKeyName, hash){
	if(!hash)
		hash = [];

	if(obj == null || typeof(obj) != 'object')
		return;

	if(hash.indexOf(obj) == -1)
	{
		hash.push(obj);
	}
	else
		alert("found circular reference: " + parentKeyName + "." + keyName);

	for(var key in obj)
		Astriarch.SavedGameInterface.findCircularReferences(obj[key], key, keyName, hash);
	return;

};

Astriarch.SavedGameInterface.getModelFromSerializableModel = function(/*Astriarch.SerializableModel*/ serializedModel){
	
	var players = [];
	//first generate a 'stub' model so we have a grid
	var newModel = new Astriarch.Model(/*List<Player>*/ players, /*Player*/ null, /*int*/ serializedModel.SystemsToGenerate, /*PlanetsPerSystemOption*/ serializedModel.PlanetsPerSystem, true);
	newModel.ShowUnexploredPlanetsAndEnemyPlayerStats = serializedModel.ShowUnexploredPlanetsAndEnemyPlayerStats;
	newModel.Turn = jQuery.extend(newModel.Turn, serializedModel.Turn);
	
	var planets = [];
	var planetsById = {};//id:planet
	for(var i in serializedModel.SerializablePlanets)
	{
		var sp = serializedModel.SerializablePlanets[i];
		var boundingHex = newModel.GameGrid.GetHexAt(sp.OriginPoint);
		var p = new Astriarch.Planet(/*PlanetType*/ sp.Type, /*string*/ sp.Name, /*Hexagon*/ boundingHex, /*Player*/ null);
		
		p.Id = sp.Id;
		p.Population = sp.Population;//List<Citizen>
		p.RemainderProduction = sp.RemainderProduction;//if we finished building something we may have remainder to apply to the next item
		
		//populate BuildQueue:Queue<PlanetProductionItem>
		for(var j in sp.BuildQueue)
		{
			var sppi = sp.BuildQueue[j];
			var ppi = Astriarch.SavedGameInterface.getPlanetProductionItemFromSerializedPlanetProductionItem(sppi);
			p.BuildQueue.push(ppi);
		}
		
		
		p.BuiltImprovements = sp.BuiltImprovements;//Dictionary<PlanetImprovementType, List<PlanetImprovement>>
		p.MaxImprovements = sp.MaxImprovements;
		p.Resources = jQuery.extend(p.Resources, sp.Resources);//PlanetResources
		p.OriginPoint = sp.OriginPoint;//Point

		//populate Owner later in planets.SetPlanetOwner
		//this.Owner = null;//Player//null means it is ruled by natives or nobody in the case of an asteroid belt
		
		p.PlanetaryFleet = Astriarch.SavedGameInterface.getFleetFromSerializableFleet(sp.PlanetarySerializableFleet, newModel);

		//populate outgoingFleets
		for(var j in sp.OutgoingSerializableFleets)
		{
			p.OutgoingFleets.push(Astriarch.SavedGameInterface.getFleetFromSerializableFleet(sp.OutgoingSerializableFleets[j], newModel));
		}

		p.PlanetHappiness = sp.PlanetHappiness;//PlanetHappinessType
		
		p.StarShipTypeLastBuilt = sp.StarShipTypeLastBuilt;//StarShipType
		p.BuildLastStarShip = sp.BuildLastStarShip;

		p.ResourcesPerTurn = new Astriarch.Planet.PlanetPerTurnResourceGeneration(/*Planet*/ p, /*PlanetType*/ p.Type);
		
		//NOTE: not serialized
		p.maxPopulation = p.MaxImprovements;
		
		
		
		planets.push(p);
		planetsById[p.Id] = p;
	}
	
	//remake players
	for(var i in serializedModel.SerializablePlayers)
	{
		players.push(Astriarch.SavedGameInterface.getPlayerFromSerializedPlayer(newModel, serializedModel.SerializablePlayers[i], planetsById));
	}
	
	var playersById = {};
	var mainPlayer = null;
	for(var i in players)
	{
		var player = players[i];
		if(player.Type == Astriarch.Player.PlayerType.Human)
		{
			mainPlayer = player;
		}
		playersById[player.Id] = player;
	}
	
	//look for serializable destroyed players
	for(var i in serializedModel.SerializablePlayersDestroyed)
	{
		var player = serializedModel.SerializablePlayersDestroyed[i];
		playersById[player.Id] = Astriarch.SavedGameInterface.getPlayerFromSerializedPlayer(newModel, player, planetsById);
	}
	
	//second pass serializable players
	for(var i in serializedModel.SerializablePlayers)
	{
		var sp = serializedModel.SerializablePlayers[i];
		var p = playersById[sp.Id];
		
		//Player has LastKnownPlanetFleetStrength:new Dictionary<int, LastKnownFleet>
		for(var j in sp.LastKnownPlanetSerializableFleetStrength)
		{
			var sLKF = sp.LastKnownPlanetSerializableFleetStrength[j];
			
			//get Fleet from serializable fleet
			var fleet = Astriarch.SavedGameInterface.getFleetFromSerializableFleet(sLKF.SerializableFleet, newModel);
			var lastKnownFleet = new Astriarch.Fleet.LastKnownFleet(/*Fleet*/ fleet, /*Player*/ null);
			lastKnownFleet.TurnLastExplored = sLKF.TurnLastExplored;
			if(sLKF.LastKnownOwnerId)
			{
				lastKnownFleet.LastKnownOwner = playersById[sLKF.LastKnownOwnerId];
			}
			p.LastKnownPlanetFleetStrength[j] = lastKnownFleet;
		}
	}
	
	newModel.MainPlayer = mainPlayer;
	newModel.Planets = planets;
	
	return newModel;
};

Astriarch.SavedGameInterface.getPlayerFromSerializedPlayer = function(newModel, /*SerializablePlayer*/sp, planetsById) {
	var p = new Astriarch.Player(/*PlayerType*/ sp.Type, /*string*/ sp.Name);
	p.Id = sp.Id;
	p.Resources = jQuery.extend(p.Resources, sp.Resources);
	//for the main player we just want the color to be set, keep default image data
	//maybe this logic should be in SetColor instead?
	sp.Color = jQuery.extend(new Astriarch.Util.ColorRGBA(0, 0, 0, 0), sp.Color);
	if(p.Type == Astriarch.Player.PlayerType.Human)
	{
		p.Color = sp.Color;
	}
	else
	{
		p.SetColor(sp.Color);
	}
	p.LastTurnFoodNeededToBeShipped = sp.LastTurnFoodNeededToBeShipped;//this is for computers to know how much gold to keep in surplus for food shipments
	p.Options = sp.Options;

	//player model has OwnedPlanets:Dictionary<int, Planet>
	for(var j in sp.OwnedPlanetIds)
	{
		var planet = planetsById[sp.OwnedPlanetIds[j]];
		planet.SetPlanetOwner(p);
	}
	
	//player model has KnownPlanets:Dictionary<int, Planet>
	for(var j in sp.KnownPlanetIds)
	{
		var id = sp.KnownPlanetIds[j];
		p.KnownPlanets[id] = planetsById[id];
	}
	
	//LastKnownPlanetFleetStrength populated in second pass
	
	//populate PlanetBuildGoals:Dictionary<int, PlanetProductionItem>
	for(var j in sp.PlanetBuildGoals)
	{
		var sppi = sp.PlanetBuildGoals[j];
		var ppi = Astriarch.SavedGameInterface.getPlanetProductionItemFromSerializedPlanetProductionItem(sppi);
		p.PlanetBuildGoals[j] = ppi;
	}

	p.HomePlanet = planetsById[sp.HomePlanetId];

	for(var j in sp.SerializableFleetsInTransit)
	{
		p.FleetsInTransit.push(Astriarch.SavedGameInterface.getFleetFromSerializableFleet(sp.SerializableFleetsInTransit[j], newModel));
	}
	
	return p;
};

Astriarch.SavedGameInterface.getPlanetProductionItemFromSerializedPlanetProductionItem = function(/*PlanetProductionItem*/ sppi) {
	var ppi = null;
	if (sppi.PlanetProductionItemType == Astriarch.Planet.PlanetProductionItemType.PlanetImprovement)
	{
		ppi = new Astriarch.Planet.PlanetImprovement(sppi.Type);
	}
	else if (sppi.PlanetProductionItemType == Astriarch.Planet.PlanetProductionItemType.StarShipInProduction)//it's a ship
	{
		ppi = new Astriarch.Planet.StarShipInProduction(sppi.Type);
	}
	else if(sppi.PlanetProductionItemType == Astriarch.Planet.PlanetProductionItemType.PlanetImprovementToDestroy)//it is a destroy improvement request
	{
		ppi = new Astriarch.Planet.PlanetImprovementToDestroy(sppi.Type);
	}
	else
	{
		var string = "Problem!";
	}
	
	return jQuery.extend(ppi, sppi);
};

Astriarch.SavedGameInterface.getFleetFromSerializableFleet = function(/*Astriarch.SerializableFleet*/ serializedFleet, newModel) {
	var f = new Astriarch.Fleet();
		
	f.HasSpacePlatform = serializedFleet.HasSpacePlatform;
	f.SpacePlatformDamage = serializedFleet.SpacePlatformDamage;
	
	//populate starships, have to call constructors for all serialized starships because our methods won't be serialized
	for (var i in serializedFleet.StarShips[Astriarch.Fleet.StarShipType.SystemDefense])
	{
		var ship = jQuery.extend(new Astriarch.Fleet.StarShip(Astriarch.Fleet.StarShipType.SystemDefense), serializedFleet.StarShips[Astriarch.Fleet.StarShipType.SystemDefense][i]);
		f.StarShips[Astriarch.Fleet.StarShipType.SystemDefense].push(ship);
	}
	for (var i in serializedFleet.StarShips[Astriarch.Fleet.StarShipType.Scout])
	{
		var ship = jQuery.extend(new Astriarch.Fleet.StarShip(Astriarch.Fleet.StarShipType.Scout), serializedFleet.StarShips[Astriarch.Fleet.StarShipType.Scout][i]);
		f.StarShips[Astriarch.Fleet.StarShipType.Scout].push(ship);
	}
	for (var i in serializedFleet.StarShips[Astriarch.Fleet.StarShipType.Destroyer])
	{
		var ship = jQuery.extend(new Astriarch.Fleet.StarShip(Astriarch.Fleet.StarShipType.Destroyer), serializedFleet.StarShips[Astriarch.Fleet.StarShipType.Destroyer][i]);
		f.StarShips[Astriarch.Fleet.StarShipType.Destroyer].push(ship);
	}
	for (var i in serializedFleet.StarShips[Astriarch.Fleet.StarShipType.Cruiser])
	{
		var ship = jQuery.extend(new Astriarch.Fleet.StarShip(Astriarch.Fleet.StarShipType.Cruiser), serializedFleet.StarShips[Astriarch.Fleet.StarShipType.Cruiser][i]);
		f.StarShips[Astriarch.Fleet.StarShipType.Cruiser].push(ship);
	}
	for (var i in serializedFleet.StarShips[Astriarch.Fleet.StarShipType.Battleship])
	{
		var ship = jQuery.extend(new Astriarch.Fleet.StarShip(Astriarch.Fleet.StarShipType.Battleship), serializedFleet.StarShips[Astriarch.Fleet.StarShipType.Battleship][i]);
		f.StarShips[Astriarch.Fleet.StarShipType.Battleship].push(ship);
	}

	f.LocationHex = null;//Hexagon
	if(serializedFleet.LocationHexMidPoint)
	{
		f.LocationHex = newModel.GameGrid.GetHexAt(serializedFleet.LocationHexMidPoint)
	}
	//NOTE: need to populate?:
	//this.OnFleetMoved = null;//function pointer: FleetMoved(Fleet f);
	//this.OnFleetMergedOrDestroyed = null;//function pointer: FleetMergedOrDestroyed(Fleet f)
	
	//this.DrawnFleet = null;//backreference if we are drawing this fleet
	
	//remake DrawnFleet if this was a fleet in transit
	if(serializedFleet.travelingFromHexMidPoint)
	{
		var travelingFromHex = newModel.GameGrid.GetHexAt(serializedFleet.travelingFromHexMidPoint);
		var destinationHex = newModel.GameGrid.GetHexAt(serializedFleet.DestinationHexMidPoint);
		var totalTravelDistance = newModel.GameGrid.GetHexDistance(travelingFromHex, destinationHex);
		f.CreateDrawnFleetAndSetDestination(travelingFromHex, destinationHex, serializedFleet.addDrawnFleetToCanvas, serializedFleet.TurnsToDestination, totalTravelDistance);
	}
	
	return f;
};

/**
 * SerializableModel is a serializable version of the model, Creates a new version of the model without recursive/circular references so that it can be stringified
 * @constructor
 */
Astriarch.SerializableModel = function(/*Astriarch.Model*/ model) {

	this.ShowUnexploredPlanetsAndEnemyPlayerStats = model.ShowUnexploredPlanetsAndEnemyPlayerStats;//for debugging for now, could eventually be used once a scanner is researched?

    this.SystemsToGenerate = model.SystemsToGenerate;

    this.PlanetsPerSystem = model.PlanetsPerSystem;//Astriarch.Model.PlanetsPerSystemOption.FOUR;
    //public bool EnsureEachSystemContainsAllPlanetTypes = true;//TODO: implement if false every planet type (except home) will be randomly selected

	this.Turn = model.Turn;
	
	//build all known players so we can use this later for the serializable players destroyed
	var playersDestroyed = [];
	var allPlayerIds = {};
	for(var i in model.Players)
	{
		allPlayerIds[model.Players[i].Id] = true;
	}
	
	//this.Players = players;//model has Players:Astriarch.Player
	this.SerializablePlayers = [];
	for(var i in model.Players)
	{
		this.SerializablePlayers.push(new Astriarch.SerializablePlayer(model.Players[i], allPlayerIds, playersDestroyed));
	}
	
	//we keep a reference to dead players in the last known fleet,
	//	this way we have this structure for destroyed players that are "last known" in at least one fleet
	this.SerializablePlayersDestroyed = [];
	for(var i in playersDestroyed)
	{
		this.SerializablePlayersDestroyed.push(new Astriarch.SerializablePlayer(playersDestroyed[i], allPlayerIds, playersDestroyed));
	}
	
	//this.Planets = [];//model has Planets:Astriarch.Planet
	this.SerializablePlanets = [];
	for(var i in model.Planets)
	{
		this.SerializablePlanets.push(new Astriarch.SerializablePlanet(model.Planets[i]));
	}
	
	//save the version to the serializable model too so we could eventually be able to be smart about backwards compatibility for saved games
	this['Version'] = Astriarch.Version;
};

/**
 * A SerializablePlayer is a serializable version of the Player
 * @constructor
 */
Astriarch.SerializablePlayer = function(/*Astriarch.Player*/ player, allPlayerIds, playersDestroyed) {

	this.Id = player.Id;
	
	this.Type = player.Type;//PlayerType

	this.Name = player.Name;

	this.Resources = player.Resources;

	this.Color = player.Color;

	this.LastTurnFoodNeededToBeShipped = player.LastTurnFoodNeededToBeShipped;//this is for computers to know how much gold to keep in surplus for food shipments

	this.Options = player.Options;

	this.OwnedPlanetIds = [];//player model has OwnedPlanets:Dictionary<int, Planet>
	for(var i in player.OwnedPlanets)
	{
		this.OwnedPlanetIds.push(player.OwnedPlanets[i].Id);
	}
	
	this.KnownPlanetIds = [];//player model has KnownPlanets:Dictionary<int, Planet>
	for(var i in player.KnownPlanets)
	{
		this.KnownPlanetIds.push(player.KnownPlanets[i].Id);
	}
	
	this.LastKnownPlanetSerializableFleetStrength = {};//Player has LastKnownPlanetFleetStrength:new Dictionary<int, LastKnownFleet>
	for(var i in player.LastKnownPlanetFleetStrength)
	{
		this.LastKnownPlanetSerializableFleetStrength[i] = new Astriarch.Fleet.SerializableLastKnownFleet(player.LastKnownPlanetFleetStrength[i], allPlayerIds, playersDestroyed);
	}
	
	this.PlanetBuildGoals = player.PlanetBuildGoals;//Dictionary<int, PlanetProductionItem>
	for(var i in this.PlanetBuildGoals)
	{
		Astriarch.SavedGameInterface.makePlanetProductionItemSerializable(this.PlanetBuildGoals[i]);
	}

	this.HomePlanetId = player.HomePlanet.Id;//Player has HomePlanet:Planet

	this.SerializableFleetsInTransit = [];//Player has FleetsInTransit:List<Fleet>
	for(var i in player.FleetsInTransit)
	{
		this.SerializableFleetsInTransit.push(new Astriarch.SerializableFleet(player.FleetsInTransit[i], this.Type == Astriarch.Player.PlayerType.Human));
	}
	
	//NOTE: not serialized
	//this.fleetsArrivingOnUnownedPlanets = {};//Dictionary<int, Fleet>//indexed by planet id

};

/**
 * A SerializableFleet is a serializable version of the Fleet
 * @constructor
 */
Astriarch.SerializableFleet = function(/*Astriarch.Fleet*/ fleet, addDrawnFleetToCanvas) {
        this.StarShips = fleet.StarShips;
		
        this.HasSpacePlatform = fleet.HasSpacePlatform;
        this.SpacePlatformDamage = fleet.SpacePlatformDamage;

		//NOTE: not serialized
        this.LocationHexMidPoint = null;//Fleet has LocationHex:Hexagon
		if(fleet.LocationHex)
		{
			this.LocationHexMidPoint = fleet.LocationHex.MidPoint;
		}

		//NOTE: not serialized
        //this.OnFleetMoved = null;//function pointer: FleetMoved(Fleet f);
		//NOTE: not serialized
        //this.OnFleetMergedOrDestroyed = null;//function pointer: FleetMergedOrDestroyed(Fleet f)
		
		//NOTE: not serialized
		//this.DrawnFleet = null;//backreference if we are drawing this fleet
		
		//if this is a fleet in transit (it has a DrawnFleet reference), 
		//we need to serialize where it's going and coming from
		//in the future we might want to change the model so the fleet has the destination information instead of the drawn fleet
		if(fleet.DrawnFleet)
		{
			this.travelingFromHexMidPoint = fleet.DrawnFleet.travelingFromHex.MidPoint;
			this.DestinationHexMidPoint = fleet.DrawnFleet.DestinationHex.MidPoint;
			this.TurnsToDestination = fleet.DrawnFleet.TurnsToDestination;
			this.addDrawnFleetToCanvas = addDrawnFleetToCanvas;
		}
};

/**
 * A SerializableLastKnownFleet is a serializable version of the LastKnownFleet
 * @constructor
 */
Astriarch.Fleet.SerializableLastKnownFleet = function(/*LastKnownFleet*/ lastKnownFleet, allPlayerIds, playersDestroyed){
	this.TurnLastExplored = lastKnownFleet.TurnLastExplored;

	this.SerializableFleet = new Astriarch.SerializableFleet(lastKnownFleet.Fleet, false);//LastKnownFleet has Fleet:Astriarch.Fleet
	
	if(lastKnownFleet.LastKnownOwner)
	{
		if(!(lastKnownFleet.LastKnownOwner.Id in allPlayerIds))
		{
			//add the LastKnownOwer as a destroyed player
			playersDestroyed.push(lastKnownFleet.LastKnownOwner);
			allPlayerIds[lastKnownFleet.LastKnownOwner.Id] = true;
		}
		this.LastKnownOwnerId = lastKnownFleet.LastKnownOwner.Id;//LastKnownFleet has LastKnownOwner:Player
	}

};

/**
 * A SerializablePlanet is a serializable version of the Planet
 * @constructor
 */
Astriarch.SerializablePlanet = function(/*Astriarch.Planet*/ planet) {

	this.Id = planet.Id;
	this.Name = planet.Name;
	this.Type = planet.Type;
	this.Population = planet.Population;//List<Citizen>
	this.RemainderProduction = planet.RemainderProduction;//if we finished building something we may have remainder to apply to the next item
	
	this.BuildQueue = planet.BuildQueue;//Queue<PlanetProductionItem>
	for(var i in this.BuildQueue)
	{
		Astriarch.SavedGameInterface.makePlanetProductionItemSerializable(this.BuildQueue[i]);
	}
	
	this.BuiltImprovements = planet.BuiltImprovements;//Dictionary<PlanetImprovementType, List<PlanetImprovement>>

	this.MaxImprovements = planet.MaxImprovements;

	this.Resources = planet.Resources;//PlanetResources

	//NOTE: not serialized
	//this.BoundingHex = boundingHex;//Hexagon

	this.OriginPoint = planet.OriginPoint;//Point

	//NOTE: not serialized
	//this.Owner = null;//Player//null means it is ruled by natives or nobody in the case of an asteroid belt

	this.PlanetarySerializableFleet = new Astriarch.SerializableFleet(planet.PlanetaryFleet, false);//Planet has PlanetaryFleet:Fleet//the fleet stationed at this planet
	
	//populate outgoingFleets
	this.OutgoingSerializableFleets = [];//Planet has OutgoingFleets List<Fleet>
	for(var i in planet.OutgoingFleets)
	{
		this.OutgoingSerializableFleets.push(new Astriarch.SerializableFleet(planet.OutgoingFleets[i], planet.Owner.Type == Astriarch.Player.PlayerType.Human));
	}

	this.PlanetHappiness = planet.PlanetHappiness;//PlanetHappinessType

	this.BuiltImprovements = planet.BuiltImprovements;//Dictionary<PlanetImprovementType, List<PlanetImprovement>>
	
	this.StarShipTypeLastBuilt = planet.StarShipTypeLastBuilt;//StarShipType
    this.BuildLastStarShip = planet.BuildLastStarShip;

	//NOTE: not serialized
	//this.maxPopulation = this.MaxImprovements;
};

Astriarch.Planet.PlanetProductionItemType = {
	Unknown: 0,
    PlanetImprovement: 1,
    StarShipInProduction: 2,
    PlanetImprovementToDestroy: 3
};

Astriarch.SavedGameInterface.makePlanetProductionItemSerializable = function(/*PlanetProductionItem*/ sppi) {
	//since the instanceof is not serializable, we need to add a property to the PlanetProductionItem to tell what type it is
	sppi.PlanetProductionItemType = Astriarch.Planet.PlanetProductionItemType.Unknown
	if (sppi instanceof Astriarch.Planet.PlanetImprovement)
	{
		sppi.PlanetProductionItemType = Astriarch.Planet.PlanetProductionItemType.PlanetImprovement;
	}
	else if (sppi instanceof Astriarch.Planet.StarShipInProduction)//it's a ship
	{
		sppi.PlanetProductionItemType = Astriarch.Planet.PlanetProductionItemType.StarShipInProduction;
	}
	else if(sppi instanceof Astriarch.Planet.PlanetImprovementToDestroy)//it is a destroy improvement request
	{
		sppi.PlanetProductionItemType = Astriarch.Planet.PlanetProductionItemType.PlanetImprovementToDestroy;
	}
	else
	{
		var string = "Problem!";
	}
};
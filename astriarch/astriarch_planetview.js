Astriarch.PlanetView = {
	dialog:null,//instance of Astriarch.Dialog
	
	planetMain:null,//planet of the currently popped-up dialog
	
	population:0,
    farmers:0,
    miners:0,
    workers:0,

    farmersOrig:0,
    minersOrig:0,
    workersOrig:0,
	
	farmCount:0,
    mineCount:0,
    factoryCount:0,
    colonyCount:0,
	
	//build queue items
    workingBuildQueue: [],//List<PlanetProductionItem>
    workingResources: null,//WorkingPlayerResources
    workingProductionRemainderOriginal:0,
	
	lastClicked: null,
    lastChanged: null,
	
	updatingGUI: false,
	ItemsAvailableListBox: null,
	BuildQueueListBox: null,
	//items available list box items
	//AvailableImprovementListBoxItems
	lbiFarm: null,
	lbiMine: null,
	lbiColony: null,
	lbiFactory: null,
	lbiSpacePlatform: null,
	//AvailableStarShipListBoxItems
	lbiDefender: null,
	lbiScout: null,
	lbiDestroyer: null,
	lbiCruiser: null,
	lbiBattleship: null,
	
	itemsAvailable: [],
	
	init: function() {
	
		$( "#ButtonDemolishFarm, #ButtonDemolishMine, #ButtonDemolishFactory, #ButtonDemolishColony").button({ icons: {primary:'icon_demolish'}, text: false });
 
		$('#SliderFarmers').slider({value:0, step:1, min:0, max:10, slide: Astriarch.PlanetView.SliderFarmersValueChanged});
		$('#SliderMiners').slider({value:0, step:1, min:0, max:10, slide: Astriarch.PlanetView.SliderMinersValueChanged});
		$('#SliderWorkers').slider({value:0, step:1, min:0, max:10, slide: Astriarch.PlanetView.SliderWorkersValueChanged});
	 
		$("#ButtonBuildQueueAddSelectedItem").button({ icons: {primary:'icon_build_queue_add'}, text: false });
		$("#ButtonBuildQueueRemoveSelectedItem").button({ icons: {primary:'icon_build_queue_remove'}, text: false });
		$("#ButtonBuildQueueMoveSelectedItemDown").button({ icons: {primary:'icon_build_queue_down'}, text: false });
		$("#ButtonBuildQueueMoveSelectedItemUp").button({ icons: {primary:'icon_build_queue_up'}, text: false });
		
		$( "#ButtonBuildQueueAddSelectedItem" ).click(
			function() {
				Astriarch.PlanetView.addSelectedItemToQueue();
			}
		);
		
		$( "#ButtonBuildQueueRemoveSelectedItem" ).click(
			function() {
				Astriarch.PlanetView.removeSelectedItemFromQueue();
			}
		);
		
		$( "#ButtonBuildQueueMoveSelectedItemDown" ).click(
			function() {
				Astriarch.PlanetView.moveSelectedItemInQueue(false);
			}
		);
		
		$( "#ButtonBuildQueueMoveSelectedItemUp" ).click(
			function() {
				Astriarch.PlanetView.moveSelectedItemInQueue(true);
			}
		);
		
		$( "#ButtonDemolishFarm" ).click(
			function() {
				Astriarch.PlanetView.addImprovementToDestroy(Astriarch.Planet.PlanetImprovementType.Farm);
			}
		);
		
		$( "#ButtonDemolishMine" ).click(
			function() {
				Astriarch.PlanetView.addImprovementToDestroy(Astriarch.Planet.PlanetImprovementType.Mine);
			}
		);
		
		$( "#ButtonDemolishFactory" ).click(
			function() {
				Astriarch.PlanetView.addImprovementToDestroy(Astriarch.Planet.PlanetImprovementType.Factory);
			}
		);
		
		$( "#ButtonDemolishColony" ).click(
			function() {
				Astriarch.PlanetView.addImprovementToDestroy(Astriarch.Planet.PlanetImprovementType.Colony);
			}
		);
		
		var checkBoxTooltip = "If this option is checked and the build queue is empty at the end of the turn,\r\nthe ship last built on this planet will be added to the queue.\r\nIn order to build the ship, sufficient resources must exist\r\nas well as a surplus of gold to cover the amount of food shipped last turn.";
		//$('#BuildLastShipCheckBox').attr('title', checkBoxTooltip);
		$('#BuildLastShipCheckBoxLabel').attr('title', checkBoxTooltip);
		
		$('#BuildLastShipCheckBox').attr('checked', true);
		
		Astriarch.PlanetView.ItemsAvailableListBox = new JSListBox({'containerSelector':'ItemsAvailableListBox'});
		Astriarch.PlanetView.BuildQueueListBox = new JSListBox({'containerSelector':'BuildQueueListBox'});
	 
		Astriarch.PlanetView.lbiFarm = new Astriarch.PlanetView.AvailableImprovementListBoxItem(Astriarch.Planet.PlanetImprovementType.Farm);
        Astriarch.PlanetView.lbiMine = new Astriarch.PlanetView.AvailableImprovementListBoxItem(Astriarch.Planet.PlanetImprovementType.Mine);
        Astriarch.PlanetView.lbiColony = new Astriarch.PlanetView.AvailableImprovementListBoxItem(Astriarch.Planet.PlanetImprovementType.Colony);
        Astriarch.PlanetView.lbiFactory = new Astriarch.PlanetView.AvailableImprovementListBoxItem(Astriarch.Planet.PlanetImprovementType.Factory);
        Astriarch.PlanetView.lbiSpacePlatform = new Astriarch.PlanetView.AvailableImprovementListBoxItem(Astriarch.Planet.PlanetImprovementType.SpacePlatform);

        Astriarch.PlanetView.lbiDefender = new Astriarch.PlanetView.AvailableStarShipListBoxItem(Astriarch.Fleet.StarShipType.SystemDefense);
        Astriarch.PlanetView.lbiScout = new Astriarch.PlanetView.AvailableStarShipListBoxItem(Astriarch.Fleet.StarShipType.Scout);
        Astriarch.PlanetView.lbiDestroyer = new Astriarch.PlanetView.AvailableStarShipListBoxItem(Astriarch.Fleet.StarShipType.Destroyer);
        Astriarch.PlanetView.lbiCruiser = new Astriarch.PlanetView.AvailableStarShipListBoxItem(Astriarch.Fleet.StarShipType.Cruiser);
        Astriarch.PlanetView.lbiBattleship = new Astriarch.PlanetView.AvailableStarShipListBoxItem(Astriarch.Fleet.StarShipType.Battleship);
		
		Astriarch.PlanetView.itemsAvailable.push(Astriarch.PlanetView.lbiFarm);
		Astriarch.PlanetView.itemsAvailable.push(Astriarch.PlanetView.lbiMine);
		Astriarch.PlanetView.itemsAvailable.push(Astriarch.PlanetView.lbiColony);
		Astriarch.PlanetView.itemsAvailable.push(Astriarch.PlanetView.lbiFactory);
		Astriarch.PlanetView.itemsAvailable.push(Astriarch.PlanetView.lbiSpacePlatform);
		//Astriarch.PlanetView.ItemsAvailableListBox.addItem(new Separator());
		Astriarch.PlanetView.itemsAvailable.push(Astriarch.PlanetView.lbiDefender);
		Astriarch.PlanetView.itemsAvailable.push(Astriarch.PlanetView.lbiScout);
		Astriarch.PlanetView.itemsAvailable.push(Astriarch.PlanetView.lbiDestroyer);
		Astriarch.PlanetView.itemsAvailable.push(Astriarch.PlanetView.lbiCruiser);
		Astriarch.PlanetView.itemsAvailable.push(Astriarch.PlanetView.lbiBattleship);
	 
		Astriarch.PlanetView.dialog = new Astriarch.Dialog('#planetViewDialog', 'Planet View', 568, 485, Astriarch.PlanetView.OKClose, Astriarch.PlanetView.CancelClose);
		
		Astriarch.PlanetView.lastClicked = Astriarch.PlanetView.SliderValueClicked.None;
		Astriarch.PlanetView.lastChanged = Astriarch.PlanetView.SliderValueClicked.None;
		
	},
	
	show: function(/*Planet*/ p) {
	
		Astriarch.PlanetView.planetMain = p;
		
		var planetImagePath = "";
		switch (p.Type)
		{
			case Astriarch.Planet.PlanetType.PlanetClass2:
				planetImagePath = "img/PlanetClass2.png";
				break;
			case Astriarch.Planet.PlanetType.PlanetClass1:
				planetImagePath = "img/PlanetClass1.png";
				break;
			case Astriarch.Planet.PlanetType.DeadPlanet:
				planetImagePath = "img/PlanetDead.png";
				break;
			case Astriarch.Planet.PlanetType.AsteroidBelt:
				planetImagePath = "img/PlanetAsteroid.png";
				break;
		}
		$('#PlanetImage').css("background-image", 'url(' + planetImagePath + ')');
		
		$('#TextBlockPlanetType').text(Astriarch.GameTools.PlanetTypeToFriendlyName(p.Type));
		
		Astriarch.PlanetView.farmCount = p.BuiltImprovements[Astriarch.Planet.PlanetImprovementType.Farm].length;
        Astriarch.PlanetView.mineCount = p.BuiltImprovements[Astriarch.Planet.PlanetImprovementType.Mine].length;
        Astriarch.PlanetView.factoryCount = p.BuiltImprovements[Astriarch.Planet.PlanetImprovementType.Factory].length;
        Astriarch.PlanetView.colonyCount = p.BuiltImprovements[Astriarch.Planet.PlanetImprovementType.Colony].length;
		
		$('#PlanetViewFarmCount').text(Astriarch.PlanetView.farmCount);
        $('#PlanetViewMineCount').text(Astriarch.PlanetView.mineCount);
        $('#PlanetViewFactoryCount').text(Astriarch.PlanetView.factoryCount);
        $('#PlanetViewColonyCount').text(Astriarch.PlanetView.colonyCount);
        $('#PlanetViewSpacePlatformCount').text(p.BuiltImprovements[Astriarch.Planet.PlanetImprovementType.SpacePlatform].length);

		Astriarch.PlanetView.refreshResourcesPerTurnTextBoxes();

		Astriarch.PlanetView.updatePlanetStatsToolTip();

		Astriarch.PlanetView.population = p.Population.length;
		$('#SliderFarmers').slider("option", "max", Astriarch.PlanetView.population);
		$('#SliderMiners').slider("option", "max", Astriarch.PlanetView.population);
		$('#SliderWorkers').slider("option", "max", Astriarch.PlanetView.population);
		
		var pop = new Astriarch.Planet.PopulationAssignments();
		p.CountPopulationWorkerTypes(pop);
		Astriarch.PlanetView.farmers = pop.Farmers;
		Astriarch.PlanetView.miners = pop.Miners;
		Astriarch.PlanetView.workers = pop.Workers;

		//copy to our orig variables to remember in case we cancel/close
		Astriarch.PlanetView.farmersOrig = Astriarch.PlanetView.farmers;
		Astriarch.PlanetView.minersOrig = Astriarch.PlanetView.miners;
		Astriarch.PlanetView.workersOrig = Astriarch.PlanetView.workers;

		$('#SliderFarmers').slider("value", Astriarch.PlanetView.farmers);
		$('#TextBoxFarmers').text(Astriarch.PlanetView.farmers + "");

		$('#SliderMiners').slider("value", Astriarch.PlanetView.miners);
		$('#TextBoxMiners').text(Astriarch.PlanetView.miners + "");

		$('#SliderWorkers').slider("value", Astriarch.PlanetView.workers);
		$('#TextBoxWorkers').text(Astriarch.PlanetView.workers + "");
		
		//copy the planet's buildQueue into our working build queue
		Astriarch.PlanetView.workingBuildQueue = [];
		for(var i in p.BuildQueue)
			Astriarch.PlanetView.workingBuildQueue.push(p.BuildQueue[i]);
		
		Astriarch.PlanetView.workingResources = new Astriarch.PlanetView.WorkingPlayerResources(p.Owner);
		Astriarch.PlanetView.workingProductionRemainderOriginal = p.RemainderProduction;

		Astriarch.PlanetView.ItemsAvailableListBox.setSelectedItem(null);
		Astriarch.PlanetView.refreshItemsAvailableListBox();
		
		Astriarch.PlanetView.refreshBuildQueueListBox();
		Astriarch.PlanetView.showOrHideDemolishImprovementButtons();

		$('#ButtonBuildQueueAddSelectedItem').button('disable');
		$('#ButtonBuildQueueRemoveSelectedItem').button('disable');
		$('#ButtonBuildQueueMoveSelectedItemDown').button('disable');
		$('#ButtonBuildQueueMoveSelectedItemUp').button('disable');
		
		Astriarch.PlanetView.refreshCurrentWorkingResourcesTextBoxes();
		
		if(Astriarch.PlanetView.planetMain.BuildLastStarShip) {
			$("#BuildLastShipCheckBox").prop('checked', true);
		} else {
			$("#BuildLastShipCheckBox").prop('checked', false);
		}
		
		
		$('#BuildLastShipCheckBoxLabel').text("Build Last Ship");
		$("#LastShipBuiltTextBlock").text("");
		if (Astriarch.PlanetView.planetMain.StarShipTypeLastBuilt != null)
		{
			//this.BuildLastShipCheckBox.IsEnabled = true;
			$("#LastShipBuiltTextBlock").text("Last Built: " + Astriarch.GameTools.StarShipTypeToFriendlyName(Astriarch.PlanetView.planetMain.StarShipTypeLastBuilt));
			//if(Astriarch.PlanetView.planetMain.BuildQueue.length == 0) {
			//	$('#BuildLastShipCheckBoxLabel').text("Build " + Astriarch.GameTools.StarShipTypeToFriendlyName(Astriarch.PlanetView.planetMain.StarShipTypeLastBuilt) + "s");
			//}
		}
	
		Astriarch.PlanetView.dialog.setTitle("Planet " + p.Name + " View");
		Astriarch.PlanetView.dialog.open();
	},
	
	BuildQueueSelectionChanged: function() {
		$('#ButtonBuildQueueRemoveSelectedItem').button('disable');
		$('#ButtonBuildQueueMoveSelectedItemDown').button('disable');
		$('#ButtonBuildQueueMoveSelectedItemUp').button('disable');
		if (Astriarch.PlanetView.BuildQueueListBox.SelectedItem != null)
		{
			$('#ButtonBuildQueueRemoveSelectedItem').button('enable');
			if (Astriarch.PlanetView.BuildQueueListBox.SelectedIndex != Astriarch.PlanetView.BuildQueueListBox.items.length - 1)
				$('#ButtonBuildQueueMoveSelectedItemDown').button('enable');
			if (Astriarch.PlanetView.BuildQueueListBox.SelectedIndex != 0)
				$('#ButtonBuildQueueMoveSelectedItemUp').button('enable');
		}
	},
	
	ItemsAvailableSelectionChanged: function() {
		if (Astriarch.PlanetView.ItemsAvailableListBox.SelectedItem != null && Astriarch.PlanetView.ItemsAvailableListBox.SelectedItem.enabled)
		{
			$('#ButtonBuildQueueAddSelectedItem').button('enable')
		}
		else
		{
			$('#ButtonBuildQueueAddSelectedItem').button('disable');
		}
	},
	
	recalculateBuildQueueListItemsTurnsToCompleteEstimates: function() {
		var self = Astriarch.PlanetView;
		//TODO: will this be too slow?
		self.planetMain.UpdatePopulationWorkerTypes(self.farmers, self.miners, self.workers);
		self.planetMain.ResourcesPerTurn.UpdateResourcesPerTurnBasedOnPlanetStats();

		var workingProdRemainder = self.workingProductionRemainderOriginal;
		for ( var i in self.BuildQueueListBox.items)
		{
			var queueItem = self.BuildQueueListBox.items[i];//BuildQueueListBoxItem
			queueItem.ProductionItem.EstimateTurnsToComplete(self.planetMain.ResourcesPerTurn.ProductionAmountPerTurn + workingProdRemainder);
			workingProdRemainder = 0;
		}
		self.BuildQueueListBox.refresh();
	},
	
	refreshResourcesPerTurnTextBoxes: function() {
		$('#TextBlockFoodPerTurn').text(Astriarch.PlanetView.planetMain.ResourcesPerTurn.FoodAmountPerTurn);
        $('#TextBlockOrePerTurn').text(Astriarch.PlanetView.planetMain.ResourcesPerTurn.OreAmountPerTurn);
        $('#TextBlockIridiumPerTurn').text(Astriarch.PlanetView.planetMain.ResourcesPerTurn.IridiumAmountPerTurn);
        $('#TextBlockProductionPerTurn').text(Astriarch.PlanetView.planetMain.ResourcesPerTurn.ProductionAmountPerTurn);
	},
	
	updatePlanetStatsToolTip: function() {
		var ttText = "";
		ttText += "Base Worker Resource Generation Per Turn:\r\n";
		ttText += "Food: " + Astriarch.PlanetView.planetMain.ResourcesPerTurn.BaseFoodAmountPerWorkerPerTurn + "\r\n";
		ttText += "Ore: " + Astriarch.PlanetView.planetMain.ResourcesPerTurn.BaseOreAmountPerWorkerPerTurn + "\r\n";
		ttText += "Iridium: " + Astriarch.PlanetView.planetMain.ResourcesPerTurn.BaseIridiumAmountPerWorkerPerTurn + "\r\n";
		ttText += "Production: " + Astriarch.PlanetView.planetMain.ResourcesPerTurn.BaseProductionPerWorkerPerTurn + "\r\n\r\n";

		ttText += "Worker Resource Generation with Improvements:\r\n";
		ttText += "Food: " + Astriarch.PlanetView.planetMain.ResourcesPerTurn.GetExactFoodAmountPerWorkerPerTurn() + "\r\n";
		ttText += "Ore: " + Astriarch.PlanetView.planetMain.ResourcesPerTurn.GetExactOreAmountPerWorkerPerTurn() + "\r\n";
		ttText += "Iridium: " + Astriarch.PlanetView.planetMain.ResourcesPerTurn.GetExactIridiumAmountPerWorkerPerTurn() + "\r\n";
		ttText += "Production: " + Astriarch.PlanetView.planetMain.ResourcesPerTurn.GetExactProductionAmountPerWorkerPerTurn() + "\r\n\r\n";

		ttText += "Food amount on planet: " + Astriarch.PlanetView.planetMain.Resources.FoodAmount + "\r\n";
		$('#PlanetImage').attr('title', "Planet Stats:\r\n" + ttText);
	},
	
	workingQueueContainsSpacePlatform: function() {
		for (var i in Astriarch.PlanetView.workingBuildQueue)
		{
			var ppi = Astriarch.PlanetView.workingBuildQueue[i];//PlanetProductionItem
			if (ppi instanceof Astriarch.Planet.PlanetImprovement && ppi.Type == Astriarch.Planet.PlanetImprovementType.SpacePlatform)
				return true;
		}
		return false;
	},
	
	disableOrEnableImprovementsBasedOnSlotsAvailable: function()
	{
		var improvementCount = Astriarch.PlanetView.planetMain.BuiltImprovementCount();
		//count items that take up slots in working queue
		for (var i in Astriarch.PlanetView.workingBuildQueue)
		{
			var ppi = Astriarch.PlanetView.workingBuildQueue[i];//PlanetProductionItem
			if (ppi instanceof Astriarch.Planet.PlanetImprovement && ppi.Type != Astriarch.Planet.PlanetImprovementType.SpacePlatform)
				improvementCount++;
		}

		var slotsAvailable = Astriarch.PlanetView.planetMain.MaxImprovements - improvementCount;

		if (slotsAvailable <= 0)//less than zero is a problem, but we'll just make sure they can't build more here
		{
			Astriarch.PlanetView.lbiFarm.CanBuild = false;
			Astriarch.PlanetView.lbiMine.CanBuild = false;
			Astriarch.PlanetView.lbiColony.CanBuild = false;
			Astriarch.PlanetView.lbiFactory.CanBuild = false;
		}
		else
		{
			Astriarch.PlanetView.lbiFarm.CanBuild = true;
			Astriarch.PlanetView.lbiMine.CanBuild = true;
			Astriarch.PlanetView.lbiColony.CanBuild = true;
			Astriarch.PlanetView.lbiFactory.CanBuild = true;
		}

		if (Astriarch.PlanetView.planetMain.BuiltImprovements[Astriarch.Planet.PlanetImprovementType.Factory].length == 0)
			Astriarch.PlanetView.lbiSpacePlatform.CanBuild = false;
		else
			Astriarch.PlanetView.lbiSpacePlatform.CanBuild = true;

		//we can only have one space platform
		if (Astriarch.PlanetView.planetMain.BuiltImprovements[Astriarch.Planet.PlanetImprovementType.SpacePlatform].length > 0 ||
			Astriarch.PlanetView.workingQueueContainsSpacePlatform())
		{
			Astriarch.PlanetView.lbiSpacePlatform.CanBuild = false;
		}
	},
	
	disableImprovementsBasedOnResourcesAvailable: function()
	{
		for(var i in Astriarch.PlanetView.itemsAvailable)
		{
			var lbi = Astriarch.PlanetView.itemsAvailable[i];//ListBoxItem
			if (lbi instanceof Astriarch.PlanetView.AvailableImprovementListBoxItem)
			{
				if (lbi.CanBuild)
				{
					if (Astriarch.PlanetView.workingResources.GoldAmount < lbi.AvailablePlanetImprovement.GoldCost ||
						Astriarch.PlanetView.workingResources.IridiumAmount < lbi.AvailablePlanetImprovement.IridiumCost ||
						Astriarch.PlanetView.workingResources.OreAmount < lbi.AvailablePlanetImprovement.OreCost)
					{
						lbi.CanBuildBasedOnResources = false;
					}
					else
					{
						lbi.CanBuildBasedOnResources = true;
					}
				}

			}
			else if (lbi instanceof Astriarch.PlanetView.AvailableStarShipListBoxItem)
			{
				if (lbi.CanBuild)
				{
					if (Astriarch.PlanetView.workingResources.GoldAmount < lbi.AvailableStarShip.GoldCost ||
							Astriarch.PlanetView.workingResources.IridiumAmount < lbi.AvailableStarShip.IridiumCost ||
							Astriarch.PlanetView.workingResources.OreAmount < lbi.AvailableStarShip.OreCost)
					{
						lbi.CanBuildBasedOnResources = false;
					}
					else
					{
						lbi.CanBuildBasedOnResources = true;
					}
				}
			}
		}

		//check to ensure the selected item is not enabled
		if (Astriarch.PlanetView.ItemsAvailableListBox.SelectedItem != null &&
		    !(Astriarch.PlanetView.ItemsAvailableListBox.SelectedItem.CanBuild && Astriarch.PlanetView.ItemsAvailableListBox.SelectedItem.CanBuildBasedOnResources) )
		{
			Astriarch.PlanetView.ItemsAvailableListBox.setSelectedItem(null);
			Astriarch.PlanetView.ItemsAvailableListBox.refresh();
		}
	},
	
	refreshItemsAvailableListBox: function() {

		Astriarch.PlanetView.disableOrEnableImprovementsBasedOnSlotsAvailable();

		if (Astriarch.PlanetView.planetMain.BuiltImprovements[Astriarch.Planet.PlanetImprovementType.Factory].length == 0)
			Astriarch.PlanetView.lbiDestroyer.CanBuild = false;
		else
			Astriarch.PlanetView.lbiDestroyer.CanBuild = true;
		if (Astriarch.PlanetView.planetMain.BuiltImprovements[Astriarch.Planet.PlanetImprovementType.SpacePlatform].length == 0)
		{
			Astriarch.PlanetView.lbiCruiser.CanBuild = false;
			Astriarch.PlanetView.lbiBattleship.CanBuild = false;
		}
		else
		{
			Astriarch.PlanetView.lbiCruiser.CanBuild = true;
			Astriarch.PlanetView.lbiBattleship.CanBuild = true;
		}
		
		Astriarch.PlanetView.disableImprovementsBasedOnResourcesAvailable();
		
		Astriarch.PlanetView.ItemsAvailableListBox.clear();
		Astriarch.PlanetView.ItemsAvailableListBox.addItems(Astriarch.PlanetView.itemsAvailable);
	},
	
	refreshBuildQueueListBox: function() {
		Astriarch.PlanetView.BuildQueueListBox.clear();

		var workingProdRemainder = Astriarch.PlanetView.workingProductionRemainderOriginal;
		for (var i in Astriarch.PlanetView.workingBuildQueue)
		{
			var ppi = Astriarch.PlanetView.workingBuildQueue[i];//PlanetProductionItem
			ppi.EstimateTurnsToComplete(Astriarch.PlanetView.planetMain.ResourcesPerTurn.ProductionAmountPerTurn + workingProdRemainder);
			workingProdRemainder = 0;
			var queueItem = new Astriarch.PlanetView.BuildQueueListBoxItem(ppi);
			Astriarch.PlanetView.BuildQueueListBox.addItem(queueItem);
		}
	},
	
	showOrHideDemolishImprovementButtons: function() {
		if (Astriarch.PlanetView.farmCount - Astriarch.PlanetView.countDemolishImprovementsInQueueByType(Astriarch.Planet.PlanetImprovementType.Farm) > 0)
		{
			$('#ButtonDemolishFarm').css({"visibility":"visible"});
		}
		else
			$('#ButtonDemolishFarm').css({"visibility":"hidden"});

		if (Astriarch.PlanetView.mineCount - Astriarch.PlanetView.countDemolishImprovementsInQueueByType(Astriarch.Planet.PlanetImprovementType.Mine) > 0)
		{
			$('#ButtonDemolishMine').css({"visibility":"visible"});
		}
		else
			$('#ButtonDemolishMine').css({"visibility":"hidden"});

		if (Astriarch.PlanetView.factoryCount - Astriarch.PlanetView.countDemolishImprovementsInQueueByType(Astriarch.Planet.PlanetImprovementType.Factory) > 0)
		{
			$('#ButtonDemolishFactory').css({"visibility":"visible"});
		}
		else
			$('#ButtonDemolishFactory').css({"visibility":"hidden"});

		if (Astriarch.PlanetView.colonyCount - Astriarch.PlanetView.countDemolishImprovementsInQueueByType(Astriarch.Planet.PlanetImprovementType.Colony) > 0)
		{
			$('#ButtonDemolishColony').css({"visibility":"visible"});
		}
		else
			$('#ButtonDemolishColony').css({"visibility":"hidden"});
	},
	
	refreshCurrentWorkingResourcesTextBoxes: function() {
		$('#TextBlockCurrentGoldAmount').text(Astriarch.PlanetView.workingResources.GoldAmount);
        $('#TextBlockCurrentOreAmount').text(Astriarch.PlanetView.workingResources.OreAmount);
        $('#TextBlockCurrentIridiumAmount').text(Astriarch.PlanetView.workingResources.IridiumAmount);
	},
	
	countDemolishImprovementsInQueueByType: function(/*PlanetImprovementType*/ pit)
	{
		var count = 0;

		for (var i in Astriarch.PlanetView.workingBuildQueue)
		{
			var ppi = Astriarch.PlanetView.workingBuildQueue[i];
			if (ppi instanceof Astriarch.Planet.PlanetImprovementToDestroy && ppi.TypeToDestroy == pit)
			{
				count++;
			}
		}

		return count;
	},
	
	addImprovementToDestroy: function(/*PlanetImprovementType*/ pit)
	{
		var pi = new Astriarch.Planet.PlanetImprovementToDestroy(pit);
		Astriarch.PlanetView.workingBuildQueue.push(pi);
		Astriarch.PlanetView.showOrHideDemolishImprovementButtons();
		Astriarch.PlanetView.refreshBuildQueueListBox();
	},
	
	updateSliderValues: function(/*SliderValueClicked*/ clicked, clickedValue)//apparently for the one changing you have to get it from the args
	{
		var self = Astriarch.PlanetView;
		//TODO: is dependent sliders the way to go? for now hopefully it's easy
		//determine if we're adding or removing...
		//if clicked farmers switch off between giving to/taking from miners and workers
		//if clicked miners switch off between giving to/taking from farmers and workers
		//if clicked workers switch off between giving to/taking from farmers and miners
		var diff = 0;
		self.updatingGUI = true;

		if(self.lastClicked != clicked)
			self.lastChanged = Astriarch.PlanetView.SliderValueClicked.None;

		var roundedFarmerSliderValue = $('#SliderFarmers').slider("value");
		var roundedMinerSliderValue = $('#SliderMiners').slider("value");
		var roundedWorkerSliderValue = $('#SliderWorkers').slider("value");

		//figure out who we can give to or take from
		//if either others are candidates, choose the one we didn't last change (alternate)

		//first figure differences
		switch (clicked)
		{
			case Astriarch.PlanetView.SliderValueClicked.Farmers:
				roundedFarmerSliderValue = clickedValue;
				diff = roundedFarmerSliderValue - self.farmers;
				break;
			case Astriarch.PlanetView.SliderValueClicked.Miners:
				roundedMinerSliderValue = clickedValue;
				diff = roundedMinerSliderValue - self.miners;
				break;
			case Astriarch.PlanetView.SliderValueClicked.Workers:
				roundedWorkerSliderValue = clickedValue;
				diff = roundedWorkerSliderValue - self.workers;
				break;
		}

		var canChangeFarmers = false;
		var canChangeMiners = false;
		var canChangeWorkers = false;
		//next figure can change candidates
		if (diff > 0) //we're looking for a slider to take from
		{
			canChangeFarmers = (self.farmers != 0);
			canChangeMiners = (self.miners != 0);
			canChangeWorkers = (self.workers != 0);
		}
		else if (diff < 0) //we're looking for a slider to give to
		{
			canChangeFarmers = (self.farmers != self.population);
			canChangeMiners = (self.miners != self.population);
			canChangeWorkers = (self.workers != self.population);
		}
		else
		{
			//we're not changing anything
			self.updatingGUI = false;
			//console.log("NOT Changing the sliders");
			return;
		}

		while(diff != 0)
		{
			var diffToChange = 1;
			if(diff < 0)
				diffToChange = -1;
				
			var sliderToChange = Astriarch.PlanetView.SliderValueClicked.None;
			//next pick a slider to change
			switch (clicked)
			{
				case Astriarch.PlanetView.SliderValueClicked.Farmers:
					if(canChangeMiners && !canChangeWorkers)
					{
						sliderToChange = Astriarch.PlanetView.SliderValueClicked.Miners;
					}
					else if(!canChangeMiners && canChangeWorkers)
					{
						sliderToChange = Astriarch.PlanetView.SliderValueClicked.Workers;
					}
					else//if both values are the same, check last change to alternate candidates
						//otherwize first check diff to see if we want the larger or the smaller
					{
						if (roundedMinerSliderValue == roundedWorkerSliderValue)
						{
							if (self.lastChanged != Astriarch.PlanetView.SliderValueClicked.Miners)
								sliderToChange = Astriarch.PlanetView.SliderValueClicked.Miners;
							else
								sliderToChange = Astriarch.PlanetView.SliderValueClicked.Workers;
						}
						else if (diff > 0)//we're removing so choose the slider with a larger value
						{
							if (roundedMinerSliderValue > roundedWorkerSliderValue)
								sliderToChange = Astriarch.PlanetView.SliderValueClicked.Miners;
							else
								sliderToChange = Astriarch.PlanetView.SliderValueClicked.Workers;
						}
						else//choose the slider with a smaller value
						{
							if (roundedMinerSliderValue < roundedWorkerSliderValue)
								sliderToChange = Astriarch.PlanetView.SliderValueClicked.Miners;
							else
								sliderToChange = Astriarch.PlanetView.SliderValueClicked.Workers;
						}
					}

					break;
				case Astriarch.PlanetView.SliderValueClicked.Miners:
					if (canChangeFarmers && !canChangeWorkers)
					{
						sliderToChange = Astriarch.PlanetView.SliderValueClicked.Farmers;
					}
					else if (!canChangeFarmers && canChangeWorkers)
					{
						sliderToChange = Astriarch.PlanetView.SliderValueClicked.Workers;
					}
					else//if both values are the same, check last change to alternate candidates
						//otherwize first check diff to see if we want the larger or the smaller
					{
						if (roundedFarmerSliderValue == roundedWorkerSliderValue)
						{
							if (self.lastChanged != Astriarch.PlanetView.SliderValueClicked.Farmers)
								sliderToChange = Astriarch.PlanetView.SliderValueClicked.Farmers;
							else
								sliderToChange = Astriarch.PlanetView.SliderValueClicked.Workers;
						}
						else if (diff > 0)//we're removing so choose the slider with a larger value
						{
							if (roundedFarmerSliderValue > roundedWorkerSliderValue)
								sliderToChange = Astriarch.PlanetView.SliderValueClicked.Farmers;
							else
								sliderToChange = Astriarch.PlanetView.SliderValueClicked.Workers;
						}
						else//choose the slider with a smaller value
						{
							if (roundedFarmerSliderValue < roundedWorkerSliderValue)
								sliderToChange = Astriarch.PlanetView.SliderValueClicked.Farmers;
							else
								sliderToChange = Astriarch.PlanetView.SliderValueClicked.Workers;
						}
					}
					break;
				case Astriarch.PlanetView.SliderValueClicked.Workers:
					if (canChangeFarmers && !canChangeMiners)
					{
						sliderToChange = Astriarch.PlanetView.SliderValueClicked.Farmers;
					}
					else if (!canChangeFarmers && canChangeMiners)
					{
						sliderToChange = Astriarch.PlanetView.SliderValueClicked.Miners;
					}
					else//if both values are the same, check last change to alternate candidates
						//otherwize first check diff to see if we want the larger or the smaller
					{
						if (roundedFarmerSliderValue == roundedMinerSliderValue)
						{
							if (self.lastChanged != Astriarch.PlanetView.SliderValueClicked.Farmers)
								sliderToChange = Astriarch.PlanetView.SliderValueClicked.Farmers;
							else
								sliderToChange = Astriarch.PlanetView.SliderValueClicked.Miners;
						}
						else if (diff > 0)//we're removing so choose the slider with a larger value
						{
							if (roundedFarmerSliderValue > roundedMinerSliderValue)
								sliderToChange = Astriarch.PlanetView.SliderValueClicked.Farmers;
							else
								sliderToChange = Astriarch.PlanetView.SliderValueClicked.Miners;
						}
						else//choose the slider with a smaller value
						{
							if (roundedFarmerSliderValue < roundedMinerSliderValue)
								sliderToChange = Astriarch.PlanetView.SliderValueClicked.Farmers;
							else
								sliderToChange = Astriarch.PlanetView.SliderValueClicked.Miners;
						}
					}
					break;
			}
			
			//finally, change the picked slider
			switch (sliderToChange)
			{
				case Astriarch.PlanetView.SliderValueClicked.Farmers:
					roundedFarmerSliderValue -= diffToChange;
					$('#SliderFarmers').slider("value", roundedFarmerSliderValue);
					self.lastChanged = Astriarch.PlanetView.SliderValueClicked.Farmers;
					break;
				case Astriarch.PlanetView.SliderValueClicked.Miners:
					roundedMinerSliderValue -= diffToChange;
					$('#SliderMiners').slider("value", roundedMinerSliderValue);
					self.lastChanged = Astriarch.PlanetView.SliderValueClicked.Miners;
					break;
				case Astriarch.PlanetView.SliderValueClicked.Workers:
					roundedWorkerSliderValue -= diffToChange;
					$('#SliderWorkers').slider("value", roundedWorkerSliderValue);
					self.lastChanged = Astriarch.PlanetView.SliderValueClicked.Workers;
					break;
				default:
					throw new Error("Unable to determine slider to change in PlanetViewControl!");
					break;
			}
			
			self.farmers = roundedFarmerSliderValue;
			self.miners = roundedMinerSliderValue;
			self.workers = roundedWorkerSliderValue;
			
			if(diff > 0)
				diff--;
			else if(diff < 0)
				diff++;
		}
		
		self.updatingGUI = false;

		self.lastClicked = clicked;

		$('#TextBoxFarmers').text(self.farmers);
		$('#TextBoxMiners').text(self.miners);
		$('#TextBoxWorkers').text(self.workers);
		

		self.recalculateBuildQueueListItemsTurnsToCompleteEstimates();
		self.refreshResourcesPerTurnTextBoxes();
	},
	
	SliderFarmersValueChanged: function(event, ui)
	{
		if(!Astriarch.PlanetView.updatingGUI)
			Astriarch.PlanetView.updateSliderValues(Astriarch.PlanetView.SliderValueClicked.Farmers, ui.value);
	},

	SliderMinersValueChanged: function(event, ui)
	{
		if (!Astriarch.PlanetView.updatingGUI)
			Astriarch.PlanetView.updateSliderValues(Astriarch.PlanetView.SliderValueClicked.Miners, ui.value);
	},

	SliderWorkersValueChanged: function(event, ui)
	{
		if (!Astriarch.PlanetView.updatingGUI)
			Astriarch.PlanetView.updateSliderValues(Astriarch.PlanetView.SliderValueClicked.Workers, ui.value);
	},
	
	moveSelectedItemInQueue: function(/*bool*/ moveUp){
		var index = Astriarch.PlanetView.BuildQueueListBox.SelectedIndex;

		if (index == 0 && moveUp)
			return;
		else if (index == Astriarch.PlanetView.BuildQueueListBox.items.length - 1 && !moveUp)
			return;

		var bqlbi = Astriarch.PlanetView.BuildQueueListBox.items[index];//BuildQueueListBoxItem
		Astriarch.PlanetView.BuildQueueListBox.items.splice(index, 1);
		Astriarch.PlanetView.workingBuildQueue.splice(index, 1);
		if(moveUp)
		{
			Astriarch.PlanetView.BuildQueueListBox.items.splice(index-1, 0, bqlbi);
			Astriarch.PlanetView.workingBuildQueue.splice(index-1, 0, bqlbi.ProductionItem);
			Astriarch.PlanetView.BuildQueueListBox.setSelectedIndex(index - 1);
		}
		else
		{
			Astriarch.PlanetView.BuildQueueListBox.items.splice(index+1, 0, bqlbi);
			Astriarch.PlanetView.workingBuildQueue.splice(index+1, 0, bqlbi.ProductionItem);
			Astriarch.PlanetView.BuildQueueListBox.setSelectedIndex(index + 1);
		}
		Astriarch.PlanetView.BuildQueueSelectionChanged();//manually trigger because we changed selected item
		Astriarch.PlanetView.BuildQueueListBox.refresh();
	},

	removeSelectedItemFromQueue: function()	{
		var o = Astriarch.PlanetView.BuildQueueListBox.SelectedItem;
		var index = Astriarch.PlanetView.BuildQueueListBox.SelectedIndex;
		if (o != null && index != null)
		{
			//o is BuildQueueListBoxItem
			var bqlbi = o;

			var refundObject = bqlbi.ProductionItem.GetRefundAmount();

			Astriarch.PlanetView.workingResources.GoldRemainder += refundObject.Gold;
			Astriarch.PlanetView.workingResources.OreRemainder += refundObject.Ore;
			Astriarch.PlanetView.workingResources.IridiumRemainder += refundObject.Iridium;
			Astriarch.PlanetView.workingResources.AccumulateResourceRemainders();

			//Astriarch.PlanetView.workingBuildQueue.Remove(bqlbi.ProductionItem);
			Astriarch.PlanetView.workingBuildQueue.splice(index, 1);
			Astriarch.PlanetView.BuildQueueListBox.removeAt(index);

			Astriarch.PlanetView.refreshItemsAvailableListBox();
			
			Astriarch.PlanetView.refreshCurrentWorkingResourcesTextBoxes();
			Astriarch.PlanetView.showOrHideDemolishImprovementButtons();
			
			Astriarch.PlanetView.BuildQueueSelectionChanged();//manually trigger because we changed selected item
		}
	},

	addSelectedItemToQueue: function() {
		var o = Astriarch.PlanetView.ItemsAvailableListBox.SelectedItem;
		if (o != null)
		{
			if (o instanceof Astriarch.PlanetView.AvailableImprovementListBoxItem)
			{
				var lbiImprovement = o;//AvailableImprovementListBoxItem
				if (lbiImprovement.CanBuild)
				{
					//check to see if we have enough resouces 
					if (Astriarch.PlanetView.workingResources.GoldAmount >= lbiImprovement.AvailablePlanetImprovement.GoldCost &&
						Astriarch.PlanetView.workingResources.IridiumAmount >= lbiImprovement.AvailablePlanetImprovement.IridiumCost &&
						Astriarch.PlanetView.workingResources.OreAmount >= lbiImprovement.AvailablePlanetImprovement.OreCost)
					{
						Astriarch.PlanetView.workingResources.GoldAmount -= lbiImprovement.AvailablePlanetImprovement.GoldCost;
						Astriarch.PlanetView.workingResources.IridiumAmount -= lbiImprovement.AvailablePlanetImprovement.IridiumCost;
						Astriarch.PlanetView.workingResources.OreAmount -= lbiImprovement.AvailablePlanetImprovement.OreCost;
						var pi = new Astriarch.Planet.PlanetImprovement(lbiImprovement.AvailablePlanetImprovement.Type);
						Astriarch.PlanetView.workingBuildQueue.push(pi);

					}
					else
					{
						var a = new Astriarch.Alert("Insufficient resources", "Insufficient resources: (Gold/Ore/Iridium)\r\nRequires  (" + lbiImprovement.AvailablePlanetImprovement.GoldCost + " / " + lbiImprovement.AvailablePlanetImprovement.OreCost + " / " + lbiImprovement.AvailablePlanetImprovement.IridiumCost + ")\r\n" +
										"You have (" + Astriarch.PlanetView.workingResources.GoldAmount + " / " + Astriarch.PlanetView.workingResources.OreAmount + " / " + Astriarch.PlanetView.workingResources.IridiumAmount + ")", "Insufficient resources");
					}
				}
				//else warn them?
			}
			else if (o instanceof Astriarch.PlanetView.AvailableStarShipListBoxItem)
			{
				var lbiStarship = o;//AvailableStarShipListBoxItem
				if (lbiStarship.CanBuild)
				{
					//check to see if we have enough resouces 
					if (Astriarch.PlanetView.workingResources.GoldAmount >= lbiStarship.AvailableStarShip.GoldCost &&
						Astriarch.PlanetView.workingResources.IridiumAmount >= lbiStarship.AvailableStarShip.IridiumCost &&
						Astriarch.PlanetView.workingResources.OreAmount >= lbiStarship.AvailableStarShip.OreCost)
					{
						Astriarch.PlanetView.workingResources.GoldAmount -= lbiStarship.AvailableStarShip.GoldCost;
						Astriarch.PlanetView.workingResources.IridiumAmount -= lbiStarship.AvailableStarShip.IridiumCost;
						Astriarch.PlanetView.workingResources.OreAmount -= lbiStarship.AvailableStarShip.OreCost;
						var ssip = new Astriarch.Planet.StarShipInProduction(lbiStarship.AvailableStarShip.Type);
						Astriarch.PlanetView.workingBuildQueue.push(ssip);
					}
					else
					{
						//TODO: make themed properly by using custom Dialog Window
						var a = new Astriarch.Alert("Insufficient resources", "Insufficient resources: (Gold/Ore/Iridium)\r\nRequires  (" + lbiStarship.AvailableStarShip.GoldCost + " / " + lbiStarship.AvailableStarShip.OreCost + " / " + lbiStarship.AvailableStarShip.IridiumCost + ")\r\n" +
										"You have (" + Astriarch.PlanetView.workingResources.GoldAmount + " / " + Astriarch.PlanetView.workingResources.OreAmount + " / " + Astriarch.PlanetView.workingResources.IridiumAmount + ")", "Insufficient resources");
					}
				}
				//else warn them?
			}
			Astriarch.PlanetView.refreshItemsAvailableListBox();
			
			Astriarch.PlanetView.refreshBuildQueueListBox();
			Astriarch.PlanetView.refreshCurrentWorkingResourcesTextBoxes();
		}
	},
	
	OKClose: function()	{
	//TODO: throw exception if farmers miners and worker counts are greater than our planet pop
		var self = Astriarch.PlanetView;
		self.planetMain.UpdatePopulationWorkerTypes(self.farmers, self.miners, self.workers);
		self.planetMain.ResourcesPerTurn.UpdateResourcesPerTurnBasedOnPlanetStats();

		//copy our working items to our original planet pointer
		self.planetMain.BuildQueue = [];
		for (var i in self.workingBuildQueue)
		{
			self.planetMain.BuildQueue.push(self.workingBuildQueue[i]);
		}

		//now spend our resources and in case we issued a refund, add remainders to this planets resources and accumulate
		var originalResources = new Astriarch.PlanetView.WorkingPlayerResources(self.planetMain.Owner);
		var goldCost = originalResources.GoldAmount - self.workingResources.GoldAmount;
		var oreCost = originalResources.OreAmount - self.workingResources.OreAmount;
		var iridiumCost = originalResources.IridiumAmount - self.workingResources.IridiumAmount;
		self.planetMain.SpendResources(goldCost, oreCost, iridiumCost, self.planetMain.Owner);
		//add the remainders to the planets resources and accumulate
		self.planetMain.Owner.Resources.GoldRemainder = self.workingResources.GoldRemainder;
		self.planetMain.Owner.Resources.OreRemainder = self.workingResources.OreRemainder;
		self.planetMain.Owner.Resources.IridiumRemainder = self.workingResources.IridiumRemainder;
		self.planetMain.Owner.Resources.AccumulateResourceRemainders();
		
		Astriarch.PlanetView.planetMain.BuildLastStarShip = true;
		if(!$('#BuildLastShipCheckBox').attr('checked')) {
			Astriarch.PlanetView.planetMain.BuildLastStarShip = false;
		}
		
		
		Astriarch.View.updateSelectedItemPanelForPlanet();
        Astriarch.View.updatePlayerStatusPanel();//for total food per turn indicator and build queue updates
	},

	CancelClose: function()	{
		//copy back our original workers to our planet object
		var self = Astriarch.PlanetView;
		self.planetMain.UpdatePopulationWorkerTypes(self.farmersOrig, self.minersOrig, self.workersOrig);
		self.planetMain.ResourcesPerTurn.UpdateResourcesPerTurnBasedOnPlanetStats();
	}
};

/**
 * BuildQueueListBoxItem is a list box item for the build queue list
 * @constructor
 */
Astriarch.PlanetView.BuildQueueListBoxItem = JSListBox.Item.extend({

	ProductionItem: null,//PlanetProductionItem
	
	/**
	 * initializes this BuildQueueListBoxItem
	 * @this {Astriarch.PlanetView.BuildQueueListBoxItem}
	 */
	init: function(/*PlanetProductionItem*/ productionItem) {
		this.ProductionItem = productionItem;
		//ToolTipService.SetToolTip(this, GameTools.PlanetImprovementTypeToHelpText(type));
	},

	/**
	 * renders this BuildQueueListBoxItem
	 * @this {Astriarch.PlanetView.BuildQueueListBoxItem}
	 * @return {string}
	 */
	render: function() {
		var name = this.ProductionItem.ToString();

		var turnsToCompleteString = "";
		//only show turns to complete if we've started building
		//if (this.ProductionItem.ProductionCostComplete > 0)
			turnsToCompleteString = " (" + (this.ProductionItem.TurnsToComplete) + ")";
		name += " " + this.ProductionItem.ProductionCostComplete + "/" + this.ProductionItem.BaseProductionCost + turnsToCompleteString;
		return '<a href="#">' + name + '</a>';
	},
	
	/**
	 * fires the selection changed event
	 * @this {Astriarch.PlanetView.BuildQueueListBoxItem}
	 */
	onClick: function() {
		Astriarch.PlanetView.BuildQueueSelectionChanged();
	}
	
});

/**
 * AvailableImprovementListBoxItem is a list box item for the available items to build list
 * @constructor
 */
Astriarch.PlanetView.AvailableImprovementListBoxItem = JSListBox.Item.extend({

	Tooltip: "",
	AvailablePlanetImprovement: null,//PlanetImprovement
	CanBuild: true,
	CanBuildBasedOnResources: true,
	Foreground: "white",
	
	/**
	 * initializes this AvailableImprovementListBoxItem
	 * @this {Astriarch.PlanetView.AvailableImprovementListBoxItem}
	 */
	init: function(/*PlanetImprovementType*/ type) {
		this.Tooltip = Astriarch.GameTools.PlanetImprovementTypeToHelpText(type);
		this.AvailablePlanetImprovement = new Astriarch.Planet.PlanetImprovement(type);
	},

	/**
	 * renders this AvailableImprovementListBoxItem
	 * @this {Astriarch.PlanetView.AvailableImprovementListBoxItem}
	 * @return {string}
	 */
	render: function() {
		this.enabled = false;
		if(!this.CanBuild)
			this.Foreground = "darkgray";
		else if(!this.CanBuildBasedOnResources)
			this.Foreground = "yellow";
		else if(this.CanBuild)
		{
			this.Foreground = "white";
			this.enabled = true;
		}
		
		var text = Astriarch.GameTools.PlanetImprovementTypeToFriendlyName(this.AvailablePlanetImprovement.Type);
		//show build cost
		text += " (" + this.AvailablePlanetImprovement.GoldCost + " / " + this.AvailablePlanetImprovement.OreCost + " / " + this.AvailablePlanetImprovement.IridiumCost + ")";
		if(this.enabled)
			return '<a href="#" title="' + this.Tooltip + '" style="color:' + this.Foreground + '">' + text + '</a>';
		else
			return '<a style="color:' + this.Foreground + '">' + text + '</a>';
	},
	
	/**
	 * fires the selection changed event
	 * @this {Astriarch.PlanetView.AvailableImprovementListBoxItem}
	 */
	onClick: function() {
		Astriarch.PlanetView.ItemsAvailableSelectionChanged();
	},
	
	/**
	 * fires the double click event
	 * @this {Astriarch.PlanetView.AvailableImprovementListBoxItem}
	 */
	onDblClick: function() {
		Astriarch.PlanetView.addSelectedItemToQueue();
	}
});

/**
 * AvailableStarShipListBoxItem is a list box item for the available items to build list
 * @constructor
 */
Astriarch.PlanetView.AvailableStarShipListBoxItem = JSListBox.Item.extend({

	Tooltip: "",
	AvailableStarShip: null,//StarShipInProduction
	CanBuild: true,
	CanBuildBasedOnResources: true,
	Foreground: "white",
	
	/**
	 * initializes this AvailableStarShipListBoxItem
	 * @this {Astriarch.PlanetView.AvailableStarShipListBoxItem}
	 */
	init: function(/*StarShipType*/ type) {
		this.Tooltip = Astriarch.GameTools.StarShipTypeToHelpText(type);
		this.AvailableStarShip = new Astriarch.Planet.StarShipInProduction(type);
	},

	/**
	 * renders this AvailableStarShipListBoxItem
	 * @this {Astriarch.PlanetView.AvailableStarShipListBoxItem}
	 * @return {string}
	 */
	render: function() {
		this.enabled = false;
		if(!this.CanBuild)
			this.Foreground = "darkgray";
		else if(!this.CanBuildBasedOnResources)
			this.Foreground = "yellow";
		else if(this.CanBuild)
		{
			this.Foreground = "white";
			this.enabled = true;
		}
		
		var text = Astriarch.GameTools.StarShipTypeToFriendlyName(this.AvailableStarShip.Type);
		//show build cost
		text += " (" + this.AvailableStarShip.GoldCost + " / " + this.AvailableStarShip.OreCost + " / " + this.AvailableStarShip.IridiumCost + ")";
		if(this.enabled)
			return '<a href="#" title="' + this.Tooltip + '" style="color:' + this.Foreground + '">' + text + '</a>';
		else
			return '<a style="color:' + this.Foreground + '">' + text + '</a>';
	},
	
	/**
	 * fires the selection changed event
	 * @this {Astriarch.PlanetView.AvailableStarShipListBoxItem}
	 */
	onClick: function() {
		Astriarch.PlanetView.ItemsAvailableSelectionChanged();
	},
	
	/**
	 * fires the double click event
	 * @this {Astriarch.PlanetView.AvailableStarShipListBoxItem}
	 */
	onDblClick: function() {
		Astriarch.PlanetView.addSelectedItemToQueue();
	}
});

Astriarch.PlanetView.SliderValueClicked = {
	None: 0,
	Farmers: 1,
	Miners: 2,
	Workers: 3
}

/**
 * WorkingPlayerResources is the players resources at the global level
 * @constructor
 */
Astriarch.PlanetView.WorkingPlayerResources = function(player) {
	this.GoldAmount = player.Resources.GoldAmount;
	this.GoldRemainder = 0.0;
	
	this.OreAmount = player.TotalOreAmount();
	this.OreRemainder = 0.0;
	
	this.IridiumAmount = player.TotalIridiumAmount();
	this.IridiumRemainder = 0.0;
};

/**
 * AccumulateResourceRemainders for our WorkingPlayerResources object
 * @this {Astriarch.PlanetView.WorkingPlayerResources}
 */
Astriarch.PlanetView.WorkingPlayerResources.prototype.AccumulateResourceRemainders = function() {
	
	if (this.GoldRemainder >= 1.0)
	{
		this.GoldAmount += Math.floor(this.GoldRemainder / 1.0);
		this.GoldRemainder = this.GoldRemainder % 1;
	}
	
	if (this.OreRemainder >= 1.0)
	{
		this.OreAmount += Math.floor(this.OreRemainder / 1.0);
		this.OreRemainder = this.OreRemainder % 1;
	}

	if (this.IridiumRemainder >= 1.0)
	{
		this.IridiumAmount += Math.floor(this.IridiumRemainder / 1.0);
		this.IridiumRemainder = this.IridiumRemainder % 1;
	}
};

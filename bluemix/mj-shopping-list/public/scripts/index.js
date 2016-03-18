
var REST_DATA='/api/items';

function addItem(item, isNew){
	
	var listItem = document.createElement('li');
	listItem.className = "listItems";
	var id = item && item.id;
	if(id){
		listItem.setAttribute('data-id', id);
	}
	listItem.innerHTML=item.id+", "+item.value.quantity;
	
	console.log("Item-name: " + item.id + "\nQuantity: " + item.value.quantity);
	var shoppingList = document.getElementById('shoppingItems');
	shoppingList.appendChild(listItem);
}

function loadItems(){
	console.log("loading shopping items");
	xhrGet(REST_DATA, function(data){
		
		var receivedItems = data || [];
		var items = [];
		var i;
		// Make sure the received items have correct format
		for(i = 0; i < receivedItems.length; ++i){
			var item = receivedItems[i];
			if(item && 'id' in item){
				items.push(item);
			}
		}
		var hasItems = items.length;
		if(!hasItems){
			items = defaultItems;
		}
		for(i = 0; i < items.length; ++i){
			addItem(items[i], !hasItems);
		}
		if(!hasItems){
			var table = document.getElementById('notes');
			var nodes = [];
			for(i = 0; i < table.rows.length; ++i){
				nodes.push(table.rows[i].firstChild.firstChild);
			}
			function save(){
				if(nodes.length){
					saveChange(nodes.shift(), save);
				}
			}
			save();
		}
	}, function(err){
		console.error(err);
	});
}

// function addItem() {
	// var itemName=document.getElementById('newShoppingItem');
	// var itemQuantity=document.getElementById('newShoppingItemQuantity');
	
	// console.log("Adding " + itemName + "," + itemQuantity);
// }

function logOnIndexPage(logMessage) {
	document.getElementById('logs').innerHTML=logMessage;
}

//logOnIndexPage('Index Rendered.');
loadItems();